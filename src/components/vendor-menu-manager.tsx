"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import {
  ChevronLeft,
  ChevronRight,
  Pencil,
  Plus,
  Trash,
  UtensilsCrossed,
} from "lucide-react"
import { EmptyState } from "@/components/empty-state"
import { ErrorState } from "@/components/error-state"
import { PageContainer } from "@/components/page-container"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardAction,
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
import { apiErrorMessage } from "@/lib/api-error"
import { formatCurrency, formatDate, formatNumber } from "@/lib/format"
import {
  useDeleteVendorMenuItem,
  useUpdateVendorMenuItem,
  useVendorMenuItems,
} from "@/lib/vendor-queries"
import type { MenuItem, MenuItemCategory, MenuItemStatus } from "@/types"
import { cn } from "cn"

const PAGE_SIZE = 12

const STATUS_FILTERS: Array<{
  value: MenuItemStatus | "all"
  label: string
}> = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "out_of_stock", label: "Out of stock" },
]

function categoryLabel(category: MenuItemCategory) {
  return category.charAt(0).toUpperCase() + category.slice(1)
}

function statusLabel(status: MenuItemStatus) {
  if (status === "out_of_stock") return "Out of stock"
  return status.charAt(0).toUpperCase() + status.slice(1)
}

function statusVariant(
  status: MenuItemStatus
): "success" | "pending" | "destructive" | "secondary" {
  if (status === "active") return "success"
  if (status === "pending" || status === "out_of_stock") return "pending"
  if (status === "rejected") return "destructive"
  return "secondary"
}

function MenuCardSkeleton() {
  return (
    <Card aria-hidden="true">
      <div className="px-4 pt-4">
        <Skeleton className="aspect-[4/3] w-full rounded-lg" />
      </div>
      <CardHeader>
        <Skeleton className="h-5 w-3/4" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-3 w-full" />
        <Skeleton className="mt-2 h-3 w-2/3" />
      </CardContent>
      <CardFooter>
        <Skeleton className="h-8 w-24" />
      </CardFooter>
    </Card>
  )
}

type MenuItemCardProps = {
  item: MenuItem
  isUpdating: boolean
  isDeleting: boolean
  onToggleAvailability: (item: MenuItem) => void
  onRequestDelete: (item: MenuItem) => void
}

function MenuItemCard({
  item,
  isUpdating,
  isDeleting,
  onToggleAvailability,
  onRequestDelete,
}: MenuItemCardProps) {
  const mutationsDisabled = isUpdating || isDeleting

  return (
    <Card className="h-full transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift">
      <div className="px-4 pt-4">
        <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-muted">
          {item.imageUrl ? (
            <Image
              src={item.imageUrl}
              alt={item.name}
              fill
              sizes="(min-width: 1280px) 25vw, (min-width: 768px) 50vw, 100vw"
              className="object-cover transition-transform duration-500 group-hover/card:scale-105"
            />
          ) : (
            <span className="flex size-full items-center justify-center text-muted-foreground">
              <UtensilsCrossed className="size-8" aria-hidden="true" />
            </span>
          )}
          <Badge
            variant="secondary"
            className="absolute top-3 left-3 capitalize"
          >
            {categoryLabel(item.category)}
          </Badge>
          <Badge
            variant={statusVariant(item.status)}
            className="absolute top-3 right-3"
          >
            {statusLabel(item.status)}
          </Badge>
        </div>
      </div>

      <CardHeader className="pt-4">
        <CardTitle className="text-base leading-snug">{item.name}</CardTitle>
        <CardDescription className="line-clamp-2">
          {item.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="font-heading text-base font-bold">
            {formatCurrency(item.price, item.currency)}
          </span>
          <span className="text-xs text-muted-foreground">{item.location}</span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium">Availability</span>
            <Badge variant={item.isAvailable ? "success" : "secondary"}>
              {item.isAvailable ? "Available" : "Unavailable"}
            </Badge>
          </div>
          <Button
            type="button"
            variant="outline"
            aria-pressed={item.isAvailable}
            disabled={mutationsDisabled}
            onClick={() => onToggleAvailability(item)}
          >
            {isUpdating ? "Saving…" : item.isAvailable ? "Turn off" : "Turn on"}
          </Button>
        </div>

        {item.createdAt ? (
          <p className="text-xs text-muted-foreground">
            Created {formatDate(item.createdAt)}
          </p>
        ) : null}
      </CardContent>

      <CardFooter className="gap-2">
        <Link
          href={`/vendor/menu/${item.id}/edit`}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          <Pencil aria-hidden="true" />
          Edit
        </Link>
        <Button
          type="button"
          variant="destructive"
          size="sm"
          disabled={mutationsDisabled}
          onClick={() => onRequestDelete(item)}
        >
          <Trash aria-hidden="true" />
          {isDeleting ? "Deleting…" : "Delete"}
        </Button>
      </CardFooter>
    </Card>
  )
}

function VendorMenuManager() {
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState<MenuItemStatus | "all">("all")
  const [itemToDelete, setItemToDelete] = useState<MenuItem | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const menuQuery = useVendorMenuItems({
    page,
    limit: PAGE_SIZE,
    status: status === "all" ? undefined : status,
  })
  const updateMutation = useUpdateVendorMenuItem()
  const deleteMutation = useDeleteVendorMenuItem()

  const items = menuQuery.data?.data.items ?? []
  const pagination = menuQuery.data?.data.pagination
  const isRefreshing = menuQuery.isFetching && !menuQuery.isPending
  const mutationError = updateMutation.error ?? deleteMutation.error

  function changeStatus(nextStatus: MenuItemStatus | "all") {
    setStatus(nextStatus)
    setPage(1)
  }

  function handleToggleAvailability(item: MenuItem) {
    setUpdatingId(item.id)
    updateMutation.reset()
    updateMutation.mutate(
      { id: item.id, input: { isAvailable: !item.isAvailable } },
      { onSettled: () => setUpdatingId(null) }
    )
  }

  function handleDeleteConfirm() {
    if (!itemToDelete) return
    deleteMutation.reset()
    deleteMutation.mutate(itemToDelete.id, {
      onSuccess: () => {
        setItemToDelete(null)
        if (items.length === 1 && page > 1) setPage(page - 1)
      },
    })
  }

  const activeFilter = STATUS_FILTERS.find((filter) => filter.value === status)

  return (
    <PageContainer size="wide" className="space-y-6 py-8 sm:py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-3">
          <p className="text-xs font-semibold tracking-[0.14em] text-primary uppercase">
            Workspace
          </p>
          <h1 className="font-heading text-3xl font-bold">My Menu</h1>
          <p className="max-w-prose text-muted-foreground">
            Add items, manage availability, and track admin approval in one
            place.
          </p>
        </div>
        <Link
          href="/vendor/menu/new"
          className={cn(buttonVariants(), "w-full sm:w-auto")}
        >
          <Plus aria-hidden="true" />
          Add menu item
        </Link>
      </div>

      {mutationError ? (
        <ErrorState
          title="Couldn't save that change"
          description={apiErrorMessage(mutationError)}
          action={
            <Button
              variant="outline"
              onClick={() => {
                updateMutation.reset()
                deleteMutation.reset()
              }}
            >
              Dismiss
            </Button>
          }
        />
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Filter by status</CardTitle>
          <CardDescription>
            Approval status is managed by PizzaHub admins; vendors can only
            change availability.
          </CardDescription>
          {menuQuery.data ? (
            <CardAction>
              <Badge variant="outline">
                {formatNumber(pagination?.total ?? 0)}{" "}
                {pagination?.total === 1 ? "item" : "items"}
              </Badge>
            </CardAction>
          ) : null}
        </CardHeader>
        <CardContent className="gap-3">
          <div
            role="group"
            aria-label="Filter menu items by status"
            className="flex flex-wrap gap-2"
          >
            {STATUS_FILTERS.map((filter) => (
              <button
                key={filter.value}
                type="button"
                aria-pressed={status === filter.value}
                onClick={() => changeStatus(filter.value)}
                className={cn(
                  buttonVariants({
                    variant: status === filter.value ? "secondary" : "outline",
                  }),
                  "h-10 rounded-full px-4"
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>
          {isRefreshing ? (
            <p role="status" className="text-xs text-muted-foreground">
              Refreshing menu…
            </p>
          ) : null}
        </CardContent>
      </Card>

      {menuQuery.isPending ? (
        <div
          role="status"
          aria-label="Loading menu items"
          className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
        >
          {Array.from({ length: 6 }).map((_, index) => (
            <MenuCardSkeleton key={index} />
          ))}
        </div>
      ) : menuQuery.isError ? (
        <ErrorState
          title="Couldn't load your menu"
          description={apiErrorMessage(menuQuery.error)}
          action={
            <Button variant="outline" onClick={() => void menuQuery.refetch()}>
              Try again
            </Button>
          }
        />
      ) : items.length === 0 ? (
        <EmptyState
          icon={UtensilsCrossed}
          title={
            status === "all"
              ? "Your menu is empty"
              : `No ${activeFilter?.label.toLowerCase()} items`
          }
          description={
            status === "all"
              ? "Add your first item to start building your storefront menu."
              : "Try a different status filter to see more items."
          }
          action={
            status === "all" ? (
              <Link
                href="/vendor/menu/new"
                className={cn(buttonVariants(), "w-full sm:w-auto")}
              >
                <Plus aria-hidden="true" />
                Add menu item
              </Link>
            ) : (
              <Button variant="outline" onClick={() => changeStatus("all")}>
                Clear filter
              </Button>
            )
          }
        />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => (
              <MenuItemCard
                key={item.id}
                item={item}
                isUpdating={updatingId === item.id && updateMutation.isPending}
                isDeleting={
                  itemToDelete?.id === item.id && deleteMutation.isPending
                }
                onToggleAvailability={handleToggleAvailability}
                onRequestDelete={(selected) => {
                  deleteMutation.reset()
                  setItemToDelete(selected)
                }}
              />
            ))}
          </div>

          {pagination && pagination.totalPages > 1 ? (
            <nav
              aria-label="Vendor menu pagination"
              className="flex flex-wrap items-center justify-center gap-4"
            >
              <Button
                variant="outline"
                className="h-10"
                disabled={pagination.page <= 1 || isRefreshing}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
              >
                <ChevronLeft aria-hidden="true" />
                Previous
              </Button>
              <span
                className="text-sm text-muted-foreground"
                aria-live="polite"
              >
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                className="h-10"
                disabled={
                  pagination.page >= pagination.totalPages || isRefreshing
                }
                onClick={() => setPage((current) => current + 1)}
              >
                Next
                <ChevronRight aria-hidden="true" />
              </Button>
            </nav>
          ) : null}
        </>
      )}

      <Sheet
        open={Boolean(itemToDelete)}
        onOpenChange={(open) => {
          if (!open && !deleteMutation.isPending) setItemToDelete(null)
        }}
      >
        <SheetContent side="bottom" className="mx-auto max-w-lg rounded-t-2xl">
          <SheetHeader>
            <SheetTitle>Delete menu item?</SheetTitle>
            <SheetDescription>
              {itemToDelete
                ? `“${itemToDelete.name}” will be permanently removed from your menu. This cannot be undone.`
                : "This item will be permanently removed."}
            </SheetDescription>
          </SheetHeader>
          {deleteMutation.isError ? (
            <ErrorState
              title="Delete failed"
              description={apiErrorMessage(deleteMutation.error)}
              className="py-6"
            />
          ) : null}
          <SheetFooter className="sm:justify-end">
            <SheetClose
              render={
                <Button variant="outline" disabled={deleteMutation.isPending} />
              }
            >
              Cancel
            </SheetClose>
            <Button
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={handleDeleteConfirm}
            >
              {deleteMutation.isPending ? "Deleting…" : "Delete item"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </PageContainer>
  )
}

export { VendorMenuManager }
