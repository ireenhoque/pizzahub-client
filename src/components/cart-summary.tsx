"use client"

import { Minus, Plus, Trash2 } from "lucide-react"
import Image from "next/image"
import { cn } from "cn"
import type { CartItem } from "@/components/cart-provider"
import { Button } from "@/components/ui/button"
import { formatCurrency, MENU_CURRENCY } from "@/lib/format"

// Presentational cart lines + totals, shared by the cart page and checkout.
// `editable` adds quantity/remove controls; totals are always derived from the
// same item snapshots the cart holds, so there is one source of truth.

type CartSummaryProps = {
  items: CartItem[]
  editable?: boolean
  onIncrease?: (itemId: string) => void
  onDecrease?: (itemId: string) => void
  onRemove?: (itemId: string) => void
  className?: string
}

function CartSummary({
  items,
  editable = false,
  onIncrease,
  onDecrease,
  onRemove,
  className,
}: CartSummaryProps) {
  const currency = items[0]?.item.currency ?? MENU_CURRENCY
  const subtotal = items.reduce(
    (sum, entry) => sum + entry.item.price * entry.quantity,
    0
  )

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <ul className="flex flex-col divide-y divide-border">
        {items.map(({ item, quantity }) => (
          <li key={item.id} className="flex gap-3 py-4 first:pt-0 last:pb-0">
            <div className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-muted">
              <Image
                src={item.imageUrl}
                alt=""
                fill
                sizes="64px"
                className="object-cover"
              />
            </div>

            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <div className="flex items-start justify-between gap-2">
                <p className="leading-snug font-medium">{item.name}</p>
                <p className="shrink-0 font-semibold">
                  {formatCurrency(item.price * quantity, item.currency)}
                </p>
              </div>
              <p className="truncate text-xs text-muted-foreground">
                <span className="capitalize">{item.category}</span> ·{" "}
                {item.vendorName ?? `#${item.vendorId.slice(0, 8)}`}
              </p>

              <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
                {editable ? (
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon-sm"
                      aria-label={`Decrease quantity of ${item.name}`}
                      onClick={() => onDecrease?.(item.id)}
                      disabled={quantity <= 1}
                    >
                      <Minus aria-hidden="true" />
                    </Button>
                    <span
                      aria-live="polite"
                      className="w-8 text-center font-medium tabular-nums"
                    >
                      {quantity}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon-sm"
                      aria-label={`Increase quantity of ${item.name}`}
                      onClick={() => onIncrease?.(item.id)}
                      disabled={quantity >= 99}
                    >
                      <Plus aria-hidden="true" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Remove ${item.name} from cart`}
                      onClick={() => onRemove?.(item.id)}
                    >
                      <Trash2 aria-hidden="true" className="text-destructive" />
                    </Button>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Qty {quantity}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(item.price, item.currency)} each
                </p>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <dl className="flex flex-col gap-2 border-t border-border pt-4 text-sm">
        <div className="flex justify-between text-muted-foreground">
          <dt>Subtotal</dt>
          <dd>{formatCurrency(subtotal, currency)}</dd>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <dt>Delivery</dt>
          <dd>Free</dd>
        </div>
        <div className="flex justify-between border-t border-border pt-2 font-heading text-base font-bold">
          <dt>Total</dt>
          <dd>{formatCurrency(subtotal, currency)}</dd>
        </div>
      </dl>
    </div>
  )
}

export { CartSummary, type CartSummaryProps }
