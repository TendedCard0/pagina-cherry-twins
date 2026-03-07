import { sql } from '@/lib/db'
import type { Product, ProductWithDetails, Category, Artist, ProductImage, ProductVariant } from '@/lib/types'

export interface ProductListItem {
  id: number
  name: string
  slug: string
  base_price_cents: number
  currency: string
  artist_name: string | null
  category_name: string | null
  image_url: string | null
  image_alt: string | null
}

export async function getProducts(options?: {
  categorySlug?: string
  artistSlug?: string
  limit?: number
  offset?: number
}): Promise<ProductListItem[]> {
  const { categorySlug, artistSlug, limit = 20, offset = 0 } = options || {}
  
  let query = `
    SELECT 
      p.id,
      p.name,
      p.slug,
      p.base_price_cents,
      p.currency,
      a.name as artist_name,
      c.name as category_name,
      pi.url as image_url,
      pi.alt_text as image_alt
    FROM products p
    LEFT JOIN artists a ON p.artist_id = a.id
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN LATERAL (
      SELECT url, alt_text 
      FROM product_images 
      WHERE product_id = p.id 
      ORDER BY sort_order 
      LIMIT 1
    ) pi ON true
    WHERE p.is_active = true
  `

  const params: (string | number)[] = []
  let paramIndex = 1

  if (categorySlug) {
    query += ` AND c.slug = $${paramIndex}`
    params.push(categorySlug)
    paramIndex++
  }

  if (artistSlug) {
    query += ` AND a.slug = $${paramIndex}`
    params.push(artistSlug)
    paramIndex++
  }

  query += ` ORDER BY p.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`
  params.push(limit, offset)

  const result = await sql(query, params)
  return result as ProductListItem[]
}

export async function getFeaturedProducts(limit: number = 8): Promise<ProductListItem[]> {
  const result = await sql`
    SELECT 
      p.id,
      p.name,
      p.slug,
      p.base_price_cents,
      p.currency,
      a.name as artist_name,
      c.name as category_name,
      pi.url as image_url,
      pi.alt_text as image_alt
    FROM products p
    LEFT JOIN artists a ON p.artist_id = a.id
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN LATERAL (
      SELECT url, alt_text 
      FROM product_images 
      WHERE product_id = p.id 
      ORDER BY sort_order 
      LIMIT 1
    ) pi ON true
    WHERE p.is_active = true
    ORDER BY p.created_at DESC
    LIMIT ${limit}
  `
  return result as ProductListItem[]
}

export async function getProductBySlug(slug: string): Promise<ProductWithDetails | null> {
  const productResult = await sql`
    SELECT 
      p.*,
      a.id as artist_id,
      a.name as artist_name,
      a.slug as artist_slug,
      a.bio as artist_bio,
      c.id as category_id,
      c.name as category_name,
      c.slug as category_slug
    FROM products p
    LEFT JOIN artists a ON p.artist_id = a.id
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.slug = ${slug} AND p.is_active = true
    LIMIT 1
  `

  if (productResult.length === 0) return null

  const productRow = productResult[0]

  const [images, variants] = await Promise.all([
    sql`
      SELECT * FROM product_images 
      WHERE product_id = ${productRow.id} 
      ORDER BY sort_order
    `,
    sql`
      SELECT * FROM product_variants 
      WHERE product_id = ${productRow.id} AND is_active = true
      ORDER BY price_cents
    `,
  ])

  const product: ProductWithDetails = {
    id: productRow.id,
    artist_id: productRow.artist_id,
    category_id: productRow.category_id,
    name: productRow.name,
    slug: productRow.slug,
    description: productRow.description,
    is_active: productRow.is_active,
    base_price_cents: productRow.base_price_cents,
    currency: productRow.currency,
    created_at: productRow.created_at,
    updated_at: productRow.updated_at,
    artist: productRow.artist_id ? {
      id: productRow.artist_id,
      name: productRow.artist_name,
      slug: productRow.artist_slug,
      bio: productRow.artist_bio,
      created_at: new Date(),
      updated_at: new Date(),
    } : null,
    category: productRow.category_id ? {
      id: productRow.category_id,
      name: productRow.category_name,
      slug: productRow.category_slug,
      parent_id: null,
      created_at: new Date(),
      updated_at: new Date(),
    } : null,
    images: images as ProductImage[],
    variants: variants as ProductVariant[],
  }

  return product
}

export async function getCategories(): Promise<Category[]> {
  const result = await sql`
    SELECT * FROM categories 
    ORDER BY name
  `
  return result as Category[]
}

export async function getArtists(): Promise<Artist[]> {
  const result = await sql`
    SELECT * FROM artists 
    ORDER BY name
  `
  return result as Artist[]
}
