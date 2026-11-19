// Public storefront shell — the navbar, hero, and footer components slot in here.

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="flex min-h-svh flex-col">
      <main id="main-content" className="flex-1">
        {children}
      </main>
    </div>
  )
}
