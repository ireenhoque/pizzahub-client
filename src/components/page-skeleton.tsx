import { PageContainer } from "@/components/page-container"
import { SkeletonCard } from "@/components/skeleton-card"
import { Skeleton } from "@/components/ui/skeleton"

// Reusable loading state — header block + card grid mirroring the content
// shapes used across storefront and dashboards. Server-renderable; used by
// route-level loading.tsx files.
export function PageSkeleton() {
  return (
    <PageContainer
      role="status"
      aria-label="Loading page"
      className="flex flex-col gap-6 py-12"
    >
      <div className="flex flex-col gap-3">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-9 w-72 max-w-full" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <SkeletonCard key={index} variant="media" />
        ))}
      </div>
    </PageContainer>
  )
}
