import { AuthShell } from "@/components/auth/auth-shell"
import { RegisterForm } from "@/components/auth/register-form"

export default function RegisterPage() {
  return (
    <AuthShell
      title="Crear cuenta"
      subtitle="Regístrate para comprar en Cherry Twins"
    >
      <RegisterForm />
    </AuthShell>
  )
}