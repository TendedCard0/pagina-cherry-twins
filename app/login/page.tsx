import { Suspense } from "react"
import { AuthShell } from "@/components/auth/auth-shell"
import { LoginForm } from "@/components/auth/login-form"

export default function LoginPage() {
  return (
    <AuthShell
      title="Iniciar sesión"
      subtitle="Accede a tu cuenta Cherry Twins"
    >
      <Suspense fallback={<p className="text-sm text-neutral-400">Cargando…</p>}>
        <LoginForm />
      </Suspense>
    </AuthShell>
  )
}