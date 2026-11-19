import { ArrowUpRight } from "lucide-react"
import Link from "next/link"
import { PageContainer } from "@/components/page-container"
import { MENU_CATEGORY_FACETS } from "@/lib/menu-categories"
import { enter } from "@/lib/motion"

// Browse-by-category grid — every tile links to the Browse Menu page with a
// `?category=<slug>` query param; the shared facet list (lib/menu-categories)
// maps each slug to the Express category enum for the menu page to consume.
function Categories() {
  return (
    <section aria-labelledby="categories-heading" className="py-14 md:py-16">
      <PageContainer className="flex flex-col gap-8">
        <div className="flex flex-col gap-3 motion-safe:animate-in motion-safe:duration-700 motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-4">
          <p className="flex items-center gap-3 text-xs font-semibold tracking-[0.14em] uppercase">
            <span aria-hidden="true" className="h-px w-8 bg-primary" />
            Menu categories
          </p>
          <h2
            id="categories-heading"
            className="font-heading text-3xl font-extrabold tracking-tight md:text-4xl"
          >
            What are you craving?
          </h2>
          <p className="max-w-prose text-sm text-muted-foreground md:text-base">
            Six ways into the menu — tap a category to open Browse Menu with the
            filter already applied.
          </p>
        </div>

        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MENU_CATEGORY_FACETS.map((facet, index) => (
            <li
              key={facet.slug}
              className="h-full motion-safe:animate-in motion-safe:duration-700 motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-4"
              style={enter(`${index * 60}ms`)}
            >
              <Link
                href={`/menu?category=${facet.slug}`}
                className="group flex h-full items-start gap-4 rounded-xl border border-border bg-card p-5 shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift"
              >
                <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                  <facet.icon aria-hidden="true" className="size-5" />
                </span>
                <span className="flex min-w-0 flex-col gap-1">
                  <span className="font-heading text-base font-semibold">
                    {facet.label}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {facet.blurb}
                  </span>
                </span>
                <ArrowUpRight
                  aria-hidden="true"
                  className="ml-auto size-4 shrink-0 text-muted-foreground transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </Link>
            </li>
          ))}
        </ul>
      </PageContainer>
    </section>
  )
}

export { Categories }
