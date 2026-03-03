import { getFeaturedProducts } from "@/lib/data"
import { ProductCard } from "@/components/product-card"
import Link from "next/link"

export function FeaturedProducts() {
  const featured = getFeaturedProducts()

  return (
    <section className="mx-auto max-w-7xl px-4 py-20 lg:px-8">
      <div className="mb-10 flex items-end justify-between">
        <div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.3em] text-primary">
            Destacados
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Top Picks
          </h2>
        </div>
        <Link
          href="/shop"
          className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground underline-offset-4 hover:underline"
        >
          Ver todo
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
        {featured.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  )
}
