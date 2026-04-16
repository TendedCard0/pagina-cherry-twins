"use client"

import { useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { toast } from "sonner"
import { Star, Minus, Plus, Truck, ShieldCheck, RotateCcw, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { ProductCard } from "@/components/product-card"
import { useCart } from "@/lib/cart-store"
import { formatPrice } from "@/lib/price"
import { effectiveUnitCurrency, effectiveUnitPriceCents } from "@/lib/catalog-pricing"
import type {
  ProductDetailResponse,
  ProductListItemResponse,
  ProductVariantResponse,
  ReviewResponse,
} from "@/lib/catalog-types"

function variantLabel(v: ProductVariantResponse): string {
  const attrs = v.attributes
  if (!attrs || Object.keys(attrs).length === 0) return v.variantName || v.sku
  const bits = Object.entries(attrs).map(([k, val]) => `${k}: ${String(val)}`)
  return [v.variantName, ...bits].filter(Boolean).join(" · ")
}

function sortedImages(product: ProductDetailResponse) {
  return [...product.images].sort((a, b) => a.sortOrder - b.sortOrder)
}

interface ProductDetailProps {
  product: ProductDetailResponse
  reviews: ReviewResponse[]
  related: ProductListItemResponse[]
}

export function ProductDetail({ product, reviews, related }: ProductDetailProps) {
  const images = sortedImages(product)
  const variants = useMemo(
    () => product.variants.filter((v) => v.active),
    [product.variants]
  )
  const defaultVariant =
    variants.length > 0
      ? (variants.find((v) => v.stockOnHand > 0) ?? variants[0])
      : null

  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedVariant, setSelectedVariant] = useState<ProductVariantResponse | null>(defaultVariant)
  const [quantity, setQuantity] = useState(1)
  const { addToCart } = useCart()

  const mainSrc =
    images[selectedImage]?.url ||
    images[0]?.url ||
    "/placeholder.svg"

  const priceCents = effectiveUnitPriceCents(selectedVariant, product.basePriceCents)
  const currency = effectiveUnitCurrency(selectedVariant, product.currency)
  const stock = selectedVariant?.stockOnHand ?? 0
  const noVariants = variants.length === 0
  const isOutOfStock = noVariants || !selectedVariant || stock <= 0

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : 0

  function handleAddToCart() {
    if (noVariants || !selectedVariant || isOutOfStock) return
    const img = images[0]?.url ?? null
    addToCart({
      variantId: selectedVariant.id,
      productId: product.id,
      slug: product.slug,
      name: product.name,
      imageUrl: img,
      variantLabel: variantLabel(selectedVariant),
      unitPriceCents: effectiveUnitPriceCents(selectedVariant, product.basePriceCents),
      currency: effectiveUnitCurrency(selectedVariant, product.currency),
      quantity,
    })
    toast.success(`${product.name} agregado al carrito`, {
      description: `${variantLabel(selectedVariant)} · Cantidad: ${quantity}`,
    })
  }

  const descriptionLines = (product.description || "")
    .split(/\n+/)
    .map((s) => s.trim())
    .filter(Boolean)

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      <Breadcrumb className="mb-8">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/" className="text-muted-foreground hover:text-foreground">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator className="text-muted-foreground" />
          <BreadcrumbItem>
            <BreadcrumbLink href="/shop" className="text-muted-foreground hover:text-foreground">Tienda</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator className="text-muted-foreground" />
          <BreadcrumbItem>
            <BreadcrumbPage className="text-foreground">{product.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="flex flex-col gap-4">
          <div className="relative aspect-square overflow-hidden rounded-lg bg-secondary">
            <Image
              src={mainSrc}
              alt={images[selectedImage]?.altText || product.name}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            {isOutOfStock && (
              <Badge variant="secondary" className="absolute top-4 right-4 bg-secondary text-muted-foreground border border-border">
                Agotado
              </Badge>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-3">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => setSelectedImage(i)}
                  className={`relative h-20 w-20 overflow-hidden rounded-md border-2 transition-colors ${
                    selectedImage === i ? "border-primary" : "border-border"
                  }`}
                >
                  <Image src={img.url} alt={img.altText || product.name} fill className="object-cover" sizes="80px" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col">
          <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            {product.name}
          </h1>

          {product.artist && (
            <p className="mt-2 text-sm text-muted-foreground">
              Artista:{" "}
              <Link href={`/shop?artist=${encodeURIComponent(product.artist.slug)}`} className="text-primary hover:underline">
                {product.artist.name}
              </Link>
            </p>
          )}

          <div className="mt-3 flex items-center gap-2">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${i < Math.round(avgRating) ? "fill-primary text-primary" : "text-muted-foreground/30"}`}
                />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">
              {reviews.length > 0
                ? `${avgRating.toFixed(1)} (${reviews.length} reseñas)`
                : "Sin reseñas aún"}
            </span>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <span className="text-2xl font-bold text-foreground">{formatPrice(priceCents, currency)}</span>
          </div>

          {product.description && (
            <p className="mt-4 leading-relaxed text-muted-foreground whitespace-pre-wrap">{product.description}</p>
          )}

          <Separator className="my-6 bg-border" />

          {noVariants && (
            <p className="mb-6 text-sm text-muted-foreground">
              Este producto no tiene variantes activas. Agrega variantes en la base de datos para poder comprarlo.
            </p>
          )}

          {variants.length > 0 && (
            <div className="mb-6">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-widest text-foreground">Variante</h3>
              <div className="flex flex-col gap-2">
                {variants.map((v) => {
                  const out = v.stockOnHand <= 0
                  const sel = selectedVariant?.id === v.id
                  return (
                    <button
                      key={v.id}
                      type="button"
                      disabled={out}
                      onClick={() => setSelectedVariant(v)}
                      className={`rounded-md border px-4 py-3 text-left text-sm transition-colors ${
                        sel
                          ? "border-primary bg-primary/10 text-foreground"
                          : out
                            ? "border-border bg-secondary/50 text-muted-foreground/50 cursor-not-allowed line-through"
                            : "border-border bg-secondary text-foreground hover:border-foreground/40"
                      }`}
                    >
                      <span className="font-medium">{variantLabel(v)}</span>
                      <span className="ml-2 text-muted-foreground">
                        {formatPrice(
                          effectiveUnitPriceCents(v, product.basePriceCents),
                          effectiveUnitCurrency(v, product.currency)
                        )}{" "}
                        · {out ? "Agotado" : `${v.stockOnHand} en stock`}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center rounded-md border border-border">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="flex h-11 w-11 items-center justify-center text-foreground hover:bg-secondary transition-colors"
                aria-label="Reducir cantidad"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="flex h-11 w-11 items-center justify-center text-sm font-medium text-foreground">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="flex h-11 w-11 items-center justify-center text-foreground hover:bg-secondary transition-colors"
                aria-label="Aumentar cantidad"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            {isOutOfStock ? (
              <Button disabled className="flex-1 h-12 bg-secondary text-muted-foreground cursor-not-allowed">
                Agotado
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleAddToCart}
                className="flex-1 h-12 bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-semibold uppercase tracking-wider"
              >
                Agregar al carrito
              </Button>
            )}
          </div>

          {isOutOfStock && (
            <Button variant="outline" className="mt-3 border-border text-foreground hover:bg-secondary">
              <Bell className="mr-2 h-4 w-4" />
              Avisame cuando haya stock
            </Button>
          )}

          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Truck className="h-4 w-4 text-primary shrink-0" />
              Envios a todo Mexico
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <RotateCcw className="h-4 w-4 text-primary shrink-0" />
              Devolucion 30 dias
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
              Pago seguro
            </div>
          </div>

          <Accordion type="multiple" className="mt-8">
            <AccordionItem value="details" className="border-border">
              <AccordionTrigger className="text-foreground hover:text-foreground">Detalles del producto</AccordionTrigger>
              <AccordionContent>
                {descriptionLines.length > 0 ? (
                  <ul className="flex flex-col gap-2">
                    {descriptionLines.map((line) => (
                      <li key={line} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" />
                        {line}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">Sin detalles adicionales.</p>
                )}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="care" className="border-border">
              <AccordionTrigger className="text-foreground hover:text-foreground">Cuidados</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                Lavar a maquina en frio con colores similares. No usar blanqueador. Secar a temperatura baja. No planchar sobre estampados o bordados.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="sizes" className="border-border">
              <AccordionTrigger className="text-foreground hover:text-foreground">Guia de tallas</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                Nuestras prendas tienen corte oversize. Si prefieres un ajuste mas ceñido, te recomendamos pedir una talla menos de la habitual.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>

      {reviews.length > 0 && (
        <section className="mt-20">
          <h2 className="mb-8 text-2xl font-bold tracking-tight text-foreground">Reseñas</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {reviews.map((review) => (
              <div key={review.id} className="flex flex-col gap-3 rounded-lg border border-border bg-card p-6">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i < review.rating ? "fill-primary text-primary" : "text-muted-foreground/30"}`}
                    />
                  ))}
                </div>
                {review.title && <p className="text-sm font-medium text-foreground">{review.title}</p>}
                {review.comment && (
                  <p className="text-sm leading-relaxed text-muted-foreground">{`"${review.comment}"`}</p>
                )}
                <div className="mt-auto flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">Cliente verificado</span>
                  <time className="text-xs text-muted-foreground" dateTime={review.createdAt}>
                    {new Date(review.createdAt).toLocaleDateString("es-MX")}
                  </time>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="mb-8 text-2xl font-bold tracking-tight text-foreground">Tambien te puede gustar</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:gap-6">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {!isOutOfStock && (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/95 backdrop-blur p-4 lg:hidden">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-foreground">{product.name}</p>
              <p className="text-lg font-bold text-foreground">{formatPrice(priceCents, currency)}</p>
            </div>
            <Button
              type="button"
              onClick={handleAddToCart}
              className="h-11 bg-primary text-primary-foreground hover:bg-primary/90 px-6 text-sm font-semibold uppercase tracking-wider"
            >
              Agregar
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
