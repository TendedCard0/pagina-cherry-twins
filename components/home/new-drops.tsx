import { listProducts } from "@/lib/catalog-api"
import { ProductCard } from "@/components/product-card"

export async function NewDrops() {
  let items: Awaited<ReturnType<typeof listProducts>>["content"] = []
  try {
    const page = await listProducts({ page: 0, size: 8, sort: "createdAt_desc" })
    items = page.content
  } catch {
    items = []
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-20 lg:px-8">
      <div className="mb-10">
        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.3em] text-primary">
          Recien llegados
        </p>
        <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Drop Reciente
        </h2>
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Sin productos recientes desde la API.
        </p>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4 lg:gap-6 scrollbar-hide">
          {items.map((product) => (
            <div key={product.id} className="min-w-[250px] flex-shrink-0 md:min-w-[280px]">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
