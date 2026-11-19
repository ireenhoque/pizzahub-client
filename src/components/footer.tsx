import Link from "next/link"
import { Mail, MapPin, Phone } from "lucide-react"
import { PageContainer } from "@/components/page-container"
import { SiteLogo } from "@/components/site-logo"
import { cn } from "cn"

const linkColumns = [
  {
    heading: "Explore",
    links: [
      { href: "/", label: "Home" },
      { href: "/menu", label: "Browse Menu" },
    ],
  },
  {
    heading: "Account",
    links: [
      { href: "/login", label: "Sign In" },
      { href: "/register", label: "Sign Up" },
    ],
  },
]

// Contact placeholders — swap for real details when the business lands.
const contacts = [
  {
    icon: Mail,
    label: "hello@pizzahub.com",
    href: "mailto:hello@pizzahub.com",
  },
  { icon: Phone, label: "+1 (555) 000-0000", href: "tel:+15550000000" },
  { icon: MapPin, label: "123 Pizza Street, Your City", href: null },
]

const socials = [
  {
    label: "PizzaHub on X",
    href: "https://x.com/pizzahub",
    icon: XLogo,
  },
  {
    label: "PizzaHub on Instagram",
    href: "https://www.instagram.com/pizzahub",
    icon: InstagramLogo,
  },
  {
    label: "PizzaHub on Facebook",
    href: "https://www.facebook.com/pizzahub",
    icon: FacebookLogo,
  },
]

// The current X (formerly Twitter) mark — lucide ships no brand icons.
function XLogo() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className="size-4"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

function InstagramLogo() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="size-4"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  )
}

function FacebookLogo() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="size-4"
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  )
}

// Ink-surface footer — brand story, navigation, contact placeholders, socials.
function Footer() {
  return (
    <footer className="bg-secondary text-secondary-foreground">
      <PageContainer className="py-12 md:py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1.4fr] lg:gap-8">
          <div className="flex flex-col gap-4">
            <SiteLogo />
            <p className="max-w-sm text-sm text-secondary-foreground/70">
              PizzaHub is a premium neighborhood pizza marketplace — discover
              local pizzerias, browse their menus, and order your favorites in a
              few taps.
            </p>
            <div className="flex items-center gap-1.5">
              {socials.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className={cn(
                    "rounded-lg p-2.5 text-secondary-foreground/80 transition-colors outline-none",
                    "hover:bg-secondary-foreground/10 hover:text-accent",
                    "focus-visible:ring-3 focus-visible:ring-accent/60"
                  )}
                >
                  <social.icon />
                </a>
              ))}
            </div>
          </div>

          {linkColumns.map((column) => (
            <nav key={column.heading} aria-label={column.heading}>
              <h2 className="text-xs font-semibold tracking-[0.14em] text-accent uppercase">
                {column.heading}
              </h2>
              <ul className="mt-4 flex flex-col gap-2.5">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="rounded-md text-sm text-secondary-foreground/70 transition-colors outline-none hover:text-accent focus-visible:ring-3 focus-visible:ring-accent/60"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div>
            <h2 className="text-xs font-semibold tracking-[0.14em] text-accent uppercase">
              Contact
            </h2>
            <ul className="mt-4 flex flex-col gap-2.5">
              {contacts.map((contact) => {
                const body = (
                  <span className="flex items-center gap-2.5 text-sm text-secondary-foreground/70 transition-colors">
                    <contact.icon
                      className="size-4 shrink-0 text-accent"
                      aria-hidden="true"
                    />
                    {contact.label}
                  </span>
                )
                return (
                  <li key={contact.label}>
                    {contact.href ? (
                      <Link
                        href={contact.href}
                        className="rounded-md text-secondary-foreground/70 outline-none hover:text-accent focus-visible:ring-3 focus-visible:ring-accent/60"
                      >
                        {body}
                      </Link>
                    ) : (
                      body
                    )}
                  </li>
                )
              })}
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-secondary-foreground/15 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-secondary-foreground/60">
            © {new Date().getFullYear()} PizzaHub. All rights reserved.
          </p>
          <p className="text-xs text-secondary-foreground/60">
            Neighborhood pizzerias, one order away.
          </p>
        </div>
      </PageContainer>
    </footer>
  )
}

export { Footer }
