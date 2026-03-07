import { Suspense } from "react"
import { ShopContent } from "@/components/shop/shop-content"

export const metadata = {
  title: "Tienda | Cherry Twins",
  description: "Explora toda la coleccion de streetwear Cherry Twins. Hoodies, playeras, accesorios y mas.",
}

export default function ShopPage() {
  return (
    <Suspense fallback={<ShopSkeleton />}>
      <ShopContent />
    </Suspense>
  )
}

function ShopSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
      <div className="h-8 w-48 animate-pulse rounded bg-secondary mb-8" />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-3">
            <div className="aspect-square animate-pulse rounded-lg bg-secondary" />
            <div className="h-4 w-3/4 animate-pulse rounded bg-secondary" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-secondary" />
          </div>
        ))}
      </div>
    </div>
  )
}
