import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const { itemId, quantity } = await request.json()

    if (!itemId || quantity === undefined) {
      return NextResponse.json(
        { error: 'Invalid request' },
        { status: 400 }
      )
    }

    // Get cart item with variant info
    const cartItem = await sql`
      SELECT ci.id, ci.variant_id, pv.stock_on_hand
      FROM cart_items ci
      JOIN product_variants pv ON ci.variant_id = pv.id
      WHERE ci.id = ${itemId}
    `

    if (cartItem.length === 0) {
      return NextResponse.json(
        { error: 'Cart item not found' },
        { status: 404 }
      )
    }

    if (quantity < 1) {
      // Remove item
      await sql`DELETE FROM cart_items WHERE id = ${itemId}`
      return NextResponse.json({ success: true, removed: true })
    }

    if (quantity > cartItem[0].stock_on_hand) {
      return NextResponse.json(
        { error: 'Not enough stock available' },
        { status: 400 }
      )
    }

    await sql`
      UPDATE cart_items SET quantity = ${quantity} WHERE id = ${itemId}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating cart:', error)
    return NextResponse.json(
      { error: 'Failed to update cart' },
      { status: 500 }
    )
  }
}
