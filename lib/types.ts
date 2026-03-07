// Database types based on SQL schema

export type UserRole = 'CUSTOMER' | 'ADMIN'

export interface User {
  id: number
  email: string
  password_hash: string
  full_name: string | null
  phone: string | null
  role: UserRole
  is_active: boolean
  email_verified: boolean
  created_at: Date
  updated_at: Date
}

export interface Address {
  id: number
  user_id: number
  label: string | null
  recipient_name: string | null
  line1: string
  line2: string | null
  city: string
  state: string | null
  postal_code: string | null
  country: string
  is_default: boolean
  created_at: Date
  updated_at: Date
}

export interface Artist {
  id: number
  name: string
  slug: string
  bio: string | null
  created_at: Date
  updated_at: Date
}

export interface Category {
  id: number
  name: string
  slug: string
  parent_id: number | null
  created_at: Date
  updated_at: Date
}

export interface Product {
  id: number
  artist_id: number | null
  category_id: number | null
  name: string
  slug: string
  description: string | null
  is_active: boolean
  base_price_cents: number
  currency: string
  created_at: Date
  updated_at: Date
}

export interface ProductImage {
  id: number
  product_id: number
  url: string
  alt_text: string | null
  sort_order: number
  created_at: Date
}

export interface ProductVariant {
  id: number
  product_id: number
  sku: string
  variant_name: string | null
  attributes: Record<string, string>
  price_cents: number
  currency: string
  stock_on_hand: number
  is_active: boolean
  created_at: Date
  updated_at: Date
}

export type InventoryMovementType = 'IN' | 'OUT' | 'ADJUST'

export interface InventoryMovement {
  id: number
  variant_id: number
  movement_type: InventoryMovementType
  quantity: number
  reason: string | null
  reference_id: string | null
  created_at: Date
}

export type CartStatus = 'ACTIVE' | 'CHECKED_OUT' | 'ABANDONED'

export interface Cart {
  id: number
  user_id: number | null
  status: CartStatus
  created_at: Date
  updated_at: Date
}

export interface CartItem {
  id: number
  cart_id: number
  variant_id: number
  quantity: number
  created_at: Date
  updated_at: Date
}

export type CouponDiscountType = 'PERCENT' | 'FIXED'

export interface Coupon {
  id: number
  code: string
  discount_type: CouponDiscountType
  discount_value: number
  currency: string
  starts_at: Date | null
  ends_at: Date | null
  max_redemptions: number | null
  per_user_limit: number | null
  min_order_cents: number
  is_active: boolean
  created_at: Date
  updated_at: Date
}

export interface CouponRedemption {
  id: number
  coupon_id: number
  user_id: number | null
  order_id: number | null
  redeemed_at: Date
}

export type OrderStatus = 'PENDING' | 'PAID' | 'CANCELLED' | 'REFUNDED' | 'FULFILLED'

export interface Order {
  id: number
  user_id: number | null
  status: OrderStatus
  currency: string
  subtotal_cents: number
  discount_cents: number
  shipping_cents: number
  tax_cents: number
  total_cents: number
  coupon_id: number | null
  shipping_address_id: number | null
  billing_address_id: number | null
  placed_at: Date | null
  created_at: Date
  updated_at: Date
}

export interface OrderItem {
  id: number
  order_id: number
  variant_id: number | null
  product_name: string
  variant_snapshot: Record<string, unknown>
  sku: string | null
  unit_price_cents: number
  quantity: number
  line_total_cents: number
  created_at: Date
}

export type PaymentStatus = 'INITIATED' | 'AUTHORIZED' | 'CAPTURED' | 'FAILED' | 'CANCELLED' | 'REFUNDED'

export interface Payment {
  id: number
  order_id: number
  provider: string
  provider_ref: string | null
  status: PaymentStatus
  amount_cents: number
  currency: string
  paid_at: Date | null
  created_at: Date
  updated_at: Date
}

export type ShipmentStatus = 'PENDING' | 'LABEL_CREATED' | 'SHIPPED' | 'IN_TRANSIT' | 'DELIVERED' | 'RETURNED' | 'CANCELLED'

export interface Shipment {
  id: number
  order_id: number
  carrier: string | null
  tracking_number: string | null
  status: ShipmentStatus
  shipped_at: Date | null
  delivered_at: Date | null
  created_at: Date
  updated_at: Date
}

export interface Review {
  id: number
  product_id: number
  user_id: number | null
  rating: number
  title: string | null
  comment: string | null
  is_public: boolean
  created_at: Date
}

// Extended types with relations
export interface ProductWithDetails extends Product {
  artist: Artist | null
  category: Category | null
  images: ProductImage[]
  variants: ProductVariant[]
}

export interface CartItemWithProduct extends CartItem {
  variant: ProductVariant & {
    product: Product & {
      images: ProductImage[]
    }
  }
}

export interface CartWithItems extends Cart {
  items: CartItemWithProduct[]
}

// Helper functions
export function formatPrice(cents: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(cents / 100)
}

export function calculateTotalStock(variants: ProductVariant[]): number {
  return variants.reduce((sum, v) => sum + v.stock_on_hand, 0)
}
