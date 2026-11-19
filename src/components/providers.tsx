"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState } from "react"
import { AuthProvider } from "@/components/auth-provider"
import { CartProvider } from "@/components/cart-provider"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"

type ProvidersProps = {
  children: React.ReactNode
}

// Single mount point for app-wide providers — the root layout renders this
// exactly once, so nothing is ever double-wrapped (one theme context, one
// query client, one toaster). Client-only by necessity: query state and the
// toaster are browser-side.
export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  )

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <CartProvider>{children}</CartProvider>
        </AuthProvider>
      </QueryClientProvider>
      <Toaster position="bottom-right" />
    </ThemeProvider>
  )
}
