"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"

export function AccountContent() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading, logout } = useAuth()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login")
    }
  }, [isAuthenticated, isLoading, router])

  function handleLogout() {
    logout()
    router.push("/login")
  }

  if (isLoading) {
    return (
      <section className="px-6 py-16 text-white">
        <div className="mx-auto max-w-4xl rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
          <p className="text-neutral-300">Cargando tu sesión...</p>
        </div>
      </section>
    )
  }

  if (!isAuthenticated || !user) {
    return null
  }

  const createdAt = new Date(user.createdAt).toLocaleDateString("es-MX", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <section className="px-6 py-16 text-white">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <p className="text-sm text-neutral-400">Home &gt; Mi Cuenta</p>
          <h1 className="mt-3 text-4xl font-bold">Mi Cuenta</h1>
          <p className="mt-2 text-neutral-400">
            Aquí puedes ver la información real de tu sesión.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-[1.4fr_0.8fr]">
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
            <h2 className="mb-5 text-2xl font-semibold">Perfil</h2>

            <div className="space-y-5">
              <div>
                <p className="text-sm text-neutral-400">Nombre completo</p>
                <p className="mt-1 text-lg">{user.fullName || "No registrado"}</p>
              </div>

              <div>
                <p className="text-sm text-neutral-400">Correo electrónico</p>
                <p className="mt-1 text-lg">{user.email}</p>
              </div>

              <div>
                <p className="text-sm text-neutral-400">Teléfono</p>
                <p className="mt-1 text-lg">{user.phone || "No registrado"}</p>
              </div>

              <div>
                <p className="text-sm text-neutral-400">Fecha de registro</p>
                <p className="mt-1 text-lg">{createdAt}</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
            <h2 className="mb-5 text-2xl font-semibold">Estado</h2>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-neutral-400">Rol</p>
                <p className="mt-1 inline-flex rounded-full border border-neutral-700 px-3 py-1 text-sm">
                  {user.role}
                </p>
              </div>

              <div>
                <p className="text-sm text-neutral-400">Cuenta activa</p>
                <p className="mt-1">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-sm ${
                      user.active
                        ? "bg-green-500/15 text-green-400"
                        : "bg-red-500/15 text-red-400"
                    }`}
                  >
                    {user.active ? "Activa" : "Inactiva"}
                  </span>
                </p>
              </div>

              <div>
                <p className="text-sm text-neutral-400">Correo verificado</p>
                <p className="mt-1">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-sm ${
                      user.emailVerified
                        ? "bg-green-500/15 text-green-400"
                        : "bg-yellow-500/15 text-yellow-400"
                    }`}
                  >
                    {user.emailVerified ? "Verificado" : "Pendiente"}
                  </span>
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="mt-8 w-full rounded-lg bg-white px-4 py-3 font-semibold text-black transition hover:opacity-90"
            >
              Cerrar sesión
            </button>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
          <h2 className="mb-3 text-2xl font-semibold">Siguientes módulos</h2>
          <p className="text-neutral-400">
            Aquí después podemos conectar pedidos, direcciones y edición de perfil
            usando los endpoints ya existentes del backend.
          </p>
        </div>
      </div>
    </section>
  )
}