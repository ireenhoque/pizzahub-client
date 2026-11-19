"use client"

import Link from "next/link"
import {
  CircleUser,
  LayoutDashboard,
  LogOut,
  Package,
  UtensilsCrossed,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { dashboardLabelForRole, dashboardPathForRole } from "@/lib/roles"
import type { ProfileUser } from "@/types"

type ProfileMenuProps = {
  user: ProfileUser
  /** Wired to the auth provider; renders disabled when omitted. */
  onSignOut?: () => void | Promise<void>
}

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

// Profile dropdown — session data and sign-out are supplied by <Navbar>.
// Dashboard links are role-aware but purely navigational; the Express API
// still authorizes every protected request against MongoDB.
function ProfileMenu({ user, onSignOut }: ProfileMenuProps) {
  const dashboardHref = dashboardPathForRole(user.role)
  const dashboardLabel = dashboardLabelForRole(user.role)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`Account menu for ${user.name}`}
        className="flex size-10 items-center justify-center rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <Avatar className="size-9">
          {user.avatarUrl ? <AvatarImage src={user.avatarUrl} alt="" /> : null}
          <AvatarFallback className="bg-secondary text-xs font-semibold text-secondary-foreground">
            {initials(user.name)}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="font-normal">
            <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <CircleUser className="size-4 text-primary" aria-hidden="true" />
              {user.name}
            </span>
            {user.email ? (
              <span className="mt-0.5 block text-xs text-muted-foreground">
                {user.email}
              </span>
            ) : null}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem render={<Link href="/menu" />}>
            <UtensilsCrossed aria-hidden="true" />
            Browse Menu
          </DropdownMenuItem>
          {user.role === "customer" ? (
            <DropdownMenuItem render={<Link href="/orders" />}>
              <Package aria-hidden="true" />
              My Orders
            </DropdownMenuItem>
          ) : null}
          {dashboardHref && dashboardLabel ? (
            <DropdownMenuItem render={<Link href={dashboardHref} />}>
              <LayoutDashboard aria-hidden="true" />
              {dashboardLabel}
            </DropdownMenuItem>
          ) : null}
          <DropdownMenuItem
            variant="destructive"
            disabled={!onSignOut}
            onClick={onSignOut}
          >
            <LogOut aria-hidden="true" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export { ProfileMenu, type ProfileUser, type ProfileMenuProps }
