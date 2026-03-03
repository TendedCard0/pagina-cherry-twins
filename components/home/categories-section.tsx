import Image from "next/image"
import Link from "next/link"
import { categories } from "@/lib/data"

export function CategoriesSection() {
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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
        {categories.map((cat) => (
          <Link
            key={cat.slug}
            href={`/shop?category=${cat.slug}`}
            className="group relative aspect-[4/5] overflow-hidden rounded-lg"
          >
            <Image
              src={cat.image}
              alt={cat.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
            <div className="absolute inset-0 bg-background/50 transition-colors group-hover:bg-background/40" />
            <div className="relative z-10 flex h-full flex-col items-start justify-end p-6">
              <h3 className="text-xl font-bold text-foreground">{cat.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{cat.count} productos</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
