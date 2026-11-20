import type { Metadata } from "next"
import { VendorOrderList } from "@/components/vendor-order-list"

export const metadata: Metadata = {
  title: "Vendor Orders",
}

export default function VendorOrdersPage() {
  return <VendorOrderList />
}
