"use client"

import {
  BadgeCheck,
  Clock,
  CreditCard,
  ReceiptText,
  RefreshCw,
  Store,
  Users,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react"

import { EmptyState } from "@/components/empty-state"
import { ErrorState } from "@/components/error-state"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { apiErrorMessage } from "@/lib/api-error"
import { formatCurrency, formatNumber } from "@/lib/format"
import { useAdminOverview } from "@/lib/admin-queries"

type StatCardProps = {
  label: string
  value: string
  caption: string
  icon: LucideIcon
}

function StatCard({ label, value, caption, icon: Icon }: StatCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
        <CardAction>
          <span className="flex size-8 items-center justify-center rounded-lg bg-muted text-primary">
            <Icon className="size-4" aria-hidden="true" />
          </span>
        </CardAction>
      </CardHeader>
      <CardContent>
        <p className="font-heading text-3xl font-bold tracking-tight">
          {value}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">{caption}</p>
      </CardContent>
    </Card>
  )
}

function StatCardSkeleton() {
  return (
    <Card aria-hidden="true">
      <CardHeader>
        <Skeleton className="h-4 w-28" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-9 w-16" />
        <Skeleton className="mt-2 h-3 w-32" />
      </CardContent>
    </Card>
  )
}

function amountLabel(amount: number, currency: string) {
  // Mixed-currency ledgers have no single valid Intl currency code.
  return /^[A-Z]{3}$/.test(currency)
    ? formatCurrency(amount, currency)
    : formatNumber(amount)
}

function AdminOverview() {
  const query = useAdminOverview()
  const overview = query.data?.data

  const isEmpty = overview
    ? [
        overview.users.total,
        overview.menuItems.total,
        overview.orders.total,
        overview.transactions.count,
      ].every((count) => count === 0)
    : false

  return (
    <section aria-labelledby="admin-overview-heading" className="space-y-4">
      <div className="flex flex-col gap-1">
        <h2 id="admin-overview-heading" className="font-heading text-xl font-bold">
          Platform overview
        </h2>
        <p className="text-sm text-muted-foreground">
          A live snapshot of accounts, menu activity and payment records.
        </p>
      </div>

      {query.isError ? (
        <ErrorState
          title="Couldn't load the overview"
          description={apiErrorMessage(query.error)}
          action={
            <Button
              variant="outline"
              onClick={() => {
                void query.refetch()
              }}
            >
              <RefreshCw aria-hidden="true" />
              Try again
            </Button>
          }
        />
      ) : null}

      {query.isPending ? (
        <div
          className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
          aria-label="Loading platform overview"
        >
          {Array.from({ length: 8 }, (_, index) => (
            <StatCardSkeleton key={index} />
          ))}
        </div>
      ) : null}

      {!query.isPending && !query.isError && isEmpty ? (
        <EmptyState
          title="No marketplace data yet"
          description="Counts will appear here as users, menu items and transactions are recorded."
        />
      ) : null}

      {!query.isPending && !query.isError && overview && !isEmpty ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total users"
            value={formatNumber(overview.users.total)}
            caption="All registered accounts"
            icon={Users}
          />
          <StatCard
            label="Customers"
            value={formatNumber(overview.users.customers)}
            caption="Accounts with the customer role"
            icon={Users}
          />
          <StatCard
            label="Vendors"
            value={formatNumber(overview.users.vendors)}
            caption="Accounts with the vendor role"
            icon={Store}
          />
          <StatCard
            label="Pending approvals"
            value={formatNumber(overview.menuItems.pending)}
            caption="Menu items awaiting review"
            icon={Clock}
          />
          <StatCard
            label="Active menu items"
            value={formatNumber(overview.menuItems.active)}
            caption="Live on the storefront"
            icon={UtensilsCrossed}
          />
          <StatCard
            label="Total orders"
            value={formatNumber(overview.orders.total)}
            caption="Across all order statuses"
            icon={ReceiptText}
          />
          <StatCard
            label="Transactions"
            value={formatNumber(overview.transactions.count)}
            caption={`${formatNumber(overview.transactions.paidCount)} paid records`}
            icon={CreditCard}
          />
          <StatCard
            label="Paid amount"
            value={amountLabel(
              overview.transactions.paidAmount,
              overview.transactions.currency
            )}
            caption="From paid transaction records"
            icon={BadgeCheck}
          />
        </div>
      ) : null}
    </section>
  )
}

export { AdminOverview }
