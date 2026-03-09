"use client"

import Link from "next/link"
import { useState } from "react"

export function RegisterForm() {
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.")
      return
    }

    console.log("Register intent:", {
      full_name: fullName,
      email,
      phone,
      password,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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

      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}

      <button
        type="submit"
        className="bg-white text-black font-semibold p-3 rounded hover:opacity-90"
      >
        Crear cuenta
      </button>

      <p className="text-sm text-neutral-400 text-center">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="text-white underline">
          Inicia sesión
        </Link>
      </p>
    </form>
  )
}