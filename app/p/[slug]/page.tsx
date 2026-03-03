import { notFound } from "next/navigation"
import { getProductBySlug, products } from "@/lib/data"
import { ProductDetail } from "@/components/product/product-detail"

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = getProductBySlug(slug)
  if (!product) return { title: "Producto no encontrado" }
  return {
    title: `${product.name} | Cherry Twins`,
    description: product.description,
  }
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = getProductBySlug(slug)

  if (!product) notFound()

  return <ProductDetail product={product} />
}
