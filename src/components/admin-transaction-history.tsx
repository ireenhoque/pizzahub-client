"use client"

import Link from "next/link"
import { useEffect, useState, type ReactNode } from "react"
import {
  ChevronLeft,
  ChevronRight,
  CreditCard,
  RefreshCw,
  Search,
  ShoppingBag,
  Sparkles,
} from "lucide-react"

import { EmptyState } from "@/components/empty-state"
import { ErrorState } from "@/components/error-state"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { apiErrorMessage } from "@/lib/api-error"
import {
  useAdminTransactions,
  useInvalidateAdminTransactions,
} from "@/lib/admin-transaction-queries"
import { formatCurrency, formatDate, formatNumber } from "@/lib/format"
import type {
  AdminTransaction,
  AdminTransactionSortField,
  AdminTransactionSortOrder,
  PaymentStatus,
  TransactionContext,
  TransactionParty,
  TransactionType,
} from "@/types"
import { cn } from "cn"

const PAGE_SIZE = 10

const DATE_TIME_OPTIONS: Intl.DateTimeFormatOptions = {
  dateStyle: "medium",
  timeStyle: "short",
}

const ROW_CLASSES =
  "grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-[1.1fr_1fr_1.2fr_0.9fr_0.7fr_0.8fr_1fr] lg:items-start"

const STATUS_OPTIONS: Array<{ value: PaymentStatus | "all"; label: string }> = [
  { value: "all", label: "All statuses" },
  { value: "paid", label: "Paid" },
  { value: "pending", label: "Pending" },
  { value: "failed", label: "Failed" },
  { value: "refunded", label: "Refunded" },
]

const TYPE_OPTIONS: Array<{ value: TransactionType | "all"; label: string }> = [
  { value: "all", label: "All types" },
  { value: "payment", label: "Payment" },
  { value: "refund", label: "Refund" },
]

const SORT_OPTIONS: Array<{ value: AdminTransactionSortField; label: string }> =
  [
    { value: "createdAt", label: "Date" },
    { value: "amount", label: "Amount" },
    { value: "updatedAt", label: "Updated" },
  ]

const SORT_ORDER_OPTIONS: Array<{
  value: AdminTransactionSortOrder
  label: string
}> = [
  { value: "desc", label: "Descending" },
  { value: "asc", label: "Ascending" },
]

function contextLabel(context: TransactionContext) {
  return context === "customer_order" ? "Customer order" : "Vendor subscription"
}

function contextVariant(context: TransactionContext): "secondary" | "outline" {
  return context === "customer_order" ? "secondary" : "outline"
}

function statusVariant(
  status: PaymentStatus
): "success" | "pending" | "destructive" | "secondary" {
  if (status === "paid") return "success"
  if (status === "pending") return "pending"
  if (status === "failed") return "destructive"
  return "secondary"
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function formatAmount(amount: number, currency: string) {
  try {
    return formatCurrency(amount, currency.toUpperCase())
  } catch {
    return `${formatNumber(amount)} ${currency}`
  }
}

function formatOptionalDate(value?: string) {
  return value ? formatDate(value, "en-US", DATE_TIME_OPTIONS) : "—"
}

function toDateBoundary(value: string, endOfDay: boolean) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return value
  const time = endOfDay ? "23:59:59.999" : "00:00:00.000"
  return `${value}T${time}Z`
}

function partyLabel(party: TransactionParty) {
  return party.name?.trim() || party.email?.trim() || party.id
}

function partyDetail(party: TransactionParty) {
  if (party.name?.trim() && party.email?.trim()) return party.email
  if (party.name?.trim()) return "Email unavailable"
  if (party.email?.trim()) return "Name unavailable"
  return "Details unavailable"
}

function RowField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <span className="mb-1 block text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase lg:hidden">
        {label}
      </span>
      {children}
    </div>
  )
}

function PartyCell({
  label,
  party,
}: {
  label: string
  party: TransactionParty
}) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
        {label}
      </p>
      <p
        className="truncate text-sm font-medium"
        title={party.name ?? party.email ?? party.id}
      >
        {partyLabel(party)}
      </p>
      <p
        className="truncate text-xs text-muted-foreground"
        title={party.email ?? undefined}
      >
        {partyDetail(party)}
      </p>
    </div>
  )
}

function TransactionDetails({
  transaction,
}: {
  transaction: AdminTransaction
}) {
  const details = [
    {
      label: "Stripe session",
      value: transaction.stripeSessionId,
    },
    transaction.stripePaymentIntentId
      ? {
          label: "Payment intent",
          value: transaction.stripePaymentIntentId,
        }
      : null,
    transaction.stripeSubscriptionId
      ? {
          label: "Subscription",
          value: transaction.stripeSubscriptionId,
        }
      : null,
    transaction.paidAt
      ? { label: "Paid at", value: formatOptionalDate(transaction.paidAt) }
      : null,
    transaction.refundedAt
      ? {
          label: "Refunded at",
          value: formatOptionalDate(transaction.refundedAt),
        }
      : null,
    transaction.updatedAt
      ? { label: "Updated", value: formatOptionalDate(transaction.updatedAt) }
      : null,
    transaction.failureReason
      ? { label: "Failure reason", value: transaction.failureReason }
      : null,
  ].filter((detail): detail is { label: string; value: string } =>
    Boolean(detail)
  )

  return (
    <details className="mt-2 w-fit">
      <summary className="cursor-pointer text-xs font-medium text-primary">
        Details
      </summary>
      <dl className="mt-2 grid gap-2 rounded-lg bg-muted/50 p-3 text-xs">
        {details.map((detail) => (
          <div
            key={detail.label}
            className="flex min-w-0 flex-col gap-0.5 sm:flex-row sm:justify-between sm:gap-3"
          >
            <dt className="shrink-0 font-medium text-muted-foreground">
              {detail.label}
            </dt>
            <dd className="min-w-0 text-right break-all" title={detail.value}>
              {detail.value}
            </dd>
          </div>
        ))}
      </dl>
    </details>
  )
}

function TransactionRowSkeleton() {
  return (
    <div aria-hidden="true" className={ROW_CLASSES}>
      {Array.from({ length: 7 }, (_, index) => (
        <Skeleton key={index} className="h-10 w-full" />
      ))}
    </div>
  )
}

function AdminTransactionHistory() {
  const [page, setPage] = useState(1)
  const [searchInput, setSearchInput] = useState("")
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState<PaymentStatus | "all">("all")
  const [type, setType] = useState<TransactionType | "all">("all")
  const [sortBy, setSortBy] = useState<AdminTransactionSortField>("createdAt")
  const [sortOrder, setSortOrder] = useState<AdminTransactionSortOrder>("desc")
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")

  const invalidateTransactions = useInvalidateAdminTransactions()
  const invalidDateRange = Boolean(from && to && from > to)

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput)
      setPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  const transactionsQuery = useAdminTransactions(
    {
      page,
      limit: PAGE_SIZE,
      search: search || undefined,
      status: status === "all" ? undefined : status,
      type: type === "all" ? undefined : type,
      sortBy,
      sortOrder,
      from: from ? toDateBoundary(from, false) : undefined,
      to: to ? toDateBoundary(to, true) : undefined,
    },
    !invalidDateRange
  )

  const transactions = transactionsQuery.data?.data.transactions ?? []
  const pagination = transactionsQuery.data?.data.pagination

  function resetFilters() {
    setSearchInput("")
    setSearch("")
    setStatus("all")
    setType("all")
    setSortBy("createdAt")
    setSortOrder("desc")
    setFrom("")
    setTo("")
    setPage(1)
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-3">
          <p className="text-xs font-semibold tracking-[0.14em] text-primary uppercase">
            Workspace
          </p>
          <h1 className="font-heading text-3xl font-bold">
            Transaction history
          </h1>
          <p className="max-w-prose text-muted-foreground">
            Review payments returned by the API. Customer order records carry an
            order ID; subscription records are vendor billing. Reference IDs are
            shown only as returned — no card or secret data is available here.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin"
            className={buttonVariants({ variant: "outline" })}
          >
            <ChevronLeft aria-hidden="true" />
            Menu approvals
          </Link>
          <Link
            href="/admin/users"
            className={buttonVariants({ variant: "outline" })}
          >
            Manage users
          </Link>
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-xl">Transactions</CardTitle>
          <CardDescription>
            Filter and sort real transaction records. Each row is labelled with
            its API context so customer order payments and vendor subscription
            payments stay distinct.
          </CardDescription>
          <CardAction>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={transactionsQuery.isFetching}
              onClick={() => {
                void invalidateTransactions()
              }}
            >
              <RefreshCw aria-hidden="true" />
              Refresh
            </Button>
          </CardAction>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="transaction-search">Search</Label>
              <div className="relative">
                <Search
                  className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  id="transaction-search"
                  type="search"
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder="ID, name, email, Stripe ref"
                  className="pl-9"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="transaction-status">Status</Label>
              <Select
                items={STATUS_OPTIONS}
                value={status}
                onValueChange={(value) => {
                  setStatus((value ?? "all") as PaymentStatus | "all")
                  setPage(1)
                }}
              >
                <SelectTrigger id="transaction-status" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="transaction-type">Type</Label>
              <Select
                items={TYPE_OPTIONS}
                value={type}
                onValueChange={(value) => {
                  setType((value ?? "all") as TransactionType | "all")
                  setPage(1)
                }}
              >
                <SelectTrigger id="transaction-type" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="transaction-sort-by">Sort by</Label>
              <Select
                items={SORT_OPTIONS}
                value={sortBy}
                onValueChange={(value) => {
                  setSortBy((value ?? "createdAt") as AdminTransactionSortField)
                  setPage(1)
                }}
              >
                <SelectTrigger id="transaction-sort-by" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="transaction-sort-order">Order</Label>
              <Select
                items={SORT_ORDER_OPTIONS}
                value={sortOrder}
                onValueChange={(value) => {
                  setSortOrder((value ?? "desc") as AdminTransactionSortOrder)
                  setPage(1)
                }}
              >
                <SelectTrigger id="transaction-sort-order" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SORT_ORDER_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:col-span-2 lg:col-span-1">
              <div className="flex flex-col gap-2">
                <Label htmlFor="transaction-from">From</Label>
                <Input
                  id="transaction-from"
                  type="date"
                  value={from}
                  onChange={(event) => {
                    setFrom(event.target.value)
                    setPage(1)
                  }}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="transaction-to">To</Label>
                <Input
                  id="transaction-to"
                  type="date"
                  value={to}
                  onChange={(event) => {
                    setTo(event.target.value)
                    setPage(1)
                  }}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground" aria-live="polite">
              {pagination
                ? `${pagination.total} transaction${pagination.total === 1 ? "" : "s"} found`
                : "Loading transactions…"}
            </p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={resetFilters}
            >
              Clear filters
            </Button>
          </div>

          {invalidDateRange ? (
            <ErrorState
              title="Invalid date range"
              description="The start date must be on or before the end date."
              action={
                <Button
                  variant="outline"
                  onClick={() => {
                    setFrom("")
                    setTo("")
                    setPage(1)
                  }}
                >
                  Clear dates
                </Button>
              }
            />
          ) : null}

          {!invalidDateRange && transactionsQuery.isPending ? (
            <div
              aria-label="Loading transactions"
              className="divide-y rounded-xl border"
            >
              {Array.from({ length: 4 }, (_, index) => (
                <TransactionRowSkeleton key={index} />
              ))}
            </div>
          ) : null}

          {!invalidDateRange && transactionsQuery.isError ? (
            <ErrorState
              title="Couldn't load transactions"
              description={apiErrorMessage(transactionsQuery.error)}
              action={
                <Button
                  variant="outline"
                  onClick={() => {
                    void transactionsQuery.refetch()
                  }}
                >
                  <RefreshCw aria-hidden="true" />
                  Try again
                </Button>
              }
            />
          ) : null}

          {!invalidDateRange &&
          !transactionsQuery.isPending &&
          !transactionsQuery.isError &&
          transactions.length === 0 ? (
            <EmptyState
              icon={CreditCard}
              title="No transactions found"
              description="Try a different search term, filter, or date range."
              action={
                <Button variant="outline" onClick={resetFilters}>
                  Clear filters
                </Button>
              }
            />
          ) : null}

          {!invalidDateRange &&
          !transactionsQuery.isPending &&
          !transactionsQuery.isError &&
          transactions.length > 0 ? (
            <div className="divide-y rounded-xl border">
              <div
                className={cn(
                  ROW_CLASSES,
                  "hidden border-b text-xs font-semibold tracking-[0.08em] text-muted-foreground uppercase lg:grid"
                )}
              >
                <span>Transaction</span>
                <span>Context</span>
                <span>Customer / Vendor</span>
                <span>Amount</span>
                <span>Type</span>
                <span>Status</span>
                <span>Date</span>
              </div>

              {transactions.map((transaction) => (
                <div key={transaction.id} className={ROW_CLASSES}>
                  <RowField label="Transaction">
                    <p
                      className="truncate font-mono text-xs"
                      title={transaction.id}
                    >
                      {transaction.id}
                    </p>
                    {transaction.orderId ? (
                      <p
                        className="mt-1 truncate text-xs text-muted-foreground"
                        title={transaction.orderId}
                      >
                        Order {transaction.orderId}
                      </p>
                    ) : null}
                    <TransactionDetails transaction={transaction} />
                  </RowField>

                  <RowField label="Context">
                    <Badge
                      variant={contextVariant(transaction.context)}
                      className="gap-1"
                    >
                      {transaction.context === "customer_order" ? (
                        <ShoppingBag aria-hidden="true" />
                      ) : (
                        <Sparkles aria-hidden="true" />
                      )}
                      {contextLabel(transaction.context)}
                    </Badge>
                  </RowField>

                  <RowField label="Customer / Vendor">
                    <div className="space-y-3">
                      <PartyCell
                        label="Customer"
                        party={transaction.customer}
                      />
                      <PartyCell label="Vendor" party={transaction.vendor} />
                    </div>
                  </RowField>

                  <RowField label="Amount">
                    <p className="font-heading text-base font-bold">
                      {formatAmount(transaction.amount, transaction.currency)}
                    </p>
                    <p className="text-xs text-muted-foreground uppercase">
                      {transaction.currency}
                    </p>
                  </RowField>

                  <RowField label="Type">
                    <Badge
                      variant={
                        transaction.type === "refund"
                          ? "destructive"
                          : "secondary"
                      }
                      className="capitalize"
                    >
                      {transaction.type}
                    </Badge>
                  </RowField>

                  <RowField label="Status">
                    <Badge variant={statusVariant(transaction.paymentStatus)}>
                      {capitalize(transaction.paymentStatus)}
                    </Badge>
                  </RowField>

                  <RowField label="Date">
                    <p className="text-sm">
                      {formatOptionalDate(transaction.createdAt)}
                    </p>
                    {transaction.paidAt ? (
                      <p className="mt-1 text-xs text-muted-foreground">
                        Paid {formatOptionalDate(transaction.paidAt)}
                      </p>
                    ) : null}
                  </RowField>
                </div>
              ))}
            </div>
          ) : null}
        </CardContent>

        {pagination && pagination.totalPages > 1 ? (
          <CardFooter className="justify-between gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page <= 1 || transactionsQuery.isFetching}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              <ChevronLeft aria-hidden="true" />
              Previous
            </Button>
            <span className="text-xs text-muted-foreground">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={
                page >= pagination.totalPages || transactionsQuery.isFetching
              }
              onClick={() =>
                setPage((current) =>
                  Math.min(pagination.totalPages, current + 1)
                )
              }
            >
              Next
              <ChevronRight aria-hidden="true" />
            </Button>
          </CardFooter>
        ) : null}
      </Card>
    </div>
  )
}

export { AdminTransactionHistory }
