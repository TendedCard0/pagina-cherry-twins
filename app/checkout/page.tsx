import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import Link from 'next/link'
import Image from 'next/image'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { CheckoutForm } from '@/components/checkout/checkout-form'
import { getCart } from '@/lib/data/cart'
import { getSession } from '@/lib/auth'
import { formatPrice } from '@/lib/types'

export const metadata = {
  title: 'Checkout',
  description: 'Complete your order at Cherry Twins.',
}

export default async function CheckoutPage() {
  const cookieStore = await cookies()
  const cartIdCookie = cookieStore.get('cart_id')
  
  if (!cartIdCookie) {
    redirect('/cart')
  }

  const cart = await getCart(parseInt(cartIdCookie.value))
  
  if (!cart || cart.items.length === 0) {
    redirect('/cart')
  }

  const session = await getSession()

  // Calculate totals
  const shippingCents = 1200 // $12.00 flat rate
  const taxRate = 0.08 // 8%
  const taxCents = Math.round(cart.subtotal_cents * taxRate)
  const totalCents = cart.subtotal_cents + shippingCents + taxCents

  return (
    <div className="min-h-screen flex flex-col">
      <Header cartItemCount={cart.item_count} />
      
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <h1 className="font-[family-name:var(--font-heading)] text-3xl font-bold tracking-tight mb-8">
            Checkout
          </h1>

          <div className="lg:grid lg:grid-cols-12 lg:gap-12">
            {/* Checkout Form */}
            <div className="lg:col-span-7">
              <CheckoutForm 
                user={session?.user} 
                cartId={cart.id}
                subtotalCents={cart.subtotal_cents}
                shippingCents={shippingCents}
                taxCents={taxCents}
                totalCents={totalCents}
              />
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-5 mt-8 lg:mt-0">
              <div className="bg-secondary/50 rounded-lg p-6 sticky top-24">
                <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
                
                {/* Cart Items */}
                <div className="space-y-4 mb-6">
                  {cart.items.map((item) => {
                    const product = item.variant.product
                    const image = product.images[0]
                    const size = (item.variant.attributes as { size?: string })?.size

                    return (
                      <div key={item.id} className="flex gap-4">
                        <div className="relative h-16 w-14 flex-shrink-0 rounded-md bg-muted overflow-hidden">
                          {image && (
                            <Image
                              src={image.url}
                              alt={image.alt_text || product.name}
                              fill
                              className="object-cover object-center"
                              sizes="56px"
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{product.name}</p>
                          {size && (
                            <p className="text-xs text-muted-foreground">Size: {size}</p>
                          )}
                          <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                        <p className="text-sm font-medium">
                          {formatPrice(item.variant.price_cents * item.quantity, 'USD')}
                        </p>
                      </div>
                    )
                  })}
                </div>

                {/* Totals */}
                <div className="space-y-3 text-sm border-t border-border pt-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatPrice(cart.subtotal_cents, 'USD')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>{formatPrice(shippingCents, 'USD')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax</span>
                    <span>{formatPrice(taxCents, 'USD')}</span>
                  </div>
                  <div className="flex justify-between text-base font-semibold pt-3 border-t border-border">
                    <span>Total</span>
                    <span>{formatPrice(totalCents, 'USD')}</span>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground mt-4">
                  By placing this order, you agree to our{' '}
                  <Link href="/terms" className="underline hover:text-foreground">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="underline hover:text-foreground">
                    Privacy Policy
                  </Link>
                  .
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
