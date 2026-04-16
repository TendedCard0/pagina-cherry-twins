"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import {
  LayoutDashboard, Package, ShoppingCart, Tag, TrendingUp,
  AlertTriangle, Plus, Trash2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { API_BASE_URL } from "@/lib/api-config"
import { apiFetch } from "@/lib/api"
import { useAuth } from "@/context/auth-context"
import type { PageResponse, SpringPage } from "@/lib/catalog-types"
import { AdminCatalogProductsTab } from "@/components/admin/admin-catalog-products-tab"
import { formatPrice } from "@/lib/price"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"

const ORDER_STATUSES = ["PENDING", "PAID", "FULFILLED", "CANCELLED", "REFUNDED"] as const

type AdminOrderSummary = {
  id: number
  userId: number | null
  status: string
  totalCents: number
  currency: string
  createdAt: string
  customerEmail: string | null
  shippingAddressId: number | null
}

type AdminOrdersPage = PageResponse<AdminOrderSummary>

type AdminOrderItem = {
  id: number
  variantId: number
  productName: string
  sku: string
  variantSnapshot: unknown
  unitPriceCents: number
  quantity: number
  lineTotalCents: number
}

type AdminOrderDetailBlock = {
  id: number
  userId: number
  status: string
  currency: string
  subtotalCents: number
  discountCents: number
  shippingCents: number
  taxCents: number
  totalCents: number
  couponId: number | null
  shippingAddressId: number | null
  billingAddressId: number | null
  placedAt: string | null
  createdAt: string
  items: AdminOrderItem[]
}

type AdminShippingAddress = {
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

type AdminOrderDetailPayload = {
  order: AdminOrderDetailBlock
  customerEmail: string | null
  shippingAddress: AdminShippingAddress | null
}

type AdminCouponRow = {
  id: number
  code: string
  discountType: string
  discountValue: number
  currency: string
  startsAt: string | null
  endsAt: string | null
  maxRedemptions: number | null
  perUserLimit: number | null
  minOrderCents: number
  active: boolean
  createdAt: string
}

function formatOrderDate(iso: string) {
  try {
    return new Date(iso).toLocaleString("es-MX", {
      dateStyle: "medium",
      timeStyle: "short",
    })
  } catch {
    return iso
  }
}

function statusBadgeClass(status: string) {
  const s = status.toUpperCase()
  if (s === "FULFILLED") return "bg-green-500/20 text-green-400 border-green-500/30"
  if (s === "PAID") return "bg-blue-500/20 text-blue-400 border-blue-500/30"
  if (s === "PENDING") return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
  if (s === "CANCELLED" || s === "REFUNDED") return "bg-muted text-muted-foreground border-border"
  return "bg-secondary text-muted-foreground border-border"
}

/** Jackson a veces serializa `JsonNode` como bean (propiedades array/bigDecimal/…); no mostrar eso. */
function isLikelyJsonNodeBeanDump(o: Record<string, unknown>): boolean {
  return (
    typeof o.array === "boolean" &&
    typeof o.boolean === "boolean" &&
    typeof o.bigDecimal === "boolean" &&
    typeof o.bigInteger === "boolean" &&
    typeof o.binary === "boolean"
  )
}

function snapshotPreview(snap: unknown): string | null {
  if (snap == null) return null
  if (typeof snap === "string") {
    const t = snap.trim()
    if (!t) return null
    return t.length > 120 ? `${t.slice(0, 120)}…` : t
  }
  if (typeof snap === "object" && snap !== null && !Array.isArray(snap)) {
    const o = snap as Record<string, unknown>
    if (isLikelyJsonNodeBeanDump(o)) return null
    if (typeof o.variantName === "string" && o.variantName.trim()) return o.variantName.trim()
    if (o.attributes != null && typeof o.attributes === "object" && !Array.isArray(o.attributes)) {
      const attrs = o.attributes as Record<string, unknown>
      const parts = Object.entries(attrs).map(([k, v]) => `${k}: ${String(v)}`)
      if (parts.length) return parts.join(" · ")
    }
    const keys = Object.keys(o).filter((k) => !k.startsWith("_"))
    if (keys.length === 0) return null
    try {
      const s = JSON.stringify(o)
      return s.length > 160 ? `${s.slice(0, 160)}…` : s
    } catch {
      return null
    }
  }
  try {
    const s = JSON.stringify(snap)
    return s.length > 160 ? `${s.slice(0, 160)}…` : s
  } catch {
    return null
  }
}

function formatCouponDiscountLabel(c: AdminCouponRow): string {
  const t = c.discountType.toUpperCase()
  if (t === "PERCENT") return `${c.discountValue}%`
  if (t === "FIXED") return formatPrice(c.discountValue, c.currency)
  return `${c.discountType} ${c.discountValue}`
}

function formatCouponWindow(c: AdminCouponRow): string {
  if (!c.startsAt && !c.endsAt) return "Sin fechas límite"
  const a = c.startsAt ? formatOrderDate(c.startsAt) : "—"
  const b = c.endsAt ? formatOrderDate(c.endsAt) : "—"
  return `${a} → ${b}`
}

export function AdminDashboard() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const [tab, setTab] = useState("dashboard")
  const [catalogTotal, setCatalogTotal] = useState<number | null>(null)

  const [orders, setOrders] = useState<AdminOrderSummary[]>([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [ordersError, setOrdersError] = useState("")

  const [detailOpen, setDetailOpen] = useState(false)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState("")
  const [detailPayload, setDetailPayload] = useState<AdminOrderDetailPayload | null>(null)
  const [statusUpdatingId, setStatusUpdatingId] = useState<number | null>(null)

  const [coupons, setCoupons] = useState<AdminCouponRow[]>([])
  const [couponsLoading, setCouponsLoading] = useState(false)
  const [couponsError, setCouponsError] = useState("")
  const [couponToggleId, setCouponToggleId] = useState<number | null>(null)
  const [couponDeletingId, setCouponDeletingId] = useState<number | null>(null)
  const [couponCreateOpen, setCouponCreateOpen] = useState(false)
  const [couponCreateSubmitting, setCouponCreateSubmitting] = useState(false)
  const [couponCreateError, setCouponCreateError] = useState("")
  const [ccCode, setCcCode] = useState("")
  const [ccDiscountType, setCcDiscountType] = useState<"PERCENT" | "FIXED">("PERCENT")
  const [ccDiscountValue, setCcDiscountValue] = useState("10")
  const [ccCurrency, setCcCurrency] = useState("MXN")
  const [ccMinOrderCents, setCcMinOrderCents] = useState("0")
  const [ccMaxRedemptions, setCcMaxRedemptions] = useState("")

  const isAdmin = user?.role === "ADMIN"

  const loadOrders = useCallback(async () => {
    if (!isAdmin) return
    setOrdersLoading(true)
    setOrdersError("")
    try {
      const data = await apiFetch<AdminOrdersPage>("/api/admin/orders?page=0&size=100", {
        method: "GET",
        requireAuth: true,
      })
      setOrders(data.content ?? [])
    } catch (e) {
      setOrders([])
      setOrdersError(e instanceof Error ? e.message : "No se pudieron cargar los pedidos.")
    } finally {
      setOrdersLoading(false)
    }
  }, [isAdmin])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/catalog/products?page=0&size=1`, {
          cache: "no-store",
          headers: { Accept: "application/json" },
        })
        if (!res.ok) throw new Error("fetch")
        const data = (await res.json()) as PageResponse<{ id: number }>
        if (!cancelled) setCatalogTotal(data.totalElements)
      } catch {
        if (!cancelled) setCatalogTotal(null)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (isAdmin) void loadOrders()
  }, [isAdmin, loadOrders])

  const loadCoupons = useCallback(async () => {
    if (!isAdmin) return
    setCouponsLoading(true)
    setCouponsError("")
    try {
      const data = await apiFetch<SpringPage<AdminCouponRow>>("/api/admin/coupons?page=0&size=100", {
        method: "GET",
        requireAuth: true,
      })
      setCoupons(data.content ?? [])
    } catch (e) {
      setCoupons([])
      setCouponsError(e instanceof Error ? e.message : "No se pudieron cargar los cupones.")
    } finally {
      setCouponsLoading(false)
    }
  }, [isAdmin])

  useEffect(() => {
    if (!isAdmin || tab !== "coupons") return
    void loadCoupons()
  }, [isAdmin, tab, loadCoupons])

  async function openOrderDetail(orderId: number) {
    setDetailOpen(true)
    setDetailLoading(true)
    setDetailError("")
    setDetailPayload(null)
    try {
      const data = await apiFetch<AdminOrderDetailPayload>(`/api/admin/orders/${orderId}`, {
        method: "GET",
        requireAuth: true,
      })
      setDetailPayload(data)
    } catch (e) {
      setDetailError(e instanceof Error ? e.message : "No se pudo cargar el pedido.")
    } finally {
      setDetailLoading(false)
    }
  }

  async function setCouponActive(couponId: number, value: boolean) {
    setCouponToggleId(couponId)
    setCouponsError("")
    try {
      await apiFetch(`/api/admin/coupons/${couponId}/active?value=${value}`, {
        method: "PUT",
        requireAuth: true,
      })
      await loadCoupons()
    } catch (e) {
      setCouponsError(e instanceof Error ? e.message : "No se pudo actualizar el cupón.")
    } finally {
      setCouponToggleId(null)
    }
  }

  async function deleteCoupon(couponId: number) {
    if (!confirm("¿Eliminar este cupón? Esta acción no se puede deshacer.")) return
    setCouponDeletingId(couponId)
    setCouponsError("")
    try {
      await apiFetch(`/api/admin/coupons/${couponId}`, {
        method: "DELETE",
        requireAuth: true,
      })
      await loadCoupons()
    } catch (e) {
      setCouponsError(e instanceof Error ? e.message : "No se pudo eliminar el cupón.")
    } finally {
      setCouponDeletingId(null)
    }
  }

  function resetCouponCreateForm() {
    setCcCode("")
    setCcDiscountType("PERCENT")
    setCcDiscountValue("10")
    setCcCurrency("MXN")
    setCcMinOrderCents("0")
    setCcMaxRedemptions("")
    setCouponCreateError("")
  }

  async function submitCreateCoupon() {
    setCouponCreateSubmitting(true)
    setCouponCreateError("")
    const dv = Number(ccDiscountValue)
    const minOrder = Number(ccMinOrderCents)
    if (!ccCode.trim()) {
      setCouponCreateError("El código es obligatorio.")
      setCouponCreateSubmitting(false)
      return
    }
    if (!Number.isFinite(dv) || dv <= 0) {
      setCouponCreateError("El valor del descuento no es válido.")
      setCouponCreateSubmitting(false)
      return
    }
    if (!Number.isFinite(minOrder) || minOrder < 0) {
      setCouponCreateError("El pedido mínimo (centavos) no es válido.")
      setCouponCreateSubmitting(false)
      return
    }
    const body: Record<string, unknown> = {
      code: ccCode.trim(),
      discountType: ccDiscountType,
      discountValue: Math.round(dv),
      currency: ccCurrency.trim().toUpperCase() || "MXN",
      minOrderCents: Math.round(minOrder),
      active: true,
    }
    const mr = ccMaxRedemptions.trim()
    if (mr !== "") {
      const n = Number(mr)
      if (!Number.isFinite(n) || n < 0) {
        setCouponCreateError("El límite de usos no es válido.")
        setCouponCreateSubmitting(false)
        return
      }
      body.maxRedemptions = Math.round(n)
    }
    try {
      await apiFetch("/api/admin/coupons", {
        method: "POST",
        requireAuth: true,
        body: JSON.stringify(body),
      })
      setCouponCreateOpen(false)
      resetCouponCreateForm()
      await loadCoupons()
    } catch (e) {
      setCouponCreateError(e instanceof Error ? e.message : "No se pudo crear el cupón.")
    } finally {
      setCouponCreateSubmitting(false)
    }
  }

  async function updateOrderStatus(orderId: number, status: string) {
    setStatusUpdatingId(orderId)
    setOrdersError("")
    try {
      await apiFetch(`/api/admin/orders/${orderId}/status`, {
        method: "PUT",
        requireAuth: true,
        body: JSON.stringify({ status }),
      })
      await loadOrders()
      if (detailOpen && detailPayload?.order.id === orderId) {
        await openOrderDetail(orderId)
      }
    } catch (e) {
      setOrdersError(e instanceof Error ? e.message : "No se pudo actualizar el estado.")
    } finally {
      setStatusUpdatingId(null)
    }
  }

  const stats = [
    { label: "Ventas hoy", value: "—", icon: TrendingUp, change: "" },
    { label: "Pedidos (cargados)", value: orders.length ? String(orders.length) : "—", icon: ShoppingCart, change: "" },
    { label: "Productos (catálogo)", value: catalogTotal != null ? String(catalogTotal) : "—", icon: Package, change: "" },
    { label: "Stock bajo", value: "—", icon: AlertTriangle, change: "vía API admin" },
  ]

  if (authLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center text-muted-foreground">
        Verificando sesión…
      </div>
    )
  }

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-foreground">Acceso restringido</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Solo cuentas con rol administrador pueden ver pedidos reales y el panel.
        </p>
        <Button asChild className="mt-8 bg-primary text-primary-foreground hover:bg-primary/90">
          <Link href="/login?returnTo=%2Fadmin">Iniciar sesión</Link>
        </Button>
      </div>
    )
  }

  const recentOrders = orders.slice(0, 4)

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Admin Panel</h1>
        <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">Cherry Twins</Badge>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="mb-8 bg-secondary border border-border flex-wrap h-auto gap-1 p-1">
          <TabsTrigger value="dashboard" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-muted-foreground">
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="products" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-muted-foreground">
            <Package className="mr-2 h-4 w-4" />
            Productos
          </TabsTrigger>
          <TabsTrigger value="orders" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-muted-foreground">
            <ShoppingCart className="mr-2 h-4 w-4" />
            Pedidos
          </TabsTrigger>
          <TabsTrigger value="coupons" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-muted-foreground">
            <Tag className="mr-2 h-4 w-4" />
            Cupones
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-lg border border-border bg-card p-6">
                <div className="flex items-center justify-between">
                  <stat.icon className="h-5 w-5 text-primary" />
                  {stat.change && (
                    <span className="text-xs font-medium text-primary">{stat.change}</span>
                  )}
                </div>
                <p className="mt-4 text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="mb-4 text-base font-semibold text-foreground">Pedidos recientes</h3>
              {ordersLoading ? (
                <p className="text-sm text-muted-foreground">Cargando…</p>
              ) : recentOrders.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aún no hay pedidos en el sistema.</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">
                          {order.customerEmail ?? `Usuario #${order.userId ?? "—"}`}
                        </p>
                        <p className="text-xs text-muted-foreground">#{order.id}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <Badge variant="outline" className={statusBadgeClass(order.status)}>
                          {order.status}
                        </Badge>
                        <span className="text-sm font-semibold text-foreground">
                          {formatPrice(order.totalCents, order.currency)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="mb-4 text-base font-semibold text-foreground">Inventario</h3>
              <p className="text-sm text-muted-foreground">
                El stock por variante se consulta con la API admin. El listado de productos usa el catálogo público.
              </p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="products">
          <AdminCatalogProductsTab />
        </TabsContent>

        <TabsContent value="orders">
          {ordersError && (
            <div className="mb-4 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {ordersError}
            </div>
          )}
          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-secondary/50">
                  <TableHead className="text-muted-foreground">Orden</TableHead>
                  <TableHead className="text-muted-foreground">Cliente</TableHead>
                  <TableHead className="text-muted-foreground">Fecha</TableHead>
                  <TableHead className="text-muted-foreground">Total</TableHead>
                  <TableHead className="text-muted-foreground">Estado</TableHead>
                  <TableHead className="text-muted-foreground text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ordersLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-10">
                      Cargando pedidos…
                    </TableCell>
                  </TableRow>
                ) : orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-10">
                      No hay pedidos. Los clientes generan órdenes al completar el checkout.
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.map((order) => (
                    <TableRow key={order.id} className="border-border hover:bg-secondary/50">
                      <TableCell className="text-sm font-medium text-foreground">#{order.id}</TableCell>
                      <TableCell className="text-sm text-foreground">
                        <span className="truncate block max-w-[200px]" title={order.customerEmail ?? ""}>
                          {order.customerEmail ?? `Usuario #${order.userId ?? "—"}`}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {formatOrderDate(order.createdAt)}
                      </TableCell>
                      <TableCell className="text-sm font-semibold text-foreground">
                        {formatPrice(order.totalCents, order.currency)}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={order.status}
                          disabled={statusUpdatingId === order.id}
                          onValueChange={(v) => void updateOrderStatus(order.id, v)}
                        >
                          <SelectTrigger className="h-8 w-[150px] bg-secondary text-foreground border-border text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-card text-foreground border-border">
                            {ORDER_STATUSES.map((s) => (
                              <SelectItem key={s} value={s}>
                                {s}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="border-border text-foreground hover:bg-secondary text-xs"
                          onClick={() => void openOrderDetail(order.id)}
                        >
                          Ver detalle
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="coupons">
          {couponsError && (
            <div className="mb-4 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {couponsError}
            </div>
          )}
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Cupones</h2>
            <Button
              type="button"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => {
                resetCouponCreateForm()
                setCouponCreateOpen(true)
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Nuevo cupón
            </Button>
          </div>
          {couponsLoading ? (
            <p className="text-sm text-muted-foreground">Cargando cupones…</p>
          ) : coupons.length === 0 ? (
            <p className="text-sm text-muted-foreground">No hay cupones. Crea uno con el botón de arriba.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {coupons.map((coupon) => (
                <div
                  key={coupon.id}
                  className="flex flex-col gap-3 rounded-lg border border-border bg-card p-6 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-sm font-bold text-foreground">{coupon.code}</span>
                      <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">
                        {formatCouponDiscountLabel(coupon)}
                      </Badge>
                      <Badge variant="outline" className="border-border text-muted-foreground">
                        {coupon.discountType}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Pedido mínimo {formatPrice(coupon.minOrderCents, coupon.currency)}
                      {coupon.maxRedemptions != null ? ` · Máx. ${coupon.maxRedemptions} usos` : " · Sin límite de usos"}
                      {coupon.perUserLimit != null ? ` · ${coupon.perUserLimit} por usuario` : ""}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{formatCouponWindow(coupon)}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{coupon.active ? "Activo" : "Inactivo"}</span>
                      <Switch
                        checked={coupon.active}
                        disabled={couponToggleId === coupon.id}
                        className="data-[state=checked]:bg-primary"
                        onCheckedChange={(checked) => void setCouponActive(coupon.id, checked)}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={couponDeletingId === coupon.id}
                      className="text-muted-foreground hover:text-destructive h-8 w-8"
                      onClick={() => void deleteCoupon(coupon.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog
        open={detailOpen}
        onOpenChange={(open) => {
          setDetailOpen(open)
          if (!open) {
            setDetailPayload(null)
            setDetailError("")
          }
        }}
      >
        <DialogContent
          className={cn(
            "border-border bg-card text-foreground",
            "fixed left-1/2 top-4 z-50 flex max-h-[calc(100vh-2rem)] w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2 translate-y-0 flex-col gap-0 overflow-hidden p-0 sm:top-8 sm:max-h-[calc(100vh-4rem)]",
          )}
        >
          <div className="shrink-0 border-b border-border px-6 pb-4 pt-6 pr-14">
            <DialogHeader>
              <DialogTitle>Detalle del pedido</DialogTitle>
            </DialogHeader>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-4">
          {detailLoading && <p className="text-sm text-muted-foreground">Cargando…</p>}
          {detailError && (
            <p className="text-sm text-destructive">{detailError}</p>
          )}
          {detailPayload && !detailLoading && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-muted-foreground">Orden</p>
                  <p className="font-semibold">#{detailPayload.order.id}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Estado</p>
                  <Badge variant="outline" className={statusBadgeClass(detailPayload.order.status)}>
                    {detailPayload.order.status}
                  </Badge>
                </div>
                <div className="col-span-2">
                  <p className="text-muted-foreground">Cliente</p>
                  <p className="font-medium">{detailPayload.customerEmail ?? `Usuario #${detailPayload.order.userId}`}</p>
                </div>
                {detailPayload.order.couponId != null ? (
                  <div className="col-span-2">
                    <p className="text-muted-foreground">Cupón aplicado</p>
                    <p className="font-mono text-xs">ID #{detailPayload.order.couponId}</p>
                  </div>
                ) : null}
              </div>

              <div>
                <p className="mb-2 font-semibold text-foreground">Envío</p>
                {detailPayload.shippingAddress ? (
                  <div className="rounded-md border border-border bg-secondary/40 p-3 text-xs leading-relaxed">
                    <p className="font-medium">{detailPayload.shippingAddress.recipientName ?? "—"}</p>
                    <p>{detailPayload.shippingAddress.line1}</p>
                    {detailPayload.shippingAddress.line2 ? <p>{detailPayload.shippingAddress.line2}</p> : null}
                    <p>
                      {[detailPayload.shippingAddress.postalCode, detailPayload.shippingAddress.city, detailPayload.shippingAddress.state]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                    <p>{detailPayload.shippingAddress.country}</p>
                  </div>
                ) : (
                  <p className="text-muted-foreground">Sin dirección vinculada o no encontrada.</p>
                )}
              </div>

              <div>
                <p className="mb-2 font-semibold text-foreground">Productos</p>
                <ul className="space-y-2">
                  {detailPayload.order.items.map((item) => {
                    const snapLine = snapshotPreview(item.variantSnapshot)
                    return (
                      <li key={item.id} className="rounded-md border border-border p-2">
                        <p className="font-medium">{item.productName}</p>
                        <p className="text-xs text-muted-foreground">SKU {item.sku} · {item.quantity} u.</p>
                        {snapLine ? <p className="text-xs text-muted-foreground">{snapLine}</p> : null}
                        <p className="text-right font-semibold">
                          {formatPrice(item.lineTotalCents, detailPayload.order.currency)}
                        </p>
                      </li>
                    )
                  })}
                </ul>
              </div>

              <div className="space-y-1 border-t border-border pt-3 pb-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(detailPayload.order.subtotalCents, detailPayload.order.currency)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Descuento</span>
                  <span>{formatPrice(detailPayload.order.discountCents, detailPayload.order.currency)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Envío</span>
                  <span>{formatPrice(detailPayload.order.shippingCents, detailPayload.order.currency)}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>{formatPrice(detailPayload.order.totalCents, detailPayload.order.currency)}</span>
                </div>
              </div>
            </div>
          )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={couponCreateOpen}
        onOpenChange={(open) => {
          setCouponCreateOpen(open)
          if (!open) resetCouponCreateForm()
        }}
      >
        <DialogContent className="border-border bg-card text-foreground sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nuevo cupón</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-sm">
            {couponCreateError ? (
              <p className="text-sm text-destructive">{couponCreateError}</p>
            ) : null}
            <div className="space-y-2">
              <Label htmlFor="cc-code">Código</Label>
              <Input
                id="cc-code"
                value={ccCode}
                onChange={(e) => setCcCode(e.target.value)}
                className="bg-secondary text-foreground border-border"
                placeholder="CHERRY20"
                autoComplete="off"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="cc-type">Tipo</Label>
                <Select value={ccDiscountType} onValueChange={(v) => setCcDiscountType(v as "PERCENT" | "FIXED")}>
                  <SelectTrigger id="cc-type" className="bg-secondary text-foreground border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card text-foreground border-border">
                    <SelectItem value="PERCENT">Porcentaje</SelectItem>
                    <SelectItem value="FIXED">Monto fijo (centavos)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cc-val">Valor</Label>
                <Input
                  id="cc-val"
                  type="number"
                  min={1}
                  value={ccDiscountValue}
                  onChange={(e) => setCcDiscountValue(e.target.value)}
                  className="bg-secondary text-foreground border-border"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="cc-cur">Moneda (ISO)</Label>
                <Input
                  id="cc-cur"
                  value={ccCurrency}
                  onChange={(e) => setCcCurrency(e.target.value)}
                  className="bg-secondary text-foreground border-border"
                  maxLength={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cc-min">Pedido mínimo (centavos)</Label>
                <Input
                  id="cc-min"
                  type="number"
                  min={0}
                  value={ccMinOrderCents}
                  onChange={(e) => setCcMinOrderCents(e.target.value)}
                  className="bg-secondary text-foreground border-border"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cc-max">Máximo de redenciones (opcional)</Label>
              <Input
                id="cc-max"
                type="number"
                min={0}
                value={ccMaxRedemptions}
                onChange={(e) => setCcMaxRedemptions(e.target.value)}
                className="bg-secondary text-foreground border-border"
                placeholder="Vacío = sin límite"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                className="border-border"
                onClick={() => setCouponCreateOpen(false)}
                disabled={couponCreateSubmitting}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={couponCreateSubmitting}
                onClick={() => void submitCreateCoupon()}
              >
                {couponCreateSubmitting ? "Guardando…" : "Crear"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
