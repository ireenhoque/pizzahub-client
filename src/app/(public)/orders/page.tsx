import type { Metadata } from "next"
import { CustomerGate } from "@/components/customer-gate"
import { OrderHistory } from "@/components/order-history"

export const metadata: Metadata = {
  title: "My Orders",
}

export default function OrdersPage() {
  return (
    <CustomerGate>
      <OrderHistory />
    </CustomerGate>
  )
}
