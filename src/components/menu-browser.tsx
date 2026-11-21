"use client"

import { keepPreviousData, useQuery } from "@tanstack/react-query"
import {
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Search,
  ShoppingCart,
  SlidersHorizontal,
  Sparkles,
  Star,
} from "lucide-react"
import Image from "next/image"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { cn } from "cn"
import { useCart } from "@/components/cart-provider"
import { EmptyState } from "@/components/empty-state"
import { ErrorState } from "@/components/error-state"
import { MenuCard } from "@/components/menu-card"
import { PageContainer } from "@/components/page-container"
import { SkeletonCard } from "@/components/skeleton-card"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { api } from "@/lib/api-client"
import { formatCurrency, formatDate, formatNumber } from "@/lib/format"
import { isMenuItemUnavailable } from "@/lib/menu-availability"
import {
  MENU_CATEGORY_LABELS,
  MENU_CATEGORY_VALUES,
  menuCategoryFromSlug,
  menuFacetFromSlug,
} from "@/lib/menu-categories"
import type {
  MenuItemCategory,
  MenuItemDetailResponse,
  MenuItemListResponse,
  MenuItemSortField,
  MenuItemSortOrder,
} from "@/types"

const PAGE_SIZE = 9
const DEFAULT_SORT = "createdAt:desc" as const
const FILTER_PARAM_KEYS = [
  "search",
  "minPrice",
  "maxPrice",
  "category",
  "sortBy",
  "sortOrder",
  "page",
] as const

type SortSelection = `${MenuItemSortField}:${MenuItemSortOrder}`

const SORT_OPTIONS: ReadonlyArray<{ label: string; value: SortSelection }> = [
  { label: "Newest first", value: "createdAt:desc" },
  { label: "Oldest first", value: "createdAt:asc" },
  { label: "Price: low to high", value: "price:asc" },
  { label: "Price: high to low", value: "price:desc" },
  { label: "Top rated", value: "ratingAvg:desc" },
  { label: "Lowest rated", value: "ratingAvg:asc" },
]

function firstParam(value: string | null): string | null {
  return value?.trim() ? value : null
}

function parsePage(value: string | null): number {
  const parsed = Number(value ?? "")
  return Number.isInteger(parsed) && parsed >= 1 ? parsed : 1
}

function parseSort(value: string | null, order: string | null): SortSelection {
  const candidate = `${value ?? "createdAt"}:${order ?? "desc"}`
  return SORT_OPTIONS.some((option) => option.value === candidate)
    ? (candidate as SortSelection)
    : DEFAULT_SORT
}

function setOrDeleteParam(
  params: URLSearchParams,
  key: string,
  value: string | null
) {
  if (value) params.set(key, value)
  else params.delete(key)
}

function parsePrice(value: string): number | null {
  if (value.trim() === "") return null
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null
}

function validatePriceRange(minInput: string, maxInput: string): string | null {
  const min = parsePrice(minInput)
  const max = parsePrice(maxInput)

  if (minInput.trim() !== "" && min === null) {
    return "Minimum price must be a non-negative number."
  }
  if (maxInput.trim() !== "" && max === null) {
    return "Maximum price must be a non-negative number."
  }
  if (min !== null && max !== null && min > max) {
    return "Minimum price cannot exceed maximum price."
  }
  return null
}

// Storefront menu browser — URL query params are the single source of truth for
// filters, so refresh and browser history restore the exact same result set.
// The Express API remains authoritative for public, active, in-stock items.
function MenuBrowser() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { addItem } = useCart()

  const searchParam = firstParam(searchParams.get("search"))?.trim() ?? ""
  const categoryParam = firstParam(searchParams.get("category"))
  const category = menuCategoryFromSlug(categoryParam) ?? "all"
  const activeFacet = menuFacetFromSlug(categoryParam)
  const minPrice = firstParam(searchParams.get("minPrice")) ?? ""
  const maxPrice = firstParam(searchParams.get("maxPrice")) ?? ""
  const sort = parseSort(
    firstParam(searchParams.get("sortBy")),
    firstParam(searchParams.get("sortOrder"))
  )
  const page = parsePage(firstParam(searchParams.get("page")))
  const activeItemId = firstParam(searchParams.get("item"))

  const [searchInput, setSearchInput] = useState(searchParam)
  const [minPriceInput, setMinPriceInput] = useState(minPrice)
  const [maxPriceInput, setMaxPriceInput] = useState(maxPrice)
  const urlParamsRef = useRef(new URLSearchParams(searchParams.toString()))
  const [lastUrlSearch, setLastUrlSearch] = useState(searchParam)
  const [lastUrlMinPrice, setLastUrlMinPrice] = useState(minPrice)
  const [lastUrlMaxPrice, setLastUrlMaxPrice] = useState(maxPrice)

  useEffect(() => {
    urlParamsRef.current = new URLSearchParams(searchParams.toString())
  }, [searchParams])

  // Back/forward and externally supplied URLs win over local draft text. This
  // is React's "adjust state during render" pattern, not a cascading effect.
  if (lastUrlSearch !== searchParam) {
    setLastUrlSearch(searchParam)
    setSearchInput(searchParam)
  }
  if (lastUrlMinPrice !== minPrice) {
    setLastUrlMinPrice(minPrice)
    setMinPriceInput(minPrice)
  }
  if (lastUrlMaxPrice !== maxPrice) {
    setLastUrlMaxPrice(maxPrice)
    setMaxPriceInput(maxPrice)
  }

  const updateUrlParams = useCallback(
    (
      mutate: (params: URLSearchParams) => void,
      resetPage = false,
      replace = false
    ) => {
      const current = urlParamsRef.current.toString()
      const params = new URLSearchParams(current)
      mutate(params)
      if (resetPage) params.set("page", "1")

      const next = params.toString()
      if (next === current) return

      urlParamsRef.current = params
      const href = next ? `${pathname}?${next}` : pathname
      if (replace) router.replace(href, { scroll: false })
      else router.push(href, { scroll: false })
    },
    [pathname, router]
  )

  // Only the debounced URL value drives the API query — typing never fires a
  // request per keystroke.
  useEffect(() => {
    const trimmed = searchInput.trim()
    if (trimmed === searchParam) return

    const timer = window.setTimeout(() => {
      updateUrlParams(
        (params) => {
          setOrDeleteParam(params, "search", trimmed)
          params.set("page", "1")
        },
        false,
        true
      )
    }, 300)
    return () => window.clearTimeout(timer)
  }, [searchInput, searchParam, updateUrlParams])

  // Price inputs are also debounced before they become URL/API state.
  useEffect(() => {
    if (minPriceInput === minPrice && maxPriceInput === maxPrice) return

    const timer = window.setTimeout(() => {
      updateUrlParams(
        (params) => {
          setOrDeleteParam(params, "minPrice", minPriceInput.trim() || null)
          setOrDeleteParam(params, "maxPrice", maxPriceInput.trim() || null)
          params.set("page", "1")
        },
        false,
        true
      )
    }, 300)
    return () => window.clearTimeout(timer)
  }, [minPriceInput, maxPriceInput, minPrice, maxPrice, updateUrlParams])

  const min = parsePrice(minPrice)
  const max = parsePrice(maxPrice)
  const priceError = validatePriceRange(minPriceInput, maxPriceInput)

  const queryString = useMemo(() => {
    const [sortBy, sortOrder] = sort.split(":") as [
      MenuItemSortField,
      MenuItemSortOrder,
    ]
    const params = new URLSearchParams({
      page: String(page),
      limit: String(PAGE_SIZE),
      sortBy,
      sortOrder,
    })

    if (searchParam) params.set("search", searchParam)
    if (category !== "all") params.set("category", category)
    if (min !== null) params.set("minPrice", String(min))
    if (max !== null) params.set("maxPrice", String(max))

    return params.toString()
  }, [searchParam, category, min, max, sort, page])

  const { data, isPending, isError, isFetching, error, refetch } = useQuery({
    queryKey: ["menu-items", "browse", queryString],
    queryFn: () => api.get<MenuItemListResponse>(`/menu-items?${queryString}`),
    enabled: !priceError,
    placeholderData: keepPreviousData,
  })

  const detailQuery = useQuery({
    queryKey: ["menu-item", activeItemId],
    queryFn: () =>
      api.get<MenuItemDetailResponse>(
        `/menu-items/${encodeURIComponent(activeItemId ?? "")}`
      ),
    enabled: Boolean(activeItemId),
  })

  const items = data?.data.items ?? []
  const pagination = data?.data.pagination
  const totalPages = pagination?.totalPages ?? 0
  const detailItem = detailQuery.data?.data.menuItem
  const detailUnavailable = detailItem
    ? isMenuItemUnavailable(detailItem)
    : false

  // A shared link may point past the last page. Correct it once instead of
  // leaving the customer on an empty result set.
  useEffect(() => {
    if (totalPages < 1 || page <= totalPages) return
    updateUrlParams(
      (params) => {
        params.set("page", String(totalPages))
      },
      false,
      true
    )
  }, [totalPages, page, updateUrlParams])

  const hasActiveFilters = Boolean(
    searchInput ||
      category !== "all" ||
      minPriceInput ||
      maxPriceInput ||
      sort !== DEFAULT_SORT
  )

  function updateCategory(value: MenuItemCategory | "all") {
    updateUrlParams((params) => {
      if (value === "all") params.delete("category")
      else params.set("category", value)
    }, true)
  }

  function updateMinPrice(value: string) {
    setMinPriceInput(value)
  }

  function updateMaxPrice(value: string) {
    setMaxPriceInput(value)
  }

  function updateSort(value: SortSelection) {
    updateUrlParams((params) => {
      if (value === DEFAULT_SORT) {
        params.delete("sortBy")
        params.delete("sortOrder")
      } else {
        const [sortBy, sortOrder] = value.split(":")
        params.set("sortBy", sortBy)
        params.set("sortOrder", sortOrder)
      }
    }, true)
  }

  function clearFilters() {
    setSearchInput("")
    setMinPriceInput("")
    setMaxPriceInput("")
    updateUrlParams((params) => {
      for (const key of FILTER_PARAM_KEYS) params.delete(key)
    })
  }

  function setItemParam(id: string | null) {
    updateUrlParams((params) => setOrDeleteParam(params, "item", id))
  }

  const resultCaption =
    isFetching && !isPending
      ? "Updating results…"
      : `${formatNumber(pagination?.total ?? 0)} ${
          pagination?.total === 1 ? "item" : "items"
        } found`

  return (
    <PageContainer className="flex flex-col gap-8 py-12 md:py-16">
      <header className="flex max-w-3xl flex-col gap-3">
        <p className="flex items-center gap-3 text-xs font-semibold tracking-[0.14em] text-primary uppercase">
          <span aria-hidden="true" className="h-px w-8 bg-primary" />
          Browse menu
        </p>
        <h1 className="font-heading text-4xl font-extrabold tracking-tight md:text-5xl">
          Find your next <span className="text-primary">favorite slice.</span>
        </h1>
        <p className="max-w-prose text-base text-muted-foreground">
          Search approved, in-stock items from neighborhood kitchens. Filter by
          category and price, then open any item for the full description.
        </p>
        {activeFacet ? (
          <Badge variant="secondary" className="w-fit">
            {activeFacet.label}
          </Badge>
        ) : null}
      </header>

      <Card className="gap-4 p-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_8rem_8rem_12rem_auto] lg:items-end">
          <div className="flex flex-col gap-2 sm:col-span-2 lg:col-span-1">
            <Label htmlFor="menu-search">Search</Label>
            <div className="relative">
              <Search
                aria-hidden="true"
                className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                id="menu-search"
                type="search"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search by name or description"
                className="h-10 pl-9"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="min-price">Min price</Label>
            <Input
              id="min-price"
              type="number"
              inputMode="decimal"
              min={0}
              step="0.01"
              value={minPriceInput}
              onChange={(event) => updateMinPrice(event.target.value)}
              placeholder="0.00"
              className="h-10"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="max-price">Max price</Label>
            <Input
              id="max-price"
              type="number"
              inputMode="decimal"
              min={0}
              step="0.01"
              value={maxPriceInput}
              onChange={(event) => updateMaxPrice(event.target.value)}
              placeholder="Any"
              className="h-10"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="menu-sort">Sort by</Label>
            <Select
              items={SORT_OPTIONS}
              value={sort}
              onValueChange={(value) => updateSort(value ?? DEFAULT_SORT)}
            >
              <SelectTrigger id="menu-sort" className="h-10 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            type="button"
            variant="outline"
            className="h-10 gap-2"
            onClick={clearFilters}
            disabled={!hasActiveFilters}
          >
            <RotateCcw aria-hidden="true" />
            Clear
          </Button>
        </div>

        {priceError ? (
          <p
            role="alert"
            className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive"
          >
            {priceError}
          </p>
        ) : null}

        <div
          role="group"
          aria-label="Filter by category"
          className="flex flex-wrap gap-2"
        >
          <button
            type="button"
            aria-pressed={category === "all"}
            onClick={() => updateCategory("all")}
            className={cn(
              buttonVariants({
                variant: category === "all" ? "secondary" : "outline",
              }),
              "h-10 rounded-full px-4"
            )}
          >
            All items
          </button>
          {MENU_CATEGORY_VALUES.map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={category === value}
              onClick={() => updateCategory(value)}
              className={cn(
                buttonVariants({
                  variant: category === value ? "secondary" : "outline",
                }),
                "h-10 rounded-full px-4"
              )}
            >
              {MENU_CATEGORY_LABELS[value]}
            </button>
          ))}
        </div>
      </Card>

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="font-heading text-2xl font-bold tracking-tight">
            On the menu
          </h2>
          <p className="text-sm text-muted-foreground" aria-live="polite">
            {resultCaption}
          </p>
        </div>
      </div>

      {priceError ? (
        <EmptyState
          icon={SlidersHorizontal}
          title="Check your price range"
          description={priceError}
          action={
            <Button variant="outline" onClick={() => clearFilters()}>
              Clear filters
            </Button>
          }
        />
      ) : isPending ? (
        <div
          role="status"
          aria-label="Loading menu items"
          className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {Array.from({ length: PAGE_SIZE }).map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      ) : isError ? (
        <ErrorState
          title="Couldn't load the menu"
          description={
            error instanceof Error
              ? error.message
              : "We couldn't reach the PizzaHub API. Please try again."
          }
          action={
            <Button
              variant="outline"
              onClick={() => refetch()}
              disabled={isFetching}
            >
              <RotateCcw
                aria-hidden="true"
                className={isFetching ? "animate-spin" : undefined}
              />
              Try again
            </Button>
          }
        />
      ) : items.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No menu items found"
          description="Nothing matched those filters. Try another search or clear your filters."
          action={
            <Button variant="outline" onClick={clearFilters}>
              Clear filters
            </Button>
          }
        />
      ) : (
        <>
          <div
            className={cn(
              "grid gap-5 sm:grid-cols-2 lg:grid-cols-3",
              isFetching && "opacity-60"
            )}
          >
            {items.map((item) => (
              <MenuCard
                key={item.id}
                item={item}
                onSelect={(selected) => setItemParam(selected.id)}
                onAddToCart={addItem}
              />
            ))}
          </div>

          {pagination && pagination.totalPages > 1 ? (
            <nav
              aria-label="Menu pagination"
              className="flex flex-wrap items-center justify-center gap-4 pt-2"
            >
              <Button
                variant="outline"
                size="lg"
                className="h-10"
                disabled={pagination.page <= 1 || isFetching}
                onClick={() =>
                  updateUrlParams((params) => {
                    params.set("page", String(Math.max(1, page - 1)))
                  })
                }
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
                size="lg"
                className="h-10"
                disabled={
                  pagination.page >= pagination.totalPages || isFetching
                }
                onClick={() =>
                  updateUrlParams((params) => {
                    params.set("page", String(page + 1))
                  })
                }
              >
                Next
                <ChevronRight aria-hidden="true" />
              </Button>
            </nav>
          ) : null}
        </>
      )}

      <Sheet
        open={Boolean(activeItemId)}
        onOpenChange={(open) => {
          if (!open) setItemParam(null)
        }}
      >
        <SheetContent
          side="right"
          className="w-full gap-0 overflow-y-auto sm:max-w-md"
        >
          <SheetHeader className="gap-2 border-b pb-4">
            <p className="text-xs font-semibold tracking-[0.14em] text-primary uppercase">
              Menu item
            </p>
            <SheetTitle className="pr-8 text-2xl font-extrabold">
              {detailItem?.name ?? "Item details"}
            </SheetTitle>
            <SheetDescription>
              {detailQuery.isPending
                ? "Loading item details…"
                : "Details from the PizzaHub menu."}
            </SheetDescription>
          </SheetHeader>

          <div className="flex flex-1 flex-col gap-5 p-4">
            {detailQuery.isPending ? (
              <div
                role="status"
                aria-label="Loading item details"
                className="flex flex-col gap-4"
              >
                <Skeleton className="aspect-[4/3] w-full rounded-xl" />
                <SkeletonCard variant="list" />
                <SkeletonCard variant="list" />
              </div>
            ) : detailQuery.isError || !detailItem ? (
              <ErrorState
                title="Couldn't load item details"
                description={
                  detailQuery.error instanceof Error
                    ? detailQuery.error.message
                    : "This item may no longer be available. Please try again."
                }
                action={
                  <Button
                    variant="outline"
                    onClick={() => detailQuery.refetch()}
                    disabled={detailQuery.isFetching}
                  >
                    <RotateCcw
                      aria-hidden="true"
                      className={
                        detailQuery.isFetching ? "animate-spin" : undefined
                      }
                    />
                    Try again
                  </Button>
                }
              />
            ) : (
              <div className="flex flex-col gap-5">
                <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-muted">
                  <Image
                    src={detailItem.imageUrl}
                    alt={detailItem.name}
                    fill
                    sizes="(min-width: 640px) 24rem, 100vw"
                    className="object-cover"
                  />
                  <Badge
                    variant="secondary"
                    className="absolute top-3 left-3 capitalize"
                  >
                    {detailItem.category}
                  </Badge>
                  {detailItem.isPremium ? (
                    <Badge variant="premium" className="absolute top-3 right-3">
                      <Sparkles aria-hidden="true" />
                      Premium
                    </Badge>
                  ) : null}
                  {detailUnavailable ? (
                    <Badge
                      variant="destructive"
                      className="absolute right-3 bottom-3"
                    >
                      Unavailable
                    </Badge>
                  ) : null}
                </div>

                <div className="flex items-start justify-between gap-3">
                  <p className="font-heading text-2xl font-extrabold">
                    {formatCurrency(detailItem.price, detailItem.currency)}
                  </p>
                  <span
                    className="flex items-center gap-1 rounded-full bg-accent/15 px-2.5 py-0.5 text-xs font-medium"
                    aria-label={`${formatNumber(detailItem.ratingAvg)} out of 5 from ${formatNumber(detailItem.ratingCount)} ratings`}
                  >
                    <Star
                      aria-hidden="true"
                      className="size-3.5 fill-current"
                    />
                    {formatNumber(detailItem.ratingAvg, "en-US", {
                      minimumFractionDigits: 1,
                      maximumFractionDigits: 1,
                    })}
                  </span>
                </div>

                <p className="text-sm leading-relaxed text-muted-foreground">
                  {detailItem.description}
                </p>

                <dl className="grid grid-cols-2 gap-4 rounded-xl border border-border bg-muted/30 p-4 text-sm">
                  <div className="flex flex-col gap-1">
                    <dt className="text-xs text-muted-foreground">Kitchen</dt>
                    <dd className="font-medium">
                      {detailItem.vendorName ??
                        `#${detailItem.vendorId.slice(0, 8)}`}
                    </dd>
                  </div>
                  <div className="flex flex-col gap-1">
                    <dt className="text-xs text-muted-foreground">Location</dt>
                    <dd className="font-medium">{detailItem.location}</dd>
                  </div>
                  <div className="flex flex-col gap-1">
                    <dt className="text-xs text-muted-foreground">Ratings</dt>
                    <dd className="font-medium">
                      {formatNumber(detailItem.ratingCount)}
                    </dd>
                  </div>
                  <div className="flex flex-col gap-1">
                    <dt className="text-xs text-muted-foreground">Added</dt>
                    <dd className="font-medium">
                      {detailItem.createdAt
                        ? formatDate(detailItem.createdAt)
                        : "—"}
                    </dd>
                  </div>
                </dl>

                {detailUnavailable ? (
                  <p
                    id="detail-unavailable"
                    role="status"
                    className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive"
                  >
                    This item is currently unavailable. Check back soon or
                    choose another item from the menu.
                  </p>
                ) : null}
                <Button
                  className="w-full"
                  disabled={detailUnavailable}
                  aria-describedby={
                    detailUnavailable ? "detail-unavailable" : undefined
                  }
                  onClick={() => addItem(detailItem)}
                >
                  <ShoppingCart aria-hidden="true" />
                  {detailUnavailable ? "Currently unavailable" : "Add to cart"}
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setItemParam(null)}
                >
                  Close details
                </Button>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </PageContainer>
  )
}

export { MenuBrowser }
