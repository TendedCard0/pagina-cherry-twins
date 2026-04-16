"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { CheckCircle2, ArrowLeft, Loader2, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { useCart, type CartLine } from "@/lib/cart-store"
import { formatPrice } from "@/lib/price"
import { useAuth } from "@/context/auth-context"
import { apiFetch } from "@/lib/api"

const FREE_SHIPPING_MIN_CENTS = 150_000
const STANDARD_SHIPPING_CENTS = 9_900
const EXPRESS_SHIPPING_CENTS = 19_900

const CHECKOUT_RETURN = encodeURIComponent("/checkout")

type Step = "info" | "shipping" | "payment" | "confirmation"

type AddressRow = {
  id: number
  label: string | null
  recipientName: string | null
  line1: string
  line2: string | null
  city: string
  state: string | null
  postalCode: string | null
  country: string
  default?: boolean
  isDefault?: boolean
}

function isDefaultAddress(a: AddressRow) {
  return a.default === true || a.isDefault === true
}

type OrderDetailResponse = {
  id: number
}

async function ensureServerCartMatchesLocal(lines: CartLine[]) {
  await apiFetch<unknown>("/api/cart", { method: "GET", requireAuth: true })
  await apiFetch<unknown>("/api/cart", { method: "DELETE", requireAuth: true })
  for (const line of lines) {
    await apiFetch<unknown>("/api/cart/items", {
      method: "POST",
      requireAuth: true,
      body: JSON.stringify({ variantId: line.variantId, quantity: line.quantity }),
    })
  }
}

function splitFullName(full: string): { first: string; last: string } {
  const t = (full || "").trim()
  if (!t) return { first: "", last: "" }
  const parts = t.split(/\s+/)
  if (parts.length === 1) return { first: parts[0], last: "" }
  return { first: parts[0], last: parts.slice(1).join(" ") }
}

export function CheckoutContent() {
  const { items, total, clearCart } = useCart()
  const router = useRouter()
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()

  const [step, setStep] = useState<Step>("info")
  const [shippingMethod, setShippingMethod] = useState("standard")
  const [placedOrderId, setPlacedOrderId] = useState<number | null>(null)
  const [checkoutError, setCheckoutError] = useState("")
  const [checkoutSubmitting, setCheckoutSubmitting] = useState(false)

  const [addresses, setAddresses] = useState<AddressRow[]>([])
  const [addressesLoading, setAddressesLoading] = useState(false)

  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [line1, setLine1] = useState("")
  const [line2, setLine2] = useState("")
  const [city, setCity] = useState("")
  const [stateVal, setStateVal] = useState("")
  const [postalCode, setPostalCode] = useState("")
  const [country, setCountry] = useState("MX")
  /** "custom" o id de dirección guardada */
  const [addressSource, setAddressSource] = useState<string>("custom")

  const fillAddressFields = useCallback((addr: AddressRow) => {
    setLine1(addr.line1)
    setLine2(addr.line2 ?? "")
    setCity(addr.city)
    setStateVal(addr.state ?? "")
    setPostalCode(addr.postalCode ?? "")
    setCountry(addr.country || "MX")
    if (addr.recipientName?.trim()) {
      const { first, last } = splitFullName(addr.recipientName)
      setFirstName(first)
      setLastName(last)
    }
  }, [])

  const applyUserToContact = useCallback(() => {
    if (!user) return
    setEmail(user.email)
    setPhone(user.phone ?? "")
    const { first, last } = splitFullName(user.fullName ?? "")
    setFirstName(first)
    setLastName(last)
  }, [user])

  useEffect(() => {
    applyUserToContact()
  }, [applyUserToContact])

  useEffect(() => {
    if (!isAuthenticated) {
      setAddresses([])
      return
    }
    if (!user) return

    let cancelled = false
    setAddressesLoading(true)
    apiFetch<AddressRow[]>("/api/users/addresses", { method: "GET", requireAuth: true })
      .then((list) => {
        if (cancelled) return
        setAddresses(list)
        if (list.length > 0) {
          const def = list.find(isDefaultAddress) ?? list[0]
          setAddressSource(String(def.id))
          fillAddressFields(def)
        } else {
          setAddressSource("custom")
          setEmail(user.email)
          setPhone(user.phone ?? "")
          const { first, last } = splitFullName(user.fullName ?? "")
          setFirstName(first)
          setLastName(last)
        }
      })
      .catch(() => {
        if (cancelled) return
        setAddresses([])
        setAddressSource("custom")
        setEmail(user.email)
        setPhone(user.phone ?? "")
        const { first, last } = splitFullName(user.fullName ?? "")
        setFirstName(first)
        setLastName(last)
      })
      .finally(() => {
        if (!cancelled) setAddressesLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [isAuthenticated, user?.id, fillAddressFields])

  const shippingCost =
    shippingMethod === "express"
      ? EXPRESS_SHIPPING_CENTS
      : total >= FREE_SHIPPING_MIN_CENTS
        ? 0
        : STANDARD_SHIPPING_CENTS
  const grandTotal = total + shippingCost
  const currency = items[0]?.currency ?? "MXN"

  useEffect(() => {
    if (items.length === 0 && step !== "confirmation") {
      router.push("/cart")
    }
  }, [items.length, step, router])

  const placeOrder = useCallback(async () => {
    setCheckoutError("")
    setCheckoutSubmitting(true)
    try {
      if (items.length === 0) {
        throw new Error("Tu carrito está vacío.")
      }

      await ensureServerCartMatchesLocal(items)

      let shippingAddressId: number
      if (addressSource !== "custom") {
        shippingAddressId = Number(addressSource)
        if (!Number.isFinite(shippingAddressId) || shippingAddressId <= 0) {
          throw new Error("Selecciona una dirección de envío válida.")
        }
      } else {
        const recipient = [firstName, lastName].filter((p) => p.trim()).join(" ").trim()
        if (!recipient) throw new Error("Indica nombre y apellido para la dirección de envío.")
        if (!line1.trim()) throw new Error("Indica calle y número.")
        if (!city.trim()) throw new Error("Indica la ciudad.")
        const c = country.trim().toUpperCase()
        if (c.length !== 2) throw new Error("Indica el país en formato ISO de 2 letras (ej. MX).")

        const created = await apiFetch<AddressRow>("/api/users/addresses", {
          method: "POST",
          requireAuth: true,
          body: JSON.stringify({
            label: "Envío",
            recipientName: recipient,
            line1: line1.trim(),
            line2: line2.trim() || "",
            city: city.trim(),
            state: stateVal.trim() || "",
            postalCode: postalCode.trim() || "",
            country: c,
            makeDefault: false,
          }),
        })
        shippingAddressId = created.id
      }

      const detail = await apiFetch<OrderDetailResponse>("/api/orders/checkout", {
        method: "POST",
        requireAuth: true,
        body: JSON.stringify({
          shippingAddressId,
          billingAddressId: shippingAddressId,
          shippingMethod,
        }),
      })

      clearCart()
      setPlacedOrderId(detail.id)
      setStep("confirmation")
    } catch (e) {
      setCheckoutError(e instanceof Error ? e.message : "No se pudo completar el pedido.")
    } finally {
      setCheckoutSubmitting(false)
    }
  }, [
    items,
    addressSource,
    firstName,
    lastName,
    line1,
    line2,
    city,
    stateVal,
    postalCode,
    country,
    shippingMethod,
    clearCart,
  ])

  if (items.length === 0 && step !== "confirmation") {
    return null
  }

  if (authLoading) {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center gap-4 px-4 py-20 text-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Verificando tu sesión…</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16">
        <div className="rounded-lg border border-border bg-card p-8 text-center">
          <Lock className="mx-auto mb-4 h-12 w-12 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Inicia sesión para pagar</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Necesitamos tu cuenta para usar tu perfil, direcciones guardadas y completar el pedido con seguridad.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Link href={`/login?returnTo=${CHECKOUT_RETURN}`}>Iniciar sesión</Link>
            </Button>
            <Button asChild variant="outline" className="border-border text-foreground hover:bg-secondary">
              <Link href={`/register?returnTo=${CHECKOUT_RETURN}`}>Crear cuenta</Link>
            </Button>
          </div>
          <Link
            href="/cart"
            className="mt-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al carrito
          </Link>
        </div>
      </div>
    )
  }

  if (step === "confirmation") {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 py-20 text-center">
        <CheckCircle2 className="mb-6 h-16 w-16 text-primary" />
        <h1 className="text-3xl font-bold text-foreground">Orden confirmada</h1>
        <p className="mt-2 text-muted-foreground">
          Orden #{placedOrderId != null ? placedOrderId : "—"}
        </p>
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

  function onAddressSourceChange(value: string) {
    setAddressSource(value)
    if (value === "custom") {
      setLine1("")
      setLine2("")
      setCity("")
      setStateVal("")
      setPostalCode("")
      setCountry("MX")
      applyUserToContact()
      return
    }
    const id = Number(value)
    const addr = addresses.find((a) => a.id === id)
    if (addr) fillAddressFields(addr)
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 lg:px-8">
      <Link href="/cart" className="mb-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Volver al carrito
      </Link>

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
        <div className="lg:col-span-3">
          {step === "info" && (
            <div className="flex flex-col gap-6">
              <p className="text-sm text-muted-foreground">
                Datos tomados de tu cuenta. Puedes ajustarlos solo para este pedido.
                <Link href="/account" className="ml-2 text-primary underline-offset-4 hover:underline">
                  Ir a mi cuenta
                </Link>
              </p>

              <h2 className="text-xl font-bold text-foreground">Datos de contacto</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label className="text-foreground">Nombre</Label>
                  <Input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="bg-secondary text-foreground border-border placeholder:text-muted-foreground"
                    placeholder="Juan"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-foreground">Apellido</Label>
                  <Input
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="bg-secondary text-foreground border-border placeholder:text-muted-foreground"
                    placeholder="Perez"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-foreground">Correo electronico</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-secondary text-foreground border-border placeholder:text-muted-foreground"
                  placeholder="tu@email.com"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-foreground">Telefono</Label>
                <Input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="bg-secondary text-foreground border-border placeholder:text-muted-foreground"
                  placeholder="+52 55 1234 5678"
                />
              </div>

              <Separator className="bg-border" />
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-xl font-bold text-foreground">Direccion de envio</h2>
                {addresses.length > 0 && (
                  <Link href="/account" className="text-xs text-primary underline-offset-4 hover:underline">
                    Gestionar direcciones
                  </Link>
                )}
              </div>

              {addressesLoading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Cargando direcciones guardadas…
                </div>
              ) : addresses.length > 0 ? (
                <RadioGroup value={addressSource} onValueChange={onAddressSourceChange} className="flex flex-col gap-3">
                  {addresses.map((addr) => (
                    <label
                      key={addr.id}
                      className="flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-card p-4 hover:border-foreground/20"
                    >
                      <RadioGroupItem value={String(addr.id)} className="mt-1 border-border text-primary" />
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {addr.label || "Dirección"}
                          {isDefaultAddress(addr) ? (
                            <span className="ml-2 text-xs font-normal text-primary">(predeterminada)</span>
                          ) : null}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {[addr.line1, addr.line2, addr.postalCode, addr.city, addr.state].filter(Boolean).join(" · ")}
                        </p>
                      </div>
                    </label>
                  ))}
                  <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-card p-4 hover:border-foreground/20">
                    <RadioGroupItem value="custom" className="mt-1 border-border text-primary" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Otra dirección</p>
                      <p className="text-xs text-muted-foreground">Escribir calle, ciudad y CP a mano</p>
                    </div>
                  </label>
                </RadioGroup>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No tienes direcciones guardadas. Completa el formulario o{" "}
                  <Link href="/account" className="text-primary underline-offset-4 hover:underline">
                    añade una en tu cuenta
                  </Link>
                  .
                </p>
              )}

              <div className="flex flex-col gap-2">
                <Label className="text-foreground">Calle y numero</Label>
                <Input
                  value={line1}
                  onChange={(e) => setLine1(e.target.value)}
                  className="bg-secondary text-foreground border-border placeholder:text-muted-foreground"
                  placeholder="Av. Reforma 123"
                  disabled={addresses.length > 0 && addressSource !== "custom"}
                />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label className="text-foreground">Colonia / Depto (opcional)</Label>
                  <Input
                    value={line2}
                    onChange={(e) => setLine2(e.target.value)}
                    className="bg-secondary text-foreground border-border placeholder:text-muted-foreground"
                    placeholder="Centro"
                    disabled={addresses.length > 0 && addressSource !== "custom"}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-foreground">CP</Label>
                  <Input
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="bg-secondary text-foreground border-border placeholder:text-muted-foreground"
                    placeholder="06600"
                    disabled={addresses.length > 0 && addressSource !== "custom"}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label className="text-foreground">Ciudad</Label>
                  <Input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="bg-secondary text-foreground border-border placeholder:text-muted-foreground"
                    placeholder="CDMX"
                    disabled={addresses.length > 0 && addressSource !== "custom"}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-foreground">Estado</Label>
                  <Input
                    value={stateVal}
                    onChange={(e) => setStateVal(e.target.value)}
                    className="bg-secondary text-foreground border-border placeholder:text-muted-foreground"
                    placeholder="CDMX"
                    disabled={addresses.length > 0 && addressSource !== "custom"}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-foreground">Pais (codigo ISO)</Label>
                <Input
                  value={country}
                  onChange={(e) => setCountry(e.target.value.toUpperCase())}
                  className="bg-secondary text-foreground border-border placeholder:text-muted-foreground"
                  placeholder="MX"
                  maxLength={2}
                  disabled={addresses.length > 0 && addressSource !== "custom"}
                />
              </div>

              <Button
                onClick={() => setStep("shipping")}
                className="h-12 bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-semibold uppercase tracking-wider"
              >
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
                    {total >= FREE_SHIPPING_MIN_CENTS ? "Gratis" : formatPrice(STANDARD_SHIPPING_CENTS, currency)}
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
                  <span className="text-sm font-semibold text-foreground">
                    {formatPrice(EXPRESS_SHIPPING_CENTS, currency)}
                  </span>
                </label>
              </RadioGroup>
              {total >= FREE_SHIPPING_MIN_CENTS && (
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
                <span className="text-xl font-bold text-foreground">{formatPrice(grandTotal, currency)}</span>
              </div>

              {checkoutError ? (
                <p
                  role="alert"
                  className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
                >
                  {checkoutError}
                </p>
              ) : null}

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setCheckoutError("")
                    setStep("shipping")
                  }}
                  disabled={checkoutSubmitting}
                  className="border-border text-foreground hover:bg-secondary"
                >
                  Atras
                </Button>
                <Button
                  type="button"
                  onClick={() => void placeOrder()}
                  disabled={checkoutSubmitting || items.length === 0}
                  className="inline-flex flex-1 h-12 items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-semibold uppercase tracking-wider"
                >
                  {checkoutSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
                      Procesando…
                    </>
                  ) : (
                    <>Pagar {formatPrice(grandTotal, currency)}</>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
          <div className="rounded-lg border border-border bg-card p-6 sticky top-24">
            <h3 className="text-base font-semibold text-foreground mb-4">Tu pedido</h3>
            <div className="flex flex-col gap-4">
              {items.map((item) => (
                <div key={item.variantId} className="flex gap-3">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-secondary">
                    <Image
                      src={item.imageUrl || "/placeholder.svg"}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="56px"
                    />
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex flex-1 items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-foreground">{item.name}</p>
                      <p className="text-[10px] text-muted-foreground line-clamp-2">{item.variantLabel}</p>
                    </div>
                    <span className="text-xs font-semibold text-foreground">
                      {formatPrice(item.unitPriceCents * item.quantity, item.currency)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <Separator className="my-4 bg-border" />
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-foreground">{formatPrice(total, currency)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Envio</span>
                <span className="text-foreground">
                  {shippingCost === 0 ? "Gratis" : formatPrice(shippingCost, currency)}
                </span>
              </div>
            </div>
            <Separator className="my-4 bg-border" />
            <div className="flex items-center justify-between">
              <span className="font-semibold text-foreground">Total</span>
              <span className="text-lg font-bold text-foreground">{formatPrice(grandTotal, currency)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
