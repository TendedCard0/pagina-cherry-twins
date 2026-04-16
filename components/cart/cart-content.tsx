"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { useCart } from "@/lib/cart-store"
import { formatPrice } from "@/lib/price"

export function CartContent() {
  const { items, total, updateCartQuantity, removeFromCart } = useCart()
  const [coupon, setCoupon] = useState("")

  if (items.length === 0) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-7xl flex-col items-center justify-center px-4 py-20 text-center lg:px-8">
        <ShoppingBag className="mb-6 h-16 w-16 text-muted-foreground/30" />
        <h1 className="text-2xl font-bold text-foreground">Tu carrito esta vacio</h1>
        <p className="mt-2 text-muted-foreground">Agrega algunos productos para comenzar</p>
        <Link href="/shop">
          <Button className="mt-6 bg-primary text-primary-foreground hover:bg-primary/90">
            Ir a la tienda
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
    )
  }

  const currency = items[0]?.currency ?? "MXN"

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      <Breadcrumb className="mb-8">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/" className="text-muted-foreground hover:text-foreground">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator className="text-muted-foreground" />
          <BreadcrumbItem>
            <BreadcrumbPage className="text-foreground">Carrito</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <h1 className="mb-8 text-3xl font-bold tracking-tight text-foreground">Carrito ({items.length})</h1>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="flex flex-col gap-4">
            {items.map((item) => {
              const img = item.imageUrl || "/placeholder.svg"
              const lineTotal = item.unitPriceCents * item.quantity
              return (
                <div
                  key={item.variantId}
                  className="flex gap-4 rounded-lg border border-border bg-card p-4"
                >
                  <Link href={`/p/${item.slug}`} className="relative h-24 w-24 shrink-0 overflow-hidden rounded-md bg-secondary">
                    <Image
                      src={img}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="96px"
                    />
                  </Link>
                  <div className="flex flex-1 flex-col justify-between">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Link href={`/p/${item.slug}`} className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                          {item.name}
                        </Link>
                        <p className="mt-0.5 text-xs text-muted-foreground">{item.variantLabel}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.variantId)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                        aria-label="Eliminar producto"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center rounded-md border border-border">
                        <button
                          type="button"
                          onClick={() => updateCartQuantity(item.variantId, item.quantity - 1)}
                          className="flex h-8 w-8 items-center justify-center text-foreground hover:bg-secondary transition-colors"
                          aria-label="Reducir cantidad"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="flex h-8 w-8 items-center justify-center text-xs font-medium text-foreground">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateCartQuantity(item.variantId, item.quantity + 1)}
                          className="flex h-8 w-8 items-center justify-center text-foreground hover:bg-secondary transition-colors"
                          aria-label="Aumentar cantidad"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <span className="text-sm font-semibold text-foreground">
                        {formatPrice(lineTotal, item.currency)}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-lg font-semibold text-foreground">Resumen</h2>
            <Separator className="my-4 bg-border" />
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-foreground">{formatPrice(total, currency)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Envio</span>
                <span className="text-foreground">Calculado al pagar</span>
              </div>
            </div>
            <Separator className="my-4 bg-border" />
            <div className="flex gap-2">
              <Input
                placeholder="Codigo de cupon"
                value={coupon}
                onChange={(e) => setCoupon(e.target.value)}
                className="h-9 bg-secondary text-foreground border-border placeholder:text-muted-foreground"
              />
              <Button variant="outline" size="sm" className="shrink-0 border-border text-foreground hover:bg-secondary">
                Aplicar
              </Button>
            </div>
            <Separator className="my-4 bg-border" />
            <div className="flex items-center justify-between">
              <span className="text-base font-semibold text-foreground">Total</span>
              <span className="text-xl font-bold text-foreground">{formatPrice(total, currency)}</span>
            </div>
            <Link href="/checkout">
              <Button className="mt-6 h-12 w-full bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-semibold uppercase tracking-wider">
                Ir a pagar
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
