"use client"

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"

import { api } from "@/lib/api-client"
import { adminQueryKeyBases } from "@/lib/admin-queries"
import type { ApiEnvelope, PaginationMeta, UserRole } from "@/types"

export type AdminUser = {
  id: string
  name?: string
  email?: string
  role: UserRole
  roles: UserRole[]
  isBlocked: boolean
  createdAt?: string
}

export type AdminUsersQuery = {
  page?: number
  limit?: number
  search?: string
  role?: UserRole
}

export type AdminUsersResponse = ApiEnvelope<{
  users: AdminUser[]
  pagination: PaginationMeta
}>

export type AdminUserActionResponse = ApiEnvelope<{ user: AdminUser }>

function toQueryString(values: Record<string, string | number | undefined>) {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(values)) {
    if (value !== undefined && value !== "") params.set(key, String(value))
  }
  return params.toString()
}

export function adminUsersQueryString(query: AdminUsersQuery = {}) {
  return toQueryString({
    page: query.page ?? 1,
    limit: query.limit ?? 10,
    search: query.search?.trim() || undefined,
    role: query.role,
  })
}

export const adminUserQueryKeys = {
  all: [...adminQueryKeyBases.users] as const,
  list: (query: AdminUsersQuery = {}) =>
    [
      ...adminQueryKeyBases.users,
      "list",
      adminUsersQueryString(query),
    ] as const,
}

/** Raw API calls — every endpoint here is requireAuth + requireAdmin on the server. */
export function fetchAdminUsers(query: AdminUsersQuery = {}) {
  const queryString = adminUsersQueryString(query)
  return api.get<AdminUsersResponse>(`/users?${queryString}`)
}

export function blockAdminUser(id: string) {
  return api.post<AdminUserActionResponse>(
    `/users/${encodeURIComponent(id)}/block`,
    {}
  )
}

export function unblockAdminUser(id: string) {
  return api.post<AdminUserActionResponse>(
    `/users/${encodeURIComponent(id)}/unblock`,
    {}
  )
}

/** TanStack Query hooks over the admin user management API. */
export function useAdminUsers(query: AdminUsersQuery = {}) {
  return useQuery({
    queryKey: adminUserQueryKeys.list(query),
    queryFn: () => fetchAdminUsers(query),
    placeholderData: keepPreviousData,
  })
}

function useInvalidateAdminUsers() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: adminUserQueryKeys.all })
}

export function useBlockAdminUser() {
  const invalidate = useInvalidateAdminUsers()
  return useMutation({
    mutationFn: blockAdminUser,
    onSuccess: invalidate,
  })
}

export function useUnblockAdminUser() {
  const invalidate = useInvalidateAdminUsers()
  return useMutation({
    mutationFn: unblockAdminUser,
    onSuccess: invalidate,
  })
}
