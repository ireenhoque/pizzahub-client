import type { MenuItem } from "@/types"

/** Mirrors the server's public ordering rule before an item reaches checkout. */
export function isMenuItemUnavailable(item: MenuItem): boolean {
  return !item.isAvailable || item.status !== "active"
}
