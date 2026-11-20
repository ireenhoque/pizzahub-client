"use client"

import { keepPreviousData, useQuery } from "@tanstack/react-query"

import { adminQueryKeyBases } from "@/lib/admin-queries"
import { api } from "@/lib/api-client"
import type {
  AdminTransactionSortField,
  AdminTransactionSortOrder,
  AdminTransactionsResponse,
  PaymentStatus,
  TransactionType,
} from "@/types"

export type AdminTransactionsQuery = {
  page?: number
  limit?: number
  search?: string
  status?: PaymentStatus
  type?: TransactionType
  sortBy?: AdminTransactionSortField
  sortOrder?: AdminTransactionSortOrder
  from?: string
  to?: string
}

function toQueryString(values: Record<string, string | number | undefined>) {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(values)) {
    if (value !== undefined && value !== "") params.set(key, String(value))
  }
  return params.toString()
}

export function adminTransactionsQueryString(
  query: AdminTransactionsQuery = {}
) {
  return toQueryString({
    page: query.page ?? 1,
    limit: query.limit ?? 10,
    search: query.search?.trim() || undefined,
    status: query.status,
    type: query.type,
    sortBy: query.sortBy ?? "createdAt",
    sortOrder: query.sortOrder ?? "desc",
    from: query.from,
    to: query.to,
  })
}

export const adminTransactionQueryKeys = {
  all: [...adminQueryKeyBases.transactions] as const,
  list: (query: AdminTransactionsQuery = {}) =>
    [
      ...adminQueryKeyBases.transactions,
      "list",
      adminTransactionsQueryString(query),
    ] as const,
}

/** Raw API call — the endpoint is guarded by requireAuth + requireAdmin. */
export function fetchAdminTransactions(query: AdminTransactionsQuery = {}) {
  const queryString = adminTransactionsQueryString(query)
  return api.get<AdminTransactionsResponse>(`/transactions?${queryString}`)
}

/** TanStack Query hook over the admin transaction history API. */
export function useAdminTransactions(
  query: AdminTransactionsQuery = {},
  enabled = true
) {
  return useQuery({
    queryKey: adminTransactionQueryKeys.list(query),
    queryFn: () => fetchAdminTransactions(query),
    placeholderData: keepPreviousData,
    enabled,
  })
}
