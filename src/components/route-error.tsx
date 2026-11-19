"use client"

import { RefreshCw } from "lucide-react"
import { ErrorState } from "@/components/error-state"
import { PageContainer } from "@/components/page-container"
import { Button } from "@/components/ui/button"
import { env } from "@/lib/env"

type RouteErrorProps = {
  error: unknown
  /** Next 16 error.tsx passes `retry()`; older signatures pass `reset()`. */
  retry?: () => void
  reset?: () => void
}

// Reusable fallback for route-level error boundaries — renders the design
// system's ErrorState with a recovery button. Digest is always shown so it
// can be matched against server logs; raw messages only in development.
export function RouteError({ error, retry, reset }: RouteErrorProps) {
  const onRetry = retry ?? reset
  const digest = error instanceof Error ? error.digest : undefined
  const message =
    env.isDevelopment && error instanceof Error ? error.message : undefined

  return (
    <PageContainer className="py-16">
      <div className="flex flex-col items-center gap-4">
        <ErrorState
          title="Something went wrong"
          description="We couldn't load this page. Try again, or come back in a few minutes."
          action={
            onRetry ? (
              <Button onClick={onRetry}>
                <RefreshCw aria-hidden="true" />
                Try again
              </Button>
            ) : undefined
          }
        />
        {digest ? (
          <p className="font-mono text-xs text-muted-foreground">
            Error reference: {digest}
          </p>
        ) : null}
        {message ? (
          <p className="max-w-prose text-center font-mono text-xs text-muted-foreground/70">
            {message}
          </p>
        ) : null}
      </div>
    </PageContainer>
  )
}

export type { RouteErrorProps }
