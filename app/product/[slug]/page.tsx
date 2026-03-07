import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Metadata } from 'next'
import { ChevronRight } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { ProductActions } from '@/components/product/product-actions'
import { getProductBySlug, getFeaturedProducts } from '@/lib/data/products'
import { formatPrice, calculateTotalStock } from '@/lib/types'
import { ProductCard } from '@/components/product/product-card'

interface ProductPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  
  if (!product) {
    return { title: 'Product Not Found' }
  }

  return {
    title: product.name,
    description: product.description || `Shop ${product.name} at Cherry Twins`,
    openGraph: {
      title: product.name,
      description: product.description || `Shop ${product.name} at Cherry Twins`,
      images: product.images[0]?.url ? [{ url: product.images[0].url }] : [],
    },
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params
  const [product, relatedProducts] = await Promise.all([
    getProductBySlug(slug),
    getFeaturedProducts(4),
  ])

  if (!product) {
    notFound()
  }

  const totalStock = calculateTotalStock(product.variants)
  const isInStock = totalStock > 0
  const mainImage = product.images[0]

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
            <Link href="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link href="/shop" className="hover:text-foreground transition-colors">
              Shop
            </Link>
            {product.category && (
              <>
                <ChevronRight className="h-4 w-4" />
                <Link 
                  href={`/shop?category=${product.category.slug}`} 
                  className="hover:text-foreground transition-colors"
                >
                  {product.category.name}
                </Link>
              </>
            )}
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground">{product.name}</span>
          </nav>

          {/* Product Details */}
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Images */}
            <div className="space-y-4">
              <div className="relative aspect-[3/4] w-full rounded-lg bg-secondary overflow-hidden">
                {mainImage ? (
                  <Image
                    src={mainImage.url}
                    alt={mainImage.alt_text || product.name}
                    fill
                    className="object-cover object-center"
                    priority
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-muted">
                    <span className="text-muted-foreground">No image available</span>
                  </div>
                )}
              </div>
              {product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-4">
                  {product.images.map((image, index) => (
                    <button
                      key={image.id}
                      className="relative aspect-square rounded-md bg-secondary overflow-hidden ring-2 ring-transparent hover:ring-foreground/20 transition-all"
                    >
                      <Image
                        src={image.url}
                        alt={image.alt_text || `${product.name} ${index + 1}`}
                        fill
                        className="object-cover object-center"
                        sizes="100px"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="lg:py-4">
              {product.artist && (
                <Link 
                  href={`/artists/${product.artist.slug}`}
                  className="text-sm font-medium text-accent uppercase tracking-wide hover:underline"
                >
                  {product.artist.name}
                </Link>
              )}
              <h1 className="font-[family-name:var(--font-heading)] text-2xl sm:text-3xl font-bold mt-2">
                {product.name}
              </h1>
              
              <div className="mt-4 flex items-center gap-4">
                <span className="text-2xl font-semibold">
                  {formatPrice(product.base_price_cents, product.currency)}
                </span>
                <span className={`text-sm font-medium ${isInStock ? 'text-green-600' : 'text-destructive'}`}>
                  {isInStock ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>

              {product.description && (
                <p className="mt-6 text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
              )}

              {/* Size & Add to Cart */}
              <div className="mt-8">
                <ProductActions product={product} />
              </div>

              {/* Product Details */}
              <div className="mt-10 pt-8 border-t border-border">
                <h3 className="text-sm font-semibold mb-4">Product Details</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>Premium quality materials</li>
                  <li>Designed in collaboration with world-class artists</li>
                  <li>Limited edition - not restocked once sold out</li>
                  <li>True to size fit</li>
                </ul>
              </div>

              {/* Artist Info */}
              {product.artist && product.artist.bio && (
                <div className="mt-8 pt-8 border-t border-border">
                  <h3 className="text-sm font-semibold mb-2">About {product.artist.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {product.artist.bio}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Related Products */}
          <section className="mt-16 pt-16 border-t border-border">
            <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold mb-8">
              You May Also Like
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-8">
              {relatedProducts
                .filter(p => p.slug !== product.slug)
                .slice(0, 4)
                .map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}
