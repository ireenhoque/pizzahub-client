import type { OrderStatus, VendorOrderStatus } from "@/types"

// Mirrors the Express order service transition table. `cart` is customer-owned
// and is intentionally not offered to vendors; delivered/cancelled are final.
export const VENDOR_ORDER_TRANSITIONS: Record<
  OrderStatus,
  readonly VendorOrderStatus[]
> = {
  cart: [],
  placed: ["preparing", "cancelled"],
  preparing: ["ready", "cancelled"],
  ready: ["out_for_delivery", "cancelled"],
  out_for_delivery: ["delivered", "cancelled"],
  delivered: [],
  cancelled: [],
}

export const VENDOR_ORDER_STATUSES: readonly VendorOrderStatus[] = [
  "placed",
  "preparing",
  "ready",
  "out_for_delivery",
  "delivered",
  "cancelled",
]

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  cart: "Cart",
  placed: "Placed",
  preparing: "Preparing",
  ready: "Ready",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
}

export const ORDER_STATUS_ACTION_LABELS: Record<VendorOrderStatus, string> = {
  placed: "Mark as placed",
  preparing: "Start preparing",
  ready: "Mark ready",
  out_for_delivery: "Mark out for delivery",
  delivered: "Mark delivered",
  cancelled: "Cancel order",
}

type OrderStatusVariant =
  "default" | "secondary" | "destructive" | "success" | "pending" | "outline"

export function orderStatusVariant(status: OrderStatus): OrderStatusVariant {
  if (status === "delivered") return "success"
  if (status === "cancelled") return "destructive"
  if (status === "placed") return "secondary"
  return "pending"
}
