"use client"

import { RouteError } from "@/components/route-error"

// Root route error boundary — wraps every route below the root layout
// (route groups inherit it unless they define their own). Must be a client
// component; see Next.js `error` file convention.
export default function RouteErrorBoundary(props: {
  error: unknown
  retry?: () => void
  reset?: () => void
}) {
  return <RouteError {...props} />
}
