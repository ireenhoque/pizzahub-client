import type { Metadata } from "next"

import { AdminGuard } from "@/components/admin-guard"
import { AdminTransactionHistory } from "@/components/admin-transaction-history"
import { PageContainer } from "@/components/page-container"

export const metadata: Metadata = {
  title: "Transaction history",
}

export default function AdminTransactionsPage() {
  return (
    <AdminGuard>
      <PageContainer size="wide" className="py-10">
        <AdminTransactionHistory />
      </PageContainer>
    </AdminGuard>
  )
}
