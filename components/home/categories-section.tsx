import Link from "next/link"
import { listCategories } from "@/lib/catalog-api"

function hueFromSlug(slug: string): number {
  let h = 0
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) % 360
  return h
}

export async function CategoriesSection() {
  let categories: Awaited<ReturnType<typeof listCategories>> = []
  try {
    categories = await listCategories()
  } catch {
    categories = []
  }

  const byId = new Map(categories.map((c) => [c.id, c]))
  const display = [...categories].sort((a, b) =>
    a.name.localeCompare(b.name, "es", { sensitivity: "base" })
  )

  return (
    <section className="mx-auto max-w-7xl px-4 py-20 lg:px-8">
      <div className="mb-10">
        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.3em] text-primary">
          Categorias
        </p>
        <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Explora por estilo
        </h2>
      </div>
      {display.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No hay categorías en la base de datos.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {display.map((cat) => {
            const hue = hueFromSlug(cat.slug)
            const subtitle =
              cat.parentId != null && byId.has(cat.parentId)
                ? `Dentro de ${byId.get(cat.parentId)!.name}`
                : "Ver productos"
            return (
              <Link
                key={cat.id}
                href={`/shop?category=${encodeURIComponent(cat.slug)}`}
                className="group relative flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-lg p-6"
                style={{
                  background: `linear-gradient(145deg, hsl(${hue} 45% 18%) 0%, hsl(${hue} 35% 8%) 100%)`,
                }}
              >
                <div className="absolute inset-0 bg-background/40 transition-colors group-hover:bg-background/25" />
                <div className="relative z-10">
                  <h3 className="text-xl font-bold text-foreground">{cat.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </section>
  )
}
