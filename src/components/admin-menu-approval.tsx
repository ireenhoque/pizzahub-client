"use client"

import Image from "next/image"
import { useState } from "react"
import { toast } from "sonner"
import {
  Check,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Store,
  UtensilsCrossed,
  X,
} from "lucide-react"

import { EmptyState } from "@/components/empty-state"
import { ErrorState } from "@/components/error-state"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { apiErrorMessage } from "@/lib/api-error"
import { formatCurrency } from "@/lib/format"
import {
  useAdminMenuItems,
  useAdminVendors,
  useApproveAdminMenuItem,
  useRejectAdminMenuItem,
} from "@/lib/admin-queries"
import type { MenuItem, MenuItemCategory } from "@/types"

const PAGE_SIZE = 12

function categoryLabel(category: MenuItemCategory) {
  return category.charAt(0).toUpperCase() + category.slice(1)
}

function ReviewCardSkeleton() {
  return (
    <Card aria-hidden="true">
      <div className="px-4 pt-4">
        <Skeleton className="aspect-[4/3] w-full rounded-lg" />
      </div>
      <CardHeader>
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-3 w-full" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="mt-2 h-4 w-2/3" />
      </CardContent>
      <CardFooter>
        <Skeleton className="h-9 w-full" />
      </CardFooter>
    </Card>
  )
}

type PendingItemCardProps = {
  item: MenuItem
  vendorName?: string
  isApproving: boolean
  isRejecting: boolean
  onApprove: (item: MenuItem) => void
  onReject: (item: MenuItem) => void
}

function PendingItemCard({
  item,
  vendorName,
  isApproving,
  isRejecting,
  onApprove,
  onReject,
}: PendingItemCardProps) {
  const busy = isApproving || isRejecting

  return (
    <Card className="h-full overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift">
      <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-muted">
        <Image
          src={item.imageThumbUrl || item.imageUrl}
          alt={item.name}
          fill
          sizes="(min-width: 1280px) 25vw, (min-width: 768px) 50vw, 100vw"
          className="object-cover"
        />
        <Badge variant="secondary" className="absolute top-3 left-3 capitalize">
          {categoryLabel(item.category)}
        </Badge>
        <Badge variant="pending" className="absolute top-3 right-3">
          Pending
        </Badge>
      </div>

      <CardHeader className="pt-4">
        <CardTitle className="text-base leading-snug">{item.name}</CardTitle>
        <CardDescription className="line-clamp-3">
          {item.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="gap-3">
        <div className="flex items-center justify-between gap-2">
          <span className="font-heading text-base font-bold">
            {formatCurrency(item.price, item.currency)}
          </span>
          <span className="text-xs text-muted-foreground">{item.location}</span>
        </div>
        <div className="flex min-w-0 items-center gap-2 text-sm">
          <Store className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          <span className="truncate" title={vendorName ?? item.vendorId}>
            <span className="text-muted-foreground">Vendor: </span>
            {vendorName ?? item.vendorId}
          </span>
        </div>
      </CardContent>

      <CardFooter className="grid grid-cols-2 gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={busy}
          onClick={() => onReject(item)}
        >
          <X aria-hidden="true" />
          {isRejecting ? "Rejecting…" : "Reject"}
        </Button>
        <Button
          type="button"
          disabled={busy}
          onClick={() => onApprove(item)}
        >
          <Check aria-hidden="true" />
          {isApproving ? "Approving…" : "Approve"}
        </Button>
      </CardFooter>
    </Card>
  )
}

function AdminMenuApproval() {
  const [page, setPage] = useState(1)
  const [actionError, setActionError] = useState<string | null>(null)

  const itemsQuery = useAdminMenuItems({
    status: "pending",
    page,
    limit: PAGE_SIZE,
  })
  const vendorsQuery = useAdminVendors()
  const approveMutation = useApproveAdminMenuItem()
  const rejectMutation = useRejectAdminMenuItem()

  const vendorNames = new Map(
    (vendorsQuery.data?.data.users ?? []).map((user) => [user.id, user.name])
  )

  function handleDecision(item: MenuItem, decision: "approve" | "reject") {
    setActionError(null)
    const mutation = decision === "approve" ? approveMutation : rejectMutation

    mutation.mutate(item.id, {
      onSuccess: (response) => {
        toast.success(
          response.message ||
            (decision === "approve"
              ? "Menu item approved"
              : "Menu item rejected")
        )
      },
      onError: (error) => {
        setActionError(apiErrorMessage(error))
      },
    })
  }

  const items = itemsQuery.data?.data.items ?? []
  const pagination = itemsQuery.data?.data.pagination

  return (
    <section className="space-y-4" aria-labelledby="pending-menu-heading">
      <Card>
        <CardHeader>
          <CardTitle id="pending-menu-heading" className="font-heading text-xl">
            Pending approvals
          </CardTitle>
          <CardDescription>
            Review vendor submissions. Approval makes an item available in the
            customer menu; rejection hides it.
          </CardDescription>
          {pagination ? (
            <CardAction>
              <Badge variant="pending">{pagination.total} pending</Badge>
            </CardAction>
          ) : null}
        </CardHeader>

        <CardContent className="space-y-4">
          {actionError ? (
            <ErrorState
              title="Couldn't save the review"
              description={actionError}
              action={
                <Button
                  variant="outline"
                  onClick={() => setActionError(null)}
                >
                  Dismiss
                </Button>
              }
            />
          ) : null}

          {itemsQuery.isPending ? (
            <div
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
              aria-label="Loading pending menu items"
            >
              {Array.from({ length: 3 }, (_, index) => (
                <ReviewCardSkeleton key={index} />
              ))}
            </div>
          ) : null}

          {itemsQuery.isError ? (
            <ErrorState
              title="Couldn't load pending items"
              description={apiErrorMessage(itemsQuery.error)}
              action={
                <Button
                  variant="outline"
                  onClick={() => {
                    void itemsQuery.refetch()
                  }}
                >
                  <RefreshCw aria-hidden="true" />
                  Try again
                </Button>
              }
            />
          ) : null}

          {!itemsQuery.isPending && !itemsQuery.isError && items.length === 0 ? (
            <EmptyState
              icon={UtensilsCrossed}
              title="Nothing to review"
              description="New vendor submissions will appear here for approval."
            />
          ) : null}

          {!itemsQuery.isPending && !itemsQuery.isError && items.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                <PendingItemCard
                  key={item.id}
                  item={item}
                  vendorName={vendorNames.get(item.vendorId)}
                  isApproving={
                    approveMutation.isPending &&
                    approveMutation.variables === item.id
                  }
                  isRejecting={
                    rejectMutation.isPending &&
                    rejectMutation.variables === item.id
                  }
                  onApprove={(target) => handleDecision(target, "approve")}
                  onReject={(target) => handleDecision(target, "reject")}
                />
              ))}
            </div>
          ) : null}
        </CardContent>

        {pagination && pagination.totalPages > 1 ? (
          <CardFooter className="justify-between gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page <= 1 || itemsQuery.isFetching}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              <ChevronLeft aria-hidden="true" />
              Previous
            </Button>
            <span className="text-xs text-muted-foreground">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={
                page >= pagination.totalPages || itemsQuery.isFetching
              }
              onClick={() =>
                setPage((current) => Math.min(pagination.totalPages, current + 1))
              }
            >
              Next
              <ChevronRight aria-hidden="true" />
            </Button>
          </CardFooter>
        ) : null}
      </Card>
    </section>
  )
}

export { AdminMenuApproval }
