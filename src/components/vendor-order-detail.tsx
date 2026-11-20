"use client"

import Link from "next/link"
import { useState } from "react"
import {
  ArrowLeft,
  MapPin,
  Package,
  Phone,
  RotateCcw,
  StickyNote,
} from "lucide-react"
import { toast } from "sonner"
import { EmptyState } from "@/components/empty-state"
import { ErrorState } from "@/components/error-state"
import { PageContainer } from "@/components/page-container"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { ApiError } from "@/lib/api-client"
import { apiErrorMessage } from "@/lib/api-error"
import { formatCurrency, formatDate, formatNumber } from "@/lib/format"
import {
  ORDER_STATUS_ACTION_LABELS,
  ORDER_STATUS_LABELS,
  orderStatusVariant,
  VENDOR_ORDER_STATUSES,
  VENDOR_ORDER_TRANSITIONS,
} from "@/lib/vendor-order-status"
import {
  useUpdateVendorOrderStatus,
  useVendorOrder,
} from "@/lib/vendor-queries"
import type { Order, VendorOrderStatus } from "@/types"
import { cn } from "cn"

function OrderDetailSkeleton() {
  return (
    <PageContainer size="wide" className="space-y-6 py-8 sm:py-10">
      <div role="status" aria-label="Loading order" className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-6">
            <Skeleton className="h-48 rounded-xl" />
            <Skeleton className="h-72 rounded-xl" />
          </div>
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    </PageContainer>
  )
}

type OrderStatusActionsProps = {
  order: Order
  onRefresh: () => void
}

function OrderStatusActions({ order, onRefresh }: OrderStatusActionsProps) {
  const mutation = useUpdateVendorOrderStatus()
  const [cancelOpen, setCancelOpen] = useState(false)
  const allowed = VENDOR_ORDER_TRANSITIONS[order.status]
  const isConflict =
    mutation.error instanceof ApiError && mutation.error.status === 409

  function update(status: VendorOrderStatus) {
    mutation.reset()
    mutation.mutate(
      { id: order._id, input: { status } },
      {
        onSuccess: () => {
          toast.success(
            status === "cancelled"
              ? "Order cancelled"
              : `Order marked ${ORDER_STATUS_LABELS[status].toLowerCase()}`
          )
          if (status === "cancelled") setCancelOpen(false)
        },
      }
    )
  }

  function renderError() {
    if (!mutation.error) return null
    return (
      <ErrorState
        className="py-6"
        title={
          isConflict ? "Order status changed" : "Couldn't update the order"
        }
        description={
          isConflict
            ? "This order may have been updated elsewhere. Refresh to see the latest status before trying again."
            : apiErrorMessage(mutation.error)
        }
        action={
          <Button
            variant="outline"
            onClick={() => {
              mutation.reset()
              setCancelOpen(false)
              onRefresh()
            }}
          >
            <RotateCcw aria-hidden="true" />
            Refresh
          </Button>
        }
      />
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Update status</CardTitle>
        <CardDescription>
          Only transitions allowed for the current status are enabled.
        </CardDescription>
        <Badge variant={orderStatusVariant(order.status)}>
          {ORDER_STATUS_LABELS[order.status]}
        </Badge>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        {VENDOR_ORDER_STATUSES.map((status) => {
          const enabled = allowed.includes(status) && !mutation.isPending
          return (
            <Button
              key={status}
              type="button"
              variant={status === "cancelled" ? "destructive" : "outline"}
              disabled={!enabled}
              onClick={() =>
                status === "cancelled" ? setCancelOpen(true) : update(status)
              }
            >
              {ORDER_STATUS_ACTION_LABELS[status]}
            </Button>
          )
        })}
      </CardContent>
      {allowed.length === 0 ? (
        <CardFooter>
          <p className="text-xs text-muted-foreground">
            This order is in a final state and cannot be changed further.
          </p>
        </CardFooter>
      ) : null}
      {renderError()}

      <Sheet
        open={cancelOpen}
        onOpenChange={(open) => {
          if (!open && !mutation.isPending) setCancelOpen(false)
        }}
      >
        <SheetContent side="bottom" className="mx-auto max-w-lg rounded-t-2xl">
          <SheetHeader>
            <SheetTitle>Cancel this order?</SheetTitle>
            <SheetDescription>
              Order #{order._id.slice(-8)} will be marked cancelled. This is a
              final state and cannot be undone.
            </SheetDescription>
          </SheetHeader>
          {renderError()}
          <SheetFooter className="sm:justify-end">
            <SheetClose
              render={
                <Button variant="outline" disabled={mutation.isPending} />
              }
            >
              Keep order
            </SheetClose>
            <Button
              variant="destructive"
              disabled={mutation.isPending}
              onClick={() => update("cancelled")}
            >
              {mutation.isPending ? "Cancelling…" : "Cancel order"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </Card>
  )
}

function VendorOrderDetail({ id }: { id: string }) {
  const orderQuery = useVendorOrder(id)

  if (orderQuery.isPending) return <OrderDetailSkeleton />

  if (orderQuery.isError) {
    return (
      <PageContainer size="wide" className="py-8 sm:py-10">
        <ErrorState
          icon={RotateCcw}
          title="Couldn't load this order"
          description={apiErrorMessage(orderQuery.error)}
          action={
            <Button
              variant="outline"
              disabled={orderQuery.isFetching}
              onClick={() => void orderQuery.refetch()}
            >
              <RotateCcw
                aria-hidden="true"
                className={orderQuery.isFetching ? "animate-spin" : undefined}
              />
              Try again
            </Button>
          }
        />
      </PageContainer>
    )
  }

  const order = orderQuery.data?.data.order
  if (!order) {
    return (
      <PageContainer size="wide" className="py-8 sm:py-10">
        <EmptyState
          icon={Package}
          title="Order not found"
          description="It may have been removed or the link is incorrect."
          action={
            <Link
              href="/vendor/orders"
              className={cn(buttonVariants(), "w-full sm:w-auto")}
            >
              <ArrowLeft aria-hidden="true" />
              Back to orders
            </Link>
          }
        />
      </PageContainer>
    )
  }

  const orderDate = order.placedAt ?? order.createdAt

  return (
    <PageContainer size="wide" className="space-y-6 py-8 sm:py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-3">
          <p className="text-xs font-semibold tracking-[0.14em] text-primary uppercase">
            Workspace
          </p>
          <h1 className="font-heading text-3xl font-bold" title={order._id}>
            Order #{order._id.slice(-8)}
          </h1>
          <p className="flex flex-wrap items-center gap-2 text-muted-foreground">
            <Badge variant={orderStatusVariant(order.status)}>
              {ORDER_STATUS_LABELS[order.status]}
            </Badge>
            Placed {formatDate(orderDate)}
          </p>
        </div>
        <Link
          href="/vendor/orders"
          className={cn(
            buttonVariants({ variant: "outline" }),
            "w-full sm:w-auto"
          )}
        >
          <ArrowLeft aria-hidden="true" />
          Back to orders
        </Link>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Line items</CardTitle>
              <CardDescription>
                Names and prices captured when the order was placed.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-0 sm:px-(--card-spacing)">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[32rem] text-sm">
                  <thead className="text-left text-xs text-muted-foreground">
                    <tr className="border-b border-border">
                      <th scope="col" className="px-4 py-2 font-medium sm:px-0">
                        Item
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-2 text-right font-medium"
                      >
                        Qty
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-2 text-right font-medium"
                      >
                        Unit price
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-2 text-right font-medium sm:pr-0"
                      >
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {order.lineItems.map((line) => (
                      <tr key={line.menuItemId}>
                        <td className="px-4 py-3 sm:px-0">
                          <p className="font-medium">{line.name}</p>
                          <p
                            className="text-xs text-muted-foreground"
                            title={line.menuItemId}
                          >
                            #{line.menuItemId.slice(-8)}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums">
                          {formatNumber(line.quantity)}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums">
                          {formatCurrency(line.unitPrice, order.currency)}
                        </td>
                        <td className="px-4 py-3 text-right font-medium tabular-nums sm:pr-0">
                          {formatCurrency(
                            line.unitPrice * line.quantity,
                            order.currency
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
            <CardFooter className="justify-end">
              <div className="w-full max-w-xs space-y-2 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="tabular-nums">
                    {formatCurrency(order.subtotal, order.currency)}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Delivery fee</span>
                  <span className="tabular-nums">
                    {formatCurrency(order.deliveryFee, order.currency)}
                  </span>
                </div>
                <div className="flex justify-between gap-4 border-t border-border pt-2 font-heading text-base font-bold">
                  <span>Total</span>
                  <span className="tabular-nums">
                    {formatCurrency(order.totalAmount, order.currency)}
                  </span>
                </div>
              </div>
            </CardFooter>
          </Card>

          <OrderStatusActions
            order={order}
            onRefresh={() => void orderQuery.refetch()}
          />
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Delivery details</CardTitle>
              <CardDescription>
                Information supplied with the order.
              </CardDescription>
            </CardHeader>
            <CardContent className="gap-4">
              <div className="flex gap-3">
                <MapPin
                  className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                  aria-hidden="true"
                />
                <div className="min-w-0">
                  <p className="text-xs font-medium">Address</p>
                  <p className="text-sm break-words text-muted-foreground">
                    {order.deliveryAddress}
                  </p>
                </div>
              </div>
              {order.contactPhone ? (
                <div className="flex gap-3">
                  <Phone
                    className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <div>
                    <p className="text-xs font-medium">Contact</p>
                    <p className="text-sm text-muted-foreground">
                      {order.contactPhone}
                    </p>
                  </div>
                </div>
              ) : null}
              {order.notes ? (
                <div className="flex gap-3">
                  <StickyNote
                    className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <div>
                    <p className="text-xs font-medium">Customer notes</p>
                    <p className="text-sm break-words text-muted-foreground">
                      {order.notes}
                    </p>
                  </div>
                </div>
              ) : null}
              <div className="border-t border-border pt-4">
                <p className="text-xs font-medium">Customer reference</p>
                <p
                  className="text-sm text-muted-foreground"
                  title={order.customerId}
                >
                  #{order.customerId.slice(-8)}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent className="gap-3 text-sm">
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">Placed</span>
                <span>{formatDate(orderDate)}</span>
              </div>
              {order.deliveredAt ? (
                <div className="flex justify-between gap-3">
                  <span className="text-muted-foreground">Delivered</span>
                  <span>{formatDate(order.deliveredAt)}</span>
                </div>
              ) : null}
              {order.cancelledAt ? (
                <div className="flex justify-between gap-3">
                  <span className="text-muted-foreground">Cancelled</span>
                  <span>{formatDate(order.cancelledAt)}</span>
                </div>
              ) : null}
              {order.cancellationReason ? (
                <div className="border-t border-border pt-3">
                  <p className="text-muted-foreground">Cancellation reason</p>
                  <p className="break-words">{order.cancellationReason}</p>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  )
}

export { VendorOrderDetail }
