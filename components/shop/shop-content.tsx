"use client"

import { useState, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import { products, categories } from "@/lib/data"
import { ProductCard } from "@/components/product-card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { Checkbox } from "@/components/ui/checkbox"
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

const ITEMS_PER_PAGE = 8

export function ShopContent() {
  const searchParams = useSearchParams()
  const initialCategory = searchParams.get("category") || "all"

  const [selectedCategory, setSelectedCategory] = useState(initialCategory)
  const [sortBy, setSortBy] = useState("relevance")
  const [priceRange, setPriceRange] = useState([0, 2000])
  const [inStockOnly, setInStockOnly] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  const filtered = useMemo(() => {
    let result = [...products]

    if (selectedCategory !== "all") {
      result = result.filter((p) => p.category === selectedCategory)
    }

    result = result.filter((p) => p.price >= priceRange[0] && p.price <= priceRange[1])

    if (inStockOnly) {
      result = result.filter((p) => p.stock > 0)
    }

    switch (sortBy) {
      case "price-asc":
        result.sort((a, b) => a.price - b.price)
        break
      case "price-desc":
        result.sort((a, b) => b.price - a.price)
        break
      case "newest":
        result.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0))
        break
      default:
        result.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0))
    }

    return result
  }, [selectedCategory, sortBy, priceRange, inStockOnly])

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginatedProducts = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  function clearFilters() {
    setSelectedCategory("all")
    setPriceRange([0, 2000])
    setInStockOnly(false)
    setSortBy("relevance")
    setCurrentPage(1)
  }

  const FiltersContent = (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-widest text-foreground">Categoria</h3>
        <div className="flex flex-col gap-2">
          <button
            onClick={() => { setSelectedCategory("all"); setCurrentPage(1) }}
            className={`text-left text-sm transition-colors ${selectedCategory === "all" ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground"}`}
          >
            Todas
          </button>
          {categories.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => { setSelectedCategory(cat.slug); setCurrentPage(1) }}
              className={`text-left text-sm transition-colors ${selectedCategory === cat.slug ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground"}`}
            >
              {cat.name} ({cat.count})
            </button>
          ))}
        </div>
      </div>
      <Separator className="bg-border" />
      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-widest text-foreground">Precio</h3>
        <Slider
          defaultValue={[0, 2000]}
          value={priceRange}
          onValueChange={(v) => { setPriceRange(v); setCurrentPage(1) }}
          max={2000}
          step={50}
          className="mb-2"
        />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>${priceRange[0]}</span>
          <span>${priceRange[1]}</span>
        </div>
      </div>
      <Separator className="bg-border" />
      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-widest text-foreground">Disponibilidad</h3>
        <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
          <Checkbox
            checked={inStockOnly}
            onCheckedChange={(v) => { setInStockOnly(!!v); setCurrentPage(1) }}
          />
          Solo en stock
        </label>
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
      {/* Breadcrumbs */}
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

      {/* Top Bar */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Tienda</h1>
          <p className="mt-1 text-sm text-muted-foreground">{filtered.length} productos</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Mobile Filters */}
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

          <Select value={sortBy} onValueChange={(v) => { setSortBy(v); setCurrentPage(1) }}>
            <SelectTrigger className="w-[180px] bg-secondary text-foreground border-border">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent className="bg-card text-foreground border-border">
              <SelectItem value="relevance">Relevancia</SelectItem>
              <SelectItem value="price-asc">Precio: menor a mayor</SelectItem>
              <SelectItem value="price-desc">Precio: mayor a menor</SelectItem>
              <SelectItem value="newest">Nuevos</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Desktop Sidebar */}
        <aside className="hidden w-[220px] shrink-0 lg:block">
          {FiltersContent}
        </aside>

        {/* Products Grid */}
        <div className="flex-1">
          {paginatedProducts.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:gap-6">
              {paginatedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="text-lg font-medium text-foreground">No se encontraron productos</p>
              <p className="mt-1 text-sm text-muted-foreground">Intenta ajustar los filtros</p>
              <Button variant="outline" onClick={clearFilters} className="mt-4 border-border text-foreground">
                Limpiar filtros
              </Button>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="border-border text-foreground hover:bg-secondary disabled:opacity-50"
              >
                Anterior
              </Button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <Button
                  key={i}
                  variant={currentPage === i + 1 ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(i + 1)}
                  className={currentPage === i + 1
                    ? "bg-primary text-primary-foreground"
                    : "border-border text-foreground hover:bg-secondary"
                  }
                >
                  {i + 1}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
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
