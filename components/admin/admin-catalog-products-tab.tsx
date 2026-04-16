"use client"

import { useCallback, useEffect, useState } from "react"
import Image from "next/image"
import {
  Eye,
  Loader2,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { API_BASE_URL } from "@/lib/api-config"
import { apiFetch } from "@/lib/api"
import { useAuth } from "@/context/auth-context"
import type {
  ArtistResponse,
  CategoryResponse,
  PageResponse,
  ProductDetailResponse,
  ProductListItemResponse,
  ProductVariantResponse,
} from "@/lib/catalog-types"
import { formatPrice } from "@/lib/price"
import { cn } from "@/lib/utils"

function dialogShellClass() {
  return cn(
    "border-border bg-card text-foreground",
    "fixed left-1/2 top-4 z-50 flex max-h-[calc(100vh-2rem)] w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2 translate-y-0 flex-col gap-0 overflow-hidden p-0 sm:top-8 sm:max-h-[calc(100vh-4rem)]",
  )
}

export function AdminCatalogProductsTab() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const isAdmin = user?.role === "ADMIN"

  const [products, setProducts] = useState<ProductListItemResponse[]>([])
  const [catalogLoading, setCatalogLoading] = useState(false)
  const [catalogError, setCatalogError] = useState("")
  const [productSearch, setProductSearch] = useState("")

  const [metaArtists, setMetaArtists] = useState<ArtistResponse[]>([])
  const [metaCategories, setMetaCategories] = useState<CategoryResponse[]>([])

  const [activeToggleId, setActiveToggleId] = useState<number | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const [viewOpen, setViewOpen] = useState(false)
  const [viewLoading, setViewLoading] = useState(false)
  const [viewError, setViewError] = useState("")
  const [viewDetail, setViewDetail] = useState<ProductDetailResponse | null>(null)

  const [formOpen, setFormOpen] = useState(false)
  const [formMode, setFormMode] = useState<"create" | "edit">("create")
  const [formProductId, setFormProductId] = useState<number | null>(null)
  const [formLoading, setFormLoading] = useState(false)
  const [formSaving, setFormSaving] = useState(false)
  const [formError, setFormError] = useState("")
  const [formDetail, setFormDetail] = useState<ProductDetailResponse | null>(null)

  const [pfName, setPfName] = useState("")
  const [pfSlug, setPfSlug] = useState("")
  const [pfDesc, setPfDesc] = useState("")
  const [pfBasePrice, setPfBasePrice] = useState("")
  const [pfCurrency, setPfCurrency] = useState("MXN")
  const [pfActive, setPfActive] = useState(true)
  const [pfArtistId, setPfArtistId] = useState<string>("")
  const [pfCategoryId, setPfCategoryId] = useState<string>("")

  const [createVarSku, setCreateVarSku] = useState("")
  const [createVarName, setCreateVarName] = useState("")
  const [createVarPrice, setCreateVarPrice] = useState("")
  const [createVarStock, setCreateVarStock] = useState("0")

  const [newVarSku, setNewVarSku] = useState("")
  const [newVarName, setNewVarName] = useState("")
  const [newVarPrice, setNewVarPrice] = useState("")
  const [newVarStock, setNewVarStock] = useState("0")
  const [variantBusy, setVariantBusy] = useState(false)

  const [stockQty, setStockQty] = useState<Record<number, string>>({})

  const loadCatalog = useCallback(async () => {
    if (!isAdmin) return
    setCatalogLoading(true)
    setCatalogError("")
    try {
      const params = new URLSearchParams({ page: "0", size: "100" })
      const q = productSearch.trim()
      if (q) params.set("q", q)
      const res = await fetch(`${API_BASE_URL}/api/catalog/products?${params}`, {
        cache: "no-store",
        headers: { Accept: "application/json" },
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = (await res.json()) as PageResponse<ProductListItemResponse>
      setProducts(data.content ?? [])
    } catch {
      setProducts([])
      setCatalogError("No se pudo cargar el catálogo.")
    } finally {
      setCatalogLoading(false)
    }
  }, [isAdmin, productSearch])

  useEffect(() => {
    if (!isAdmin) return
    const t = window.setTimeout(() => {
      void loadCatalog()
    }, 320)
    return () => window.clearTimeout(t)
  }, [isAdmin, loadCatalog])

  useEffect(() => {
    if (!isAdmin) return
    let cancelled = false
    ;(async () => {
      try {
        const [ar, ca] = await Promise.all([
          fetch(`${API_BASE_URL}/api/catalog/artists`, {
            cache: "no-store",
            headers: { Accept: "application/json" },
          }),
          fetch(`${API_BASE_URL}/api/catalog/categories`, {
            cache: "no-store",
            headers: { Accept: "application/json" },
          }),
        ])
        const artists = ar.ok ? ((await ar.json()) as ArtistResponse[]) : []
        const categories = ca.ok ? ((await ca.json()) as CategoryResponse[]) : []
        if (!cancelled) {
          setMetaArtists(artists)
          setMetaCategories(categories)
        }
      } catch {
        if (!cancelled) {
          setMetaArtists([])
          setMetaCategories([])
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [isAdmin])

  async function fetchAdminProduct(id: number): Promise<ProductDetailResponse> {
    return apiFetch<ProductDetailResponse>(`/api/admin/catalog/products/${id}`, {
      method: "GET",
      requireAuth: true,
    })
  }

  function fillFormFromDetail(d: ProductDetailResponse) {
    setPfName(d.name)
    setPfSlug(d.slug)
    setPfDesc(d.description ?? "")
    setPfBasePrice(String(d.basePriceCents))
    setPfCurrency(d.currency)
    setPfActive(d.active)
    setPfArtistId(d.artist?.id != null ? String(d.artist.id) : "")
    setPfCategoryId(d.category?.id != null ? String(d.category.id) : "")
  }

  function resetCreateForm() {
    setFormProductId(null)
    setFormDetail(null)
    setPfName("")
    setPfSlug("")
    setPfDesc("")
    setPfBasePrice("")
    setPfCurrency("MXN")
    setPfActive(true)
    setPfArtistId("")
    setPfCategoryId("")
    setCreateVarSku("")
    setCreateVarName("")
    setCreateVarPrice("")
    setCreateVarStock("0")
    setNewVarSku("")
    setNewVarName("")
    setNewVarPrice("")
    setNewVarStock("0")
    setFormError("")
    setStockQty({})
  }

  async function openView(productId: number) {
    setViewOpen(true)
    setViewLoading(true)
    setViewError("")
    setViewDetail(null)
    try {
      const d = await fetchAdminProduct(productId)
      setViewDetail(d)
    } catch (e) {
      setViewError(e instanceof Error ? e.message : "No se pudo cargar el producto.")
    } finally {
      setViewLoading(false)
    }
  }

  async function openEdit(productId: number) {
    setFormMode("edit")
    setFormProductId(productId)
    setFormOpen(true)
    setFormLoading(true)
    setFormError("")
    setFormDetail(null)
    setNewVarSku("")
    setNewVarName("")
    setNewVarPrice("")
    setNewVarStock("0")
    setStockQty({})
    try {
      const d = await fetchAdminProduct(productId)
      setFormDetail(d)
      fillFormFromDetail(d)
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "No se pudo cargar el producto.")
    } finally {
      setFormLoading(false)
    }
  }

  function openCreate() {
    setFormMode("create")
    resetCreateForm()
    setFormOpen(true)
  }

  async function saveProduct() {
    setFormSaving(true)
    setFormError("")
    const base = Number(pfBasePrice)
    if (!pfName.trim()) {
      setFormError("El nombre es obligatorio.")
      setFormSaving(false)
      return
    }
    if (!Number.isFinite(base) || base < 0) {
      setFormError("El precio base (centavos) no es válido.")
      setFormSaving(false)
      return
    }
    const cur = pfCurrency.trim().toUpperCase()
    if (cur.length !== 3) {
      setFormError("La moneda debe ser un código ISO de 3 letras.")
      setFormSaving(false)
      return
    }
    const body: Record<string, unknown> = {
      name: pfName.trim(),
      slug: pfSlug.trim() || null,
      description: pfDesc.trim() || null,
      basePriceCents: Math.round(base),
      currency: cur,
      active: pfActive,
      artistId: pfArtistId ? Number(pfArtistId) : null,
      categoryId: pfCategoryId ? Number(pfCategoryId) : null,
    }
    try {
      if (formMode === "create") {
        const created = await apiFetch<ProductDetailResponse>("/api/admin/catalog/products", {
          method: "POST",
          requireAuth: true,
          body: JSON.stringify(body),
        })
        const sku = createVarSku.trim()
        if (sku) {
          const price = Number(createVarPrice)
          const stock = Number(createVarStock)
          if (!Number.isFinite(price) || price < 0) {
            setFormError("Producto creado. Indica un precio válido para la variante o deja el SKU vacío.")
            setFormSaving(false)
            await loadCatalog()
            await openEdit(created.id)
            return
          }
          if (!Number.isFinite(stock) || stock < 0) {
            setFormError("Producto creado. Indica stock válido (≥ 0) para la variante.")
            setFormSaving(false)
            await loadCatalog()
            await openEdit(created.id)
            return
          }
          await apiFetch<ProductVariantResponse[]>(
            `/api/admin/catalog/products/${created.id}/variants`,
            {
              method: "POST",
              requireAuth: true,
              body: JSON.stringify({
                sku,
                variantName: createVarName.trim() || undefined,
                priceCents: Math.round(price),
                currency: cur,
                stockOnHand: Math.round(stock),
                active: true,
              }),
            },
          )
        }
        setFormOpen(false)
        resetCreateForm()
        await loadCatalog()
      } else if (formProductId != null) {
        await apiFetch<ProductDetailResponse>(`/api/admin/catalog/products/${formProductId}`, {
          method: "PUT",
          requireAuth: true,
          body: JSON.stringify(body),
        })
        const d = await fetchAdminProduct(formProductId)
        setFormDetail(d)
        fillFormFromDetail(d)
        await loadCatalog()
      }
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "No se pudo guardar.")
    } finally {
      setFormSaving(false)
    }
  }

  async function setProductActive(productId: number, value: boolean) {
    setActiveToggleId(productId)
    setCatalogError("")
    try {
      await apiFetch<ProductDetailResponse>(`/api/admin/catalog/products/${productId}/active?value=${value}`, {
        method: "PUT",
        requireAuth: true,
      })
      await loadCatalog()
    } catch (e) {
      setCatalogError(e instanceof Error ? e.message : "No se pudo actualizar el estado.")
    } finally {
      setActiveToggleId(null)
    }
  }

  async function deleteProduct(productId: number) {
    if (!confirm("¿Eliminar este producto, sus imágenes y variantes? Esta acción no se puede deshacer.")) return
    setDeletingId(productId)
    setCatalogError("")
    try {
      await apiFetch(`/api/admin/catalog/products/${productId}`, {
        method: "DELETE",
        requireAuth: true,
      })
      if (viewDetail?.id === productId) {
        setViewOpen(false)
        setViewDetail(null)
      }
      if (formProductId === productId) {
        setFormOpen(false)
      }
      await loadCatalog()
    } catch (e) {
      setCatalogError(e instanceof Error ? e.message : "No se pudo eliminar el producto.")
    } finally {
      setDeletingId(null)
    }
  }

  async function addVariant() {
    if (formProductId == null) return
    setVariantBusy(true)
    setFormError("")
    const sku = newVarSku.trim()
    const price = Number(newVarPrice)
    const stock = Number(newVarStock)
    if (!sku) {
      setFormError("SKU obligatorio para nueva variante.")
      setVariantBusy(false)
      return
    }
    if (!Number.isFinite(price) || price < 0) {
      setFormError("Precio de variante no válido.")
      setVariantBusy(false)
      return
    }
    if (!Number.isFinite(stock) || stock < 0) {
      setFormError("Stock no válido.")
      setVariantBusy(false)
      return
    }
    try {
      const list = await apiFetch<ProductVariantResponse[]>(
        `/api/admin/catalog/products/${formProductId}/variants`,
        {
          method: "POST",
          requireAuth: true,
          body: JSON.stringify({
            sku,
            variantName: newVarName.trim() || undefined,
            priceCents: Math.round(price),
            currency: pfCurrency.trim().toUpperCase() || "MXN",
            stockOnHand: Math.round(stock),
            active: true,
          }),
        },
      )
      setFormDetail((prev) => (prev ? { ...prev, variants: list } : prev))
      setNewVarSku("")
      setNewVarName("")
      setNewVarPrice("")
      setNewVarStock("0")
      await loadCatalog()
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "No se pudo crear la variante.")
    } finally {
      setVariantBusy(false)
    }
  }

  async function removeVariant(variantId: number) {
    if (formProductId == null) return
    if (!confirm("¿Eliminar esta variante?")) return
    setVariantBusy(true)
    setFormError("")
    try {
      const list = await apiFetch<ProductVariantResponse[]>(
        `/api/admin/catalog/products/${formProductId}/variants/${variantId}`,
        { method: "DELETE", requireAuth: true },
      )
      setFormDetail((prev) => (prev ? { ...prev, variants: list } : prev))
      await loadCatalog()
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "No se pudo eliminar la variante.")
    } finally {
      setVariantBusy(false)
    }
  }

  async function applyStock(variantId: number, movementType: "IN" | "OUT") {
    const raw = (stockQty[variantId] ?? "").trim()
    const qty = Number(raw)
    if (!Number.isFinite(qty) || qty < 1) {
      setFormError("Indica una cantidad entera ≥ 1.")
      return
    }
    setVariantBusy(true)
    setFormError("")
    try {
      await apiFetch(`/api/admin/inventory/adjust`, {
        method: "POST",
        requireAuth: true,
        body: JSON.stringify({
          variantId,
          movementType,
          quantity: Math.round(qty),
          reason: `ADMIN_PANEL_${movementType}`,
        }),
      })
      if (formProductId != null) {
        const d = await fetchAdminProduct(formProductId)
        setFormDetail(d)
      }
      setStockQty((s) => ({ ...s, [variantId]: "" }))
      await loadCatalog()
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "No se pudo ajustar el stock.")
    } finally {
      setVariantBusy(false)
    }
  }

  if (authLoading) {
    return <p className="text-sm text-muted-foreground">Cargando…</p>
  }
  if (!isAuthenticated || !isAdmin) {
    return null
  }

  return (
    <>
      {catalogError && (
        <div className="mb-4 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {catalogError}
        </div>
      )}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Input
          placeholder="Buscar por nombre o slug…"
          value={productSearch}
          onChange={(e) => setProductSearch(e.target.value)}
          className="w-full bg-secondary text-foreground border-border placeholder:text-muted-foreground sm:max-w-xs"
        />
        <Button
          type="button"
          className="bg-primary text-primary-foreground hover:bg-primary/90 w-fit"
          onClick={() => openCreate()}
        >
          <Plus className="mr-2 h-4 w-4" />
          Nuevo producto
        </Button>
      </div>
      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-secondary/50">
              <TableHead className="text-muted-foreground">Producto</TableHead>
              <TableHead className="text-muted-foreground">Precio</TableHead>
              <TableHead className="text-muted-foreground">Activo</TableHead>
              <TableHead className="text-muted-foreground">Categoría</TableHead>
              <TableHead className="text-muted-foreground text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {catalogLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Cargando catálogo…
                  </span>
                </TableCell>
              </TableRow>
            ) : products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                  No hay productos que coincidan.
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <TableRow key={product.id} className="border-border hover:bg-secondary/50">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-secondary">
                        <Image
                          src={product.mainImageUrl || "/placeholder.svg"}
                          alt={product.name}
                          fill
                          className="object-cover"
                          sizes="40px"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">{product.name}</p>
                        <p className="text-[10px] text-muted-foreground">{product.slug}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-foreground whitespace-nowrap">
                    {formatPrice(product.basePriceCents, product.currency)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={product.active}
                        disabled={activeToggleId === product.id}
                        className="data-[state=checked]:bg-primary"
                        onCheckedChange={(checked) => void setProductActive(product.id, checked)}
                      />
                      <Badge variant="outline" className="border-border text-muted-foreground text-[10px]">
                        {product.active ? "visible" : "oculto"}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground capitalize">
                    {product.categorySlug ?? "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-foreground h-8 w-8"
                        title="Ver detalle"
                        onClick={() => void openView(product.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-foreground h-8 w-8"
                        title="Editar"
                        onClick={() => void openEdit(product.id)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        disabled={deletingId === product.id}
                        className="text-muted-foreground hover:text-destructive h-8 w-8"
                        title="Eliminar"
                        onClick={() => void deleteProduct(product.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog
        open={viewOpen}
        onOpenChange={(open) => {
          setViewOpen(open)
          if (!open) {
            setViewDetail(null)
            setViewError("")
          }
        }}
      >
        <DialogContent className={dialogShellClass()}>
          <div className="shrink-0 border-b border-border px-6 pb-4 pt-6 pr-14">
            <DialogHeader>
              <DialogTitle>Detalle del producto</DialogTitle>
            </DialogHeader>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-4 text-sm">
            {viewLoading && (
              <p className="text-muted-foreground inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Cargando…
              </p>
            )}
            {viewError && <p className="text-destructive">{viewError}</p>}
            {viewDetail && !viewLoading && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{viewDetail.name}</h3>
                  <p className="text-xs text-muted-foreground font-mono">{viewDetail.slug}</p>
                  <p className="mt-2 text-muted-foreground">{viewDetail.description || "Sin descripción."}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Badge variant="outline">{viewDetail.active ? "Activo" : "Inactivo"}</Badge>
                    <Badge variant="outline">
                      Base {formatPrice(viewDetail.basePriceCents, viewDetail.currency)}
                    </Badge>
                    {viewDetail.artist ? (
                      <Badge variant="outline">Artista: {viewDetail.artist.name}</Badge>
                    ) : null}
                    {viewDetail.category ? (
                      <Badge variant="outline">Categoría: {viewDetail.category.name}</Badge>
                    ) : null}
                  </div>
                </div>
                {viewDetail.images.length > 0 ? (
                  <div>
                    <p className="mb-2 font-medium text-foreground">Imágenes</p>
                    <ul className="space-y-1 text-xs text-muted-foreground">
                      {viewDetail.images.map((im) => (
                        <li key={im.id} className="truncate">
                          {im.sortOrder}: {im.url}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                <div>
                  <p className="mb-2 font-medium text-foreground">Variantes</p>
                  {viewDetail.variants.length === 0 ? (
                    <p className="text-muted-foreground">Sin variantes.</p>
                  ) : (
                    <div className="rounded-md border border-border overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-muted-foreground">SKU</TableHead>
                            <TableHead className="text-muted-foreground">Nombre</TableHead>
                            <TableHead className="text-muted-foreground">Precio</TableHead>
                            <TableHead className="text-muted-foreground">Stock</TableHead>
                            <TableHead className="text-muted-foreground">Activa</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {viewDetail.variants.map((v) => (
                            <TableRow key={v.id}>
                              <TableCell className="font-mono text-xs">{v.sku}</TableCell>
                              <TableCell>{v.variantName || "—"}</TableCell>
                              <TableCell>{formatPrice(v.priceCents, v.currency)}</TableCell>
                              <TableCell>{v.stockOnHand}</TableCell>
                              <TableCell>{v.active ? "Sí" : "No"}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open)
          if (!open) {
            resetCreateForm()
            setFormLoading(false)
            setFormSaving(false)
          }
        }}
      >
        <DialogContent className={dialogShellClass()}>
          <div className="shrink-0 border-b border-border px-6 pb-4 pt-6 pr-14">
            <DialogHeader>
              <DialogTitle>{formMode === "create" ? "Nuevo producto" : "Editar producto"}</DialogTitle>
            </DialogHeader>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-4">
            {formLoading ? (
              <p className="text-sm text-muted-foreground inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Cargando…
              </p>
            ) : (
              <div className="space-y-4 text-sm">
                {formError ? <p className="text-destructive">{formError}</p> : null}
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="pf-name">Nombre</Label>
                    <Input
                      id="pf-name"
                      value={pfName}
                      onChange={(e) => setPfName(e.target.value)}
                      className="bg-secondary border-border text-foreground"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pf-slug">Slug (opcional)</Label>
                    <Input
                      id="pf-slug"
                      value={pfSlug}
                      onChange={(e) => setPfSlug(e.target.value)}
                      className="bg-secondary border-border text-foreground"
                      placeholder="auto desde nombre"
                    />
                  </div>
                  <div className="space-y-2 flex items-end pb-1">
                    <div className="flex items-center gap-2">
                      <Switch checked={pfActive} onCheckedChange={setPfActive} className="data-[state=checked]:bg-primary" />
                      <span className="text-muted-foreground">Visible en tienda</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pf-price">Precio base (centavos)</Label>
                    <Input
                      id="pf-price"
                      type="number"
                      min={0}
                      value={pfBasePrice}
                      onChange={(e) => setPfBasePrice(e.target.value)}
                      className="bg-secondary border-border text-foreground"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pf-cur">Moneda</Label>
                    <Input
                      id="pf-cur"
                      value={pfCurrency}
                      maxLength={3}
                      onChange={(e) => setPfCurrency(e.target.value.toUpperCase())}
                      className="bg-secondary border-border text-foreground"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Artista</Label>
                    <Select value={pfArtistId || "__none__"} onValueChange={(v) => setPfArtistId(v === "__none__" ? "" : v)}>
                      <SelectTrigger className="bg-secondary border-border text-foreground">
                        <SelectValue placeholder="Ninguno" />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border text-foreground">
                        <SelectItem value="__none__">Ninguno</SelectItem>
                        {metaArtists.map((a) => (
                          <SelectItem key={a.id} value={String(a.id)}>
                            {a.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Categoría</Label>
                    <Select value={pfCategoryId || "__none__"} onValueChange={(v) => setPfCategoryId(v === "__none__" ? "" : v)}>
                      <SelectTrigger className="bg-secondary border-border text-foreground">
                        <SelectValue placeholder="Ninguna" />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border text-foreground">
                        <SelectItem value="__none__">Ninguna</SelectItem>
                        {metaCategories.map((c) => (
                          <SelectItem key={c.id} value={String(c.id)}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="pf-desc">Descripción</Label>
                    <Textarea
                      id="pf-desc"
                      value={pfDesc}
                      onChange={(e) => setPfDesc(e.target.value)}
                      rows={4}
                      className="bg-secondary border-border text-foreground resize-y"
                    />
                  </div>
                </div>

                {formMode === "create" ? (
                  <div className="rounded-lg border border-border bg-secondary/30 p-4 space-y-3">
                    <p className="text-xs font-medium text-foreground">Primera variante (opcional)</p>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <div className="space-y-1">
                        <Label className="text-xs">SKU</Label>
                        <Input
                          value={createVarSku}
                          onChange={(e) => setCreateVarSku(e.target.value)}
                          className="bg-secondary border-border h-8 text-xs"
                          placeholder="PR-RED-S"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Nombre variante</Label>
                        <Input
                          value={createVarName}
                          onChange={(e) => setCreateVarName(e.target.value)}
                          className="bg-secondary border-border h-8 text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Precio (centavos)</Label>
                        <Input
                          type="number"
                          min={0}
                          value={createVarPrice}
                          onChange={(e) => setCreateVarPrice(e.target.value)}
                          className="bg-secondary border-border h-8 text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Stock inicial</Label>
                        <Input
                          type="number"
                          min={0}
                          value={createVarStock}
                          onChange={(e) => setCreateVarStock(e.target.value)}
                          className="bg-secondary border-border h-8 text-xs"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 rounded-lg border border-border bg-secondary/20 p-4">
                    <p className="text-sm font-medium text-foreground">Variantes</p>
                    {formDetail && formDetail.variants.length > 0 ? (
                      <div className="space-y-3">
                        {formDetail.variants.map((v) => (
                          <div
                            key={v.id}
                            className="flex flex-col gap-2 rounded-md border border-border bg-card p-3 text-xs sm:flex-row sm:flex-wrap sm:items-end sm:justify-between"
                          >
                            <div className="min-w-0">
                              <p className="font-mono font-semibold text-foreground">{v.sku}</p>
                              <p className="text-muted-foreground">{v.variantName || "—"}</p>
                              <p className="text-muted-foreground">
                                {formatPrice(v.priceCents, v.currency)} · stock {v.stockOnHand}{" "}
                                {v.active ? "" : "(inactiva)"}
                              </p>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                              <Input
                                className="h-8 w-20 bg-secondary border-border"
                                placeholder="Cant."
                                value={stockQty[v.id] ?? ""}
                                onChange={(e) =>
                                  setStockQty((prev) => ({ ...prev, [v.id]: e.target.value }))
                                }
                              />
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                className="h-8 border-border"
                                disabled={variantBusy}
                                onClick={() => void applyStock(v.id, "IN")}
                              >
                                Entrada
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                className="h-8 border-border"
                                disabled={variantBusy}
                                onClick={() => void applyStock(v.id, "OUT")}
                              >
                                Salida
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                className="h-8 text-destructive hover:text-destructive"
                                disabled={variantBusy}
                                onClick={() => void removeVariant(v.id)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">Sin variantes aún.</p>
                    )}
                    <div className="grid gap-2 border-t border-border pt-3 sm:grid-cols-4">
                      <Input
                        placeholder="SKU nuevo"
                        value={newVarSku}
                        onChange={(e) => setNewVarSku(e.target.value)}
                        className="bg-secondary border-border h-8 text-xs sm:col-span-1"
                      />
                      <Input
                        placeholder="Nombre"
                        value={newVarName}
                        onChange={(e) => setNewVarName(e.target.value)}
                        className="bg-secondary border-border h-8 text-xs"
                      />
                      <Input
                        type="number"
                        placeholder="Precio ¢"
                        value={newVarPrice}
                        onChange={(e) => setNewVarPrice(e.target.value)}
                        className="bg-secondary border-border h-8 text-xs"
                      />
                      <div className="flex gap-2 sm:col-span-1">
                        <Input
                          type="number"
                          placeholder="Stock"
                          value={newVarStock}
                          onChange={(e) => setNewVarStock(e.target.value)}
                          className="bg-secondary border-border h-8 text-xs flex-1"
                        />
                        <Button
                          type="button"
                          size="sm"
                          className="h-8 shrink-0 bg-primary text-primary-foreground"
                          disabled={variantBusy}
                          onClick={() => void addVariant()}
                        >
                          Añadir
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-2 border-t border-border pt-4">
                  <Button type="button" variant="outline" className="border-border" onClick={() => setFormOpen(false)}>
                    Cancelar
                  </Button>
                  <Button
                    type="button"
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                    disabled={formSaving}
                    onClick={() => void saveProduct()}
                  >
                    {formSaving ? "Guardando…" : formMode === "create" ? "Crear" : "Guardar"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
