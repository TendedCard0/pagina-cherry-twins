import { Suspense } from 'react'
import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { ProductCard, ProductCardSkeleton } from '@/components/product/product-card'
import { getProducts, getCategories } from '@/lib/data/products'
import { cn } from '@/lib/utils'

export const metadata = {
  title: 'Shop',
  description: 'Browse our collection of premium streetwear.',
}

interface ShopPageProps {
  searchParams: Promise<{
    category?: string
  }>
}

async function ProductGrid({ categorySlug }: { categorySlug?: string }) {
  const products = await getProducts({ categorySlug, limit: 24 })

  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">No products found in this category.</p>
        <Link href="/shop" className="text-accent hover:underline mt-2 inline-block">
          View all products
        </Link>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-10">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}

function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-10">
      {Array.from({ length: 8 }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  )
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const { category } = await searchParams
  const categories = await getCategories()

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-[family-name:var(--font-heading)] text-3xl sm:text-4xl font-bold tracking-tight">
              {category ? categories.find(c => c.slug === category)?.name || 'Shop' : 'All Products'}
            </h1>
            <p className="mt-2 text-muted-foreground">
              Discover our collection of premium streetwear
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-8 pb-8 border-b border-border">
            <Link
              href="/shop"
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-colors",
                !category 
                  ? "bg-foreground text-background" 
                  : "bg-secondary text-muted-foreground hover:bg-secondary/80"
              )}
            >
              All
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/shop?category=${cat.slug}`}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-colors",
                  category === cat.slug
                    ? "bg-foreground text-background"
                    : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                )}
              >
                {cat.name}
              </Link>
            ))}
          </div>

          {/* Product Grid */}
          <Suspense fallback={<ProductGridSkeleton />}>
            <ProductGrid categorySlug={category} />
          </Suspense>
        </div>
      </main>

      <Footer />
    </div>
  )
}
