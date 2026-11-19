"use client"

import Link from "next/link"
import { CircleUser, LogOut, UtensilsCrossed } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { ProfileUser } from "@/types"

type ProfileMenuProps = {
  user: ProfileUser
  /** Future auth hook — until it is provided, "Sign out" renders disabled. */
  onSignOut?: () => void
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

// Profile dropdown slot — visual shell for future authentication integration.
// It only navigates today; sign-out is wired through props, never logic here.
function ProfileMenu({ user, onSignOut }: ProfileMenuProps) {
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
        <DropdownMenuItem
          variant="destructive"
          disabled={!onSignOut}
          onClick={onSignOut}
        >
          <LogOut aria-hidden="true" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export { ProfileMenu, type ProfileUser, type ProfileMenuProps }
