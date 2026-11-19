"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu } from "lucide-react"
import { PageContainer } from "@/components/page-container"
import { ProfileMenu, type ProfileUser } from "@/components/profile-menu"
import { SiteLogo } from "@/components/site-logo"
import { buttonVariants } from "@/components/ui/button"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { cn } from "cn"

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/menu", label: "Browse Menu" },
] as const

type NavbarProps = {
  /**
   * Auth integration slot: pass the signed-in user and the Sign In / Sign Up
   * links are swapped for the profile dropdown. No auth logic lives here yet.
   */
  user?: ProfileUser | null
  onSignOut?: () => void
}

function isActiveLink(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href)
}

// Sticky storefront header — brand, primary nav, auth actions, and a mobile
// sheet that mirrors the same links for small screens.
function Navbar({ user, onSignOut }: NavbarProps) {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-md">
      <PageContainer className="flex h-14 items-center justify-between gap-3">
        <SiteLogo />

        <nav
          aria-label="Primary"
          className="hidden flex-1 items-center justify-center gap-1 md:flex"
        >
          {navLinks.map((link) => {
            const active = isActiveLink(pathname, link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                  active
                    ? "bg-sidebar-accent text-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <ProfileMenu user={user} onSignOut={onSignOut} />
          ) : (
            <>
              <Link
                href="/login"
                className={cn(
                  buttonVariants({ variant: "ghost", size: "sm" }),
                  "hidden sm:inline-flex"
                )}
              >
                Sign In
              </Link>
              <Link href="/register" className={buttonVariants({ size: "sm" })}>
                Sign Up
              </Link>
            </>
          )}

          <Sheet>
            <SheetTrigger
              aria-label="Open navigation menu"
              className={cn(
                buttonVariants({ variant: "ghost", size: "icon" }),
                "size-10 md:hidden"
              )}
            >
              <Menu aria-hidden="true" />
            </SheetTrigger>
            <SheetContent side="right" className="gap-0 p-0">
              <SheetTitle className="sr-only">Navigation menu</SheetTitle>
              <div className="flex flex-col gap-6 p-4">
                <div className="pr-10">
                  <SiteLogo />
                </div>

                <nav aria-label="Mobile" className="flex flex-col gap-1">
                  {navLinks.map((link) => {
                    const active = isActiveLink(pathname, link.href)
                    return (
                      <SheetClose
                        key={link.href}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "flex min-h-11 items-center rounded-lg px-3 text-base font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                          active
                            ? "bg-sidebar-accent text-foreground"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                        render={<Link href={link.href} />}
                      >
                        {link.label}
                      </SheetClose>
                    )
                  })}
                </nav>

                <div className="flex flex-col gap-2 border-t border-border pt-4">
                  <SheetClose
                    render={
                      <Link
                        href="/login"
                        className={buttonVariants({
                          variant: "outline",
                          className: "w-full",
                        })}
                      />
                    }
                  >
                    Sign In
                  </SheetClose>
                  <SheetClose
                    render={
                      <Link
                        href="/register"
                        className={buttonVariants({ className: "w-full" })}
                      />
                    }
                  >
                    Sign Up
                  </SheetClose>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </PageContainer>
    </header>
  )
}

export { Navbar, type NavbarProps }
