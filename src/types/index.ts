// Shared cross-cutting types. Component/route-specific props stay next to
// their components; only types used across modules live here.

/** Envelope APIs return on failure (parsed by `ApiError` in lib/api-client). */
export type ApiErrorBody = {
  message?: string
  errors?: Record<string, string[]>
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

/** Signed-in account rendered in the navbar profile dropdown (auth later). */
export type ProfileUser = {
  name: string
  email?: string
  avatarUrl?: string
}
