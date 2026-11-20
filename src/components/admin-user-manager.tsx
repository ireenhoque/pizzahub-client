"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import {
  Ban,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Search,
  Users,
} from "lucide-react"

import { useAuth } from "@/components/auth-provider"
import { EmptyState } from "@/components/empty-state"
import { ErrorState } from "@/components/error-state"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { apiErrorMessage } from "@/lib/api-error"
import {
  useAdminUsers,
  useBlockAdminUser,
  useUnblockAdminUser,
  type AdminUser,
} from "@/lib/admin-user-queries"
import { formatDate } from "@/lib/format"
import { USER_ROLES, type UserRole } from "@/types"

const PAGE_SIZE = 10

const ROLE_OPTIONS: Array<{ value: UserRole | "all"; label: string }> = [
  { value: "all", label: "All roles" },
  ...USER_ROLES.map((role) => ({
    value: role,
    label: role.charAt(0).toUpperCase() + role.slice(1),
  })),
]

type PendingAction = {
  user: AdminUser
  action: "block" | "unblock"
}

function UserRowSkeleton() {
  return (
    <div className="grid gap-3 p-4 sm:grid-cols-5 sm:items-center">
      <Skeleton className="h-5 w-32" />
      <Skeleton className="h-4 w-40" />
      <Skeleton className="h-5 w-16" />
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-8 w-24 justify-self-end" />
    </div>
  )
}

function displayName(user: AdminUser) {
  return user.name?.trim() || user.email || "Unnamed user"
}

function AdminUserManager() {
  const { user: currentUser } = useAuth()
  const [page, setPage] = useState(1)
  const [searchInput, setSearchInput] = useState("")
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all")
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null)

  const blockMutation = useBlockAdminUser()
  const unblockMutation = useUnblockAdminUser()

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput)
      setPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  const usersQuery = useAdminUsers({
    page,
    limit: PAGE_SIZE,
    search: search || undefined,
    role: roleFilter === "all" ? undefined : roleFilter,
  })

  const users = usersQuery.data?.data.users ?? []
  const pagination = usersQuery.data?.data.pagination
  const activeMutation =
    pendingAction?.action === "block" ? blockMutation : unblockMutation
  const isMutating = Boolean(pendingAction && activeMutation.isPending)

  function requestAction(user: AdminUser, action: "block" | "unblock") {
    if (action === "block" && user.id === currentUser?.id) return
    blockMutation.reset()
    unblockMutation.reset()
    setPendingAction({ user, action })
  }

  function confirmAction() {
    if (!pendingAction) return

    activeMutation.mutate(pendingAction.user.id, {
      onSuccess: (response) => {
        toast.success(
          response.message ||
            (pendingAction.action === "block"
              ? "User blocked"
              : "User unblocked")
        )
        setPendingAction(null)
      },
    })
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-3">
          <p className="text-xs font-semibold tracking-[0.14em] text-primary uppercase">
            Workspace
          </p>
          <h1 className="font-heading text-3xl font-bold">User management</h1>
          <p className="max-w-prose text-muted-foreground">
            Search accounts and block or unblock access. Roles are managed
            server-side and cannot be changed here.
          </p>
        </div>
        <Link
          href="/admin"
          className={buttonVariants({ variant: "outline" })}
        >
          <ChevronLeft aria-hidden="true" />
          Menu approvals
        </Link>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-xl">Accounts</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-[1fr_200px]">
            <div className="flex flex-col gap-2">
              <Label htmlFor="user-search">Search</Label>
              <div className="relative">
                <Search
                  className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  id="user-search"
                  type="search"
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder="Name or email"
                  className="pl-9"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="user-role">Role</Label>
              <Select
                items={ROLE_OPTIONS}
                value={roleFilter}
                onValueChange={(value) => {
                  setRoleFilter((value ?? "all") as UserRole | "all")
                  setPage(1)
                }}
              >
                <SelectTrigger id="user-role" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {usersQuery.isPending ? (
            <div aria-label="Loading users" className="divide-y">
              {Array.from({ length: 4 }, (_, index) => (
                <UserRowSkeleton key={index} />
              ))}
            </div>
          ) : null}

          {usersQuery.isError ? (
            <ErrorState
              title="Couldn't load users"
              description={apiErrorMessage(usersQuery.error)}
              action={
                <Button
                  variant="outline"
                  onClick={() => {
                    void usersQuery.refetch()
                  }}
                >
                  <RefreshCw aria-hidden="true" />
                  Try again
                </Button>
              }
            />
          ) : null}

          {!usersQuery.isPending && !usersQuery.isError && users.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No users found"
              description="Try a different search term or role filter."
              action={
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchInput("")
                    setSearch("")
                    setRoleFilter("all")
                    setPage(1)
                  }}
                >
                  Clear filters
                </Button>
              }
            />
          ) : null}

          {!usersQuery.isPending && !usersQuery.isError && users.length > 0 ? (
            <div className="divide-y">
              <div className="hidden gap-3 px-4 pb-2 text-xs font-semibold tracking-[0.08em] text-muted-foreground uppercase sm:grid sm:grid-cols-5 sm:items-center">
                <span>Name</span>
                <span>Email</span>
                <span>Role</span>
                <span>Registered</span>
                <span className="text-right">Status</span>
              </div>

              {users.map((user) => {
                const isSelf = user.id === currentUser?.id
                const blockDisabled =
                  isSelf || user.role === "admin" || isMutating

                return (
                  <div
                    key={user.id}
                    className="grid gap-3 p-4 sm:grid-cols-5 sm:items-center"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">
                        {displayName(user)}
                      </p>
                      {isSelf ? (
                        <span className="text-xs text-muted-foreground">
                          You
                        </span>
                      ) : null}
                    </div>

                    <p
                      className="truncate text-sm text-muted-foreground"
                      title={user.email}
                    >
                      {user.email ?? "—"}
                    </p>

                    <div>
                      <Badge variant="secondary" className="capitalize">
                        {user.role}
                      </Badge>
                    </div>

                    <p className="text-sm text-muted-foreground">
                      {user.createdAt ? formatDate(user.createdAt) : "—"}
                    </p>

                    <div className="flex flex-wrap items-center justify-start gap-2 sm:justify-end">
                      <Badge
                        variant={user.isBlocked ? "destructive" : "success"}
                      >
                        {user.isBlocked ? "Blocked" : "Active"}
                      </Badge>
                      {user.isBlocked ? (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={isMutating}
                          onClick={() => requestAction(user, "unblock")}
                        >
                          <CheckCircle2 aria-hidden="true" />
                          Unblock
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={blockDisabled}
                          title={
                            isSelf
                              ? "You can't block your own account"
                              : user.role === "admin"
                                ? "Admin accounts can't be blocked"
                                : undefined
                          }
                          onClick={() => requestAction(user, "block")}
                        >
                          <Ban aria-hidden="true" />
                          Block
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : null}
        </CardContent>

        {pagination && pagination.totalPages > 1 ? (
          <CardFooter className="justify-between gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page <= 1 || usersQuery.isFetching}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              <ChevronLeft aria-hidden="true" />
              Previous
            </Button>
            <span className="text-xs text-muted-foreground" aria-live="polite">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={
                page >= pagination.totalPages || usersQuery.isFetching
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

      <Sheet
        open={Boolean(pendingAction)}
        onOpenChange={(open) => {
          if (!open && !isMutating) setPendingAction(null)
        }}
      >
        <SheetContent side="bottom" className="mx-auto max-w-lg rounded-t-2xl">
          <SheetHeader>
            <SheetTitle>
              {pendingAction?.action === "unblock"
                ? "Unblock this user?"
                : "Block this user?"}
            </SheetTitle>
            <SheetDescription>
              {pendingAction
                ? `${displayName(pendingAction.user)} ${
                    pendingAction.action === "block"
                      ? "will lose access until you unblock them."
                      : "will regain access immediately."
                  }`
                : ""}
            </SheetDescription>
          </SheetHeader>

          {activeMutation.isError ? (
            <ErrorState
              title="Couldn't update the user"
              description={apiErrorMessage(activeMutation.error)}
              className="py-6"
            />
          ) : null}

          <SheetFooter className="sm:justify-end">
            <Button
              type="button"
              variant="outline"
              disabled={isMutating}
              onClick={() => setPendingAction(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant={
                pendingAction?.action === "block" ? "destructive" : "default"
              }
              disabled={isMutating}
              onClick={confirmAction}
            >
              {isMutating
                ? "Saving…"
                : pendingAction?.action === "block"
                  ? "Block user"
                  : "Unblock user"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}

export { AdminUserManager }
