import type { Metadata } from "next"
import { VendorMenuForm } from "@/components/vendor-menu-form"

export const metadata: Metadata = {
  title: "Add Menu Item",
}

export default function NewVendorMenuItemPage() {
  return <VendorMenuForm mode="create" />
}
