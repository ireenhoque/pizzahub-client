"use client"

import { ShoppingCart, TriangleAlert } from "lucide-react"
import { toast } from "sonner"
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { formatCurrency } from "@/lib/format"
import type { MenuItem } from "@/types"

// In-memory cart: state lives in the app-wide provider, never in web storage.
// It contains full menu-item snapshots so line prices and vendor identity stay
// available without a refetch. Mixed vendors are rejected before they enter.

const MAX_QUANTITY = 99

export type CartItem = {
  item: MenuItem
  quantity: number
}

export type AddToCartResult =
  { status: "added"; replaced: boolean } | { status: "confirmation-required" }

type CartContextValue = {
  items: CartItem[]
  itemCount: number
  vendorId: string | null
  subtotal: number
  /** Backend delivery fee is currently 0, so the payable total equals subtotal. */
  total: number
  currency: string | null
  addItem: (item: MenuItem) => AddToCartResult
  increaseQuantity: (itemId: string) => void
  decreaseQuantity: (itemId: string) => void
  removeItem: (itemId: string) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

function vendorLabel(item: MenuItem) {
  return item.vendorName ?? `#${item.vendorId.slice(0, 8)}`
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [pendingItem, setPendingItem] = useState<MenuItem | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const vendorId = items[0]?.item.vendorId ?? null
  const currency = items[0]?.item.currency ?? null

  const itemCount = useMemo(
    () => items.reduce((sum, entry) => sum + entry.quantity, 0),
    [items]
  )

  const subtotal = useMemo(
    () =>
      items.reduce((sum, entry) => sum + entry.item.price * entry.quantity, 0),
    [items]
  )

  const addItem = useCallback(
    (item: MenuItem): AddToCartResult => {
      if (vendorId && vendorId !== item.vendorId) {
        setPendingItem(item)
        setConfirmOpen(true)
        return { status: "confirmation-required" }
      }

      const alreadyInCart = items.some((entry) => entry.item.id === item.id)
      setItems((current) =>
        alreadyInCart
          ? current.map((entry) =>
              entry.item.id === item.id
                ? {
                    ...entry,
                    quantity: Math.min(entry.quantity + 1, MAX_QUANTITY),
                  }
                : entry
            )
          : [...current, { item, quantity: 1 }]
      )
      toast.success(alreadyInCart ? "Quantity updated" : "Added to cart", {
        description: item.name,
      })
      return { status: "added", replaced: false }
    },
    [items, vendorId]
  )

  const increaseQuantity = useCallback((itemId: string) => {
    setItems((current) =>
      current.map((entry) =>
        entry.item.id === itemId
          ? {
              ...entry,
              quantity: Math.min(entry.quantity + 1, MAX_QUANTITY),
            }
          : entry
      )
    )
  }, [])

  const decreaseQuantity = useCallback((itemId: string) => {
    setItems((current) =>
      current.map((entry) =>
        entry.item.id === itemId && entry.quantity > 1
          ? { ...entry, quantity: entry.quantity - 1 }
          : entry
      )
    )
  }, [])

  const removeItem = useCallback((itemId: string) => {
    setItems((current) => current.filter((entry) => entry.item.id !== itemId))
  }, [])

  const clearCart = useCallback(() => setItems([]), [])

  const cancelReplace = useCallback(() => {
    setConfirmOpen(false)
    setPendingItem(null)
  }, [])

  const confirmReplace = useCallback(() => {
    if (!pendingItem) return
    setItems([{ item: pendingItem, quantity: 1 }])
    setPendingItem(null)
    setConfirmOpen(false)
    toast.success("Cart replaced", {
      description: `Your cart now holds items from ${vendorLabel(pendingItem)} only.`,
    })
  }, [pendingItem])

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      itemCount,
      vendorId,
      subtotal,
      total: subtotal,
      currency,
      addItem,
      increaseQuantity,
      decreaseQuantity,
      removeItem,
      clearCart,
    }),
    [
      items,
      itemCount,
      vendorId,
      subtotal,
      currency,
      addItem,
      increaseQuantity,
      decreaseQuantity,
      removeItem,
      clearCart,
    ]
  )

  const currentVendor = items[0]?.item
    ? vendorLabel(items[0].item)
    : "your current kitchen"

  return (
    <CartContext.Provider value={value}>
      {children}

      <Sheet
        open={confirmOpen}
        onOpenChange={(open) => {
          if (!open) cancelReplace()
        }}
      >
        <SheetContent side="right" className="w-full gap-0 sm:max-w-md">
          <SheetHeader className="gap-2 border-b pb-4">
            <p className="text-xs font-semibold tracking-[0.14em] text-primary uppercase">
              One kitchen at a time
            </p>
            <SheetTitle className="pr-8 text-xl font-extrabold">
              Replace your cart?
            </SheetTitle>
            <SheetDescription>
              One order can only contain items from a single vendor. Your cart
              is currently from {currentVendor}. Adding an item from{" "}
              {pendingItem ? vendorLabel(pendingItem) : "another vendor"} will
              clear those items first.
            </SheetDescription>
          </SheetHeader>

          <div className="flex flex-1 flex-col gap-4 p-4">
            <div className="rounded-xl border border-border bg-muted/30 p-4">
              <p className="font-medium">{pendingItem?.name}</p>
              {pendingItem ? (
                <p className="text-sm text-muted-foreground">
                  {formatCurrency(pendingItem.price, pendingItem.currency)}
                </p>
              ) : null}
            </div>
            <p className="flex gap-2 text-xs text-muted-foreground">
              <TriangleAlert
                aria-hidden="true"
                className="mt-0.5 size-4 shrink-0 text-accent-foreground"
              />
              You can place a separate order with the other kitchen afterwards.
              Your cart is cleared only if you confirm.
            </p>
          </div>

          <SheetFooter>
            <Button variant="outline" onClick={cancelReplace}>
              Keep current cart
            </Button>
            <Button onClick={confirmReplace} disabled={!pendingItem}>
              <ShoppingCart aria-hidden="true" />
              Replace cart and add
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </CartContext.Provider>
  )
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext)
  if (!context) throw new Error("useCart must be used inside <CartProvider>")
  return context
}
