import type { Metadata } from "next"
import { VendorMenuEditor } from "@/components/vendor-menu-form"

export const metadata: Metadata = {
  title: "Edit Menu Item",
}

export default async function EditVendorMenuItemPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <VendorMenuEditor id={id} />
}
