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
