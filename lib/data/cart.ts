import { sql } from '@/lib/db'
import type { CartItemWithProduct } from '@/lib/types'

export interface CartData {
  id: number
  items: CartItemWithProduct[]
  subtotal_cents: number
  item_count: number
}

export async function getCart(cartId: number): Promise<CartData | null> {
  const cart = await sql`
    SELECT id FROM carts WHERE id = ${cartId} AND status = 'ACTIVE'
  `

  if (cart.length === 0) return null

  const items = await sql`
    SELECT 
      ci.id,
      ci.cart_id,
      ci.variant_id,
      ci.quantity,
      ci.created_at,
      ci.updated_at,
      pv.id as variant_id,
      pv.product_id,
      pv.sku,
      pv.variant_name,
      pv.attributes,
      pv.price_cents,
      pv.currency,
      pv.stock_on_hand,
      pv.is_active as variant_is_active,
      p.id as product_id,
      p.name as product_name,
      p.slug as product_slug,
      p.is_active as product_is_active,
      pi.url as image_url,
      pi.alt_text as image_alt
    FROM cart_items ci
    JOIN product_variants pv ON ci.variant_id = pv.id
    JOIN products p ON pv.product_id = p.id
    LEFT JOIN LATERAL (
      SELECT url, alt_text 
      FROM product_images 
      WHERE product_id = p.id 
      ORDER BY sort_order 
      LIMIT 1
    ) pi ON true
    WHERE ci.cart_id = ${cartId}
    ORDER BY ci.created_at DESC
  `

  const cartItems: CartItemWithProduct[] = items.map((item: Record<string, unknown>) => ({
    id: item.id as number,
    cart_id: item.cart_id as number,
    variant_id: item.variant_id as number,
    quantity: item.quantity as number,
    created_at: item.created_at as Date,
    updated_at: item.updated_at as Date,
    variant: {
      id: item.variant_id as number,
      product_id: item.product_id as number,
      sku: item.sku as string,
      variant_name: item.variant_name as string | null,
      attributes: item.attributes as Record<string, string>,
      price_cents: item.price_cents as number,
      currency: item.currency as string,
      stock_on_hand: item.stock_on_hand as number,
      is_active: item.variant_is_active as boolean,
      created_at: item.created_at as Date,
      updated_at: item.updated_at as Date,
      product: {
        id: item.product_id as number,
        artist_id: null,
        category_id: null,
        name: item.product_name as string,
        slug: item.product_slug as string,
        description: null,
        is_active: item.product_is_active as boolean,
        base_price_cents: item.price_cents as number,
        currency: item.currency as string,
        created_at: item.created_at as Date,
        updated_at: item.updated_at as Date,
        images: item.image_url ? [{
          id: 0,
          product_id: item.product_id as number,
          url: item.image_url as string,
          alt_text: item.image_alt as string | null,
          sort_order: 0,
          created_at: new Date(),
        }] : [],
      },
    },
  }))

  const subtotal_cents = cartItems.reduce(
    (sum, item) => sum + item.variant.price_cents * item.quantity,
    0
  )

  const item_count = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  return {
    id: cartId,
    items: cartItems,
    subtotal_cents,
    item_count,
  }
}

export async function updateCartItemQuantity(
  itemId: number,
  quantity: number
): Promise<boolean> {
  if (quantity < 1) {
    await sql`DELETE FROM cart_items WHERE id = ${itemId}`
    return true
  }

  await sql`
    UPDATE cart_items SET quantity = ${quantity} WHERE id = ${itemId}
  `
  return true
}

export async function removeCartItem(itemId: number): Promise<boolean> {
  await sql`DELETE FROM cart_items WHERE id = ${itemId}`
  return true
}
