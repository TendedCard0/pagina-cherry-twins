import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { CheckCircle, Package, ArrowRight } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { sql } from '@/lib/db'
import { formatPrice } from '@/lib/types'

interface OrderConfirmationPageProps {
  params: Promise<{ orderId: string }>
}

async function getOrderDetails(orderId: number) {
  const orderResult = await sql`
    SELECT 
      o.*,
      a.recipient_name,
      a.line1,
      a.line2,
      a.city,
      a.state,
      a.postal_code,
      a.country
    FROM orders o
    LEFT JOIN addresses a ON o.shipping_address_id = a.id
    WHERE o.id = ${orderId}
  `

  if (orderResult.length === 0) return null

  const order = orderResult[0]

  const items = await sql`
    SELECT 
      oi.*,
      pi.url as image_url,
      pi.alt_text as image_alt
    FROM order_items oi
    LEFT JOIN product_variants pv ON oi.variant_id = pv.id
    LEFT JOIN LATERAL (
      SELECT url, alt_text 
      FROM product_images 
      WHERE product_id = pv.product_id 
      ORDER BY sort_order 
      LIMIT 1
    ) pi ON true
    WHERE oi.order_id = ${orderId}
  `

  return { order, items }
}

export default async function OrderConfirmationPage({ params }: OrderConfirmationPageProps) {
  const { orderId } = await params
  const orderIdNum = parseInt(orderId)

  if (isNaN(orderIdNum)) {
    notFound()
  }

  const data = await getOrderDetails(orderIdNum)

  if (!data) {
    notFound()
  }

  const { order, items } = data

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
          {/* Success Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-6">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="font-[family-name:var(--font-heading)] text-3xl font-bold">
              Order Confirmed!
            </h1>
            <p className="mt-2 text-muted-foreground">
              Thank you for your order. We&apos;ll send you a confirmation email shortly.
            </p>
            <p className="mt-4 text-sm">
              Order number: <span className="font-semibold">#{order.id}</span>
            </p>
          </div>

          {/* Order Details */}
          <div className="bg-secondary/30 rounded-lg p-6 mb-8">
            <h2 className="font-semibold mb-4">Order Details</h2>
            
            {/* Items */}
            <div className="space-y-4 mb-6">
              {items.map((item: Record<string, unknown>) => (
                <div key={item.id as number} className="flex gap-4">
                  <div className="relative h-16 w-14 flex-shrink-0 rounded-md bg-muted overflow-hidden">
                    {item.image_url && (
                      <Image
                        src={item.image_url as string}
                        alt={(item.image_alt as string) || (item.product_name as string)}
                        fill
                        className="object-cover object-center"
                        sizes="56px"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{item.product_name as string}</p>
                    <p className="text-xs text-muted-foreground">Qty: {item.quantity as number}</p>
                  </div>
                  <p className="text-sm font-medium">
                    {formatPrice(item.line_total_cents as number, 'USD')}
                  </p>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="space-y-2 text-sm border-t border-border pt-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(order.subtotal_cents, 'USD')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>{formatPrice(order.shipping_cents, 'USD')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span>{formatPrice(order.tax_cents, 'USD')}</span>
              </div>
              <div className="flex justify-between font-semibold text-base pt-2 border-t border-border">
                <span>Total</span>
                <span>{formatPrice(order.total_cents, 'USD')}</span>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-secondary/30 rounded-lg p-6 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Package className="h-5 w-5 text-muted-foreground" />
              <h2 className="font-semibold">Shipping Address</h2>
            </div>
            <address className="not-italic text-sm text-muted-foreground">
              <p>{order.recipient_name}</p>
              <p>{order.line1}</p>
              {order.line2 && <p>{order.line2}</p>}
              <p>{order.city}, {order.state} {order.postal_code}</p>
              <p>{order.country}</p>
            </address>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="outline">
              <Link href="/account/orders">
                View All Orders
              </Link>
            </Button>
            <Button asChild>
              <Link href="/shop">
                Continue Shopping
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
