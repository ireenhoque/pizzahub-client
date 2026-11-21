"use client"

import Link from "next/link"
import { CreditCard } from "lucide-react"

import { AdminGuard } from "@/components/admin-guard"
import { AdminMenuApproval } from "@/components/admin-menu-approval"
import { AdminOverview } from "@/components/admin-overview"
import { PageContainer } from "@/components/page-container"
import { buttonVariants } from "@/components/ui/button"

function AdminDashboard() {
  return (
    <AdminGuard>
      <PageContainer size="wide" className="space-y-6 py-10">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-3">
            <p className="text-xs font-semibold tracking-[0.14em] text-primary uppercase">
              Workspace
            </p>
            <h1 className="font-heading text-3xl font-bold">Admin dashboard</h1>
            <p className="max-w-prose text-muted-foreground">
              Review vendor submissions and keep the marketplace stocked with
              fresh menu items.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin/users"
              className={buttonVariants({ variant: "outline" })}
            >
              Manage users
            </Link>
            <Link
              href="/admin/transactions"
              className={buttonVariants({ variant: "outline" })}
            >
              <CreditCard aria-hidden="true" />
              Transactions
            </Link>
          </div>
        </header>

        <AdminOverview />
        <AdminMenuApproval />
      </PageContainer>
    </AdminGuard>
  )
}

export { AdminDashboard }
