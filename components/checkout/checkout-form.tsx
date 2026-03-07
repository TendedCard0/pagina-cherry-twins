'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import type { User } from '@/lib/types'

interface CheckoutFormProps {
  user: User | undefined
  cartId: number
  subtotalCents: number
  shippingCents: number
  taxCents: number
  totalCents: number
}

export function CheckoutForm({
  user,
  cartId,
  subtotalCents,
  shippingCents,
  taxCents,
  totalCents,
}: CheckoutFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Contact Info
  const [email, setEmail] = useState(user?.email || '')
  
  // Shipping Address
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [address, setAddress] = useState('')
  const [apartment, setApartment] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [zipCode, setZipCode] = useState('')
  const [phone, setPhone] = useState('')
  
  // Billing
  const [sameAsBilling, setSameAsBilling] = useState(true)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cartId,
          email,
          shippingAddress: {
            firstName,
            lastName,
            address,
            apartment,
            city,
            state,
            zipCode,
            phone,
          },
          subtotalCents,
          shippingCents,
          taxCents,
          totalCents,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Checkout failed')
      }

      toast.success('Order placed successfully!')
      router.push(`/order/confirmation/${data.orderId}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Checkout failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Contact */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Contact Information</h2>
        {!user && (
          <p className="text-sm text-muted-foreground mb-4">
            Already have an account?{' '}
            <Link href="/login" className="text-foreground underline hover:text-accent">
              Sign in
            </Link>
          </p>
        )}
        <div className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
            />
          </div>
        </div>
      </section>

      {/* Shipping Address */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Shipping Address</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="mt-4">
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
            placeholder="Street address"
          />
        </div>

        <div className="mt-4">
          <Label htmlFor="apartment">Apartment, suite, etc. (optional)</Label>
          <Input
            id="apartment"
            value={apartment}
            onChange={(e) => setApartment(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-3 gap-4 mt-4">
          <div>
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="state">State</Label>
            <Input
              id="state"
              value={state}
              onChange={(e) => setState(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="zipCode">ZIP Code</Label>
            <Input
              id="zipCode"
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="mt-4">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            placeholder="For shipping updates"
          />
        </div>
      </section>

      {/* Billing */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Billing Address</h2>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="sameAsBilling"
            checked={sameAsBilling}
            onCheckedChange={(checked) => setSameAsBilling(checked as boolean)}
          />
          <Label htmlFor="sameAsBilling" className="text-sm font-normal">
            Same as shipping address
          </Label>
        </div>
      </section>

      {/* Payment Notice */}
      <section className="bg-secondary/50 rounded-lg p-4">
        <p className="text-sm text-muted-foreground">
          This is a demo store. No actual payment will be processed.
          Click the button below to simulate placing an order.
        </p>
      </section>

      {/* Submit */}
      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Processing...' : 'Place Order'}
      </Button>
    </form>
  )
}
