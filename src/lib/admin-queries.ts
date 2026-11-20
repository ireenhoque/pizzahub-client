"use client"

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query"

import { api } from "@/lib/api-client"
import { vendorQueryKeyBases } from "@/lib/vendor-queries"
import type {
  ApiEnvelope,
  MenuItem,
  MenuItemStatus,
  PaginationMeta,
  UserRole,
} from "@/types"

export type AdminMenuItemsQuery = {
  page?: number
  limit?: number
  status?: MenuItemStatus
  search?: string
}

export type AdminMenuItemsResponse = ApiEnvelope<Paginated<MenuItem>>

export type AdminMenuItemActionResponse = ApiEnvelope<{ menuItem: MenuItem }>

export type AdminVendorUser = {
  id: string
  name?: string
  email?: string
  role: UserRole
  roles: UserRole[]
}

export type AdminVendorsResponse = ApiEnvelope<{
  users: AdminVendorUser[]
  pagination: PaginationMeta
}>

type Paginated<T> = {
  items: T[]
  pagination: PaginationMeta
}

function toQueryString(values: Record<string, string | number | undefined>) {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(values)) {
    if (value !== undefined) params.set(key, String(value))
  }
  return params.toString()
}

export function adminMenuItemsQueryString(query: AdminMenuItemsQuery = {}) {
  return toQueryString({
    page: query.page ?? 1,
    limit: query.limit ?? 12,
    status: query.status,
    search: query.search,
  })
}

export const adminQueryKeyBases = {
  menuItems: ["admin", "menu-items"] as const,
  transactions: ["admin", "transactions"] as const,
  users: ["admin", "users"] as const,
  vendors: ["admin", "vendors"] as const,
}

export const adminQueryKeys = {
  menuItems: (query: AdminMenuItemsQuery = {}) =>
    [
      ...adminQueryKeyBases.menuItems,
      "list",
      adminMenuItemsQueryString(query),
    ] as const,
  vendors: [...adminQueryKeyBases.vendors, "list"] as const,
}

function invalidateAdminMenuData(queryClient: QueryClient) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: adminQueryKeyBases.menuItems }),
    queryClient.invalidateQueries({ queryKey: vendorQueryKeyBases.menuItems }),
    // Approval changes storefront visibility; these are the public cache keys.
    queryClient.invalidateQueries({ queryKey: ["menu-items"] }),
    queryClient.invalidateQueries({ queryKey: ["menu-item"] }),
  ])
}

/** Raw API calls — admin endpoints are role-guarded by the Express API. */
export function fetchAdminMenuItems(query: AdminMenuItemsQuery = {}) {
  const queryString = adminMenuItemsQueryString(query)
  return api.get<AdminMenuItemsResponse>(`/menu-items/admin?${queryString}`)
}

export function fetchAdminVendors() {
  return api.get<AdminVendorsResponse>("/users?role=vendor&page=1&limit=100")
}

export function approveAdminMenuItem(id: string) {
  return api.patch<AdminMenuItemActionResponse>(
    `/menu-items/admin/${encodeURIComponent(id)}/approve`
  )
}

export function rejectAdminMenuItem(id: string) {
  return api.patch<AdminMenuItemActionResponse>(
    `/menu-items/admin/${encodeURIComponent(id)}/reject`
  )
}

/** TanStack Query hooks over the admin review API. */
export function useAdminMenuItems(query: AdminMenuItemsQuery = {}) {
  return useQuery({
    queryKey: adminQueryKeys.menuItems(query),
    queryFn: () => fetchAdminMenuItems(query),
    placeholderData: keepPreviousData,
  })
}

export function useAdminVendors() {
  return useQuery({
    queryKey: adminQueryKeys.vendors,
    queryFn: fetchAdminVendors,
    staleTime: 5 * 60 * 1000,
  })
}

export function useApproveAdminMenuItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: approveAdminMenuItem,
    onSuccess: () => invalidateAdminMenuData(queryClient),
  })
}

export function useRejectAdminMenuItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: rejectAdminMenuItem,
    onSuccess: () => invalidateAdminMenuData(queryClient),
  })
}
