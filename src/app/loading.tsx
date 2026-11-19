import { PageSkeleton } from "@/components/page-skeleton"

// Root loading boundary — streams in while routes below the root layout
// render. Reusable PageSkeleton keeps every route's loading state identical.
export default function Loading() {
  return <PageSkeleton />
}
