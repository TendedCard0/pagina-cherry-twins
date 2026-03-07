import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { sql } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { getCart } from '@/lib/data/cart'

export async function POST(request: Request) {
  try {
    const {
      cartId,
      email,
      shippingAddress,
      subtotalCents,
      shippingCents,
      taxCents,
      totalCents,
    } = await request.json()

    // Validate cart
    const cart = await getCart(cartId)
    if (!cart || cart.items.length === 0) {
      return NextResponse.json(
        { error: 'Cart is empty or not found' },
        { status: 400 }
      )
    }

    // Get user if logged in
    const session = await getSession()
    const userId = session?.userId || null

    // Create shipping address
    const addressResult = await sql`
      INSERT INTO addresses (
        user_id, 
        recipient_name, 
        line1, 
        line2, 
        city, 
        state, 
        postal_code, 
        country,
        label
      )
      VALUES (
        ${userId},
        ${`${shippingAddress.firstName} ${shippingAddress.lastName}`},
        ${shippingAddress.address},
        ${shippingAddress.apartment || null},
        ${shippingAddress.city},
        ${shippingAddress.state},
        ${shippingAddress.zipCode},
        'US',
        'Shipping'
      )
      RETURNING id
    `
    const shippingAddressId = addressResult[0].id

    // Create order
    const orderResult = await sql`
      INSERT INTO orders (
        user_id,
        status,
        currency,
        subtotal_cents,
        discount_cents,
        shipping_cents,
        tax_cents,
        total_cents,
        shipping_address_id,
        billing_address_id,
        placed_at
      )
      VALUES (
        ${userId},
        'PAID',
        'USD',
        ${subtotalCents},
        0,
        ${shippingCents},
        ${taxCents},
        ${totalCents},
        ${shippingAddressId},
        ${shippingAddressId},
        NOW()
      )
      RETURNING id
    `
    const orderId = orderResult[0].id

    // Create order items and reduce inventory
    for (const item of cart.items) {
      await sql`
        INSERT INTO order_items (
          order_id,
          variant_id,
          product_name,
          variant_snapshot,
          sku,
          unit_price_cents,
          quantity,
          line_total_cents
        )
        VALUES (
          ${orderId},
          ${item.variant.id},
          ${item.variant.product.name},
          ${JSON.stringify(item.variant.attributes)},
          ${item.variant.sku},
          ${item.variant.price_cents},
          ${item.quantity},
          ${item.variant.price_cents * item.quantity}
        )
      `

      // Reduce stock
      await sql`
        UPDATE product_variants 
        SET stock_on_hand = stock_on_hand - ${item.quantity}
        WHERE id = ${item.variant.id}
      `

      // Create inventory movement record
      await sql`
        INSERT INTO inventory_movements (variant_id, movement_type, quantity, reason, reference_id)
        VALUES (${item.variant.id}, 'OUT', ${-item.quantity}, 'Order placed', ${`ORDER-${orderId}`})
      `
    }

    // Create payment record (simulated)
    await sql`
      INSERT INTO payments (order_id, provider, provider_ref, status, amount_cents, currency, paid_at)
      VALUES (${orderId}, 'demo', ${'DEMO-' + Date.now()}, 'CAPTURED', ${totalCents}, 'USD', NOW())
    `

    // Create shipment record
    await sql`
      INSERT INTO shipments (order_id, status)
      VALUES (${orderId}, 'PENDING')
    `

    // Mark cart as checked out
    await sql`
      UPDATE carts SET status = 'CHECKED_OUT' WHERE id = ${cartId}
    `

    // Clear cart cookie
    const cookieStore = await cookies()
    cookieStore.delete('cart_id')

    return NextResponse.json({ success: true, orderId })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'Checkout failed' },
      { status: 500 }
    )
  }
}
