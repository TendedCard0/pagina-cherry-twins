"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { API_BASE_URL } from "@/lib/api-config"
import type { ArtistResponse, CategoryResponse, PageResponse, ProductListItemResponse } from "@/lib/catalog-types"
import { ProductCard } from "@/components/product-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { Slider } from "@/components/ui/slider"
import { Separator } from "@/components/ui/separator"
import { SlidersHorizontal, X } from "lucide-react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

const PAGE_SIZE = 12
const MAX_PRICE_CENTS = 500_000

function sortApiValue(ui: string): string | undefined {
  switch (ui) {
    case "price-asc":
      return "price_asc"
    case "price-desc":
      return "price_desc"
    case "newest":
      return "createdAt_desc"
    case "name-asc":
      return "name_asc"
    default:
      return undefined
  }
}

async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    cache: "no-store",
    headers: { Accept: "application/json" },
  })
  if (!res.ok) {
    const t = await res.text().catch(() => "")
    throw new Error(t || `Error ${res.status}`)
  }
  return res.json() as Promise<T>
}

/** Valores como "all" no existen como slug en la API y rompen el listado. */
function normalizeListFilterParam(raw: string | null): string {
  const v = (raw ?? "").trim()
  if (!v || v.toLowerCase() === "all") return "all"
  return v
}

export function ShopContent() {
  const searchParams = useSearchParams()
  const categoryFromUrl = normalizeListFilterParam(searchParams.get("category"))
  const artistFromUrl = normalizeListFilterParam(searchParams.get("artist"))

  const [categories, setCategories] = useState<CategoryResponse[]>([])
  const [artists, setArtists] = useState<ArtistResponse[]>([])
  const [selectedCategory, setSelectedCategory] = useState(categoryFromUrl)
  const [selectedArtist, setSelectedArtist] = useState(artistFromUrl)
  const [sortBy, setSortBy] = useState("relevance")
  const [priceRange, setPriceRange] = useState<[number, number]>([0, MAX_PRICE_CENTS])
  const [searchQ, setSearchQ] = useState("")
  const [debouncedQ, setDebouncedQ] = useState("")
  const [page, setPage] = useState(0)
  const [data, setData] = useState<PageResponse<ProductListItemResponse> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setSelectedCategory(categoryFromUrl)
    setPage(0)
  }, [categoryFromUrl])

  useEffect(() => {
    setSelectedArtist(artistFromUrl)
    setPage(0)
  }, [artistFromUrl])

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(searchQ.trim()), 350)
    return () => clearTimeout(t)
  }, [searchQ])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const [cats, arts] = await Promise.all([
          fetchJson<CategoryResponse[]>("/api/catalog/categories"),
          fetchJson<ArtistResponse[]>("/api/catalog/artists"),
        ])
        if (!cancelled) {
          setCategories(cats)
          setArtists(arts)
        }
      } catch {
        if (!cancelled) {
          setCategories([])
          setArtists([])
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const loadProducts = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const sp = new URLSearchParams()
      sp.set("page", String(page))
      sp.set("size", String(PAGE_SIZE))
      if (debouncedQ) sp.set("q", debouncedQ)
      if (selectedCategory !== "all") sp.set("category", selectedCategory)
      if (selectedArtist !== "all") sp.set("artist", selectedArtist)
      if (priceRange[0] > 0) sp.set("minPriceCents", String(priceRange[0]))
      if (priceRange[1] < MAX_PRICE_CENTS) sp.set("maxPriceCents", String(priceRange[1]))
      const sort = sortApiValue(sortBy)
      if (sort) sp.set("sort", sort)
      const res = await fetchJson<PageResponse<ProductListItemResponse>>(
        `/api/catalog/products?${sp.toString()}`
      )
      setData(res)
    } catch (e) {
      setData(null)
      setError(e instanceof Error ? e.message : "Error de red")
    } finally {
      setLoading(false)
    }
  }, [page, debouncedQ, selectedCategory, selectedArtist, priceRange, sortBy])

  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  const totalPages = data?.totalPages ?? 0
  const items = data?.content ?? []
  const totalElements = data?.totalElements ?? 0

  const categoryButtons = useMemo((): (CategoryResponse & { listLabel: string })[] => {
    const byId = new Map(categories.map((c) => [c.id, c]))
    return [...categories]
      .sort((a, b) => a.name.localeCompare(b.name, "es", { sensitivity: "base" }))
      .map((c) => ({
        ...c,
        listLabel:
          c.parentId != null && byId.has(c.parentId)
            ? `${byId.get(c.parentId)!.name} › ${c.name}`
            : c.name,
      }))
  }, [categories])

  function clearFilters() {
    setSelectedCategory("all")
    setSelectedArtist("all")
    setSortBy("relevance")
    setPriceRange([0, MAX_PRICE_CENTS])
    setSearchQ("")
    setDebouncedQ("")
    setPage(0)
  }

  const FiltersContent = (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-widest text-foreground">Buscar</h3>
        <Input
          value={searchQ}
          onChange={(e) => {
            setSearchQ(e.target.value)
            setPage(0)
          }}
          placeholder="Nombre o slug..."
          className="bg-secondary text-foreground border-border placeholder:text-muted-foreground"
        />
      </div>
      <Separator className="bg-border" />
      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-widest text-foreground">Categoria</h3>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => {
              setSelectedCategory("all")
              setPage(0)
            }}
            className={`text-left text-sm transition-colors ${selectedCategory === "all" ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground"}`}
          >
            Todas
          </button>
          {categoryButtons.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                setSelectedCategory(cat.slug)
                setPage(0)
              }}
              className={`text-left text-sm transition-colors ${selectedCategory === cat.slug ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground"}`}
            >
              {cat.listLabel}
            </button>
          ))}
        </div>
      </div>
      <Separator className="bg-border" />
      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-widest text-foreground">Artista</h3>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => {
              setSelectedArtist("all")
              setPage(0)
            }}
            className={`text-left text-sm transition-colors ${selectedArtist === "all" ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground"}`}
          >
            Todos
          </button>
          {artists.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => {
                setSelectedArtist(a.slug)
                setPage(0)
              }}
              className={`text-left text-sm transition-colors ${selectedArtist === a.slug ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground"}`}
            >
              {a.name}
            </button>
          ))}
        </div>
      </div>
      <Separator className="bg-border" />
      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-widest text-foreground">Precio (centavos)</h3>
        <Slider
          value={priceRange}
          onValueChange={(v) => {
            setPriceRange(v as [number, number])
            setPage(0)
          }}
          max={MAX_PRICE_CENTS}
          step={1000}
          className="mb-2"
        />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{priceRange[0]}</span>
          <span>{priceRange[1]}</span>
        </div>
      </div>
      <Separator className="bg-border" />
      <Button variant="outline" onClick={clearFilters} className="border-border text-foreground hover:bg-secondary">
        <X className="mr-2 h-4 w-4" />
        Limpiar filtros
      </Button>
    </div>
  )

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/" className="text-muted-foreground hover:text-foreground">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator className="text-muted-foreground" />
          <BreadcrumbItem>
            <BreadcrumbPage className="text-foreground">Tienda</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Tienda</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {loading ? "Cargando…" : `${totalElements} productos`}
          </p>
          {error && (
            <p className="mt-2 text-sm text-destructive">
              {error} — API: {API_BASE_URL}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="border-border text-foreground hover:bg-secondary lg:hidden">
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                Filtros
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] bg-background border-border">
              <SheetTitle className="text-foreground mb-6">Filtros</SheetTitle>
              {FiltersContent}
            </SheetContent>
          </Sheet>

          <Select
            value={sortBy}
            onValueChange={(v) => {
              setSortBy(v)
              setPage(0)
            }}
          >
            <SelectTrigger className="w-[200px] bg-secondary text-foreground border-border">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent className="bg-card text-foreground border-border">
              <SelectItem value="relevance">Mas recientes</SelectItem>
              <SelectItem value="price-asc">Precio: menor a mayor</SelectItem>
              <SelectItem value="price-desc">Precio: mayor a menor</SelectItem>
              <SelectItem value="newest">Nuevos</SelectItem>
              <SelectItem value="name-asc">Nombre A-Z</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex gap-8">
        <aside className="hidden w-[240px] shrink-0 lg:block">{FiltersContent}</aside>

        <div className="flex-1">
          {loading && items.length === 0 ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-3">
                  <div className="aspect-square animate-pulse rounded-lg bg-secondary" />
                  <div className="h-4 w-3/4 animate-pulse rounded bg-secondary" />
                </div>
              ))}
            </div>
          ) : items.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:gap-6">
              {items.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="text-lg font-medium text-foreground">No se encontraron productos</p>
              <p className="mt-1 text-sm text-muted-foreground">Intenta ajustar los filtros o verifica la API.</p>
              <Button variant="outline" onClick={clearFilters} className="mt-4 border-border text-foreground">
                Limpiar filtros
              </Button>
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 0 || loading}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                className="border-border text-foreground hover:bg-secondary disabled:opacity-50"
              >
                Anterior
              </Button>
              <span className="text-sm text-muted-foreground px-2">
                {page + 1} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages - 1 || loading}
                onClick={() => setPage((p) => p + 1)}
                className="border-border text-foreground hover:bg-secondary disabled:opacity-50"
              >
                Siguiente
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
