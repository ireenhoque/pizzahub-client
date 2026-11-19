import { Footer } from "@/components/footer"
import { Navbar } from "@/components/navbar"

// Public storefront shell — sticky navbar + footer around every public route.
// Pass `user` to <Navbar> once authentication exists to reveal the profile dropdown.

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="flex min-h-svh flex-col">
      <Navbar />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  )
}
