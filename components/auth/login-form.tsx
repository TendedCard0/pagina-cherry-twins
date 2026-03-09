"use client"

import Link from "next/link"
import { useState } from "react"

export function LoginForm() {
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

    const data = await res.json()

    if (!res.ok) {
      setError(data.message || data.error || "Correo o contraseña incorrectos.")
      return
    }

    localStorage.setItem("token", data.token)
    window.location.href = "/account"
  } catch (err) {
    console.error("Login error:", err)
    setError("No se pudo conectar con el servidor.")
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