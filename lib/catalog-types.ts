export interface ArtistResponse {
  id: number
  name: string
  slug: string
  bio: string | null
}

export interface CategoryResponse {
  id: number
  name: string
  slug: string
  parentId: number | null
}

export interface ProductListItemResponse {
  id: number
  name: string
  slug: string
  active: boolean
  basePriceCents: number
  currency: string
  mainImageUrl: string | null
  artistSlug: string | null
  categorySlug: string | null
}

export interface ProductImageResponse {
  id: number
  url: string
  altText: string | null
  sortOrder: number
}

export interface ProductVariantResponse {
  id: number
  sku: string
  variantName: string
  attributes: Record<string, unknown> | null
  priceCents: number
  currency: string
  stockOnHand: number
  active: boolean
}

export interface ProductDetailResponse {
  id: number
  name: string
  slug: string
  description: string | null
  active: boolean
  basePriceCents: number
  currency: string
  artist: ArtistResponse | null
  category: CategoryResponse | null
  images: ProductImageResponse[]
  variants: ProductVariantResponse[]
}

export interface PageResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  last: boolean
}

export interface ReviewResponse {
  id: number
  productId: number
  userId: number
  rating: number
  title: string | null
  comment: string | null
  createdAt: string
}

export interface SpringPage<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}
