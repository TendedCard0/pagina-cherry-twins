import { Suspense } from "react"
import { AuthShell } from "@/components/auth/auth-shell"
import { RegisterForm } from "@/components/auth/register-form"

export default function RegisterPage() {
  return (
    <AuthShell
      title="Crear cuenta"
      subtitle="Regístrate para comprar en Cherry Twins"
    >
      <Suspense fallback={<p className="text-sm text-neutral-400">Cargando…</p>}>
        <RegisterForm />
      </Suspense>
    </AuthShell>
  )
}