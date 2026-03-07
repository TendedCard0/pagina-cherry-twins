"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { CheckCircle2, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { useCart } from "@/lib/cart-store"
import { formatPrice } from "@/lib/data"

type Step = "info" | "shipping" | "payment" | "confirmation"

export function CheckoutContent() {
  const { items, total, clearCart } = useCart()
  const router = useRouter()
  const [step, setStep] = useState<Step>("info")
  const [shippingMethod, setShippingMethod] = useState("standard")
  const [orderNumber] = useState(() => `CT-${Math.floor(Math.random() * 90000 + 10000)}`)

  const shippingCost = shippingMethod === "express" ? 199 : total >= 1500 ? 0 : 99
  const grandTotal = total + shippingCost

  if (items.length === 0 && step !== "confirmation") {
    router.push("/cart")
    return null
  }

  if (step === "confirmation") {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 py-20 text-center">
        <CheckCircle2 className="mb-6 h-16 w-16 text-primary" />
        <h1 className="text-3xl font-bold text-foreground">Orden confirmada</h1>
        <p className="mt-2 text-muted-foreground">Orden #{orderNumber}</p>
        <p className="mt-4 text-sm text-muted-foreground">
          Recibirás un correo con los detalles de tu pedido y la informacion de seguimiento.
        </p>
        <div className="mt-8 flex gap-4">
          <Link href="/account">
            <Button variant="outline" className="border-border text-foreground hover:bg-secondary">Ver mis pedidos</Button>
          </Link>
          <Link href="/shop">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Seguir comprando</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 lg:px-8">
      <Link href="/cart" className="mb-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Volver al carrito
      </Link>

      {/* Steps indicator */}
      <div className="mb-10 flex items-center justify-center gap-2">
        {(["info", "shipping", "payment"] as Step[]).map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
              step === s ? "bg-primary text-primary-foreground" :
              (["info", "shipping", "payment"] as Step[]).indexOf(step) > i ? "bg-primary/20 text-primary" :
              "bg-secondary text-muted-foreground"
            }`}>
              {i + 1}
            </div>
            <span className={`hidden text-sm sm:inline ${step === s ? "text-foreground font-medium" : "text-muted-foreground"}`}>
              {s === "info" ? "Datos" : s === "shipping" ? "Envio" : "Pago"}
            </span>
            {i < 2 && <div className="h-px w-8 bg-border sm:w-12" />}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-5">
        {/* Form Area */}
        <div className="lg:col-span-3">
          {step === "info" && (
            <div className="flex flex-col gap-6">
              <h2 className="text-xl font-bold text-foreground">Datos de contacto</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label className="text-foreground">Nombre</Label>
                  <Input className="bg-secondary text-foreground border-border placeholder:text-muted-foreground" placeholder="Juan" />
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-foreground">Apellido</Label>
                  <Input className="bg-secondary text-foreground border-border placeholder:text-muted-foreground" placeholder="Perez" />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-foreground">Correo electronico</Label>
                <Input type="email" className="bg-secondary text-foreground border-border placeholder:text-muted-foreground" placeholder="tu@email.com" />
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-foreground">Telefono</Label>
                <Input type="tel" className="bg-secondary text-foreground border-border placeholder:text-muted-foreground" placeholder="+52 55 1234 5678" />
              </div>

              <Separator className="bg-border" />
              <h2 className="text-xl font-bold text-foreground">Direccion de envio</h2>
              <div className="flex flex-col gap-2">
                <Label className="text-foreground">Calle y numero</Label>
                <Input className="bg-secondary text-foreground border-border placeholder:text-muted-foreground" placeholder="Av. Reforma 123" />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label className="text-foreground">Colonia</Label>
                  <Input className="bg-secondary text-foreground border-border placeholder:text-muted-foreground" placeholder="Centro" />
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-foreground">CP</Label>
                  <Input className="bg-secondary text-foreground border-border placeholder:text-muted-foreground" placeholder="06600" />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label className="text-foreground">Ciudad</Label>
                  <Input className="bg-secondary text-foreground border-border placeholder:text-muted-foreground" placeholder="CDMX" />
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-foreground">Estado</Label>
                  <Input className="bg-secondary text-foreground border-border placeholder:text-muted-foreground" placeholder="CDMX" />
                </div>
              </div>

              <Button onClick={() => setStep("shipping")} className="h-12 bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-semibold uppercase tracking-wider">
                Continuar a envio
              </Button>
            </div>
          )}

          {step === "shipping" && (
            <div className="flex flex-col gap-6">
              <h2 className="text-xl font-bold text-foreground">Metodo de envio</h2>
              <RadioGroup value={shippingMethod} onValueChange={setShippingMethod} className="flex flex-col gap-3">
                <label className="flex items-center justify-between rounded-lg border border-border bg-card p-4 cursor-pointer hover:border-foreground/20 transition-colors">
                  <div className="flex items-center gap-3">
                    <RadioGroupItem value="standard" className="border-border text-primary" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Envio estandar</p>
                      <p className="text-xs text-muted-foreground">5-7 dias habiles</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-foreground">
                    {total >= 1500 ? "Gratis" : "$99 MXN"}
                  </span>
                </label>
                <label className="flex items-center justify-between rounded-lg border border-border bg-card p-4 cursor-pointer hover:border-foreground/20 transition-colors">
                  <div className="flex items-center gap-3">
                    <RadioGroupItem value="express" className="border-border text-primary" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Envio express</p>
                      <p className="text-xs text-muted-foreground">1-3 dias habiles</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-foreground">$199 MXN</span>
                </label>
              </RadioGroup>
              {total >= 1500 && (
                <p className="text-xs text-primary">Envio estandar gratis en compras mayores a $1,500 MXN</p>
              )}
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep("info")} className="border-border text-foreground hover:bg-secondary">
                  Atras
                </Button>
                <Button onClick={() => setStep("payment")} className="flex-1 h-12 bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-semibold uppercase tracking-wider">
                  Continuar a pago
                </Button>
              </div>
            </div>
          )}

          {step === "payment" && (
            <div className="flex flex-col gap-6">
              <h2 className="text-xl font-bold text-foreground">Metodo de pago</h2>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label className="text-foreground">Numero de tarjeta</Label>
                  <Input className="bg-secondary text-foreground border-border placeholder:text-muted-foreground" placeholder="4242 4242 4242 4242" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <Label className="text-foreground">Fecha</Label>
                    <Input className="bg-secondary text-foreground border-border placeholder:text-muted-foreground" placeholder="MM/AA" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label className="text-foreground">CVV</Label>
                    <Input className="bg-secondary text-foreground border-border placeholder:text-muted-foreground" placeholder="123" />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-foreground">Nombre en la tarjeta</Label>
                  <Input className="bg-secondary text-foreground border-border placeholder:text-muted-foreground" placeholder="JUAN PEREZ" />
                </div>
              </div>

              <Separator className="bg-border" />
              <div className="flex items-center justify-between">
                <span className="text-base font-semibold text-foreground">Total a pagar</span>
                <span className="text-xl font-bold text-foreground">{formatPrice(grandTotal)}</span>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep("shipping")} className="border-border text-foreground hover:bg-secondary">
                  Atras
                </Button>
                <Button
                  onClick={() => { clearCart(); setStep("confirmation") }}
                  className="flex-1 h-12 bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-semibold uppercase tracking-wider"
                >
                  Pagar {formatPrice(grandTotal)}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-2">
          <div className="rounded-lg border border-border bg-card p-6 sticky top-24">
            <h3 className="text-base font-semibold text-foreground mb-4">Tu pedido</h3>
            <div className="flex flex-col gap-4">
              {items.map((item) => (
                <div key={`${item.product.id}-${item.selectedSize}`} className="flex gap-3">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-secondary">
                    <Image src={item.product.images[0]} alt={item.product.name} fill className="object-cover" sizes="56px" />
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex flex-1 items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-foreground">{item.product.name}</p>
                      <p className="text-[10px] text-muted-foreground">{item.selectedSize.toUpperCase()}</p>
                    </div>
                    <span className="text-xs font-semibold text-foreground">{formatPrice(item.product.price * item.quantity)}</span>
                  </div>
                </div>
              ))}
            </div>
            <Separator className="my-4 bg-border" />
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-foreground">{formatPrice(total)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Envio</span>
                <span className="text-foreground">{shippingCost === 0 ? "Gratis" : formatPrice(shippingCost)}</span>
              </div>
            </div>
            <Separator className="my-4 bg-border" />
            <div className="flex items-center justify-between">
              <span className="font-semibold text-foreground">Total</span>
              <span className="text-lg font-bold text-foreground">{formatPrice(grandTotal)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
