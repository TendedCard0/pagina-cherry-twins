"use client"

import Link from "next/link"
import { useState } from "react"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    console.log("Login intent:", {
      email,
      password,
    })
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

      <button
        type="submit"
        className="bg-white text-black font-semibold p-3 rounded hover:opacity-90"
      >
        Iniciar sesión
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