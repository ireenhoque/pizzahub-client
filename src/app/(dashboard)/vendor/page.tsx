import type { Metadata } from "next"
import { VendorOverview } from "@/components/vendor-overview"

export const metadata: Metadata = {
  title: "Vendor dashboard",
}

export default function VendorDashboardPage() {
  return <VendorOverview />
}
