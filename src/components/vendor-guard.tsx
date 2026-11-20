"use client"

import { usePathname, useRouter } from "next/navigation"
import { useEffect, useMemo } from "react"
import { useAuth } from "@/components/auth-provider"
import { Skeleton } from "@/components/ui/skeleton"
import { dashboardPathForRole } from "@/lib/roles"

// Client-side UX guard for /vendor routes. The Express API remains the
// authorization authority; this only decides which page a session sees.

type VendorGuardProps = {
  children: React.ReactNode
}

function VendorGuardLoading({ label }: { label: string }) {
  return (
    <div
      role="status"
      aria-label={label}
      className="flex min-h-svh items-center justify-center bg-background p-6"
    >
      <span className="sr-only">{label}</span>
      <div className="w-full max-w-6xl space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((index) => (
            <Skeleton key={index} className="h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-72 rounded-xl" />
      </div>
    </div>
  )
}

function VendorGuard({ children }: VendorGuardProps) {
  const { user, isPending } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const redirectTo = useMemo(() => {
    if (!user) {
      return `/login?redirectTo=${encodeURIComponent(pathname)}`
    }
    if (user.isBlocked) return "/?auth=blocked"
    if (user.role === "vendor") return null
    return dashboardPathForRole(user.role) ?? "/"
  }, [user, pathname])

  useEffect(() => {
    if (isPending || !redirectTo) return
    router.replace(redirectTo)
  }, [isPending, redirectTo, router])

  if (isPending) {
    return <VendorGuardLoading label="Checking your session" />
  }

  if (redirectTo) {
    return <VendorGuardLoading label="Redirecting" />
  }

  return <>{children}</>
}

export { VendorGuard, type VendorGuardProps }
