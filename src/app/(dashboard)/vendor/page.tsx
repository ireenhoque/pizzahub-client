import type { Metadata } from "next"
import { PageContainer } from "@/components/page-container"

export const metadata: Metadata = {
  title: "Vendor dashboard",
}

export default function VendorDashboardPage() {
  return (
    <PageContainer size="wide" className="py-8 sm:py-10">
      <div className="flex flex-col gap-3">
        <p className="text-xs font-semibold tracking-[0.14em] text-primary uppercase">
          Workspace
        </p>
        <h1 className="font-heading text-3xl font-bold">Vendor dashboard</h1>
        <p className="max-w-prose text-muted-foreground">
          Manage your menu, follow incoming orders, and keep your subscription
          in one place.
        </p>
      </div>
    </PageContainer>
  )
}
