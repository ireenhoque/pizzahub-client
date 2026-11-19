import { USER_ROLES, type UserRole } from "@/types"

// Role helpers shared by the navbar, profile menu, auth form, and proxy.
// These are presentation-only: the Express API remains the authorization
// authority and re-reads `role`/`isBlocked` from MongoDB on every request.

const knownRoles = new Set<string>(USER_ROLES)

/** Collapses a string or string[] role value to one recognized PizzaHub role. */
export function toUserRole(value: unknown): UserRole {
  const candidates = Array.isArray(value) ? value : [value]

  for (const candidate of candidates) {
    if (typeof candidate === "string" && knownRoles.has(candidate)) {
      return candidate as UserRole
    }
  }

  return "customer"
}

/** Dashboard route for a role, or null when the role has no workspace yet. */
export function dashboardPathForRole(value: unknown): string | null {
  const role = toUserRole(value)

  if (role === "admin") return "/admin"
  if (role === "vendor") return "/vendor"
  return null
}

/** Human-readable dashboard label for a role, or null when none exists. */
export function dashboardLabelForRole(value: unknown): string | null {
  const role = toUserRole(value)

  if (role === "admin") return "Admin dashboard"
  if (role === "vendor") return "Vendor dashboard"
  return null
}
