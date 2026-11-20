"use client"

import { usePathname } from "next/navigation"
import { VendorShell } from "@/components/vendor-shell"

// Shared dashboard entry point. Vendor routes get the guarded sidebar shell;
// every other dashboard route keeps the existing neutral canvas so admin work
// can land separately without inheriting vendor navigation.

function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  if (pathname === "/vendor" || pathname.startsWith("/vendor/")) {
    return <VendorShell>{children}</VendorShell>
  }

  return (
    <div className="flex min-h-svh">
      <main
        id="main-content"
        className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8"
      >
        {children}
      </main>
    </div>
  )
}

export { DashboardShell }
