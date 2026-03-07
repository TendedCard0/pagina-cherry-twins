'use client'

import Image from 'next/image'
import Link from 'next/link'
import { formatPrice } from '@/lib/types'

interface ProductCardProps {
  product: {
    id: number
    name: string
    slug: string
    base_price_cents: number
    currency: string
    artist_name?: string | null
    category_name?: string | null
    image_url?: string | null
    image_alt?: string | null
  }
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/product/${product.slug}`} className="group">
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg bg-secondary">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.image_alt || product.name}
            fill
            className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <span className="text-muted-foreground text-sm">No image</span>
          </div>
        )}
        {/* Quick view overlay */}
        <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/5 transition-colors duration-300" />
      </div>
      <div className="mt-4 space-y-1">
        {product.artist_name && (
          <p className="text-xs font-medium text-accent uppercase tracking-wide">
            {product.artist_name}
          </p>
        )}
        <h3 className="text-sm font-medium text-foreground group-hover:text-accent transition-colors text-balance">
          {product.name}
        </h3>
        <p className="text-sm text-muted-foreground">
          {formatPrice(product.base_price_cents, product.currency)}
        </p>
      </div>
    </Link>
  )
}

export function ProductCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[3/4] w-full rounded-lg bg-muted" />
      <div className="mt-4 space-y-2">
        <div className="h-3 w-16 bg-muted rounded" />
        <div className="h-4 w-3/4 bg-muted rounded" />
        <div className="h-4 w-20 bg-muted rounded" />
      </div>
    </div>
  )
}
