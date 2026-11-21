"use client"

import { useQueryClient } from "@tanstack/react-query"
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"

import { setAccessTokenGetter } from "@/lib/api-client"
import { authClient } from "@/lib/auth-client"
import { toUserRole } from "@/lib/roles"
import type { ProfileUser } from "@/types"

// Session + in-memory JWT provider.
//
// The Better Auth session cookie is the credential that proves the session;
// the JWT is a short-lived bearer token for the Express API. It is held only
// in memory (a ref) and registered with `api-client` through a getter — never
// persisted to `localStorage`, cookies, or any other client storage.

type SessionData = typeof authClient.$Infer.Session

type AuthContextValue = {
  user: ProfileUser | null
  isPending: boolean
  signOut: () => Promise<void>
  /** Fetches a fresh JWT for the active session (used after sign-in too). */
  refreshAccessToken: () => Promise<string | null>
}

const AuthContext = createContext<AuthContextValue | null>(null)

/** Refresh this long before `exp` so in-flight requests never see a dead token. */
const REFRESH_SKEW_MS = 60_000

/** Reads `exp` (seconds) from a JWT without verifying it — UI timing only. */
function readJwtExpirationMs(token: string): number | null {
  const payload = token.split(".")[1]
  if (!payload) return null

  try {
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/")
    const padded = normalized.padEnd(
      normalized.length + ((4 - (normalized.length % 4)) % 4),
      "="
    )
    const parsed: unknown = JSON.parse(atob(padded))

    if (
      parsed &&
      typeof parsed === "object" &&
      "exp" in parsed &&
      typeof parsed.exp === "number"
    ) {
      return parsed.exp * 1000
    }
  } catch {
    // A malformed token is treated as opaque; the next request will re-fetch.
  }

  return null
}

function toProfileUser(user: SessionData["user"]): ProfileUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email ?? undefined,
    avatarUrl: user.image ?? undefined,
    role: toUserRole(user.role),
    isBlocked: user.isBlocked === true,
  }
}

type AuthProviderProps = {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { data: session, isPending } = authClient.useSession()
  const queryClient = useQueryClient()
  const tokenRef = useRef<string | null>(null)
  const previousUserIdRef = useRef<string | null>(null)
  const [tokenStatus, setTokenStatus] = useState<
    "idle" | "loading" | "ready" | "error"
  >("idle")

  const refreshAccessToken = useCallback(async (): Promise<string | null> => {
    setTokenStatus("loading")
    const result = await authClient.token()

    if (result.error || !result.data?.token) {
      tokenRef.current = null
      setTokenStatus("error")
      return null
    }

    tokenRef.current = result.data.token
    setTokenStatus("ready")
    return result.data.token
  }, [])

  const sessionUserId = session?.user?.id ?? null

  // Drops every cached query and mutation, including in-flight requests, so
  // data tied to the previous identity cannot survive a logout or switch.
  const clearUserData = useCallback(() => {
    queryClient.clear()
  }, [queryClient])

  const signOut = useCallback(async (): Promise<void> => {
    tokenRef.current = null
    setTokenStatus("idle")
    await authClient.signOut()
    clearUserData()
  }, [clearUserData])

  // Expose the current token to the API client without re-rendering on every
  // token change (the getter reads the ref).
  useEffect(() => {
    setAccessTokenGetter(() => tokenRef.current)
    return () => setAccessTokenGetter(null)
  }, [])

  // Also clear when the session identity changes outside this tab's signOut()
  // (e.g. Better Auth's cross-tab broadcast), covering direct account switches.
  useEffect(() => {
    const previousUserId = previousUserIdRef.current
    previousUserIdRef.current = sessionUserId
    if (previousUserId !== null && previousUserId !== sessionUserId) {
      clearUserData()
    }
  }, [sessionUserId, clearUserData])

  // Fetch a token whenever the session changes, then refresh just before `exp`.
  useEffect(() => {
    let cancelled = false
    let refreshTimer: ReturnType<typeof setTimeout> | undefined

    async function syncToken() {
      if (!sessionUserId) {
        tokenRef.current = null
        setTokenStatus("idle")
        return
      }

      const token = await refreshAccessToken()
      if (cancelled || !token) return

      const expiresAt = readJwtExpirationMs(token)
      if (expiresAt === null) return

      const delay = Math.max(expiresAt - Date.now() - REFRESH_SKEW_MS, 15_000)
      refreshTimer = setTimeout(() => {
        void syncToken()
      }, delay)
    }

    void syncToken()

    return () => {
      cancelled = true
      if (refreshTimer) clearTimeout(refreshTimer)
    }
  }, [sessionUserId, refreshAccessToken])

  const user = useMemo(
    () => (session?.user ? toProfileUser(session.user) : null),
    [session]
  )

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      // Once the session is known, wait for the first token attempt (ready or
      // error) so the navbar never gets stuck on a failed token request.
      isPending:
        isPending ||
        (user !== null && tokenStatus !== "ready" && tokenStatus !== "error"),
      signOut,
      refreshAccessToken,
    }),
    [user, isPending, tokenStatus, signOut, refreshAccessToken]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error("useAuth must be used inside <AuthProvider>")
  }

  return context
}
