'use client'

import { useState } from 'react'
import { ShoppingBag, Minus, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { formatPrice, type ProductWithDetails, type ProductVariant } from '@/lib/types'
import { cn } from '@/lib/utils'

interface ProductActionsProps {
  product: ProductWithDetails
}

export function ProductActions({ product }: ProductActionsProps) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    product.variants.length > 0 ? product.variants[0] : null
  )
  const [quantity, setQuantity] = useState(1)
  const [isAdding, setIsAdding] = useState(false)

  const sizes = product.variants.map(v => ({
    ...v,
    size: (v.attributes as { size?: string })?.size || v.variant_name,
  }))

  const maxQuantity = selectedVariant?.stock_on_hand || 0
  const isOutOfStock = !selectedVariant || selectedVariant.stock_on_hand === 0

  const handleAddToCart = async () => {
    if (!selectedVariant || isOutOfStock) return

    setIsAdding(true)
    try {
      const response = await fetch('/api/cart/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          variantId: selectedVariant.id,
          quantity,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to add to cart')
      }

      toast.success('Added to cart', {
        description: `${product.name} (${selectedVariant.variant_name}) x ${quantity}`,
      })
    } catch (error) {
      toast.error('Failed to add to cart', {
        description: 'Please try again later.',
      })
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Size Selection */}
      {sizes.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium">Size</span>
            {selectedVariant && (
              <span className="text-sm text-muted-foreground">
                {selectedVariant.stock_on_hand} in stock
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {sizes.map((variant) => {
              const isSelected = selectedVariant?.id === variant.id
              const isAvailable = variant.stock_on_hand > 0

              return (
                <button
                  key={variant.id}
                  onClick={() => {
                    setSelectedVariant(variant)
                    setQuantity(1)
                  }}
                  disabled={!isAvailable}
                  className={cn(
                    "h-10 min-w-[48px] px-4 rounded-md text-sm font-medium transition-all",
                    isSelected
                      ? "bg-foreground text-background"
                      : isAvailable
                      ? "bg-secondary text-foreground hover:bg-secondary/80"
                      : "bg-muted text-muted-foreground cursor-not-allowed line-through"
                  )}
                >
                  {variant.size}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Quantity */}
      <div>
        <span className="text-sm font-medium mb-3 block">Quantity</span>
        <div className="flex items-center gap-3">
          <div className="flex items-center border border-border rounded-md">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
              className="h-10 w-10 flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-50 transition-colors"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-12 text-center text-sm font-medium">{quantity}</span>
            <button
              onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
              disabled={quantity >= maxQuantity}
              className="h-10 w-10 flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-50 transition-colors"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Price Display */}
      {selectedVariant && selectedVariant.price_cents !== product.base_price_cents && (
        <div className="py-2">
          <span className="text-lg font-semibold">
            {formatPrice(selectedVariant.price_cents * quantity, selectedVariant.currency)}
          </span>
          {quantity > 1 && (
            <span className="text-sm text-muted-foreground ml-2">
              ({formatPrice(selectedVariant.price_cents, selectedVariant.currency)} each)
            </span>
          )}
        </div>
      )}

      {/* Add to Cart Button */}
      <Button
        onClick={handleAddToCart}
        disabled={isOutOfStock || isAdding}
        className="w-full h-12 text-base font-medium"
        size="lg"
      >
        {isAdding ? (
          'Adding...'
        ) : isOutOfStock ? (
          'Out of Stock'
        ) : (
          <>
            <ShoppingBag className="mr-2 h-5 w-5" />
            Add to Cart
          </>
        )}
      </Button>
    </div>
  )
}
