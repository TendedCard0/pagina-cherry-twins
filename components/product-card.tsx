"use client"

import Link from "next/link"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import type { Product } from "@/lib/data"
import { formatPrice } from "@/lib/data"

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const isOutOfStock = product.stock === 0

  return (
    <Link href={`/p/${product.slug}`} className="group block">
      <div className="relative aspect-square overflow-hidden rounded-lg bg-secondary">
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {product.isNew && (
            <Badge className="bg-primary text-primary-foreground text-xs">Nuevo</Badge>
          )}
          {isOutOfStock && (
            <Badge variant="secondary" className="bg-secondary text-muted-foreground text-xs border border-border">Agotado</Badge>
          )}
          {product.comparePrice && (
            <Badge className="bg-foreground text-background text-xs">
              -{Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)}%
            </Badge>
          )}
        </div>
      </div>
      <div className="mt-3 flex flex-col gap-1">
        <h3 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
          {product.name}
        </h3>
        <div className="flex items-center gap-2">
          <span className={`text-sm font-semibold ${isOutOfStock ? "text-muted-foreground" : "text-foreground"}`}>
            {formatPrice(product.price)}
          </span>
          {product.comparePrice && (
            <span className="text-xs text-muted-foreground line-through">
              {formatPrice(product.comparePrice)}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
