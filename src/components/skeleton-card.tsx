import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "cn"

type SkeletonCardProps = {
  /** Set to "list" for a text-only row skeleton (no image block). */
  variant?: "media" | "list"
  className?: string
}

// Card-shaped loading skeleton — mirrors the product-card anatomy
// (media block + title/price line + meta line) so loading matches loaded.
function SkeletonCard({ variant = "media", className }: SkeletonCardProps) {
  return (
    <div
      data-slot="skeleton-card"
      className={cn(
        "flex flex-col gap-3 rounded-xl border border-border bg-card p-4",
        className
      )}
    >
      {variant === "media" ? (
        <Skeleton className="aspect-[4/3] w-full rounded-lg" />
      ) : null}
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    </div>
  )
}

export { SkeletonCard, type SkeletonCardProps }
