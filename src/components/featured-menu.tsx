"use client"

import { useQuery } from "@tanstack/react-query"
import { ArrowRight, Pizza, RefreshCw } from "lucide-react"
import Link from "next/link"
import { cn } from "cn"
import { EmptyState } from "@/components/empty-state"
import { ErrorState } from "@/components/error-state"
import { MenuCard } from "@/components/menu-card"
import { PageContainer } from "@/components/page-container"
import { SkeletonCard } from "@/components/skeleton-card"
import { Button, buttonVariants } from "@/components/ui/button"
import { api } from "@/lib/api-client"
import { enter } from "@/lib/motion"
import type { MenuItemListResponse } from "@/types"

// Featured menu — fetches the six newest approved, in-stock items from the
// Express API (GET /api/menu-items filters status=active + isAvailable
// server-side; the strict query schema only accepts whitelisted params).
// Client component: TanStack Query drives the loading/error/empty states.
function FeaturedMenu() {
  const { data, isPending, isError, isFetching, refetch } = useQuery({
    queryKey: ["menu-items", "featured"],
    queryFn: () =>
      api.get<MenuItemListResponse>(
        "/menu-items?limit=6&page=1&sortBy=createdAt&sortOrder=desc"
      ),
  })

  const items = (data?.data.items ?? []).slice(0, 6)

  return (
    <section aria-labelledby="featured-heading" className="py-14 md:py-16">
      <PageContainer className="flex flex-col gap-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-3 motion-safe:animate-in motion-safe:duration-700 motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-4">
            <p className="flex items-center gap-3 text-xs font-semibold tracking-[0.14em] uppercase">
              <span aria-hidden="true" className="h-px w-8 bg-primary" />
              Fresh from the oven
            </p>
            <h2
              id="featured-heading"
              className="font-heading text-3xl font-extrabold tracking-tight md:text-4xl"
            >
              Featured on PizzaHub
            </h2>
            <p className="max-w-prose text-sm text-muted-foreground md:text-base">
              Approved, in-stock items from local kitchens — the newest listings
              first.
            </p>
          </div>
          <Link
            href="/menu"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "group/viewall"
            )}
          >
            View full menu
            <ArrowRight
              aria-hidden="true"
              className="transition-transform group-hover/viewall:translate-x-1"
            />
          </Link>
        </div>

        {isPending ? (
          <div
            role="status"
            aria-label="Loading featured menu"
            className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
          >
            {Array.from({ length: 6 }).map((_, index) => (
              <SkeletonCard key={index} />
            ))}
          </div>
        ) : isError ? (
          <ErrorState
            title="Couldn't load the featured menu"
            description="We couldn't reach the PizzaHub API. Make sure the backend is running, then try again."
            action={
              <Button
                variant="outline"
                onClick={() => refetch()}
                disabled={isFetching}
              >
                <RefreshCw
                  aria-hidden="true"
                  className={isFetching ? "animate-spin" : undefined}
                />
                Try again
              </Button>
            }
          />
        ) : items.length === 0 ? (
          <EmptyState
            icon={Pizza}
            title="No featured items yet"
            description="Approved menu items will show up here as soon as restaurants publish them."
            action={
              <Link href="/menu" className={buttonVariants()}>
                Browse the full menu
              </Link>
            }
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item, index) => (
              <MenuCard
                key={item.id}
                item={item}
                style={enter(`${index * 70}ms`)}
                className="motion-safe:animate-in motion-safe:duration-700 motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-4"
              />
            ))}
          </div>
        )}
      </PageContainer>
    </section>
  )
}

export { FeaturedMenu }
