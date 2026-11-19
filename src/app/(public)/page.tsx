// Home route ("/"). Storefront marketing content is built here in a later iteration.

export default function HomePage() {
  return (
    <section className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-16 sm:px-6 md:py-24 lg:px-8">
      <p className="text-xs font-semibold tracking-[0.14em] text-primary uppercase">
        PizzaHub storefront
      </p>
      <h1 className="max-w-3xl font-heading text-4xl font-extrabold tracking-tight md:text-5xl lg:text-6xl">
        Neighborhood pizzerias,
        <span className="block text-primary">one order away.</span>
      </h1>
      <p className="max-w-prose text-base text-muted-foreground md:text-lg">
        Browse local menus, order your favorites, and track delivery — the
        PizzaHub storefront is under construction.
      </p>
    </section>
  )
}
