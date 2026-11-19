import Link from "next/link"

// Authentication shell — centered layout shared by sign-in and sign-up routes.

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center px-4 py-12">
      <Link
        href="/"
        className="font-heading text-2xl font-extrabold tracking-tight text-primary"
      >
        PizzaHub
      </Link>
      <main id="main-content" className="mt-8 w-full max-w-sm">
        {children}
      </main>
    </div>
  )
}
