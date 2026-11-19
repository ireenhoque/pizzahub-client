import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Admin dashboard",
}

// Placeholder — overview stats, users, menu, and transactions come later.

export default function AdminDashboardPage() {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-semibold tracking-[0.14em] text-primary uppercase">
        Workspace
      </p>
      <h1 className="font-heading text-3xl font-bold">Admin dashboard</h1>
      <p className="max-w-prose text-muted-foreground">
        Overview stats, user management, and transaction history are coming
        soon.
      </p>
    </div>
  )
}
