import type { Metadata } from "next"
import { PageContainer } from "@/components/page-container"

export const metadata: Metadata = {
  title: "Browse Menu",
}

// Placeholder route — browse bar, category pills, and the product grid
// come in a later iteration. Exists so navbar/footer links resolve.
export default function MenuPage() {
  return (
    <PageContainer className="flex flex-col gap-4 py-16 md:py-24">
      <p className="text-xs font-semibold tracking-[0.14em] text-primary uppercase">
        Browse menu
      </p>
      <h1 className="max-w-2xl font-heading text-4xl font-extrabold tracking-tight md:text-5xl">
        Every pizzeria, <span className="text-primary">one menu away.</span>
      </h1>
      <p className="max-w-prose text-base text-muted-foreground">
        Menu browsing is under construction — pizzas, sides, and drinks from
        neighborhood pizzerias will live here.
      </p>
    </PageContainer>
  )
}
