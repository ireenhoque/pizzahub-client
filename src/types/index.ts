// Shared cross-cutting types. Component/route-specific props stay next to
// their components; only types used across modules live here.

/** PizzaHub roles — mirrors `USER_ROLES` in pizzahub-server. */
export const USER_ROLES = ["customer", "vendor", "admin"] as const

export type UserRole = (typeof USER_ROLES)[number]

/** One field-level validation issue from the Express error envelope. */
export type ApiErrorDetail = {
  field: string
  message: string
}

/** Envelope APIs return on failure (parsed by `ApiError` in lib/api-client). */
export type ApiErrorBody = {
  message?: string
  errors?: Record<string, string[]>
  /** Zod validation issues — `[{ field, message }]` (see server validate.ts). */
  details?: ApiErrorDetail[]
}

/** Standard success envelope used by every Express endpoint. */
export type ApiEnvelope<T> = {
  success: boolean
  message: string
  data: T
}

/** Pagination meta exactly as the Express list endpoints return it. */
export type PaginationMeta = {
  page: number
  limit: number
  total: number
  totalPages: number
}

/** Paginated list payload — `data.items` + `data.pagination`. */
export type Paginated<T> = {
  items: T[]
  pagination: PaginationMeta
}

/** Menu categories — mirrors `MENU_ITEM_CATEGORIES` in pizzahub-server. */
export type MenuItemCategory =
  "pizza" | "sides" | "drinks" | "desserts" | "combos"

/** Menu lifecycle — mirrors `MENU_ITEM_STATUSES` in pizzahub-server. */
export type MenuItemStatus =
  "pending" | "active" | "rejected" | "inactive" | "out_of_stock"

/**
 * Public menu item from `GET /api/menu-items` (the server's whitelist DTO).
 * `vendorName` is not exposed by the API yet — it renders automatically as
 * soon as the backend provides it; today the card falls back to the id.
 */
export type MenuItem = {
  id: string
  vendorId: string
  name: string
  description: string
  category: MenuItemCategory
  price: number
  currency: string
  location: string
  imageUrl: string
  imageThumbUrl?: string | null
  status: MenuItemStatus
  isAvailable: boolean
  ratingAvg: number
  ratingCount: number
  createdAt?: string
  updatedAt?: string
  vendorName?: string | null
}

/** Response of `GET /api/menu-items`. */
export type MenuItemListResponse = ApiEnvelope<Paginated<MenuItem>>

/** Sortable fields accepted by `GET /api/menu-items`. */
export type MenuItemSortField = "price" | "ratingAvg" | "createdAt"

/** Sort directions accepted by `GET /api/menu-items`. */
export type MenuItemSortOrder = "asc" | "desc"

/**
 * Response of `GET /api/menu-items/:id`.
 * The server nests the item under `data.menuItem` (unlike the list response).
 */
export type MenuItemDetailResponse = ApiEnvelope<{ menuItem: MenuItem }>

/**
 * Signed-in account rendered in the navbar/profile menu.
 *
 * `role` and `isBlocked` are owned by the server: Better Auth writes them from
 * its configured defaults, and the Express API re-reads them from MongoDB on
 * every protected request. The client uses them for navigation only — never
 * for authorization.
 */
export type ProfileUser = {
  id: string
  name: string
  email?: string
  avatarUrl?: string
  role: UserRole
  isBlocked: boolean
}

/** Order lifecycle — mirrors `ORDER_STATUSES` in pizzahub-server. */
export const ORDER_STATUSES = [
  "cart",
  "placed",
  "preparing",
  "ready",
  "out_for_delivery",
  "delivered",
  "cancelled",
] as const

export type OrderStatus = (typeof ORDER_STATUSES)[number]

/** Price/name snapshot taken when the order was created. */
export type OrderLineItem = {
  menuItemId: string
  name: string
  unitPrice: number
  quantity: number
}

/**
 * Order from the Express API. Mongo ObjectIds arrive as strings in JSON and
 * the order controller does not remap `_id` to `id` (unlike menu items).
 */
export type Order = {
  _id: string
  customerId: string
  vendorId: string
  lineItems: OrderLineItem[]
  status: OrderStatus
  subtotal: number
  deliveryFee: number
  totalAmount: number
  currency: string
  deliveryAddress: string
  contactPhone?: string
  notes?: string
  placedAt?: string
  deliveredAt?: string
  cancelledAt?: string
  cancellationReason?: string
  createdAt: string
  updatedAt: string
}

/**
 * Body accepted by `POST /api/orders`. There is deliberately no currency
 * field: the server derives it from the menu items it fetches.
 */
export type CreateOrderInput = {
  lineItems: Array<{ menuItemId: string; quantity: number }>
  deliveryAddress: string
  contactPhone?: string
  notes?: string
}

export type CreateOrderResponse = ApiEnvelope<{ order: Order }>

/** `data` of `GET /api/orders/my` — keyed by `orders`, not `items`. */
export type CustomerOrdersResponse = ApiEnvelope<{
  orders: Order[]
  pagination: PaginationMeta
}>

export type OrderDetailResponse = ApiEnvelope<{ order: Order }>
