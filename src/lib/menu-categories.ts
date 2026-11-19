import {
  Beef,
  ChefHat,
  CupSoda,
  Leaf,
  Pizza,
  Sandwich,
  type LucideIcon,
} from "lucide-react"
import type { MenuItemCategory } from "@/types"

// The six storefront category facets. `slug` is the `?category=` value the
// Browse Menu link carries; `apiCategories` maps each facet to the Express
// enum (GET /api/menu-items?category=...) so the menu page can translate
// facets into API filters without duplicating the contract.
export type MenuCategoryFacet = {
  slug: string
  label: string
  blurb: string
  icon: LucideIcon
  apiCategories: MenuItemCategory[]
}

export const MENU_CATEGORY_FACETS: MenuCategoryFacet[] = [
  {
    slug: "classic-pizzas",
    label: "Classic Pizzas",
    blurb: "Timeless cheese, pepperoni, and margherita staples.",
    icon: Pizza,
    apiCategories: ["pizza"],
  },
  {
    slug: "vegetarian-pizzas",
    label: "Vegetarian Pizzas",
    blurb: "Garden-fresh toppings and meat-free favorites.",
    icon: Leaf,
    apiCategories: ["pizza"],
  },
  {
    slug: "meat-lovers",
    label: "Meat Lovers",
    blurb: "Pepperoni, sausage, and hearty protein stacks.",
    icon: Beef,
    apiCategories: ["pizza"],
  },
  {
    slug: "specialty-pizzas",
    label: "Specialty / Gourmet Pizzas",
    blurb: "Chef specials with premium, creative toppings.",
    icon: ChefHat,
    apiCategories: ["pizza"],
  },
  {
    slug: "sides-appetizers",
    label: "Sides and Appetizers",
    blurb: "Garlic bread, fries, wings, and sharing plates.",
    icon: Sandwich,
    apiCategories: ["sides"],
  },
  {
    slug: "beverages-desserts",
    label: "Beverages and Desserts",
    blurb: "Sodas, shakes, cookies, and sweet finishes.",
    icon: CupSoda,
    apiCategories: ["drinks", "desserts"],
  },
]

/** Values accepted by the Express `?category=` query — one per API enum. */
export const MENU_CATEGORY_VALUES: MenuItemCategory[] = [
  "pizza",
  "sides",
  "drinks",
  "desserts",
  "combos",
]

/** Short labels for the API category values used in storefront filter pills. */
export const MENU_CATEGORY_LABELS: Record<MenuItemCategory, string> = {
  pizza: "Pizza",
  sides: "Sides",
  drinks: "Drinks",
  desserts: "Desserts",
  combos: "Combos",
}

/**
 * Translates a homepage facet slug (or a direct API value) into the single
 * category the Express list endpoint accepts. Facets that span multiple API
 * categories fall back to their first value because the API takes one category.
 */
export function menuCategoryFromSlug(
  slug?: string | string[] | null
): MenuItemCategory | null {
  const value = Array.isArray(slug) ? slug[0] : slug
  if (!value) return null

  const facet = MENU_CATEGORY_FACETS.find((entry) => entry.slug === value)
  if (facet) return facet.apiCategories[0] ?? null

  return MENU_CATEGORY_VALUES.includes(value as MenuItemCategory)
    ? (value as MenuItemCategory)
    : null
}
