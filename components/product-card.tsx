"use client"

import Link from "next/link"
import Image from "next/image"
import type { ProductListItemResponse } from "@/lib/catalog-types"
import { formatPrice } from "@/lib/price"

interface ProductCardProps {
  product: ProductListItemResponse
}

export function ProductCard({ product }: ProductCardProps) {
  const src = product.mainImageUrl || "/placeholder.svg"

  return (
    <Link href={`/p/${product.slug}`} className="group block">
      <div className="relative aspect-square overflow-hidden rounded-lg bg-secondary">
        <Image
          src={src}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
      </div>
      <div className="mt-3 flex flex-col gap-1">
        <h3 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
          {product.name}
        </h3>
        <span className="text-sm font-semibold text-foreground">
          {formatPrice(product.basePriceCents, product.currency)}
        </span>
      </div>
    </Link>
  )
}
