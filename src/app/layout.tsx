import type { Metadata } from "next"
import { Inter, Manrope } from "next/font/google"

import "./globals.css"

import { Providers } from "@/components/providers"
import { cn } from "@/lib/utils"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
})

export const metadata: Metadata = {
  title: {
    default: "PizzaHub — premium neighborhood pizza marketplace",
    template: "%s | PizzaHub",
  },
  description:
    "PizzaHub connects you with the best neighborhood pizzerias — browse local menus, order your favorites, and track every delivery.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        inter.variable,
        manrope.variable,
        "font-sans"
      )}
    >
      <body className="min-h-svh bg-background text-foreground">
        <a
          href="#main-content"
          className="sr-only rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50"
        >
          Skip to content
        </a>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
