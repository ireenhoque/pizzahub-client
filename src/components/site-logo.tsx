import Link from "next/link"
import { Pizza } from "lucide-react"

// Brand lockup — primary chip with a pizza glyph + two-tone wordmark.
// Reused by the navbar, footer, and any future branded surface.
function SiteLogo() {
  return (
    <Link
      href="/"
      className="flex items-center gap-2 rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      aria-label="PizzaHub — go to home"
    >
      <span
        aria-hidden="true"
        className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground"
      >
        <Pizza className="size-4" />
      </span>
      <span className="font-heading text-lg font-extrabold tracking-tight">
        Pizza<span className="text-primary">Hub</span>
      </span>
    </Link>
  )
}

export { SiteLogo }
