"use client"

import Link from "next/link"
import { LockKeyhole } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { EmptyState } from "@/components/empty-state"
import { buttonVariants } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

// Client-side UX guard for customer-only storefront flows. The Express API
// re-checks the DB-derived role/blocked state on every protected request, so
// this only decides what the signed-in user sees.

type CustomerGateProps = {
  children: React.ReactNode
}

function CustomerGate({ children }: CustomerGateProps) {
  const { user, isPending } = useAuth()

  if (isPending) {
    return (
      <div
        role="status"
        aria-label="Checking your session"
        className="flex flex-col gap-4"
      >
        <Skeleton className="h-9 w-1/3" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    )
  }

  if (!user) {
    return (
      <EmptyState
        icon={LockKeyhole}
        title="Sign in to continue"
        description="You need a customer account to check out and view your orders."
        action={
          <Link href="/login" className={buttonVariants()}>
            Sign In
          </Link>
        }
      />
    )
  }

  if (user.isBlocked || user.role !== "customer") {
    return (
      <EmptyState
        icon={LockKeyhole}
        title="Customer accounts only"
        description={
          user.isBlocked
            ? "This account cannot place orders. Contact support for help."
            : "Orders and checkout are available to customer accounts only."
        }
        action={
          <Link href="/menu" className={buttonVariants({ variant: "outline" })}>
            Browse the menu
          </Link>
        }
      />
    )
  }

  return <>{children}</>
}

export { CustomerGate, type CustomerGateProps }
