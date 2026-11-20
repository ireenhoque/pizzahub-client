"use client"

import Link from "next/link"
import {
  ArrowUpRight,
  BadgeCheck,
  Clock,
  Plus,
  ReceiptText,
  Sparkles,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react"
import { EmptyState } from "@/components/empty-state"
import { ErrorState } from "@/components/error-state"
import { PageContainer } from "@/components/page-container"
import { Button, buttonVariants } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { apiErrorMessage } from "@/lib/api-error"
import { formatCurrency, formatDate, formatNumber } from "@/lib/format"
import {
  useVendorMenuItems,
  useVendorOrders,
  useVendorSubscription,
} from "@/lib/vendor-queries"
import type { OrderStatus } from "@/types"
import { cn } from "cn"

const DASHBOARD_QUERY = { page: 1, limit: 100 } as const
const RECENT_ORDER_COUNT = 5
/** Mirrors FREE_PLAN_MAX_ACTIVE_MENU_ITEMS in the Express menu service. */
const FREE_PLAN_MENU_ITEM_LIMIT = 3

const quickActions: Array<{
  href: string
  label: string
  icon: LucideIcon
}> = [
  { href: "/vendor/menu/new", label: "Add menu item", icon: Plus },
  { href: "/vendor/menu", label: "Manage menu", icon: UtensilsCrossed },
  { href: "/vendor/orders", label: "View orders", icon: ReceiptText },
  {
    href: "/vendor/subscription",
    label: "Manage subscription",
    icon: Sparkles,
  },
]

function shortId(value: string) {
  return value.length > 10 ? `${value.slice(0, 8)}…` : value
}

function planLabel(plan: string | undefined) {
  if (!plan) return "—"
  if (plan === "free") return "Free"
  return plan.charAt(0).toUpperCase() + plan.slice(1)
}

function orderStatusLabel(status: OrderStatus) {
  const label = status.replace(/_/g, " ")
  return label.charAt(0).toUpperCase() + label.slice(1)
}

function orderStatusVariant(
  status: OrderStatus
): "success" | "pending" | "destructive" | "secondary" {
  if (status === "delivered") return "success"
  if (status === "cancelled") return "destructive"
  if (status === "placed" || status === "preparing" || status === "ready") {
    return "pending"
  }
  if (status === "out_for_delivery") return "pending"
  return "secondary"
}

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

function VendorOverview() {
  const menuQuery = useVendorMenuItems(DASHBOARD_QUERY)
  const ordersQuery = useVendorOrders(DASHBOARD_QUERY)
  const subscriptionQuery = useVendorSubscription()

  const queries = [menuQuery, ordersQuery, subscriptionQuery]
  const failedQueries = queries.filter((query) => query.isError)
  const isLoading = queries.some((query) => query.isPending)

  const menuItems = menuQuery.data?.data.items ?? []
  const activeCount = menuItems.filter(
    (item) => item.status === "active"
  ).length
  const pendingCount = menuItems.filter(
    (item) => item.status === "pending"
  ).length

  const orders = ordersQuery.data?.data.orders ?? []
  const totalOrders = ordersQuery.data?.data.pagination.total ?? 0
  const recentOrders = orders.slice(0, RECENT_ORDER_COUNT)

  const subscription = subscriptionQuery.data?.data.subscription
  const plan = planLabel(subscription?.plan)
  const usage = subscription
    ? subscription.isActive
      ? "Unlimited active items"
      : `${formatNumber(activeCount)} of ${FREE_PLAN_MENU_ITEM_LIMIT} active items`
    : "—"

  function retryFailedQueries() {
    for (const query of failedQueries) void query.refetch()
  }

  return (
    <PageContainer size="wide" className="space-y-8 py-8 sm:py-10">
      <div className="flex flex-col gap-3">
        <p className="text-xs font-semibold tracking-[0.14em] text-primary uppercase">
          Workspace
        </p>
        <h1 className="font-heading text-3xl font-bold">Vendor dashboard</h1>
        <p className="max-w-prose text-muted-foreground">
          Manage your menu, follow incoming orders, and keep your subscription
          in one place.
        </p>
      </div>

      {failedQueries.length ? (
        <ErrorState
          title="Some dashboard data could not be loaded"
          description={failedQueries
            .map((query) => apiErrorMessage(query.error))
            .join(" · ")}
          action={
            <Button variant="outline" onClick={retryFailedQueries}>
              Try again
            </Button>
          }
        />
      ) : null}

      <section aria-labelledby="vendor-summary-heading" className="space-y-4">
        <h2 id="vendor-summary-heading" className="sr-only">
          Summary
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {isLoading || failedQueries.length ? (
            [0, 1, 2, 3].map((index) => <StatCardSkeleton key={index} />)
          ) : (
            <>
              <StatCard
                label="Active menu items"
                value={formatNumber(activeCount)}
                caption="Live on your storefront"
                icon={BadgeCheck}
              />
              <StatCard
                label="Pending menu items"
                value={formatNumber(pendingCount)}
                caption="Waiting for admin approval"
                icon={Clock}
              />
              <StatCard
                label="Total orders"
                value={formatNumber(totalOrders)}
                caption="Across all order statuses"
                icon={ReceiptText}
              />
              <StatCard
                label="Subscription"
                value={plan}
                caption={
                  subscription?.isActive
                    ? usage
                    : `${usage}${subscription ? " · inactive" : ""}`
                }
                icon={Sparkles}
              />
            </>
          )}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Card>
          <CardHeader>
            <CardTitle>Recent orders</CardTitle>
            <CardDescription>
              The latest orders placed from your storefront.
            </CardDescription>
            {ordersQuery.data ? (
              <CardAction>
                <Badge variant="outline">
                  {formatNumber(totalOrders)} total
                </Badge>
              </CardAction>
            ) : null}
          </CardHeader>

          <CardContent>
            {ordersQuery.isPending ? (
              <div className="space-y-4" aria-hidden="true">
                {[0, 1, 2].map((index) => (
                  <div
                    key={index}
                    className="space-y-2 border-b border-border pb-4 last:border-b-0"
                  >
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-64" />
                  </div>
                ))}
              </div>
            ) : ordersQuery.isError ? (
              <ErrorState
                title="Orders are unavailable"
                description={apiErrorMessage(ordersQuery.error)}
                action={
                  <Button
                    variant="outline"
                    onClick={() => void ordersQuery.refetch()}
                  >
                    Retry
                  </Button>
                }
              />
            ) : recentOrders.length === 0 ? (
              <EmptyState
                icon={ReceiptText}
                title="No orders yet"
                description="New customer orders will appear here as soon as they are placed."
              />
            ) : (
              <div className="divide-y divide-border">
                {recentOrders.map((order) => (
                  <div
                    key={order._id}
                    className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium" title={order._id}>
                          Order #{shortId(order._id)}
                        </span>
                        <Badge variant={orderStatusVariant(order.status)}>
                          {orderStatusLabel(order.status)}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Customer{" "}
                        <span title={order.customerId}>
                          {shortId(order.customerId)}
                        </span>
                        <span aria-hidden="true"> · </span>
                        Placed {formatDate(order.createdAt)}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {order.deliveryAddress}
                      </p>
                      {order.contactPhone ? (
                        <p className="text-xs text-muted-foreground">
                          {order.contactPhone}
                        </p>
                      ) : null}
                    </div>
                    <div className="shrink-0 sm:text-right">
                      <p className="font-heading text-base font-bold">
                        {formatCurrency(order.totalAmount, order.currency)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatNumber(order.lineItems.length)} item
                        {order.lineItems.length === 1 ? "" : "s"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>

          <CardFooter>
            <Link
              href="/vendor/orders"
              className={cn(
                buttonVariants({ variant: "link", size: "sm" }),
                "px-0"
              )}
            >
              View all orders
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </Link>
          </CardFooter>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick actions</CardTitle>
              <CardDescription>Jump back into your workspace.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {quickActions.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "h-11 w-full justify-start gap-3"
                  )}
                >
                  <Icon className="size-4 text-primary" aria-hidden="true" />
                  <span>{label}</span>
                  <ArrowUpRight
                    className="ml-auto size-4 text-muted-foreground"
                    aria-hidden="true"
                  />
                </Link>
              ))}
            </CardContent>
          </Card>

          <div className="rounded-xl bg-gradient-to-br from-primary to-secondary p-5 text-primary-foreground shadow-card">
            <Sparkles className="size-5" aria-hidden="true" />
            <p className="mt-3 font-heading text-lg font-bold">
              Keep the oven busy
            </p>
            <p className="mt-1 text-sm text-primary-foreground/80">
              Fresh menu items and quick order updates keep customers coming
              back.
            </p>
          </div>
        </div>
      </div>
    </PageContainer>
  )
}

export { VendorOverview }
