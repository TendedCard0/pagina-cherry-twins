import { cookies } from 'next/headers'
import Link from 'next/link'
import Image from 'next/image'
import { ShoppingBag, ArrowRight } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { CartItemRow } from '@/components/cart/cart-item-row'
import { getCart } from '@/lib/data/cart'
import { formatPrice } from '@/lib/types'

export const metadata = {
  title: 'Shopping Cart',
  description: 'View and manage your shopping cart.',
}

export default async function CartPage() {
  const cookieStore = await cookies()
  const cartIdCookie = cookieStore.get('cart_id')
  
  const cart = cartIdCookie 
    ? await getCart(parseInt(cartIdCookie.value))
    : null

  const isEmpty = !cart || cart.items.length === 0

  return (
    <div className="min-h-screen flex flex-col">
      <Header cartItemCount={cart?.item_count} />
      
      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <h1 className="font-[family-name:var(--font-heading)] text-3xl sm:text-4xl font-bold tracking-tight mb-8">
            Shopping Cart
          </h1>

          {isEmpty ? (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary mb-6">
                <ShoppingBag className="h-8 w-8 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
              <p className="text-muted-foreground mb-8">
                Looks like you haven&apos;t added anything to your cart yet.
              </p>
              <Button asChild>
                <Link href="/shop">
                  Start Shopping
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          ) : (
            <div className="lg:grid lg:grid-cols-12 lg:gap-12">
              {/* Cart Items */}
              <div className="lg:col-span-7">
                <div className="divide-y divide-border">
                  {cart.items.map((item) => (
                    <CartItemRow key={item.id} item={item} />
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-5 mt-8 lg:mt-0">
                <div className="bg-secondary/50 rounded-lg p-6">
                  <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-medium">
                        {formatPrice(cart.subtotal_cents, 'USD')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shipping</span>
                      <span className="font-medium">Calculated at checkout</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tax</span>
                      <span className="font-medium">Calculated at checkout</span>
                    </div>
                  </div>

                  <div className="border-t border-border mt-4 pt-4">
                    <div className="flex justify-between text-base font-semibold">
                      <span>Estimated Total</span>
                      <span>{formatPrice(cart.subtotal_cents, 'USD')}</span>
                    </div>
                  </div>

                  <Button className="w-full mt-6" size="lg" asChild>
                    <Link href="/checkout">
                      Proceed to Checkout
                    </Link>
                  </Button>

                  <p className="text-xs text-muted-foreground text-center mt-4">
                    Taxes and shipping calculated at checkout
                  </p>
                </div>

                <div className="mt-6">
                  <Link 
                    href="/shop" 
                    className="text-sm text-muted-foreground hover:text-foreground flex items-center justify-center gap-1 transition-colors"
                  >
                    Continue Shopping
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
