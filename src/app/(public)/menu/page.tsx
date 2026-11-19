import type { Metadata } from "next"
import { MenuBrowser } from "@/components/menu-browser"
import { menuCategoryFromSlug } from "@/lib/menu-categories"

export const metadata: Metadata = {
  title: "Browse Menu",
}

type MenuPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

// The server translates homepage facet slugs into the single API category and
// forwards the existing `?item=<id>` deep link; all live filtering happens in
// the client browser component against the Express API.
export default async function MenuPage({ searchParams }: MenuPageProps) {
  const params = await searchParams
  const category = menuCategoryFromSlug(params.category)
  const itemParam = params.item
  const itemId = Array.isArray(itemParam) ? itemParam[0] : itemParam

  return (
    <MenuBrowser initialCategory={category} initialItemId={itemId ?? null} />
  )
}
