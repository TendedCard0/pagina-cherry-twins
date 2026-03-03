"use client"

import { useState } from "react"
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
import { type Product, formatPrice, getProductReviews, products } from "@/lib/data"

interface ProductDetailProps {
  product: Product
}

export function ProductDetail({ product }: ProductDetailProps) {
  const sizes = product.variants.filter((v) => v.type === "size")
  const colors = product.variants.filter((v) => v.type === "color")

  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedSize, setSelectedSize] = useState(sizes[0]?.value || "")
  const [selectedColor, setSelectedColor] = useState(colors[0]?.value || "")
  const [quantity, setQuantity] = useState(1)
  const { addToCart } = useCart()

  const reviews = getProductReviews(product.id)
  const related = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4)
  const isOutOfStock = product.stock === 0
  const selectedSizeVariant = sizes.find((v) => v.value === selectedSize)

  function handleAddToCart() {
    addToCart(product, quantity, selectedSize, selectedColor)
    toast.success(`${product.name} agregado al carrito`, {
      description: `Talla: ${selectedSize.toUpperCase()} | Cantidad: ${quantity}`,
    })
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      {/* Breadcrumbs */}
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
        {/* Gallery */}
        <div className="flex flex-col gap-4">
          <div className="relative aspect-square overflow-hidden rounded-lg bg-secondary">
            <Image
              src={product.images[selectedImage]}
              alt={product.name}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            {product.isNew && (
              <Badge className="absolute top-4 left-4 bg-primary text-primary-foreground">Nuevo</Badge>
            )}
            {isOutOfStock && (
              <Badge variant="secondary" className="absolute top-4 right-4 bg-secondary text-muted-foreground border border-border">Agotado</Badge>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-3">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`relative h-20 w-20 overflow-hidden rounded-md border-2 transition-colors ${
                    selectedImage === i ? "border-primary" : "border-border"
                  }`}
                >
                  <Image src={img} alt={`${product.name} ${i + 1}`} fill className="object-cover" sizes="80px" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex flex-col">
          <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            {product.name}
          </h1>

          {/* Rating */}
          <div className="mt-3 flex items-center gap-2">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${i < Math.round(product.rating) ? "fill-primary text-primary" : "text-muted-foreground/30"}`}
                />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">
              {product.rating} ({product.reviewCount} reseñas)
            </span>
          </div>

          {/* Price */}
          <div className="mt-4 flex items-center gap-3">
            <span className="text-2xl font-bold text-foreground">{formatPrice(product.price)}</span>
            {product.comparePrice && (
              <span className="text-lg text-muted-foreground line-through">{formatPrice(product.comparePrice)}</span>
            )}
          </div>

          <p className="mt-4 leading-relaxed text-muted-foreground">{product.description}</p>

          <Separator className="my-6 bg-border" />

          {/* Size Selector */}
          {sizes.length > 0 && sizes[0].label !== "Unica" && (
            <div className="mb-6">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-widest text-foreground">Talla</h3>
              <div className="flex flex-wrap gap-2">
                {sizes.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedSize(v.value)}
                    disabled={v.stock === 0}
                    className={`flex h-10 w-14 items-center justify-center rounded-md border text-sm font-medium transition-colors ${
                      selectedSize === v.value
                        ? "border-primary bg-primary text-primary-foreground"
                        : v.stock === 0
                          ? "border-border bg-secondary text-muted-foreground/40 cursor-not-allowed line-through"
                          : "border-border bg-secondary text-foreground hover:border-foreground/40"
                    }`}
                  >
                    {v.label}
                  </button>
                ))}
              </div>
              {selectedSizeVariant && selectedSizeVariant.stock > 0 && selectedSizeVariant.stock <= 5 && (
                <p className="mt-2 text-xs text-primary">
                  Quedan {selectedSizeVariant.stock} en stock
                </p>
              )}
            </div>
          )}

          {/* Color Selector */}
          {colors.length > 1 && (
            <div className="mb-6">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-widest text-foreground">Color</h3>
              <div className="flex flex-wrap gap-2">
                {colors.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedColor(v.value)}
                    className={`flex h-10 items-center justify-center rounded-md border px-4 text-sm font-medium transition-colors ${
                      selectedColor === v.value
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-secondary text-foreground hover:border-foreground/40"
                    }`}
                  >
                    {v.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity & Add to Cart */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center rounded-md border border-border">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="flex h-11 w-11 items-center justify-center text-foreground hover:bg-secondary transition-colors"
                aria-label="Reducir cantidad"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="flex h-11 w-11 items-center justify-center text-sm font-medium text-foreground">{quantity}</span>
              <button
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

          {/* Shipping & Guarantees */}
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

          {/* Details Accordion */}
          <Accordion type="multiple" className="mt-8">
            <AccordionItem value="details" className="border-border">
              <AccordionTrigger className="text-foreground hover:text-foreground">Detalles del producto</AccordionTrigger>
              <AccordionContent>
                <ul className="flex flex-col gap-2">
                  {product.details.map((detail, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" />
                      {detail}
                    </li>
                  ))}
                </ul>
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

      {/* Reviews Section */}
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
                <p className="text-sm leading-relaxed text-muted-foreground">{`"${review.text}"`}</p>
                <div className="mt-auto flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">{review.author}</span>
                  <span className="text-xs text-muted-foreground">{review.date}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Related Products */}
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

      {/* Sticky Mobile Buy Box */}
      {!isOutOfStock && (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/95 backdrop-blur p-4 lg:hidden">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-foreground">{product.name}</p>
              <p className="text-lg font-bold text-foreground">{formatPrice(product.price)}</p>
            </div>
            <Button
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
