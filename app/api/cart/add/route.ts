import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const { variantId, quantity } = await request.json()

    if (!variantId || !quantity || quantity < 1) {
      return NextResponse.json(
        { error: 'Invalid request' },
        { status: 400 }
      )
    }

    // Check variant exists and has stock
    const variant = await sql`
      SELECT id, stock_on_hand FROM product_variants
      WHERE id = ${variantId} AND is_active = true
    `

    if (variant.length === 0) {
      return NextResponse.json(
        { error: 'Product variant not found' },
        { status: 404 }
      )
    }

    if (variant[0].stock_on_hand < quantity) {
      return NextResponse.json(
        { error: 'Not enough stock available' },
        { status: 400 }
      )
    }

    // Get or create cart
    const cookieStore = await cookies()
    const cartIdCookie = cookieStore.get('cart_id')
    let cartId: number

    if (cartIdCookie) {
      cartId = parseInt(cartIdCookie.value)
      // Verify cart exists and is active
      const existingCart = await sql`
        SELECT id FROM carts WHERE id = ${cartId} AND status = 'ACTIVE'
      `
      if (existingCart.length === 0) {
        // Cart doesn't exist or is not active, create new one
        const newCart = await sql`
          INSERT INTO carts (status) VALUES ('ACTIVE') RETURNING id
        `
        cartId = newCart[0].id
      }
    } else {
      // Create new cart
      const newCart = await sql`
        INSERT INTO carts (status) VALUES ('ACTIVE') RETURNING id
      `
      cartId = newCart[0].id
    }

    // Check if item already in cart
    const existingItem = await sql`
      SELECT id, quantity FROM cart_items
      WHERE cart_id = ${cartId} AND variant_id = ${variantId}
    `

    if (existingItem.length > 0) {
      // Update quantity
      const newQuantity = existingItem[0].quantity + quantity
      if (newQuantity > variant[0].stock_on_hand) {
        return NextResponse.json(
          { error: 'Not enough stock available' },
          { status: 400 }
        )
      }

      await sql`
        UPDATE cart_items 
        SET quantity = ${newQuantity}
        WHERE id = ${existingItem[0].id}
      `
    } else {
      // Add new item
      await sql`
        INSERT INTO cart_items (cart_id, variant_id, quantity)
        VALUES (${cartId}, ${variantId}, ${quantity})
      `
    }

    // Set cart cookie
    const response = NextResponse.json({ success: true, cartId })
    response.cookies.set('cart_id', cartId.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Error adding to cart:', error)
    return NextResponse.json(
      { error: 'Failed to add to cart' },
      { status: 500 }
    )
  }
}
