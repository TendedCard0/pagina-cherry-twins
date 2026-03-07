'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Minus, Plus, X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { formatPrice, type CartItemWithProduct } from '@/lib/types'

interface CartItemRowProps {
  item: CartItemWithProduct
}

export function CartItemRow({ item }: CartItemRowProps) {
  const [quantity, setQuantity] = useState(item.quantity)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isRemoved, setIsRemoved] = useState(false)

  const product = item.variant.product
  const variant = item.variant
  const image = product.images[0]
  const size = (variant.attributes as { size?: string })?.size || variant.variant_name

  const updateQuantity = async (newQuantity: number) => {
    if (newQuantity < 1) {
      return handleRemove()
    }

    if (newQuantity > variant.stock_on_hand) {
      toast.error('Not enough stock available')
      return
    }

    setIsUpdating(true)
    try {
      const response = await fetch('/api/cart/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId: item.id, quantity: newQuantity }),
      })

      if (!response.ok) throw new Error('Failed to update')
      
      setQuantity(newQuantity)
    } catch {
      toast.error('Failed to update quantity')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleRemove = async () => {
    setIsUpdating(true)
    try {
      const response = await fetch('/api/cart/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId: item.id }),
      })

      if (!response.ok) throw new Error('Failed to remove')
      
      setIsRemoved(true)
      toast.success('Item removed from cart')
    } catch {
      toast.error('Failed to remove item')
    } finally {
      setIsUpdating(false)
    }
  }

  if (isRemoved) return null

  return (
    <div className="flex gap-4 py-6">
      {/* Image */}
      <Link 
        href={`/product/${product.slug}`}
        className="relative h-24 w-20 flex-shrink-0 rounded-md bg-secondary overflow-hidden"
      >
        {image ? (
          <Image
            src={image.url}
            alt={image.alt_text || product.name}
            fill
            className="object-cover object-center"
            sizes="80px"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs text-muted-foreground">No image</span>
          </div>
        )}
      </Link>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between gap-4">
          <div>
            <Link 
              href={`/product/${product.slug}`}
              className="font-medium hover:text-accent transition-colors"
            >
              {product.name}
            </Link>
            {size && (
              <p className="text-sm text-muted-foreground mt-1">
                Size: {size}
              </p>
            )}
          </div>
          <p className="font-medium">
            {formatPrice(variant.price_cents * quantity, variant.currency)}
          </p>
        </div>

        {/* Quantity & Remove */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center border border-border rounded-md">
              <button
                onClick={() => updateQuantity(quantity - 1)}
                disabled={isUpdating}
                className="h-8 w-8 flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-50"
              >
                <Minus className="h-3 w-3" />
              </button>
              <span className="w-8 text-center text-sm">{quantity}</span>
              <button
                onClick={() => updateQuantity(quantity + 1)}
                disabled={isUpdating || quantity >= variant.stock_on_hand}
                className="h-8 w-8 flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-50"
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>
            {quantity > 1 && (
              <span className="text-xs text-muted-foreground">
                {formatPrice(variant.price_cents, variant.currency)} each
              </span>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            disabled={isUpdating}
            className="text-muted-foreground hover:text-destructive"
          >
            <X className="h-4 w-4 mr-1" />
            Remove
          </Button>
        </div>
      </div>
    </div>
  )
}
