"use client"

import Link from "next/link"
import { ShoppingCart } from "lucide-react"
import { toast } from "sonner"
import { useCart } from "@/components/cart-provider"
import { CartSummary } from "@/components/cart-summary"
import { EmptyState } from "@/components/empty-state"
import { PageContainer } from "@/components/page-container"
import { buttonVariants } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

// Cart screen: item controls on the left, live totals on the right. All state
// comes from the app-wide cart provider; nothing is persisted to web storage.
function CartView() {
  const {
    items,
    itemCount,
    vendorId,
    increaseQuantity,
    decreaseQuantity,
    removeItem,
    clearCart,
  } = useCart()

  return (
    <PageContainer className="py-12 md:py-16">
      <div className="flex flex-col gap-3 pb-8">
        <p className="text-xs font-semibold tracking-[0.14em] text-primary uppercase">
          Your cart
        </p>
        <h1 className="font-heading text-4xl font-extrabold tracking-tight md:text-5xl">
          Almost time to eat.
        </h1>
        <p className="max-w-prose text-base text-muted-foreground">
          Review your picks before checkout. Every order comes from one kitchen,
          so the cart holds items from a single vendor at a time.
        </p>
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={ShoppingCart}
          title="Your cart is empty"
          description="Browse the menu and add something delicious to get started."
          action={
            <Link href="/menu" className={buttonVariants()}>
              Browse menu
            </Link>
          }
        />
      ) : (
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <Card className="p-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
              <div>
                <h2 className="font-heading text-lg font-bold">
                  Selected items
                </h2>
                <p className="text-sm text-muted-foreground">
                  {itemCount} {itemCount === 1 ? "item" : "items"} from one
                  kitchen · Vendor #{vendorId?.slice(0, 8)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  clearCart()
                  toast.success("Cart cleared")
                }}
                className="text-sm font-medium text-destructive underline-offset-4 hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                Clear cart
              </button>
            </div>

            <CartSummary
              items={items}
              editable
              onIncrease={increaseQuantity}
              onDecrease={decreaseQuantity}
              onRemove={removeItem}
            />
          </Card>

          <Card className="p-5 lg:sticky lg:top-20">
            <h2 className="font-heading text-lg font-bold">Order summary</h2>
            <p className="pt-1 pb-4 text-sm text-muted-foreground">
              Final totals are confirmed after checkout.
            </p>
            <CartSummary items={items} />
            <Link
              href="/checkout"
              className={buttonVariants({ className: "mt-5 w-full" })}
            >
              Continue to checkout
            </Link>
          </Card>
        </div>
      )}
    </PageContainer>
  )
}

export { CartView }
