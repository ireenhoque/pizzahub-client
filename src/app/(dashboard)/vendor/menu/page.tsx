import type { Metadata } from "next"
import { VendorMenuManager } from "@/components/vendor-menu-manager"

export const metadata: Metadata = {
  title: "My Menu",
}

export default function VendorMenuPage() {
  return <VendorMenuManager />
}
