import { Compass } from "lucide-react"
import Link from "next/link"
import { EmptyState } from "@/components/empty-state"
import { PageContainer } from "@/components/page-container"
import { buttonVariants } from "@/components/ui/button"

// Global 404 — reuses the design system's empty state.
export default function NotFound() {
  return (
    <PageContainer className="py-16">
      <EmptyState
        icon={Compass}
        title="Page not found"
        description="The page you're looking for doesn't exist or has moved."
        action={
          <Link href="/" className={buttonVariants()}>
            Back to home
          </Link>
        }
      />
    </PageContainer>
  )
}
