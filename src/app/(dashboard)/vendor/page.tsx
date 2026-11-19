import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Vendor dashboard",
}

// Placeholder — menu items, customer orders, and subscriptions come later.

export default function VendorDashboardPage() {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-semibold tracking-[0.14em] text-primary uppercase">
        Workspace
      </p>
      <h1 className="font-heading text-3xl font-bold">Vendor dashboard</h1>
      <p className="max-w-prose text-muted-foreground">
        Menu management, customer orders, and subscription plans are coming
        soon.
      </p>
    </div>
  )
}
