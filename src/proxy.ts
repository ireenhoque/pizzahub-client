import { NextResponse, type NextRequest } from "next/server"

// Next.js 16 Proxy (the renamed middleware convention).
//
// This is a UX guard only: it keeps anonymous users out of dashboard routes
// and signed-in users out of the auth pages. The Express API remains the
// authorization authority and re-reads `role`/`isBlocked` from MongoDB on
// every protected request, so a stale or tampered client cannot gain access.
//
// The session is resolved through the public Better Auth endpoint instead of
// importing the server-only auth module (which owns the Mongo client).

type ProxySession = {
  user: {
    role?: unknown
    isBlocked?: unknown
  }
}

const roleRoutes = [
  { prefix: "/admin", role: "admin" },
  { prefix: "/vendor", role: "vendor" },
] as const

function matchesPrefix(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`)
}

function hasRole(value: unknown, required: string): boolean {
  const roles = Array.isArray(value) ? value : [value]
  return roles.some((role) => role === required)
}

function homePathForRole(value: unknown): string {
  const roles = Array.isArray(value) ? value : [value]
  if (roles.includes("admin")) return "/admin"
  if (roles.includes("vendor")) return "/vendor"
  return "/"
}

async function getSession(request: NextRequest): Promise<ProxySession | null> {
  try {
    const response = await fetch(
      new URL("/api/auth/get-session", request.url),
      {
        headers: { cookie: request.headers.get("cookie") ?? "" },
        cache: "no-store",
      }
    )

    if (!response.ok) return null

    const data: unknown = await response.json()
    if (!data || typeof data !== "object" || !("user" in data)) return null

    const user = (data as { user?: unknown }).user
    if (!user || typeof user !== "object") return null

    return { user: user as ProxySession["user"] }
  } catch {
    // Treat an unreachable session endpoint as anonymous; the API still
    // rejects unauthorized requests, so this only affects navigation.
    return null
  }
}

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const { pathname, search } = request.nextUrl

  if (pathname === "/login" || pathname === "/register") {
    const session = await getSession(request)

    if (session && session.user.isBlocked !== true) {
      return NextResponse.redirect(
        new URL(homePathForRole(session.user.role), request.url)
      )
    }

    return NextResponse.next()
  }

  const requiredRole = roleRoutes.find((route) =>
    matchesPrefix(pathname, route.prefix)
  )?.role

  if (!requiredRole) return NextResponse.next()

  const session = await getSession(request)

  if (!session) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("redirectTo", `${pathname}${search}`)
    return NextResponse.redirect(loginUrl)
  }

  if (session.user.isBlocked === true) {
    return NextResponse.redirect(new URL("/?auth=blocked", request.url))
  }

  if (!hasRole(session.user.role, requiredRole)) {
    return NextResponse.redirect(new URL("/?auth=forbidden", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*", "/vendor/:path*", "/login", "/register"],
}
