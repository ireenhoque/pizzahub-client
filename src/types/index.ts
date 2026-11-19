// Shared cross-cutting types. Component/route-specific props stay next to
// their components; only types used across modules live here.

/** Envelope APIs return on failure (parsed by `ApiError` in lib/api-client). */
export type ApiErrorBody = {
  message?: string
  errors?: Record<string, string[]>
}

/**
 * Standard list payload. Provisional — confirm field names against the
 * backend contract before wiring real requests.
 */
export type Paginated<T> = {
  items: T[]
  page: number
  pageSize: number
  total: number
}

/** Signed-in account rendered in the navbar profile dropdown (auth later). */
export type ProfileUser = {
  name: string
  email?: string
  avatarUrl?: string
}
