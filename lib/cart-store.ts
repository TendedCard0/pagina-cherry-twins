"use client"

import { useSyncExternalStore, useCallback } from "react"

export type CartLine = {
  variantId: number
  productId: number
  slug: string
  name: string
  imageUrl: string | null
  variantLabel: string
  unitPriceCents: number
  currency: string
  quantity: number
}

type CartListener = () => void

let cartLines: CartLine[] = []
let listeners: CartListener[] = []

function emitChange() {
  for (const listener of listeners) {
    listener()
  }
}

function subscribe(listener: CartListener) {
  listeners = [...listeners, listener]
  return () => {
    listeners = listeners.filter((l) => l !== listener)
  }
}

function getSnapshot(): CartLine[] {
  return cartLines
}

export function addCartLine(line: Omit<CartLine, "quantity"> & { quantity?: number }) {
  const quantity = line.quantity ?? 1
  const existingIndex = cartLines.findIndex((l) => l.variantId === line.variantId)
  if (existingIndex >= 0) {
    cartLines = cartLines.map((l, i) =>
      i === existingIndex ? { ...l, quantity: l.quantity + quantity } : l
    )
  } else {
    cartLines = [
      ...cartLines,
      {
        variantId: line.variantId,
        productId: line.productId,
        slug: line.slug,
        name: line.name,
        imageUrl: line.imageUrl,
        variantLabel: line.variantLabel,
        unitPriceCents: line.unitPriceCents,
        currency: line.currency,
        quantity,
      },
    ]
  }
  emitChange()
}

export function removeCartLine(variantId: number) {
  cartLines = cartLines.filter((l) => l.variantId !== variantId)
  emitChange()
}

export function updateCartLineQuantity(variantId: number, quantity: number) {
  if (quantity <= 0) {
    removeCartLine(variantId)
    return
  }
  cartLines = cartLines.map((l) =>
    l.variantId === variantId ? { ...l, quantity } : l
  )
  emitChange()
}

export function clearCart() {
  cartLines = []
  emitChange()
}

export function useCart() {
  const items = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
  const total = items.reduce((t, l) => t + l.unitPriceCents * l.quantity, 0)
  const count = items.reduce((c, l) => c + l.quantity, 0)

  return {
    items,
    total,
    count,
    addToCart: useCallback(addCartLine, []),
    removeFromCart: useCallback(removeCartLine, []),
    updateCartQuantity: useCallback(updateCartLineQuantity, []),
    clearCart: useCallback(clearCart, []),
  }
}
