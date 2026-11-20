"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Sparkles,
  UtensilsCrossed,
} from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { SiteLogo } from "@/components/site-logo"
import { VendorGuard } from "@/components/vendor-guard"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { cn } from "cn"

const vendorNavLinks = [
  { href: "/vendor", label: "Overview", icon: LayoutDashboard },
  { href: "/vendor/menu", label: "My Menu", icon: UtensilsCrossed },
  { href: "/vendor/orders", label: "Orders", icon: Package },
  { href: "/vendor/subscription", label: "Subscription", icon: Sparkles },
] as const

function isActiveLink(pathname: string, href: string) {
  if (href === "/vendor") return pathname === "/vendor"
  return pathname === href || pathname.startsWith(`${href}/`)
}

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

function VendorNav({
  pathname,
  mobile = false,
}: {
  pathname: string
  mobile?: boolean
}) {
  return (
    <nav
      aria-label={mobile ? "Vendor navigation" : "Vendor workspace"}
      className="flex flex-col gap-1"
    >
      {vendorNavLinks.map((link) => {
        const Icon = link.icon
        const active = isActiveLink(pathname, link.href)
        const className = cn(
          "flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
          active
            ? "bg-sidebar-accent text-sidebar-accent-foreground"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        )

        if (mobile) {
          return (
            <SheetClose
              key={link.href}
              render={<Link href={link.href} />}
              aria-current={active ? "page" : undefined}
              className={className}
            >
              <Icon className="size-4" aria-hidden="true" />
              {link.label}
            </SheetClose>
          )
        }

        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={className}
          >
            <Icon className="size-4" aria-hidden="true" />
            {link.label}
          </Link>
        )
      })}
    </nav>
  )
}

function VendorPanel({
  pathname,
  mobile = false,
}: {
  pathname: string
  mobile?: boolean
}) {
  const { user, signOut } = useAuth()
  const displayName = user?.name ?? "Vendor"

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-6 p-4">
      <div className="px-1">
        <SiteLogo />
      </div>

      <div className="flex items-center gap-3 rounded-xl border border-sidebar-border bg-card/70 p-3">
        <Avatar className="size-10">
          {user?.avatarUrl ? <AvatarImage src={user.avatarUrl} alt="" /> : null}
          <AvatarFallback className="bg-secondary text-xs font-semibold text-secondary-foreground">
            {initials(displayName)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-sidebar-foreground">
            {displayName}
          </p>
          <p className="text-xs text-muted-foreground">Vendor workspace</p>
        </div>
      </div>

      <div>
        <p className="px-3 pb-2 text-[10px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
          Workspace
        </p>
        <VendorNav pathname={pathname} mobile={mobile} />
      </div>

      <div className="mt-auto space-y-3">
        <div className="rounded-xl border border-accent/40 bg-accent/10 p-4">
          <Sparkles className="size-5 text-primary" aria-hidden="true" />
          <p className="mt-2 font-heading text-sm font-bold text-sidebar-foreground">
            Keep the oven busy
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Fresh menu items and quick order updates keep customers coming back.
          </p>
        </div>

        <div className="border-t border-sidebar-border pt-3">
          {mobile ? (
            <SheetClose
              className={cn(
                buttonVariants({ variant: "ghost" }),
                "w-full justify-start"
              )}
              onClick={() => {
                void signOut()
              }}
            >
              <LogOut aria-hidden="true" />
              Sign out
            </SheetClose>
          ) : (
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => {
                void signOut()
              }}
            >
              <LogOut aria-hidden="true" />
              Sign out
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

function VendorShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { user } = useAuth()

  return (
    <VendorGuard>
      <div className="flex min-h-svh bg-background">
        <aside className="hidden w-72 shrink-0 border-r border-sidebar-border bg-sidebar lg:flex lg:flex-col">
          <VendorPanel pathname={pathname} />
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-40 flex h-14 items-center justify-between gap-3 border-b border-sidebar-border bg-sidebar px-4 lg:hidden">
            <Sheet>
              <SheetTrigger
                aria-label="Open vendor navigation"
                className={cn(
                  buttonVariants({ variant: "ghost", size: "icon" }),
                  "size-10"
                )}
              >
                <Menu aria-hidden="true" />
              </SheetTrigger>
              <SheetContent
                side="left"
                className="w-80 max-w-[85vw] bg-sidebar p-0"
              >
                <SheetTitle className="sr-only">Vendor navigation</SheetTitle>
                <VendorPanel pathname={pathname} mobile />
              </SheetContent>
            </Sheet>

            <SiteLogo />

            <Avatar className="size-9">
              {user?.avatarUrl ? (
                <AvatarImage src={user.avatarUrl} alt="" />
              ) : null}
              <AvatarFallback className="bg-secondary text-xs font-semibold text-secondary-foreground">
                {initials(user?.name ?? "Vendor")}
              </AvatarFallback>
            </Avatar>
          </header>

          <main id="main-content" className="min-w-0 flex-1">
            {children}
          </main>
        </div>
      </div>
    </VendorGuard>
  )
}

export { VendorShell }
