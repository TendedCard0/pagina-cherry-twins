import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { ProductCard } from '@/components/product/product-card'
import { Button } from '@/components/ui/button'
import { getFeaturedProducts, getCategories } from '@/lib/data/products'

export default async function HomePage() {
  const [products, categories] = await Promise.all([
    getFeaturedProducts(8),
    getCategories(),
  ])

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-foreground text-background overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 sm:py-32 lg:py-40">
            <div className="max-w-2xl">
              <p className="text-sm font-medium tracking-widest text-muted-foreground/70 uppercase mb-4">
                New Collection 2026
              </p>
              <h1 className="font-[family-name:var(--font-heading)] text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-balance">
                Bold Style for the Fearless
              </h1>
              <p className="mt-6 text-lg text-muted-foreground/80 leading-relaxed max-w-lg">
                Discover our latest collection of premium streetwear. Exclusive artist collaborations, exceptional quality, and designs that make a statement.
              </p>
              <div className="mt-10 flex flex-wrap gap-4">
                <Button asChild size="lg" className="bg-background text-foreground hover:bg-background/90">
                  <Link href="/shop">
                    Shop Collection
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="border-background/30 text-background hover:bg-background/10">
                  <Link href="/artists">
                    Meet the Artists
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-[family-name:var(--font-heading)] text-2xl sm:text-3xl font-bold tracking-tight">
                Shop by Category
              </h2>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/shop?category=${category.slug}`}
                  className="group relative aspect-square rounded-lg bg-secondary overflow-hidden"
                >
                  <div className="absolute inset-0 bg-foreground/60 group-hover:bg-foreground/70 transition-colors" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="font-[family-name:var(--font-heading)] text-lg sm:text-xl font-semibold text-background">
                      {category.name}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="py-16 sm:py-20 bg-secondary/30">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-[family-name:var(--font-heading)] text-2xl sm:text-3xl font-bold tracking-tight">
                Latest Drops
              </h2>
              <Link 
                href="/shop" 
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
              >
                View All
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-10">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>

        {/* Brand Values */}
        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent/10 mb-4">
                  <span className="text-xl font-bold text-accent">01</span>
                </div>
                <h3 className="font-[family-name:var(--font-heading)] text-lg font-semibold mb-2">
                  Premium Quality
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Each piece is crafted with the finest materials for lasting comfort and style.
                </p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent/10 mb-4">
                  <span className="text-xl font-bold text-accent">02</span>
                </div>
                <h3 className="font-[family-name:var(--font-heading)] text-lg font-semibold mb-2">
                  Artist Collaborations
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Exclusive designs created in partnership with world-renowned artists.
                </p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent/10 mb-4">
                  <span className="text-xl font-bold text-accent">03</span>
                </div>
                <h3 className="font-[family-name:var(--font-heading)] text-lg font-semibold mb-2">
                  Limited Editions
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Stand out with exclusive drops that are never restocked once sold out.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="py-16 sm:py-20 bg-foreground text-background">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="font-[family-name:var(--font-heading)] text-2xl sm:text-3xl font-bold tracking-tight mb-4">
              Join the Cherry Twins Community
            </h2>
            <p className="text-muted-foreground/80 max-w-lg mx-auto mb-8">
              Subscribe for early access to new drops, exclusive discounts, and behind-the-scenes content.
            </p>
            <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 h-12 rounded-md border-0 bg-background/10 px-4 text-background placeholder:text-background/50 focus:outline-none focus:ring-2 focus:ring-background/30"
              />
              <Button size="lg" className="bg-background text-foreground hover:bg-background/90">
                Subscribe
              </Button>
            </form>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
