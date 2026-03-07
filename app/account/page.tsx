import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Package, MapPin, User, LogOut } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { getSession } from '@/lib/auth'
import { LogoutButton } from '@/components/auth/logout-button'

export const metadata = {
  title: 'My Account',
  description: 'Manage your Cherry Twins account.',
}

export default async function AccountPage() {
  const session = await getSession()
  
  if (!session) {
    redirect('/login')
  }

  const { user } = session

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-[family-name:var(--font-heading)] text-3xl font-bold tracking-tight">
                My Account
              </h1>
              <p className="mt-1 text-muted-foreground">
                Welcome back, {user.full_name || user.email}
              </p>
            </div>
            <LogoutButton />
          </div>

          {/* Account Sections */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Orders */}
            <Link
              href="/account/orders"
              className="flex items-start gap-4 p-6 rounded-lg border border-border bg-card hover:bg-secondary/50 transition-colors"
            >
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                  <Package className="h-5 w-5 text-muted-foreground" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold">Orders</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  View and track your orders
                </p>
              </div>
            </Link>

            {/* Addresses */}
            <Link
              href="/account/addresses"
              className="flex items-start gap-4 p-6 rounded-lg border border-border bg-card hover:bg-secondary/50 transition-colors"
            >
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold">Addresses</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Manage your shipping addresses
                </p>
              </div>
            </Link>

            {/* Profile */}
            <Link
              href="/account/profile"
              className="flex items-start gap-4 p-6 rounded-lg border border-border bg-card hover:bg-secondary/50 transition-colors"
            >
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                  <User className="h-5 w-5 text-muted-foreground" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold">Profile</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Update your personal information
                </p>
              </div>
            </Link>
          </div>

          {/* Account Info */}
          <div className="mt-8 p-6 rounded-lg border border-border bg-card">
            <h2 className="font-semibold mb-4">Account Information</h2>
            <dl className="grid sm:grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-muted-foreground">Email</dt>
                <dd className="mt-1 font-medium">{user.email}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Name</dt>
                <dd className="mt-1 font-medium">{user.full_name || 'Not set'}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Phone</dt>
                <dd className="mt-1 font-medium">{user.phone || 'Not set'}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Member Since</dt>
                <dd className="mt-1 font-medium">
                  {new Date(user.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
