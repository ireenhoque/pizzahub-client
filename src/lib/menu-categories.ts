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
