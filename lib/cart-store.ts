"use client"

import { useSyncExternalStore, useCallback } from "react"
import type { Product, CartItem } from "./data"

type CartListener = () => void

let cartItems: CartItem[] = []
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

function getSnapshot(): CartItem[] {
  return cartItems
}

export function addToCart(product: Product, quantity: number, selectedSize: string, selectedColor: string) {
  const existingIndex = cartItems.findIndex(
    (item) => item.product.id === product.id && item.selectedSize === selectedSize && item.selectedColor === selectedColor
  )
  if (existingIndex >= 0) {
    cartItems = cartItems.map((item, index) =>
      index === existingIndex ? { ...item, quantity: item.quantity + quantity } : item
    )
  } else {
    cartItems = [...cartItems, { product, quantity, selectedSize, selectedColor }]
  }
  emitChange()
}

export function removeFromCart(productId: string, selectedSize: string, selectedColor: string) {
  cartItems = cartItems.filter(
    (item) => !(item.product.id === productId && item.selectedSize === selectedSize && item.selectedColor === selectedColor)
  )
  emitChange()
}

export function updateCartQuantity(productId: string, selectedSize: string, selectedColor: string, quantity: number) {
  if (quantity <= 0) {
    removeFromCart(productId, selectedSize, selectedColor)
    return
  }
  cartItems = cartItems.map((item) =>
    item.product.id === productId && item.selectedSize === selectedSize && item.selectedColor === selectedColor
      ? { ...item, quantity }
      : item
  )
  emitChange()
}

export function clearCart() {
  cartItems = []
  emitChange()
}

export function getCartTotal(): number {
  return cartItems.reduce((total, item) => total + item.product.price * item.quantity, 0)
}

export function getCartCount(): number {
  return cartItems.reduce((count, item) => count + item.quantity, 0)
}

export function useCart() {
  const items = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
  const total = items.reduce((t, item) => t + item.product.price * item.quantity, 0)
  const count = items.reduce((c, item) => c + item.quantity, 0)

  return {
    items,
    total,
    count,
    addToCart: useCallback(addToCart, []),
    removeFromCart: useCallback(removeFromCart, []),
    updateCartQuantity: useCallback(updateCartQuantity, []),
    clearCart: useCallback(clearCart, []),
  }
}
