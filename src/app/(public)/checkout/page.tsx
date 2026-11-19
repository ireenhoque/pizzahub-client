import type { Metadata } from "next"
import { CheckoutForm } from "@/components/checkout-form"
import { CustomerGate } from "@/components/customer-gate"

export const metadata: Metadata = {
  title: "Checkout",
}

export default function CheckoutPage() {
  return (
    <CustomerGate>
      <CheckoutForm />
    </CustomerGate>
  )
}
