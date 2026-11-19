"use client"

import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { ChevronLeft, ChevronRight, Package, RotateCcw } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { EmptyState } from "@/components/empty-state"
import { ErrorState } from "@/components/error-state"
import { PageContainer } from "@/components/page-container"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { api } from "@/lib/api-client"
import { apiErrorMessage } from "@/lib/api-error"
import { formatCurrency, formatDate, formatNumber } from "@/lib/format"
import type {
  CustomerOrdersResponse,
  Order,
  OrderDetailResponse,
  OrderStatus,
} from "@/types"

// Customer order history. The list comes from `/orders/my`; opening an order
// fetches the authoritative detail from `/orders/:id`, which also enforces
// ownership on the server.

const PAGE_SIZE = 5

const STATUS_LABELS: Record<OrderStatus, string> = {
  cart: "Cart",
  placed: "Placed",
  preparing: "Preparing",
  ready: "Ready",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
}

type StatusVariant =
  "default" | "secondary" | "destructive" | "success" | "pending" | "outline"

function statusVariant(status: OrderStatus): StatusVariant {
  if (status === "delivered") return "success"
  if (status === "cancelled") return "destructive"
  if (status === "placed") return "secondary"
  return "pending"
}

function OrderCard({ order, onView }: { order: Order; onView: () => void }) {
  return (
    <Card className="flex flex-col gap-4 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <p className="font-heading text-lg font-bold">
            Order #{order._id.slice(-8)}
          </p>
          <p className="text-sm text-muted-foreground">
            {formatDate(order.createdAt)} · Vendor #{order.vendorId.slice(0, 8)}
          </p>
        </div>
        <Badge variant={statusVariant(order.status)}>
          {STATUS_LABELS[order.status]}
        </Badge>
      </div>

      <ul className="flex flex-col gap-1 text-sm text-muted-foreground">
        {order.lineItems.map((line) => (
          <li key={line.menuItemId} className="flex justify-between gap-3">
            <span className="truncate">
              {formatNumber(line.quantity)} × {line.name}
            </span>
            <span className="shrink-0 tabular-nums">
              {formatCurrency(line.unitPrice * line.quantity, order.currency)}
            </span>
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
        <p className="font-heading text-lg font-bold">
          {formatCurrency(order.totalAmount, order.currency)}
        </p>
        <Button variant="outline" size="sm" onClick={onView}>
          View details
        </Button>
      </div>
    </Card>
  )
}

function OrderHistory() {
  const [page, setPage] = useState(1)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const queryString = `page=${page}&limit=${PAGE_SIZE}`
  const ordersQuery = useQuery({
    queryKey: ["orders", "my", queryString],
    queryFn: () => api.get<CustomerOrdersResponse>(`/orders/my?${queryString}`),
    placeholderData: keepPreviousData,
  })

  const detailQuery = useQuery({
    queryKey: ["order", selectedId],
    queryFn: () =>
      api.get<OrderDetailResponse>(
        `/orders/${encodeURIComponent(selectedId ?? "")}`
      ),
    enabled: Boolean(selectedId),
  })

  const orders = ordersQuery.data?.data.orders ?? []
  const pagination = ordersQuery.data?.data.pagination
  const detail = detailQuery.data?.data.order

  return (
    <PageContainer className="py-12 md:py-16">
      <div className="flex flex-col gap-3 pb-8">
        <p className="text-xs font-semibold tracking-[0.14em] text-primary uppercase">
          Your orders
        </p>
        <h1 className="font-heading text-4xl font-extrabold tracking-tight md:text-5xl">
          Every slice, in one place.
        </h1>
        <p className="max-w-prose text-base text-muted-foreground">
          Follow your orders from placement to delivery and revisit the details
          of past meals.
        </p>
      </div>

      {ordersQuery.isPending ? (
        <div
          role="status"
          aria-label="Loading orders"
          className="grid gap-4 sm:grid-cols-2"
        >
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-44 rounded-xl" />
          ))}
        </div>
      ) : ordersQuery.isError ? (
        <ErrorState
          icon={RotateCcw}
          title="Couldn't load your orders"
          description={apiErrorMessage(ordersQuery.error)}
          action={
            <Button
              variant="outline"
              onClick={() => ordersQuery.refetch()}
              disabled={ordersQuery.isFetching}
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
          description="Once you place an order, its status and totals will appear here."
          action={
            <Link href="/menu" className={buttonVariants()}>
              Browse menu
            </Link>
          }
        />
      ) : (
        <>
          <p className="pb-4 text-sm text-muted-foreground">
            {formatNumber(pagination?.total ?? orders.length)} orders found
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            {orders.map((order) => (
              <OrderCard
                key={order._id}
                order={order}
                onView={() => setSelectedId(order._id)}
              />
            ))}
          </div>

          {pagination && pagination.totalPages > 1 ? (
            <nav
              aria-label="Order pagination"
              className="flex flex-wrap items-center justify-center gap-4 pt-6"
            >
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page <= 1 || ordersQuery.isFetching}
              >
                <ChevronLeft aria-hidden="true" />
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setPage((current) =>
                    Math.min(pagination.totalPages, current + 1)
                  )
                }
                disabled={
                  page >= pagination.totalPages || ordersQuery.isFetching
                }
              >
                Next
                <ChevronRight aria-hidden="true" />
              </Button>
            </nav>
          ) : null}
        </>
      )}

      <Sheet
        open={Boolean(selectedId)}
        onOpenChange={(open) => {
          if (!open) setSelectedId(null)
        }}
      >
        <SheetContent
          side="right"
          className="w-full gap-0 overflow-y-auto sm:max-w-md"
        >
          <SheetHeader className="gap-2 border-b pb-4">
            <p className="text-xs font-semibold tracking-[0.14em] text-primary uppercase">
              Order details
            </p>
            <SheetTitle className="pr-8 text-xl font-extrabold">
              {detail ? `Order #${detail._id.slice(-8)}` : "Order"}
            </SheetTitle>
            <SheetDescription>
              {detailQuery.isPending
                ? "Loading order details…"
                : "Details stored with your order."}
            </SheetDescription>
          </SheetHeader>

          <div className="flex flex-1 flex-col gap-5 p-4">
            {detailQuery.isPending ? (
              <div
                role="status"
                aria-label="Loading order details"
                className="flex flex-col gap-4"
              >
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-32 w-full rounded-xl" />
                <Skeleton className="h-20 w-full rounded-xl" />
              </div>
            ) : detailQuery.isError || !detail ? (
              <ErrorState
                title="Couldn't load order details"
                description={apiErrorMessage(detailQuery.error)}
                action={
                  <Button
                    variant="outline"
                    onClick={() => detailQuery.refetch()}
                    disabled={detailQuery.isFetching}
                  >
                    <RotateCcw aria-hidden="true" />
                    Try again
                  </Button>
                }
              />
            ) : (
              <>
                <div className="flex items-center justify-between gap-3">
                  <Badge variant={statusVariant(detail.status)}>
                    {STATUS_LABELS[detail.status]}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {formatDate(detail.createdAt)}
                  </span>
                </div>

                <div className="flex flex-col gap-2">
                  <h3 className="font-heading font-bold">Items</h3>
                  <ul className="divide-y divide-border rounded-xl border border-border px-4">
                    {detail.lineItems.map((line) => (
                      <li
                        key={line.menuItemId}
                        className="flex justify-between gap-3 py-3 text-sm"
                      >
                        <span>
                          {formatNumber(line.quantity)} × {line.name}
                        </span>
                        <span className="shrink-0 tabular-nums">
                          {formatCurrency(
                            line.unitPrice * line.quantity,
                            detail.currency
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <dl className="flex flex-col gap-2 rounded-xl border border-border bg-muted/30 p-4 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <dt>Subtotal</dt>
                    <dd>{formatCurrency(detail.subtotal, detail.currency)}</dd>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <dt>Delivery</dt>
                    <dd>
                      {formatCurrency(detail.deliveryFee, detail.currency)}
                    </dd>
                  </div>
                  <div className="flex justify-between border-t border-border pt-2 font-heading text-base font-bold">
                    <dt>Total</dt>
                    <dd>
                      {formatCurrency(detail.totalAmount, detail.currency)}
                    </dd>
                  </div>
                </dl>

                <div className="flex flex-col gap-2 text-sm">
                  <h3 className="font-heading font-bold">Delivery</h3>
                  <p className="text-muted-foreground">
                    {detail.deliveryAddress}
                  </p>
                  {detail.contactPhone ? (
                    <p className="text-muted-foreground">
                      Phone: {detail.contactPhone}
                    </p>
                  ) : null}
                  {detail.notes ? (
                    <p className="text-muted-foreground">
                      Notes: {detail.notes}
                    </p>
                  ) : null}
                </div>

                <p className="text-xs text-muted-foreground">
                  Currency: {detail.currency} · Vendor #
                  {detail.vendorId.slice(0, 8)}
                </p>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </PageContainer>
  )
}

export { OrderHistory }
