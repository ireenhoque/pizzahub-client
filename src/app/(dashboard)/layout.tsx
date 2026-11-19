// Dashboard shell — shared by the admin and vendor workspaces.
// The sidebar navigation (dashboard-shell) lands here in a later iteration.

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="flex min-h-svh">
      <main
        id="main-content"
        className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8"
      >
        {children}
      </main>
    </div>
  )
}
