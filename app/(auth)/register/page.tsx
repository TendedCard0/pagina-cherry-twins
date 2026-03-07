import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/auth'
import { RegisterForm } from '@/components/auth/register-form'

export const metadata = {
  title: 'Create Account',
  description: 'Create your Cherry Twins account.',
}

export default async function RegisterPage() {
  const session = await getSession()
  
  if (session) {
    redirect('/account')
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <span className="font-[family-name:var(--font-heading)] text-2xl font-bold tracking-tight">
              CHERRY TWINS
            </span>
          </Link>
          <h1 className="mt-6 text-2xl font-semibold">Create your account</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Join the Cherry Twins community
          </p>
        </div>

        <RegisterForm />

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-foreground hover:text-accent">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
