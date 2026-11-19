import {
  Camera,
  MapPin,
  Route,
  ShieldCheck,
  ShoppingBag,
  type LucideIcon,
} from "lucide-react"
import { PageContainer } from "@/components/page-container"
import { enter } from "@/lib/motion"

type Benefit = {
  icon: LucideIcon
  title: string
  description: string
}

// Copy is grounded in what the platform actually does: menu listings are
// admin-approved before they appear, and order state is tracked end to end.
const BENEFITS: Benefit[] = [
  {
    icon: MapPin,
    title: "Local discovery",
    description:
      "Find neighborhood pizzerias around your area, not faraway chains.",
  },
  {
    icon: Camera,
    title: "Real photos & menus",
    description: "Honest food photography and full menus before you commit.",
  },
  {
    icon: ShoppingBag,
    title: "Easy ordering",
    description: "A few taps from craving to a confirmed order.",
  },
  {
    icon: Route,
    title: "Order tracking",
    description: "Follow every order from the oven to your door.",
  },
  {
    icon: ShieldCheck,
    title: "Trusted restaurants",
    description:
      "Menu listings are approved before they go live on the storefront.",
  },
]

// "Why choose PizzaHub" — five trust benefits on a soft tinted band that
// separates them from the cream sections above.
function WhyChoose() {
  return (
    <section
      aria-labelledby="why-heading"
      className="bg-secondary/40 py-14 md:py-16"
    >
      <PageContainer className="flex flex-col gap-8">
        <div className="flex flex-col gap-3 motion-safe:animate-in motion-safe:duration-700 motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-4">
          <p className="flex items-center gap-3 text-xs font-semibold tracking-[0.14em] uppercase">
            <span aria-hidden="true" className="h-px w-8 bg-primary" />
            Why PizzaHub
          </p>
          <h2
            id="why-heading"
            className="font-heading text-3xl font-extrabold tracking-tight md:text-4xl"
          >
            Why choose PizzaHub
          </h2>
          <p className="max-w-prose text-sm text-muted-foreground md:text-base">
            Everything that makes ordering from local kitchens feel effortless.
          </p>
        </div>

        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {BENEFITS.map((benefit, index) => (
            <li
              key={benefit.title}
              className={
                "flex h-full flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift motion-safe:animate-in motion-safe:duration-700 motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-4" +
                (index === BENEFITS.length - 1
                  ? " sm:col-span-2 lg:col-span-1"
                  : "")
              }
              style={enter(`${index * 60}ms`)}
            >
              <span className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary">
                <benefit.icon aria-hidden="true" className="size-5" />
              </span>
              <p className="font-heading text-base font-semibold">
                {benefit.title}
              </p>
              <p className="text-sm text-muted-foreground">
                {benefit.description}
              </p>
            </li>
          ))}
        </ul>
      </PageContainer>
    </section>
  )
}

export { WhyChoose }
