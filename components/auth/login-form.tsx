"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useAuth } from "@/context/auth-context"

type AuthResponse = {
  token: string
  tokenType: string
}

export function LoginForm() {
  const router = useRouter()
  const { completeAuth } = useAuth()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    try {
      setLoading(true)

      const res = await fetch("https://store-cherrys.onrender.com/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      })

      const data = (await res.json()) as Partial<AuthResponse> & { message?: string }

      if (!res.ok) {
        setError(data.message || "Correo o contraseña incorrectos.")
        return
      }

      if (!data.token) {
        setError("La API no devolvió un token válido.")
        return
      }

      await completeAuth({
        token: data.token,
        tokenType: data.tokenType || "Bearer",
      })

      router.push("/account")
    } catch (err) {
      console.error("Login error:", err)
      setError("No se pudo iniciar sesión.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <input
        type="email"
        placeholder="Correo electrónico"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
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

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="bg-white text-black font-semibold p-3 rounded hover:opacity-90 disabled:opacity-60"
      >
        {loading ? "Ingresando..." : "Iniciar sesión"}
      </button>

      <p className="text-sm text-neutral-400 text-center">
        ¿No tienes cuenta?{" "}
        <Link href="/register" className="text-white underline">
          Crear cuenta
        </Link>
      </p>
    </form>
  )
}