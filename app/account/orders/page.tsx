import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Package, ChevronRight, ArrowLeft } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { getSession } from '@/lib/auth'
import { sql } from '@/lib/db'
import { formatPrice } from '@/lib/types'

export const metadata = {
  title: 'My Orders',
  description: 'View your order history at Cherry Twins.',
}

async function getUserOrders(userId: number) {
  const orders = await sql`
    SELECT 
      o.id,
      o.status,
      o.total_cents,
      o.currency,
      o.placed_at,
      o.created_at,
      (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count,
      (
        SELECT json_agg(json_build_object(
          'product_name', oi.product_name,
          'image_url', (
            SELECT url FROM product_images 
            WHERE product_id = pv.product_id 
            ORDER BY sort_order LIMIT 1
          )
        ))
        FROM order_items oi
        LEFT JOIN product_variants pv ON oi.variant_id = pv.id
        WHERE oi.order_id = o.id
        LIMIT 3
      ) as preview_items
    FROM orders o
    WHERE o.user_id = ${userId}
    ORDER BY o.created_at DESC
  `
  return orders
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  PAID: 'bg-blue-100 text-blue-800',
  FULFILLED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
  REFUNDED: 'bg-gray-100 text-gray-800',
}

export default async function OrdersPage() {
  const session = await getSession()
  
  if (!session) {
    redirect('/login')
  }

  const orders = await getUserOrders(session.userId)

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="flex items-center gap-4 mb-8">
            <Link 
              href="/account" 
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="font-[family-name:var(--font-heading)] text-3xl font-bold tracking-tight">
              My Orders
            </h1>
          </div>

          {orders.length === 0 ? (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary mb-6">
                <Package className="h-8 w-8 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold mb-2">No orders yet</h2>
              <p className="text-muted-foreground mb-8">
                When you place an order, it will appear here.
              </p>
              <Button asChild>
                <Link href="/shop">Start Shopping</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <Link
                  key={order.id}
                  href={`/account/orders/${order.id}`}
                  className="block p-6 rounded-lg border border-border bg-card hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-semibold">Order #{order.id}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[order.status] || 'bg-gray-100 text-gray-800'}`}>
                          {order.status}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {order.placed_at 
                          ? new Date(order.placed_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })
                          : new Date(order.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })
                        }
                      </p>
                      <p className="text-sm mt-1">
                        {order.item_count} item{order.item_count > 1 ? 's' : ''} &middot;{' '}
                        <span className="font-medium">{formatPrice(order.total_cents, order.currency)}</span>
                      </p>
                    </div>

                    {/* Preview Images */}
                    {order.preview_items && (
                      <div className="flex -space-x-2">
                        {(order.preview_items as { image_url: string }[])
                          .filter((item) => item.image_url)
                          .slice(0, 3)
                          .map((item, i) => (
                            <div
                              key={i}
                              className="relative h-12 w-12 rounded-md border-2 border-background overflow-hidden bg-muted"
                            >
                              <Image
                                src={item.image_url}
                                alt=""
                                fill
                                className="object-cover"
                                sizes="48px"
                              />
                            </div>
                          ))}
                      </div>
                    )}

                    <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
