"use client"

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query"
import { api } from "@/lib/api-client"
import type {
  CreateVendorMenuItemInput,
  MenuItemDetailResponse,
  OrderDetailResponse,
  UpdateVendorMenuItemInput,
  UpdateVendorOrderStatusInput,
  VendorCheckoutResponse,
  VendorMenuItemsQuery,
  VendorMenuItemsResponse,
  VendorMenuItemResponse,
  VendorOrdersQuery,
  VendorOrdersResponse,
  VendorSubscriptionResponse,
} from "@/types"

function toQueryString(values: Record<string, string | number | undefined>) {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(values)) {
    if (value !== undefined) params.set(key, String(value))
  }
  return params.toString()
}

export function vendorMenuItemsQueryString(query: VendorMenuItemsQuery = {}) {
  return toQueryString({
    page: query.page ?? 1,
    limit: query.limit ?? 20,
    status: query.status,
  })
}

export function vendorOrdersQueryString(query: VendorOrdersQuery = {}) {
  return toQueryString({
    page: query.page ?? 1,
    limit: query.limit ?? 20,
  })
}

export const vendorQueryKeyBases = {
  menuItems: ["vendor", "menu-items"] as const,
  orders: ["vendor", "orders"] as const,
}

export const vendorQueryKeys = {
  menuItems: (query: VendorMenuItemsQuery = {}) =>
    [
      ...vendorQueryKeyBases.menuItems,
      "list",
      vendorMenuItemsQueryString(query),
    ] as const,
  menuItem: (id: string) =>
    [...vendorQueryKeyBases.menuItems, "detail", id] as const,
  orders: (query: VendorOrdersQuery = {}) =>
    [
      ...vendorQueryKeyBases.orders,
      "list",
      vendorOrdersQueryString(query),
    ] as const,
  order: (id: string) => [...vendorQueryKeyBases.orders, "detail", id] as const,
  subscription: ["vendor", "subscription"] as const,
}

const publicMenuItemsKey = ["menu-items"] as const
const publicMenuItemKey = ["menu-item"] as const
const customerOrdersKey = ["orders"] as const
const customerOrderKey = ["order"] as const

function invalidateVendorMenuItems(queryClient: QueryClient) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: vendorQueryKeyBases.menuItems }),
    queryClient.invalidateQueries({ queryKey: publicMenuItemsKey }),
    queryClient.invalidateQueries({ queryKey: publicMenuItemKey }),
  ])
}

function invalidateVendorOrders(queryClient: QueryClient) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: vendorQueryKeyBases.orders }),
    queryClient.invalidateQueries({ queryKey: customerOrdersKey }),
    queryClient.invalidateQueries({ queryKey: customerOrderKey }),
  ])
}

function invalidateVendorSubscription(queryClient: QueryClient) {
  return queryClient.invalidateQueries({
    queryKey: vendorQueryKeys.subscription,
  })
}

/** Raw API calls — reusable outside React when needed. */
export function fetchVendorMenuItems(query: VendorMenuItemsQuery = {}) {
  const queryString = vendorMenuItemsQueryString(query)
  return api.get<VendorMenuItemsResponse>(`/menu-items/mine?${queryString}`)
}

export function fetchVendorMenuItem(id: string) {
  return api.get<MenuItemDetailResponse>(
    `/menu-items/${encodeURIComponent(id)}`
  )
}

export function createVendorMenuItem(input: CreateVendorMenuItemInput) {
  const formData = new FormData()
  formData.set("name", input.name)
  formData.set("category", input.category)
  formData.set("description", input.description)
  formData.set("price", String(input.price))
  formData.set("location", input.location)
  formData.set("image", input.image)
  return api.post<VendorMenuItemResponse>("/menu-items", formData)
}

export function updateVendorMenuItem(
  id: string,
  input: UpdateVendorMenuItemInput
) {
  return api.patch<VendorMenuItemResponse>(
    `/menu-items/mine/${encodeURIComponent(id)}`,
    input
  )
}

export function deleteVendorMenuItem(id: string) {
  return api.delete<VendorMenuItemResponse>(
    `/menu-items/mine/${encodeURIComponent(id)}`
  )
}

export function fetchVendorOrders(query: VendorOrdersQuery = {}) {
  const queryString = vendorOrdersQueryString(query)
  return api.get<VendorOrdersResponse>(`/orders/vendor?${queryString}`)
}

export function updateVendorOrderStatus(
  id: string,
  input: UpdateVendorOrderStatusInput
) {
  return api.patch<OrderDetailResponse>(
    `/orders/${encodeURIComponent(id)}/status`,
    input
  )
}

export function fetchVendorSubscription() {
  return api.get<VendorSubscriptionResponse>("/subscriptions")
}

export function startVendorSubscription() {
  return api.post<VendorCheckoutResponse>("/subscriptions/checkout")
}

export function cancelVendorSubscription() {
  return api.post<VendorSubscriptionResponse>("/subscriptions/cancel")
}

/** TanStack Query hooks over the raw vendor API calls. */
export function useVendorMenuItems(query: VendorMenuItemsQuery = {}) {
  return useQuery({
    queryKey: vendorQueryKeys.menuItems(query),
    queryFn: () => fetchVendorMenuItems(query),
    placeholderData: keepPreviousData,
  })
}

export function useVendorMenuItem(id: string | null) {
  return useQuery({
    queryKey: vendorQueryKeys.menuItem(id ?? "none"),
    queryFn: () => fetchVendorMenuItem(id ?? ""),
    enabled: Boolean(id),
  })
}

export function useVendorOrders(query: VendorOrdersQuery = {}) {
  return useQuery({
    queryKey: vendorQueryKeys.orders(query),
    queryFn: () => fetchVendorOrders(query),
    placeholderData: keepPreviousData,
  })
}

export function useVendorSubscription() {
  return useQuery({
    queryKey: vendorQueryKeys.subscription,
    queryFn: fetchVendorSubscription,
  })
}

export type UpdateVendorMenuItemVariables = {
  id: string
  input: UpdateVendorMenuItemInput
}

export type UpdateVendorOrderStatusVariables = {
  id: string
  input: UpdateVendorOrderStatusInput
}

export function useCreateVendorMenuItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createVendorMenuItem,
    onSuccess: () => invalidateVendorMenuItems(queryClient),
  })
}

export function useUpdateVendorMenuItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: UpdateVendorMenuItemVariables) =>
      updateVendorMenuItem(id, input),
    onSuccess: () => invalidateVendorMenuItems(queryClient),
  })
}

export function useDeleteVendorMenuItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteVendorMenuItem(id),
    onSuccess: () => invalidateVendorMenuItems(queryClient),
  })
}

export function useUpdateVendorOrderStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: UpdateVendorOrderStatusVariables) =>
      updateVendorOrderStatus(id, input),
    onSuccess: () => invalidateVendorOrders(queryClient),
  })
}

export function useStartVendorSubscription() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: startVendorSubscription,
    onSuccess: () => invalidateVendorSubscription(queryClient),
  })
}

export function useCancelVendorSubscription() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: cancelVendorSubscription,
    onSuccess: () => invalidateVendorSubscription(queryClient),
  })
}
