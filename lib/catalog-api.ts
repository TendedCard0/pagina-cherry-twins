import { API_BASE_URL } from "@/lib/api-config"
import type {
  ArtistResponse,
  CategoryResponse,
  PageResponse,
  ProductDetailResponse,
  ProductListItemResponse,
  ReviewResponse,
  SpringPage,
} from "@/lib/catalog-types"

async function readErrorMessage(res: Response): Promise<string> {
  const ct = res.headers.get("content-type") || ""
  if (ct.includes("application/json")) {
    const body = (await res.json().catch(() => null)) as { message?: string } | null
    if (body && typeof body.message === "string") return body.message
  }
  const text = await res.text().catch(() => "")
  return text || `HTTP ${res.status}`
}

export async function catalogFetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      Accept: "application/json",
      ...init?.headers,
    },
  })
  if (!res.ok) {
    throw new Error(await readErrorMessage(res))
  }
  return res.json() as Promise<T>
}

export function listCategories(): Promise<CategoryResponse[]> {
  return catalogFetchJson<CategoryResponse[]>("/api/catalog/categories")
}

export function listArtists(): Promise<ArtistResponse[]> {
  return catalogFetchJson<ArtistResponse[]>("/api/catalog/artists")
}

export type ListProductsParams = {
  q?: string
  artist?: string
  category?: string
  minPriceCents?: number
  maxPriceCents?: number
  page?: number
  size?: number
  sort?: string
}

export function listProducts(
  params: ListProductsParams = {}
): Promise<PageResponse<ProductListItemResponse>> {
  const sp = new URLSearchParams()
  if (params.q) sp.set("q", params.q)
  if (params.artist) sp.set("artist", params.artist)
  if (params.category) sp.set("category", params.category)
  if (params.minPriceCents != null) sp.set("minPriceCents", String(params.minPriceCents))
  if (params.maxPriceCents != null) sp.set("maxPriceCents", String(params.maxPriceCents))
  sp.set("page", String(params.page ?? 0))
  sp.set("size", String(params.size ?? 20))
  if (params.sort) sp.set("sort", params.sort)
  return catalogFetchJson<PageResponse<ProductListItemResponse>>(
    `/api/catalog/products?${sp.toString()}`
  )
}

export function getProductBySlug(slug: string): Promise<ProductDetailResponse> {
  return catalogFetchJson<ProductDetailResponse>(
    `/api/catalog/products/${encodeURIComponent(slug)}`
  )
}

export async function listPublicReviews(
  productId: number,
  page = 0,
  size = 50
): Promise<ReviewResponse[]> {
  const data = await catalogFetchJson<SpringPage<ReviewResponse>>(
    `/api/catalog/products/${productId}/reviews?page=${page}&size=${size}`
  )
  if (data && Array.isArray(data.content)) return data.content
  return []
}

export async function listRelatedProducts(
  categorySlug: string | null | undefined,
  excludeSlug: string,
  size = 8
): Promise<ProductListItemResponse[]> {
  const take = (page: PageResponse<ProductListItemResponse>) =>
    page.content.filter((p) => p.slug !== excludeSlug).slice(0, size)

  if (categorySlug) {
    try {
      const page = await listProducts({
        category: categorySlug,
        page: 0,
        size: size + 4,
        sort: "createdAt_desc",
      })
      const slice = take(page)
      if (slice.length > 0) return slice
    } catch {
      /* categoría inválida */
    }
  }

  const fallback = await listProducts({
    page: 0,
    size: size + 4,
    sort: "createdAt_desc",
  })
  return take(fallback)
}
