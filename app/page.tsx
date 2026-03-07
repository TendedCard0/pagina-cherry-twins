import { HeroSection } from "@/components/home/hero-section"
import { FeaturedProducts } from "@/components/home/featured-products"
import { CategoriesSection } from "@/components/home/categories-section"
import { NewDrops } from "@/components/home/new-drops"
import { AboutSection } from "@/components/home/about-section"
import { ReviewsSection } from "@/components/home/reviews-section"

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturedProducts />
      <CategoriesSection />
      <NewDrops />
      <AboutSection />
      <ReviewsSection />
    </>
  )
}
