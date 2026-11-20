"use client"

import { useState } from "react"
import {
  ArrowUpRight,
  BadgeCheck,
  Clock,
  RotateCcw,
  Sparkles,
} from "lucide-react"
import { toast } from "sonner"
import { EmptyState } from "@/components/empty-state"
import { ErrorState } from "@/components/error-state"
import { PageContainer } from "@/components/page-container"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { apiErrorMessage } from "@/lib/api-error"
import { formatDate, formatNumber } from "@/lib/format"
import {
  useCancelVendorSubscription,
  useStartVendorSubscription,
  useVendorMenuItems,
  useVendorSubscription,
} from "@/lib/vendor-queries"
import { cn } from "cn"

const ACTIVE_ITEMS_QUERY = {
  page: 1,
  limit: 100,
  status: "active",
} as const
/** Mirrors FREE_PLAN_MAX_ACTIVE_MENU_ITEMS in the Express menu service. */
const FREE_PLAN_LIMIT = 3

function planLabel(plan: string | undefined) {
  if (!plan) return "—"
  if (plan === "free") return "Free"
  if (plan === "premium") return "Premium"
  return plan.charAt(0).toUpperCase() + plan.slice(1)
}

function safeCheckoutUrl(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim()) return null
  try {
    const url = new URL(value)
    if (url.protocol !== "https:" && url.protocol !== "http:") return null
    return url.toString()
  } catch {
    return null
  }
}

function SubscriptionSkeleton() {
  return (
    <PageContainer size="wide" className="space-y-6 py-8 sm:py-10">
      <div
        role="status"
        aria-label="Loading subscription"
        className="space-y-6"
      >
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-4 w-full max-w-prose" />
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <Skeleton className="h-72 rounded-xl" />
          <Skeleton className="h-72 rounded-xl" />
        </div>
      </div>
    </PageContainer>
  )
}

type PlanCardProps = {
  name: string
  description: string
  badge: string
  current: boolean
  icon: typeof Sparkles
  children?: React.ReactNode
  action?: React.ReactNode
}

function PlanCard({
  name,
  description,
  badge,
  current,
  icon: Icon,
  children,
  action,
}: PlanCardProps) {
  return (
    <Card
      className={cn("h-full", current && "shadow-card ring-2 ring-primary/60")}
    >
      <CardHeader>
        <span className="flex size-9 items-center justify-center rounded-lg bg-muted text-primary">
          <Icon className="size-4" aria-hidden="true" />
        </span>
        <CardTitle className="mt-2 text-xl">{name}</CardTitle>
        <CardDescription>{description}</CardDescription>
        <CardAction>
          <Badge variant={current ? "success" : "secondary"}>{badge}</Badge>
        </CardAction>
      </CardHeader>
      <CardContent className="flex-1 text-sm text-muted-foreground">
        {children}
      </CardContent>
      <CardFooter>{action}</CardFooter>
    </Card>
  )
}

function VendorSubscription() {
  const subscriptionQuery = useVendorSubscription()
  const menuQuery = useVendorMenuItems(ACTIVE_ITEMS_QUERY)
  const checkoutMutation = useStartVendorSubscription()
  const cancelMutation = useCancelVendorSubscription()
  const [cancelOpen, setCancelOpen] = useState(false)
  const [redirectError, setRedirectError] = useState<string | null>(null)

  const queries = [subscriptionQuery, menuQuery]
  const failedQueries = queries.filter((query) => query.isError)
  const isLoading = queries.some((query) => query.isPending)

  const subscription = subscriptionQuery.data?.data.subscription
  const plan = subscription?.plan
  const isActive = subscription?.isActive === true
  const activeCount = menuQuery.data?.data.pagination.total ?? 0
  const usageLabel =
    plan === "premium" && isActive
      ? "No active-item limit"
      : `${formatNumber(activeCount)} of ${FREE_PLAN_LIMIT} active items`
  const usagePercent =
    plan === "premium" && isActive
      ? 100
      : Math.min(100, (activeCount / FREE_PLAN_LIMIT) * 100)

  function retryFailedQueries() {
    for (const query of failedQueries) void query.refetch()
  }

  function handleCheckout() {
    setRedirectError(null)
    checkoutMutation.reset()
    checkoutMutation.mutate(undefined, {
      onSuccess: (response) => {
        const checkoutUrl = safeCheckoutUrl(response.data.checkoutUrl)
        if (!checkoutUrl) {
          setRedirectError("Stripe did not return a usable checkout URL.")
          return
        }
        toast.success("Opening Stripe checkout…")
        window.location.assign(checkoutUrl)
      },
    })
  }

  function handleCancel() {
    cancelMutation.reset()
    cancelMutation.mutate(undefined, {
      onSuccess: () => {
        toast.success("Premium subscription cancelled")
        setCancelOpen(false)
      },
    })
  }

  const mutationError = redirectError
    ? null
    : (checkoutMutation.error ?? cancelMutation.error)
  const mutationTitle =
    cancelMutation.error && !redirectError
      ? "Couldn't cancel the subscription"
      : "Couldn't start checkout"

  return (
    <PageContainer size="wide" className="space-y-6 py-8 sm:py-10">
      <div className="flex flex-col gap-3">
        <p className="text-xs font-semibold tracking-[0.14em] text-primary uppercase">
          Workspace
        </p>
        <h1 className="font-heading text-3xl font-bold">Subscription</h1>
        <p className="max-w-prose text-muted-foreground">
          Manage your PizzaHub plan and track how many active menu items you are
          using.
        </p>
      </div>

      {isLoading ? <SubscriptionSkeleton /> : null}

      {!isLoading && failedQueries.length ? (
        <ErrorState
          title="Couldn't load subscription details"
          description={failedQueries
            .map((query) => apiErrorMessage(query.error))
            .join(" · ")}
          action={
            <Button variant="outline" onClick={retryFailedQueries}>
              <RotateCcw aria-hidden="true" />
              Try again
            </Button>
          }
        />
      ) : null}

      {!isLoading && !failedQueries.length && !subscription ? (
        <EmptyState
          icon={Sparkles}
          title="Subscription details unavailable"
          description="The API did not return a subscription record."
        />
      ) : null}

      {!isLoading && !failedQueries.length && subscription ? (
        <>
          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Current plan</CardTitle>
                  <CardDescription>
                    Your live plan and active menu item usage.
                  </CardDescription>
                  <CardAction>
                    <Badge variant={isActive ? "success" : "secondary"}>
                      {isActive ? "Active" : "Inactive"}
                    </Badge>
                  </CardAction>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="rounded-lg border border-border p-4">
                      <p className="text-xs text-muted-foreground">Plan</p>
                      <p className="mt-1 font-heading text-xl font-bold">
                        {planLabel(plan)}
                      </p>
                    </div>
                    <div className="rounded-lg border border-border p-4">
                      <p className="text-xs text-muted-foreground">Status</p>
                      <p className="mt-1 font-heading text-xl font-bold">
                        {isActive
                          ? "Active"
                          : plan === "premium"
                            ? "Expired"
                            : "Free"}
                      </p>
                    </div>
                    <div className="rounded-lg border border-border p-4">
                      <p className="text-xs text-muted-foreground">Expires</p>
                      <p className="mt-1 font-heading text-base font-bold">
                        {subscription.expiresAt
                          ? formatDate(subscription.expiresAt)
                          : "Not provided"}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex flex-wrap justify-between gap-2 text-sm">
                      <span className="font-medium">Active menu items</span>
                      <span className="text-muted-foreground">
                        {usageLabel}
                      </span>
                    </div>
                    <div
                      className="h-2 w-full overflow-hidden rounded-full bg-muted"
                      role="progressbar"
                      aria-label="Active menu item usage"
                      aria-valuemin={0}
                      aria-valuemax={
                        plan === "premium" && isActive
                          ? undefined
                          : FREE_PLAN_LIMIT
                      }
                      aria-valuenow={
                        plan === "premium" && isActive
                          ? undefined
                          : Math.min(activeCount, FREE_PLAN_LIMIT)
                      }
                    >
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${usagePercent}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      The Free plan allows {FREE_PLAN_LIMIT} active menu items.
                      Usage comes from the active-item total reported by the
                      menu API.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {mutationError || redirectError ? (
                <ErrorState
                  title={
                    redirectError ? "Checkout redirect failed" : mutationTitle
                  }
                  description={redirectError ?? apiErrorMessage(mutationError)}
                  action={
                    <Button
                      variant="outline"
                      onClick={() => {
                        setRedirectError(null)
                        checkoutMutation.reset()
                        cancelMutation.reset()
                      }}
                    >
                      Dismiss
                    </Button>
                  }
                />
              ) : null}

              <Card>
                <CardHeader>
                  <CardTitle>How activation works</CardTitle>
                </CardHeader>
                <CardContent className="flex gap-3 text-sm text-muted-foreground">
                  <Clock
                    className="mt-0.5 size-4 shrink-0 text-primary"
                    aria-hidden="true"
                  />
                  <p>
                    Starting checkout opens Stripe. Premium becomes active only
                    after Stripe confirms successful payment and PizzaHub
                    processes the signed webhook. Returning from checkout alone
                    does not activate the plan.
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="h-fit bg-gradient-to-br from-primary to-secondary p-5 text-primary-foreground">
              <Sparkles className="size-5" aria-hidden="true" />
              <p className="mt-3 font-heading text-lg font-bold">
                More room for your menu
              </p>
              <p className="mt-1 text-sm text-primary-foreground/80">
                Premium removes the Free plan&apos;s active-item limit. Pricing
                and billing details are shown by Stripe at checkout.
              </p>
            </Card>
          </div>

          <section
            aria-labelledby="available-plans-heading"
            className="space-y-4"
          >
            <div>
              <h2
                id="available-plans-heading"
                className="font-heading text-2xl font-bold"
              >
                Available plans
              </h2>
              <p className="text-sm text-muted-foreground">
                Only plans implemented by the PizzaHub backend are shown.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <PlanCard
                name="Free"
                description="For vendors getting started."
                badge={plan === "free" ? "Current plan" : "Available"}
                current={plan === "free"}
                icon={BadgeCheck}
                action={
                  <Button variant="outline" disabled className="w-full">
                    {plan === "free" ? "Current plan" : "No payment required"}
                  </Button>
                }
              >
                Up to {FREE_PLAN_LIMIT} active menu items. No Stripe checkout is
                required.
              </PlanCard>

              <PlanCard
                name="Premium"
                description="For vendors with a larger menu."
                badge={plan === "premium" ? "Current plan" : "Upgrade"}
                current={plan === "premium"}
                icon={Sparkles}
                action={
                  <Button
                    disabled={isActive || checkoutMutation.isPending}
                    onClick={handleCheckout}
                    className="w-full"
                  >
                    {isActive
                      ? "Current plan"
                      : checkoutMutation.isPending
                        ? "Opening checkout…"
                        : "Upgrade with Stripe"}
                    {!isActive ? <ArrowUpRight aria-hidden="true" /> : null}
                  </Button>
                }
              >
                No active-menu-item limit. Price, currency, and billing interval
                are configured in Stripe and shown during checkout.
              </PlanCard>
            </div>

            {plan === "premium" && isActive ? (
              <Card>
                <CardHeader>
                  <CardTitle>Manage Premium</CardTitle>
                  <CardDescription>
                    Cancelling immediately downgrades the account to Free.
                  </CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button
                    variant="destructive"
                    disabled={cancelMutation.isPending}
                    onClick={() => {
                      cancelMutation.reset()
                      setCancelOpen(true)
                    }}
                  >
                    Cancel subscription
                  </Button>
                </CardFooter>
              </Card>
            ) : null}
          </section>
        </>
      ) : null}

      <Sheet
        open={cancelOpen}
        onOpenChange={(open) => {
          if (!open && !cancelMutation.isPending) setCancelOpen(false)
        }}
      >
        <SheetContent side="bottom" className="mx-auto max-w-lg rounded-t-2xl">
          <SheetHeader>
            <SheetTitle>Cancel Premium?</SheetTitle>
            <SheetDescription>
              Your plan will be downgraded to Free and the active-item limit of{" "}
              {FREE_PLAN_LIMIT} will apply again. Stripe cancellation is handled
              by the backend.
            </SheetDescription>
          </SheetHeader>
          {cancelMutation.error ? (
            <ErrorState
              className="py-6"
              title="Couldn't cancel the subscription"
              description={apiErrorMessage(cancelMutation.error)}
            />
          ) : null}
          <SheetFooter className="sm:justify-end">
            <SheetClose
              render={
                <Button variant="outline" disabled={cancelMutation.isPending} />
              }
            >
              Keep Premium
            </SheetClose>
            <Button
              variant="destructive"
              disabled={cancelMutation.isPending}
              onClick={handleCancel}
            >
              {cancelMutation.isPending ? "Cancelling…" : "Cancel subscription"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </PageContainer>
  )
}

export { VendorSubscription }
