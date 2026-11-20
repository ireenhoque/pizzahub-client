import type { Metadata } from "next"
import { VendorSubscription } from "@/components/vendor-subscription"

export const metadata: Metadata = {
  title: "Vendor Subscription",
}

export default function VendorSubscriptionPage() {
  return <VendorSubscription />
}
