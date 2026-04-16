import { Suspense } from "react"
import { HeroSection } from "@/components/home/hero-section"
import { FeaturedProducts } from "@/components/home/featured-products"
import { CategoriesSection } from "@/components/home/categories-section"
import { NewDrops } from "@/components/home/new-drops"
import { AboutSection } from "@/components/home/about-section"
import { ReviewsSection } from "@/components/home/reviews-section"

function CatalogBlockSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-20 lg:px-8">
      <div className="mb-10 h-10 w-48 animate-pulse rounded bg-secondary" />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="aspect-square animate-pulse rounded-lg bg-secondary" />
        ))}
      </div>
    </div>
  )
}

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <Suspense fallback={<CatalogBlockSkeleton />}>
        <FeaturedProducts />
      </Suspense>
      <Suspense fallback={<CatalogBlockSkeleton />}>
        <CategoriesSection />
      </Suspense>
      <Suspense fallback={<CatalogBlockSkeleton />}>
        <NewDrops />
      </Suspense>
      <AboutSection />
      <ReviewsSection />
    </>
  )
}
