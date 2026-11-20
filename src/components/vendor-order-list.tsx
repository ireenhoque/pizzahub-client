"use client"

import Link from "next/link"
import { useState } from "react"
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Package,
  RotateCcw,
} from "lucide-react"
import { EmptyState } from "@/components/empty-state"
import { ErrorState } from "@/components/error-state"
import { PageContainer } from "@/components/page-container"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { apiErrorMessage } from "@/lib/api-error"
import { formatCurrency, formatDate, formatNumber } from "@/lib/format"
import {
  ORDER_STATUS_LABELS,
  orderStatusVariant,
  VENDOR_ORDER_STATUSES,
} from "@/lib/vendor-order-status"
import { useVendorOrders } from "@/lib/vendor-queries"
import type { Order, OrderStatus, VendorOrderStatus } from "@/types"
import { cn } from "cn"

const PAGE_SIZE = 10

type StatusFilter = VendorOrderStatus | "all"

function OrderCard({ order }: { order: Order }) {
  const orderDate = order.placedAt ?? order.createdAt

  return (
    <Card className="h-full gap-4 p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="font-heading text-lg font-bold" title={order._id}>
            Order #{order._id.slice(-8)}
          </p>
          <p className="text-xs text-muted-foreground">
            Placed {formatDate(orderDate)}
          </p>
        </div>
        <Badge variant={orderStatusVariant(order.status)}>
          {ORDER_STATUS_LABELS[order.status]}
        </Badge>
      </div>

      <div className="flex flex-col gap-1 text-sm text-muted-foreground">
        <p>
          Customer{" "}
          <span title={order.customerId}>#{order.customerId.slice(-8)}</span>
        </p>
        <p className="line-clamp-2">{order.deliveryAddress}</p>
        {order.contactPhone ? <p>{order.contactPhone}</p> : null}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
        <div>
          <p className="font-heading text-lg font-bold">
            {formatCurrency(order.totalAmount, order.currency)}
          </p>
          <p className="text-xs text-muted-foreground">
            {formatNumber(order.lineItems.length)} item
            {order.lineItems.length === 1 ? "" : "s"}
          </p>
        </div>
        <Link
          href={`/vendor/orders/${order._id}`}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          View details
          <ArrowUpRight aria-hidden="true" />
        </Link>
      </div>
    </Card>
  )
}

function VendorOrderList() {
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState<StatusFilter>("all")

  const ordersQuery = useVendorOrders({ page, limit: PAGE_SIZE })
  const orders = ordersQuery.data?.data.orders ?? []
  const pagination = ordersQuery.data?.data.pagination
  const filteredOrders =
    status === "all"
      ? orders
      : orders.filter((order) => order.status === status)
  const isRefreshing = ordersQuery.isFetching && !ordersQuery.isPending

  function changeStatus(nextStatus: StatusFilter) {
    setStatus(nextStatus)
    setPage(1)
  }

  return (
    <PageContainer size="wide" className="space-y-6 py-8 sm:py-10">
      <div className="flex flex-col gap-3">
        <p className="text-xs font-semibold tracking-[0.14em] text-primary uppercase">
          Workspace
        </p>
        <h1 className="font-heading text-3xl font-bold">Orders</h1>
        <p className="max-w-prose text-muted-foreground">
          Follow incoming orders and move each one through fulfillment.
        </p>
      </div>

      <Card>
        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium">Filter by status</p>
            <div
              role="group"
              aria-label="Filter orders by status"
              className="flex flex-wrap gap-2"
            >
              <button
                type="button"
                aria-pressed={status === "all"}
                onClick={() => changeStatus("all")}
                className={cn(
                  buttonVariants({
                    variant: status === "all" ? "secondary" : "outline",
                  }),
                  "h-9 rounded-full px-3"
                )}
              >
                All
              </button>
              {VENDOR_ORDER_STATUSES.map((value) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={status === value}
                  onClick={() => changeStatus(value)}
                  className={cn(
                    buttonVariants({
                      variant: status === value ? "secondary" : "outline",
                    }),
                    "h-9 rounded-full px-3"
                  )}
                >
                  {ORDER_STATUS_LABELS[value]}
                </button>
              ))}
            </div>
          </div>
          <p className="text-xs text-muted-foreground sm:max-w-48">
            Filters apply to the current page because the API does not accept a
            vendor status filter.
          </p>
        </div>
      </Card>

      {ordersQuery.isPending ? (
        <div
          role="status"
          aria-label="Loading orders"
          className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
        >
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-52 rounded-xl" />
          ))}
        </div>
      ) : ordersQuery.isError ? (
        <ErrorState
          icon={RotateCcw}
          title="Couldn't load orders"
          description={apiErrorMessage(ordersQuery.error)}
          action={
            <Button
              variant="outline"
              disabled={ordersQuery.isFetching}
              onClick={() => void ordersQuery.refetch()}
            >
              <RotateCcw
                aria-hidden="true"
                className={ordersQuery.isFetching ? "animate-spin" : undefined}
              />
              Try again
            </Button>
          }
        />
      ) : orders.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No orders yet"
          description="Orders from your menu items will appear here as soon as customers place them."
        />
      ) : filteredOrders.length === 0 ? (
        <EmptyState
          icon={Package}
          title={`No ${ORDER_STATUS_LABELS[status as OrderStatus].toLowerCase()} orders on this page`}
          description="Try another status filter or move to a different page."
          action={
            <Button variant="outline" onClick={() => changeStatus("all")}>
              Clear filter
            </Button>
          }
        />
      ) : (
        <>
          <p className="text-sm text-muted-foreground" aria-live="polite">
            Showing {formatNumber(filteredOrders.length)} of{" "}
            {formatNumber(orders.length)} orders on this page ·{" "}
            {formatNumber(pagination?.total ?? 0)} total
            {isRefreshing ? " · refreshing…" : ""}
          </p>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredOrders.map((order) => (
              <OrderCard key={order._id} order={order} />
            ))}
          </div>

          {pagination && pagination.totalPages > 1 ? (
            <nav
              aria-label="Vendor order pagination"
              className="flex flex-wrap items-center justify-center gap-4"
            >
              <Button
                variant="outline"
                disabled={pagination.page <= 1 || isRefreshing}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
              >
                <ChevronLeft aria-hidden="true" />
                Previous
              </Button>
              <span
                className="text-sm text-muted-foreground"
                aria-live="polite"
              >
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                disabled={
                  pagination.page >= pagination.totalPages || isRefreshing
                }
                onClick={() => setPage((current) => current + 1)}
              >
                Next
                <ChevronRight aria-hidden="true" />
              </Button>
            </nav>
          ) : null}
        </>
      )}
    </PageContainer>
  )
}

export { VendorOrderList }
