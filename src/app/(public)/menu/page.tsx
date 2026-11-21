import type { Metadata } from "next"
import { Suspense } from "react"
import { MenuBrowser } from "@/components/menu-browser"
import { PageContainer } from "@/components/page-container"
import { SkeletonCard } from "@/components/skeleton-card"

export const metadata: Metadata = {
  title: "Browse Menu",
}

function MenuBrowserFallback() {
  return (
    <PageContainer className="flex flex-col gap-8 py-12 md:py-16">
      <div role="status" aria-label="Loading menu">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }, (_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      </div>
    </PageContainer>
  )
}

// useSearchParams reads the customer-facing filter URL on the client. The
// Suspense boundary keeps the route compatible with prerendering while the
// filter state hydrates.
export default function MenuPage() {
  return (
    <Suspense fallback={<MenuBrowserFallback />}>
      <MenuBrowser />
    </Suspense>
  )
}
