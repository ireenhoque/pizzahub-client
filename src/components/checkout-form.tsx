"use client"

import Link from "next/link"
import { CheckCircle2, ShoppingCart, TriangleAlert } from "lucide-react"
import { useRef, useState } from "react"
import { toast } from "sonner"
import { useCart } from "@/components/cart-provider"
import { CartSummary } from "@/components/cart-summary"
import { EmptyState } from "@/components/empty-state"
import { ErrorState } from "@/components/error-state"
import { PageContainer } from "@/components/page-container"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { api } from "@/lib/api-client"
import { apiErrorMessage } from "@/lib/api-error"
import { formatCurrency } from "@/lib/format"
import type { CreateOrderInput, CreateOrderResponse, Order } from "@/types"

// Checkout mirrors the Express create-order schema exactly: no currency field,
// no client-generated vendor id. The backend re-fetches every menu item,
// snapshots its price, derives the single vendor and stores the BDT currency.

type CheckoutFields = {
  deliveryAddress: string
  contactPhone: string
  notes: string
}

type FieldErrors = Partial<Record<keyof CheckoutFields, string>>

const EMPTY_FIELDS: CheckoutFields = {
  deliveryAddress: "",
  contactPhone: "",
  notes: "",
}

function validate(fields: CheckoutFields): FieldErrors {
  const errors: FieldErrors = {}
  const address = fields.deliveryAddress.trim()
  const phone = fields.contactPhone.trim()
  const notes = fields.notes.trim()

  if (address.length < 5) {
    errors.deliveryAddress = "Enter an address of at least 5 characters."
  }
  if (phone && (phone.length < 5 || phone.length > 20)) {
    errors.contactPhone = "Use 5–20 characters, or leave this blank."
  }
  if (notes.length > 500) {
    errors.notes = "Notes must be 500 characters or fewer."
  }

  return errors
}

function CheckoutForm() {
  const { items, clearCart } = useCart()
  const [fields, setFields] = useState<CheckoutFields>(EMPTY_FIELDS)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null)
  const submittingRef = useRef(false)

  function updateField(field: keyof CheckoutFields, value: string) {
    setFields((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
    setSubmitError(null)
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submittingRef.current || items.length === 0) return

    const nextErrors = validate(fields)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    const body: CreateOrderInput = {
      lineItems: items.map(({ item, quantity }) => ({
        menuItemId: item.id,
        quantity,
      })),
      deliveryAddress: fields.deliveryAddress.trim(),
      ...(fields.contactPhone.trim()
        ? { contactPhone: fields.contactPhone.trim() }
        : {}),
      ...(fields.notes.trim() ? { notes: fields.notes.trim() } : {}),
    }

    submittingRef.current = true
    setSubmitting(true)
    setSubmitError(null)

    try {
      const response = await api.post<CreateOrderResponse>("/orders", body)
      clearCart()
      setPlacedOrder(response.data.order)
      toast.success("Order placed", {
        description: `Order #${response.data.order._id.slice(-8)} is confirmed.`,
      })
    } catch (error) {
      setSubmitError(apiErrorMessage(error))
    } finally {
      submittingRef.current = false
      setSubmitting(false)
    }
  }

  return (
    <PageContainer className="py-12 md:py-16">
      <div className="flex flex-col gap-3 pb-8">
        <p className="text-xs font-semibold tracking-[0.14em] text-primary uppercase">
          Checkout
        </p>
        <h1 className="font-heading text-4xl font-extrabold tracking-tight md:text-5xl">
          Send it our way.
        </h1>
        <p className="max-w-prose text-base text-muted-foreground">
          Confirm where to deliver, review the summary, and place your order.
          Payment is handled separately — no card details are collected here.
        </p>
      </div>

      {placedOrder ? (
        <Card className="mx-auto max-w-2xl p-8 text-center">
          <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-success/10 text-success">
            <CheckCircle2 aria-hidden="true" className="size-7" />
          </span>
          <h2 className="pt-4 font-heading text-2xl font-extrabold">
            Your order is in
          </h2>
          <p className="pt-2 text-sm text-muted-foreground">
            Order #{placedOrder._id.slice(-8)} has been placed. Your cart is now
            empty and you can follow its progress in your order history.
          </p>
          <p className="pt-4 font-heading text-xl font-bold">
            {formatCurrency(placedOrder.totalAmount, placedOrder.currency)}{" "}
            total
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-6">
            <Link href="/orders" className={buttonVariants()}>
              View my orders
            </Link>
            <Link
              href="/menu"
              className={buttonVariants({ variant: "outline" })}
            >
              Browse more items
            </Link>
          </div>
        </Card>
      ) : items.length === 0 ? (
        <EmptyState
          icon={ShoppingCart}
          title="Nothing to check out yet"
          description="Add items from the menu before placing an order."
          action={
            <Link href="/menu" className={buttonVariants()}>
              Browse menu
            </Link>
          }
        />
      ) : (
        <form
          onSubmit={(event) => {
            void handleSubmit(event)
          }}
          className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]"
        >
          <Card className="flex flex-col gap-5 p-5">
            <div>
              <h2 className="font-heading text-lg font-bold">
                Delivery information
              </h2>
              <p className="pt-1 text-sm text-muted-foreground">
                These details are saved with your order.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="checkout-address">Delivery address *</Label>
              <Input
                id="checkout-address"
                name="deliveryAddress"
                autoComplete="street-address"
                placeholder="House, street, and area"
                value={fields.deliveryAddress}
                onChange={(event) =>
                  updateField("deliveryAddress", event.target.value)
                }
                aria-invalid={Boolean(errors.deliveryAddress)}
                aria-describedby={
                  errors.deliveryAddress ? "checkout-address-error" : undefined
                }
                required
                minLength={5}
              />
              {errors.deliveryAddress ? (
                <p
                  id="checkout-address-error"
                  className="text-sm text-destructive"
                >
                  {errors.deliveryAddress}
                </p>
              ) : null}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="checkout-phone">Contact phone</Label>
              <Input
                id="checkout-phone"
                name="contactPhone"
                type="tel"
                autoComplete="tel"
                placeholder="5–20 characters (optional)"
                value={fields.contactPhone}
                onChange={(event) =>
                  updateField("contactPhone", event.target.value)
                }
                aria-invalid={Boolean(errors.contactPhone)}
                aria-describedby={
                  errors.contactPhone ? "checkout-phone-error" : undefined
                }
                minLength={5}
                maxLength={20}
              />
              {errors.contactPhone ? (
                <p
                  id="checkout-phone-error"
                  className="text-sm text-destructive"
                >
                  {errors.contactPhone}
                </p>
              ) : null}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="checkout-notes">Delivery notes</Label>
              <textarea
                id="checkout-notes"
                name="notes"
                rows={3}
                maxLength={500}
                placeholder="Landmarks, floor, or anything helpful (optional)"
                value={fields.notes}
                onChange={(event) => updateField("notes", event.target.value)}
                aria-invalid={Boolean(errors.notes)}
                aria-describedby={
                  errors.notes ? "checkout-notes-error" : undefined
                }
                className="w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-2 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"
              />
              {errors.notes ? (
                <p
                  id="checkout-notes-error"
                  className="text-sm text-destructive"
                >
                  {errors.notes}
                </p>
              ) : null}
            </div>

            {submitError ? (
              <ErrorState
                icon={TriangleAlert}
                title="Order could not be placed"
                description={submitError}
              />
            ) : null}
          </Card>

          <Card className="p-5 lg:sticky lg:top-20">
            <h2 className="font-heading text-lg font-bold">Order summary</h2>
            <p className="pt-1 pb-4 text-sm text-muted-foreground">
              {items.length} {items.length === 1 ? "item" : "items"} from one
              kitchen.
            </p>
            <CartSummary items={items} />
            <Button type="submit" className="mt-5 w-full" disabled={submitting}>
              {submitting ? "Placing order…" : "Place order"}
            </Button>
            <p className="pt-3 text-center text-xs text-muted-foreground">
              Your cart clears only after the order is confirmed.
            </p>
          </Card>
        </form>
      )}
    </PageContainer>
  )
}

export { CheckoutForm }
