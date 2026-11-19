import { MapPin, Store } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { cn } from "cn"
import { buttonVariants } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { formatCurrency } from "@/lib/format"
import type { MenuItem } from "@/types"

type MenuCardProps = {
  item: MenuItem
  /** Entrance style from `lib/motion` — optional so the card works anywhere. */
  style?: React.CSSProperties
  className?: string
}

// Reusable menu item card — fixed 4:3 media block plus a flexible body, so a
// grid row keeps equal image ratios and equal card heights (the action pins
// to the bottom with mt-auto). Vendor shows the name once the API exposes
// it, falling back to a compact reference to the real vendorId.
function MenuCard({ item, style, className }: MenuCardProps) {
  const vendor = item.vendorName ?? `#${item.vendorId.slice(0, 8)}`

  return (
    <Card
      style={style}
      className={cn(
        "h-full transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift",
        className
      )}
    >
      <div className="flex h-full flex-col gap-3 px-4">
        <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-muted">
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover/card:scale-105"
          />
          <Badge
            variant="secondary"
            className="absolute top-3 left-3 capitalize"
          >
            {item.category}
          </Badge>
        </div>

        <div className="flex items-start justify-between gap-3">
          <h3 className="line-clamp-2 font-heading text-base leading-snug font-semibold">
            {item.name}
          </h3>
          <p className="shrink-0 font-heading text-base font-bold">
            {formatCurrency(item.price, item.currency)}
          </p>
        </div>

        <p className="line-clamp-2 text-sm text-muted-foreground">
          {item.description}
        </p>

        <div className="flex flex-col gap-1 text-xs text-muted-foreground">
          <span
            className="flex items-center gap-1.5"
            title={`Vendor ID ${item.vendorId}`}
          >
            <Store aria-hidden="true" className="size-3.5 shrink-0" />
            <span className="sr-only">Vendor: </span>
            <span className="truncate">{vendor}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <MapPin aria-hidden="true" className="size-3.5 shrink-0" />
            <span className="truncate">{item.location}</span>
          </span>
        </div>

        <Link
          href={`/menu?item=${item.id}`}
          className={cn(
            buttonVariants({ variant: "outline" }),
            "mt-auto w-full hover:border-transparent hover:bg-primary hover:text-primary-foreground"
          )}
        >
          View Details
        </Link>
      </div>
    </Card>
  )
}

export { MenuCard, type MenuCardProps }
