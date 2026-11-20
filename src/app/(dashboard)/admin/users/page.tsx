import type { Metadata } from "next"

import { AdminGuard } from "@/components/admin-guard"
import { AdminUserManager } from "@/components/admin-user-manager"
import { PageContainer } from "@/components/page-container"

export const metadata: Metadata = {
  title: "User management",
}

export default function AdminUsersPage() {
  return (
    <AdminGuard>
      <PageContainer size="wide" className="py-10">
        <AdminUserManager />
      </PageContainer>
    </AdminGuard>
  )
}
