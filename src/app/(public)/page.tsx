import { Categories } from "@/components/categories"
import { FeaturedMenu } from "@/components/featured-menu"
import { Hero } from "@/components/hero"
import { WhyChoose } from "@/components/why-choose"

// Home route ("/") — storefront sections in browse → featured → trust order.
export default function HomePage() {
  return (
    <>
      <Hero />
      <Categories />
      <FeaturedMenu />
      <WhyChoose />
    </>
  )
}
