"use client"

import { usePathname, useRouter } from "next/navigation"
import { useEffect, useMemo } from "react"

import { useAuth } from "@/components/auth-provider"
import { Skeleton } from "@/components/ui/skeleton"
import { dashboardPathForRole } from "@/lib/roles"

// Client-side UX guard for /admin routes. Proxy and the Express API remain the
// authorization authorities; this only decides which page a session sees.

type AdminGuardProps = {
  children: React.ReactNode
}

function AdminGuardLoading({ label }: { label: string }) {
  return (
    <div
      role="status"
      aria-label={label}
      className="flex min-h-svh items-center justify-center bg-background p-6"
    >
      <span className="sr-only">{label}</span>
      <div className="w-full max-w-7xl space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-4 w-full max-w-prose" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((index) => (
            <Skeleton key={index} className="h-96 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  )
}

function AdminGuard({ children }: AdminGuardProps) {
  const { user, isPending } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const redirectTo = useMemo(() => {
    if (!user) {
      return `/login?redirectTo=${encodeURIComponent(pathname)}`
    }
    if (user.isBlocked) return "/?auth=blocked"
    if (user.role === "admin") return null
    return dashboardPathForRole(user.role) ?? "/"
  }, [user, pathname])

  useEffect(() => {
    if (isPending || !redirectTo) return
    router.replace(redirectTo)
  }, [isPending, redirectTo, router])

  if (isPending) {
    return <AdminGuardLoading label="Checking your session" />
  }

  if (redirectTo) {
    return <AdminGuardLoading label="Redirecting" />
  }

  return <>{children}</>
}

export { AdminGuard, type AdminGuardProps }
