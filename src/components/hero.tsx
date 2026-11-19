import { ArrowRight, Flame } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { cn } from "cn"
// Photo: Unsplash (free license), bundled as a static import so next/image
// derives dimensions + a blur placeholder automatically.
import heroPizza from "@/assets/hero-pizza.jpg"
import { PageContainer } from "@/components/page-container"
import { buttonVariants } from "@/components/ui/button"

// `backwards` fill keeps each element hidden until its delayed entrance
// starts — tw-animate's `animate-in` defaults to fill `none`, which would
// flash the content before the animation runs.
const enter = (delay: string) => ({
  animationDelay: delay,
  animationFillMode: "backwards" as const,
})

// Storefront hero — original split composition: copy on the cream canvas,
// photography in an elevated card (never text over the photo, so contrast
// stays AA-safe without a scrim). Staggered motion-safe entrances.
function Hero() {
  return (
    <section
      aria-labelledby="hero-heading"
      className="relative overflow-hidden"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 right-0 size-80 -translate-y-1/3 rounded-full bg-accent/25 blur-3xl"
      />
      <PageContainer className="grid items-center gap-10 py-14 md:py-20 lg:grid-cols-[1.15fr_1fr] lg:gap-14">
        <div className="flex max-w-xl flex-col items-start gap-5">
          <p className="flex items-center gap-3 text-xs font-semibold tracking-[0.14em] uppercase motion-safe:animate-in motion-safe:duration-700 motion-safe:fade-in-0">
            <span aria-hidden="true" className="h-px w-8 bg-primary" />
            Neighborhood pizza marketplace
          </p>
          <h1
            id="hero-heading"
            className="font-heading text-4xl font-extrabold tracking-tight text-balance motion-safe:animate-in motion-safe:duration-700 motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-4 md:text-5xl lg:text-6xl"
            style={enter("75ms")}
          >
            Great pizza lives{" "}
            <span className="block text-primary">next door.</span>
          </h1>
          <p
            className="max-w-prose text-base text-muted-foreground motion-safe:animate-in motion-safe:duration-700 motion-safe:fade-in-0 md:text-lg"
            style={enter("150ms")}
          >
            PizzaHub brings neighborhood pizzerias together — browse their
            menus, order your favorites, and follow every pie from oven to door.
          </p>
          <Link
            href="/menu"
            className={cn(
              buttonVariants({ size: "lg" }),
              "px-5 motion-safe:animate-in motion-safe:duration-700 motion-safe:fade-in-0"
            )}
            style={enter("250ms")}
          >
            Explore Pizza Menu
            <ArrowRight
              aria-hidden="true"
              className="transition-transform group-hover/button:translate-x-1"
            />
          </Link>
        </div>

        <div className="relative">
          <div
            aria-hidden="true"
            className="absolute -top-10 -right-8 size-64 rounded-full bg-accent/25 blur-3xl"
          />
          <div
            className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-card ring-1 ring-border motion-safe:animate-in motion-safe:duration-1000 motion-safe:fade-in-0 motion-safe:zoom-in-95"
            style={enter("120ms")}
          >
            <Image
              src={heroPizza}
              alt="Top-down view of a freshly baked cheese pizza with cherry tomatoes and rosemary on a wooden table"
              fill
              sizes="(min-width: 1024px) 560px, calc(100vw - 2rem)"
              priority
              placeholder="blur"
              className="object-cover"
            />
          </div>
          <div
            className="absolute -bottom-4 left-4 flex items-center gap-2 rounded-full border border-border bg-card py-2 pr-4 pl-3 shadow-lift motion-safe:animate-in motion-safe:duration-700 motion-safe:fade-in-0"
            style={enter("650ms")}
          >
            <span className="grid size-7 place-items-center rounded-full bg-primary/10 text-primary">
              <Flame aria-hidden="true" className="size-4" />
            </span>
            <span className="text-sm font-medium">Fresh from local ovens</span>
          </div>
        </div>
      </PageContainer>
    </section>
  )
}

export { Hero }
