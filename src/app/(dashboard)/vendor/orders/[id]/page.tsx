import type { Metadata } from "next"
import { VendorOrderDetail } from "@/components/vendor-order-detail"

export const metadata: Metadata = {
  title: "Vendor Order Details",
}

export default async function VendorOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <VendorOrderDetail id={id} />
}
