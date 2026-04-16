"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import { useAuth } from "@/context/auth-context"
import { postAuthJson } from "@/lib/auth-client"
import { API_BASE_URL } from "@/lib/api-config"
import { safeReturnPath } from "@/lib/safe-return-path"

export function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const returnTo = safeReturnPath(searchParams.get("returnTo"))
  const { completeAuth } = useAuth()

  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.")
      return
    }

    try {
      setLoading(true)

      const result = await postAuthJson("/api/auth/register", {
        email,
        password,
        fullName,
        phone,
      })

      if (!result.ok) {
        setError(result.message)
        return
      }

      try {
        await completeAuth({
          token: result.data.token,
          tokenType: result.data.tokenType || "Bearer",
        })
      } catch (profileErr) {
        const msg =
          profileErr instanceof Error
            ? profileErr.message
            : "No se pudo cargar tu perfil."
        setError(`${msg} (API: ${API_BASE_URL})`)
        return
      }

      router.push(returnTo)
    } catch (err) {
      console.error("Register error:", err)
      setError(
        err instanceof Error ? err.message : "No se pudo registrar el usuario."
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <p className="text-xs text-neutral-500">
        Conectado a: <span className="font-mono text-neutral-400">{API_BASE_URL}</span>
      </p>
      <input
        type="text"
        placeholder="Nombre completo"
        required
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        className="p-3 rounded bg-neutral-800 border border-neutral-700"
      />

      <input
        type="email"
        placeholder="Correo electrónico"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="p-3 rounded bg-neutral-800 border border-neutral-700"
      />

      <input
        type="tel"
        placeholder="Teléfono"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        className="p-3 rounded bg-neutral-800 border border-neutral-700"
      />

      <input
        type="password"
        placeholder="Contraseña"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="p-3 rounded bg-neutral-800 border border-neutral-700"
      />

      <input
        type="password"
        placeholder="Confirmar contraseña"
        required
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        className="p-3 rounded bg-neutral-800 border border-neutral-700"
      />

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="bg-white text-black font-semibold p-3 rounded hover:opacity-90 disabled:opacity-60"
      >
        {loading ? "Creando cuenta..." : "Registrarse"}
      </button>

      <p className="text-sm text-neutral-400 text-center">
        ¿Ya tienes cuenta?{" "}
        <Link href={`/login?returnTo=${encodeURIComponent(returnTo)}`} className="text-white underline">
          Iniciar sesión
        </Link>
      </p>
    </form>
  )
}
