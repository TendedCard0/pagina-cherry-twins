import { notFound } from "next/navigation"
import { getProductBySlug, listPublicReviews, listRelatedProducts } from "@/lib/catalog-api"
import { ProductDetail } from "@/components/product/product-detail"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  try {
    const product = await getProductBySlug(slug)
    return {
      title: `${product.name} | Cherry Twins`,
      description: product.description?.slice(0, 160) || product.name,
    }
  } catch {
    return { title: "Producto no encontrado" }
  }
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  let product
  try {
    product = await getProductBySlug(slug)
  } catch {
    notFound()
  }

  const [reviews, related] = await Promise.all([
    listPublicReviews(product.id).catch(() => []),
    listRelatedProducts(product.category?.slug, product.slug, 8).catch(() => []),
  ])

  return <ProductDetail product={product} reviews={reviews} related={related} />
}
