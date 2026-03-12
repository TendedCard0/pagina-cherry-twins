"use client"

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { apiFetch } from "@/lib/api"

type AccountTab = "profile" | "orders" | "addresses"

type Address = {
  id: number
  label: string
  recipientName: string
  line1: string
  line2: string
  city: string
  state: string
  postalCode: string
  country: string
  createdAt: string
  default: boolean
}

type AddressFormValues = {
  label: string
  recipientName: string
  line1: string
  line2: string
  city: string
  state: string
  postalCode: string
  country: string
  makeDefault: boolean
}

type OrderSummary = {
  id: number
  status: string
  totalCents: number
  currency: string
  createdAt: string
}

type OrdersResponse = {
  content: OrderSummary[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  last: boolean
}

type OrderItem = {
  id: number
  variantId: number
  productName: string
  sku: string
  variantSnapshot: string
  unitPriceCents: number
  quantity: number
  lineTotalCents: number
}

type OrderDetail = {
  id: number
  userId: number
  status: string
  currency: string
  subtotalCents: number
  discountCents: number
  shippingCents: number
  taxCents: number
  totalCents: number
  couponId: number | null
  shippingAddressId: number | null
  billingAddressId: number | null
  placedAt: string | null
  createdAt: string
  items: OrderItem[]
}

const initialAddressForm: AddressFormValues = {
  label: "",
  recipientName: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "MX",
  makeDefault: false,
}

function formatDate(value: string | null) {
  if (!value) return "Sin fecha"
  return new Date(value).toLocaleDateString("es-MX", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

function formatMoney(cents: number, currency: string) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: currency || "MXN",
  }).format((cents || 0) / 100)
}

function getStatusClasses(status: string) {
  const normalized = status.toUpperCase()

  if (normalized === "DELIVERED" || normalized === "ENTREGADO") {
    return "bg-green-500/15 text-green-400"
  }

  if (normalized === "SHIPPED" || normalized === "ENVIADO") {
    return "bg-blue-500/15 text-blue-400"
  }

  if (normalized === "PENDING" || normalized === "PENDIENTE") {
    return "bg-yellow-500/15 text-yellow-400"
  }

  if (normalized === "CANCELLED" || normalized === "CANCELADO") {
    return "bg-red-500/15 text-red-400"
  }

  return "bg-neutral-700/40 text-neutral-200"
}

export function AccountContent() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading, logout } = useAuth()

  const [activeTab, setActiveTab] = useState<AccountTab>("profile")

  const [addresses, setAddresses] = useState<Address[]>([])
  const [addressesLoading, setAddressesLoading] = useState(false)
  const [addressesError, setAddressesError] = useState("")
  const [addressSubmitting, setAddressSubmitting] = useState(false)
  const [editingAddressId, setEditingAddressId] = useState<number | null>(null)
  const [addressForm, setAddressForm] = useState<AddressFormValues>(initialAddressForm)

  const [orders, setOrders] = useState<OrderSummary[]>([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [ordersError, setOrdersError] = useState("")
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null)
  const [selectedOrderDetail, setSelectedOrderDetail] = useState<OrderDetail | null>(null)
  const [orderDetailLoading, setOrderDetailLoading] = useState(false)
  const [orderDetailError, setOrderDetailError] = useState("")

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login")
    }
  }, [isAuthenticated, isLoading, router])

  const loadAddresses = useCallback(async () => {
    try {
      setAddressesLoading(true)
      setAddressesError("")

      const data = await apiFetch<Address[]>("/api/users/addresses", {
        method: "GET",
        requireAuth: true,
      })

      setAddresses(data)
    } catch (error) {
      console.error("Error loading addresses:", error)
      setAddressesError("No se pudieron cargar tus direcciones.")
    } finally {
      setAddressesLoading(false)
    }
  }, [])

  const loadOrders = useCallback(async () => {
    try {
      setOrdersLoading(true)
      setOrdersError("")

      const data = await apiFetch<OrdersResponse>("/api/orders?page=0&size=20", {
        method: "GET",
        requireAuth: true,
      })

      setOrders(data.content || [])
    } catch (error) {
      console.error("Error loading orders:", error)
      setOrdersError("No se pudieron cargar tus pedidos.")
    } finally {
      setOrdersLoading(false)
    }
  }, [])

  const loadOrderDetail = useCallback(async (orderId: number) => {
    try {
      setOrderDetailLoading(true)
      setOrderDetailError("")
      setSelectedOrderId(orderId)

      const data = await apiFetch<OrderDetail>(`/api/orders/${orderId}`, {
        method: "GET",
        requireAuth: true,
      })

      setSelectedOrderDetail(data)
    } catch (error) {
      console.error("Error loading order detail:", error)
      setOrderDetailError("No se pudo cargar el detalle del pedido.")
      setSelectedOrderDetail(null)
    } finally {
      setOrderDetailLoading(false)
    }
  }, [])

  useEffect(() => {
    if (activeTab === "addresses" && isAuthenticated) {
      void loadAddresses()
    }
  }, [activeTab, isAuthenticated, loadAddresses])

  useEffect(() => {
    if (activeTab === "orders" && isAuthenticated) {
      void loadOrders()
    }
  }, [activeTab, isAuthenticated, loadOrders])

  useEffect(() => {
    if (activeTab === "orders" && orders.length > 0 && selectedOrderId === null) {
      void loadOrderDetail(orders[0].id)
    }
  }, [activeTab, orders, selectedOrderId, loadOrderDetail])

  function handleLogout() {
    logout()
    router.push("/login")
  }

  function resetAddressForm() {
    setAddressForm(initialAddressForm)
    setEditingAddressId(null)
  }

  function startEditAddress(address: Address) {
    setEditingAddressId(address.id)
    setAddressForm({
      label: address.label,
      recipientName: address.recipientName,
      line1: address.line1,
      line2: address.line2 || "",
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
      makeDefault: address.default,
    })
    setActiveTab("addresses")
  }

  async function handleAddressSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    try {
      setAddressSubmitting(true)
      setAddressesError("")

      const endpoint = editingAddressId
        ? `/api/users/addresses/${editingAddressId}`
        : "/api/users/addresses"

      const method = editingAddressId ? "PUT" : "POST"

      const payload = {
        label: addressForm.label.trim(),
        recipientName: addressForm.recipientName.trim(),
        line1: addressForm.line1.trim(),
        line2: addressForm.line2.trim(),
        city: addressForm.city.trim(),
        state: addressForm.state.trim(),
        postalCode: addressForm.postalCode.trim(),
        country: addressForm.country.trim().toUpperCase(),
        makeDefault: addressForm.makeDefault,
      }

      await apiFetch<Address>(endpoint, {
        method,
        requireAuth: true,
        body: JSON.stringify(payload),
      })

      await loadAddresses()
      resetAddressForm()
    } catch (error) {
      console.error("Error saving address:", error)
      setAddressesError("No se pudo guardar la dirección.")
    } finally {
      setAddressSubmitting(false)
    }
  }

  async function handleDeleteAddress(id: number) {
    const confirmed = window.confirm("¿Seguro que quieres eliminar esta dirección?")
    if (!confirmed) return

    try {
      setAddressesError("")

      await apiFetch(`/api/users/addresses/${id}`, {
        method: "DELETE",
        requireAuth: true,
      })

      if (editingAddressId === id) {
        resetAddressForm()
      }

      await loadAddresses()
    } catch (error) {
      console.error("Error deleting address:", error)
      setAddressesError("No se pudo eliminar la dirección.")
    }
  }

  async function handleSetDefaultAddress(id: number) {
    try {
      setAddressesError("")

      await apiFetch<Address>(`/api/users/addresses/${id}/default`, {
        method: "PUT",
        requireAuth: true,
      })

      await loadAddresses()

      if (editingAddressId === id) {
        setAddressForm((prev) => ({ ...prev, makeDefault: true }))
      }
    } catch (error) {
      console.error("Error setting default address:", error)
      setAddressesError("No se pudo marcar la dirección como predeterminada.")
    }
  }

  const createdAt = useMemo(() => formatDate(user?.createdAt || null), [user?.createdAt])

  if (isLoading) {
    return (
      <section className="px-6 py-16 text-white">
        <div className="mx-auto max-w-5xl rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
          <p className="text-neutral-300">Cargando tu sesión...</p>
        </div>
      </section>
    )
  }

  if (!isAuthenticated || !user) {
    return null
  }

  return (
    <section className="px-6 py-16 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <p className="text-sm text-neutral-400">Home &gt; Mi Cuenta</p>
          <h1 className="mt-3 text-4xl font-bold">Mi Cuenta</h1>
          <p className="mt-2 text-neutral-400">
            Administra tu perfil, tus pedidos y tus direcciones.
          </p>
        </div>

        <div className="mb-8 inline-flex rounded-xl border border-neutral-800 bg-neutral-900 p-1">
          <button
            type="button"
            onClick={() => setActiveTab("profile")}
            className={`rounded-lg px-4 py-2 text-sm transition ${
              activeTab === "profile"
                ? "bg-white text-black"
                : "text-neutral-300 hover:bg-neutral-800"
            }`}
          >
            Perfil
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("orders")}
            className={`rounded-lg px-4 py-2 text-sm transition ${
              activeTab === "orders"
                ? "bg-white text-black"
                : "text-neutral-300 hover:bg-neutral-800"
            }`}
          >
            Pedidos
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("addresses")}
            className={`rounded-lg px-4 py-2 text-sm transition ${
              activeTab === "addresses"
                ? "bg-white text-black"
                : "text-neutral-300 hover:bg-neutral-800"
            }`}
          >
            Direcciones
          </button>
        </div>

        {activeTab === "profile" && (
          <>
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

            
          </>
        )}

        {activeTab === "orders" && (
          <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
              <h2 className="mb-2 text-2xl font-semibold">Mis pedidos</h2>
              <p className="mb-5 text-sm text-neutral-400">
                Historial real obtenido desde la API del usuario autenticado.
              </p>

              {ordersError && (
                <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {ordersError}
                </div>
              )}

              {ordersLoading ? (
                <p className="text-neutral-400">Cargando pedidos...</p>
              ) : orders.length === 0 ? (
                <div className="rounded-xl border border-dashed border-neutral-700 px-5 py-8 text-center text-neutral-400">
                  Todavía no tienes pedidos registrados.
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className={`rounded-xl border p-5 transition ${
                        selectedOrderId === order.id
                          ? "border-white/40 bg-white/5"
                          : "border-neutral-800 bg-black/30"
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <h3 className="text-lg font-semibold">Orden #{order.id}</h3>
                          <p className="mt-1 text-sm text-neutral-400">
                            {formatDate(order.createdAt)}
                          </p>
                        </div>

                        <span
                          className={`rounded-full px-3 py-1 text-xs ${getStatusClasses(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>
                      </div>

                      <div className="mt-4 flex items-center justify-between gap-3">
                        <p className="text-sm text-neutral-300">
                          Total:{" "}
                          <span className="font-medium text-white">
                            {formatMoney(order.totalCents, order.currency)}
                          </span>
                        </p>

                        <button
                          type="button"
                          onClick={() => void loadOrderDetail(order.id)}
                          className="rounded-lg border border-neutral-700 px-3 py-2 text-sm transition hover:bg-neutral-800"
                        >
                          Ver detalle
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
              <h2 className="mb-2 text-2xl font-semibold">Detalle del pedido</h2>
              <p className="mb-5 text-sm text-neutral-400">
                Información completa del pedido seleccionado.
              </p>

              {orderDetailError && (
                <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {orderDetailError}
                </div>
              )}

              {orderDetailLoading ? (
                <p className="text-neutral-400">Cargando detalle...</p>
              ) : !selectedOrderDetail ? (
                <div className="rounded-xl border border-dashed border-neutral-700 px-5 py-8 text-center text-neutral-400">
                  Selecciona un pedido para ver su detalle.
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-sm text-neutral-400">Orden</p>
                      <p className="mt-1 text-lg font-semibold">
                        #{selectedOrderDetail.id}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-neutral-400">Estado</p>
                      <p className="mt-1">
                        <span
                          className={`rounded-full px-3 py-1 text-sm ${getStatusClasses(
                            selectedOrderDetail.status
                          )}`}
                        >
                          {selectedOrderDetail.status}
                        </span>
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-neutral-400">Creado</p>
                      <p className="mt-1 text-base">
                        {formatDate(selectedOrderDetail.createdAt)}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-neutral-400">Colocado</p>
                      <p className="mt-1 text-base">
                        {formatDate(selectedOrderDetail.placedAt)}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-3 text-lg font-semibold">Productos</h3>
                    <div className="space-y-3">
                      {selectedOrderDetail.items.map((item) => (
                        <div
                          key={item.id}
                          className="rounded-xl border border-neutral-800 bg-black/30 p-4"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <p className="font-medium">{item.productName}</p>
                              <p className="text-sm text-neutral-400">SKU: {item.sku}</p>
                              <p className="text-sm text-neutral-400">
                                Cantidad: {item.quantity}
                              </p>
                            </div>

                            <div className="text-right">
                              <p className="text-sm text-neutral-400">
                                Unitario:{" "}
                                {formatMoney(
                                  item.unitPriceCents,
                                  selectedOrderDetail.currency
                                )}
                              </p>
                              <p className="font-medium">
                                {formatMoney(
                                  item.lineTotalCents,
                                  selectedOrderDetail.currency
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-xl border border-neutral-800 bg-black/30 p-4">
                    <h3 className="mb-3 text-lg font-semibold">Resumen</h3>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between gap-4">
                        <span className="text-neutral-400">Subtotal</span>
                        <span>
                          {formatMoney(
                            selectedOrderDetail.subtotalCents,
                            selectedOrderDetail.currency
                          )}
                        </span>
                      </div>

                      <div className="flex justify-between gap-4">
                        <span className="text-neutral-400">Descuento</span>
                        <span>
                          {formatMoney(
                            selectedOrderDetail.discountCents,
                            selectedOrderDetail.currency
                          )}
                        </span>
                      </div>

                      <div className="flex justify-between gap-4">
                        <span className="text-neutral-400">Envío</span>
                        <span>
                          {formatMoney(
                            selectedOrderDetail.shippingCents,
                            selectedOrderDetail.currency
                          )}
                        </span>
                      </div>

                      <div className="flex justify-between gap-4">
                        <span className="text-neutral-400">Impuestos</span>
                        <span>
                          {formatMoney(
                            selectedOrderDetail.taxCents,
                            selectedOrderDetail.currency
                          )}
                        </span>
                      </div>

                      <div className="mt-3 flex justify-between gap-4 border-t border-neutral-800 pt-3 text-base font-semibold">
                        <span>Total</span>
                        <span>
                          {formatMoney(
                            selectedOrderDetail.totalCents,
                            selectedOrderDetail.currency
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "addresses" && (
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold">Mis direcciones</h2>
                  <p className="mt-1 text-sm text-neutral-400">
                    Administra las direcciones de envío del usuario autenticado.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    resetAddressForm()
                  }}
                  className="rounded-lg border border-neutral-700 px-4 py-2 text-sm text-white transition hover:bg-neutral-800"
                >
                  Nueva dirección
                </button>
              </div>

              {addressesError && (
                <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {addressesError}
                </div>
              )}

              {addressesLoading ? (
                <p className="text-neutral-400">Cargando direcciones...</p>
              ) : addresses.length === 0 ? (
                <div className="rounded-xl border border-dashed border-neutral-700 px-5 py-8 text-center text-neutral-400">
                  Todavía no tienes direcciones registradas.
                </div>
              ) : (
                <div className="space-y-4">
                  {addresses.map((address) => (
                    <div
                      key={address.id}
                      className="rounded-xl border border-neutral-800 bg-black/30 p-5"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-semibold">{address.label}</h3>

                        {address.default && (
                          <span className="rounded-full bg-green-500/15 px-3 py-1 text-xs text-green-400">
                            Predeterminada
                          </span>
                        )}
                      </div>

                      <div className="mt-3 space-y-1 text-sm text-neutral-300">
                        <p>{address.recipientName}</p>
                        <p>{address.line1}</p>
                        {address.line2 && <p>{address.line2}</p>}
                        <p>
                          {address.city}, {address.state}
                        </p>
                        <p>
                          {address.postalCode} · {address.country}
                        </p>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => startEditAddress(address)}
                          className="rounded-lg border border-neutral-700 px-3 py-2 text-sm transition hover:bg-neutral-800"
                        >
                          Editar
                        </button>

                        {!address.default && (
                          <button
                            type="button"
                            onClick={() => void handleSetDefaultAddress(address.id)}
                            className="rounded-lg border border-neutral-700 px-3 py-2 text-sm transition hover:bg-neutral-800"
                          >
                            Marcar como predeterminada
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => void handleDeleteAddress(address.id)}
                          className="rounded-lg border border-red-500/30 px-3 py-2 text-sm text-red-300 transition hover:bg-red-500/10"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
              <h2 className="mb-1 text-2xl font-semibold">
                {editingAddressId ? "Editar dirección" : "Agregar dirección"}
              </h2>
              <p className="mb-5 text-sm text-neutral-400">
                Usa los campos del backend tal como están definidos en la API.
              </p>

              <form onSubmit={handleAddressSubmit} className="space-y-4">
                <input
                  type="text"
                  placeholder="Etiqueta (Casa, Oficina, etc.)"
                  required
                  value={addressForm.label}
                  onChange={(e) =>
                    setAddressForm((prev) => ({ ...prev, label: e.target.value }))
                  }
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-3"
                />

                <input
                  type="text"
                  placeholder="Nombre del destinatario"
                  required
                  value={addressForm.recipientName}
                  onChange={(e) =>
                    setAddressForm((prev) => ({
                      ...prev,
                      recipientName: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-3"
                />

                <input
                  type="text"
                  placeholder="Línea 1"
                  required
                  value={addressForm.line1}
                  onChange={(e) =>
                    setAddressForm((prev) => ({ ...prev, line1: e.target.value }))
                  }
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-3"
                />

                <input
                  type="text"
                  placeholder="Línea 2 (opcional)"
                  value={addressForm.line2}
                  onChange={(e) =>
                    setAddressForm((prev) => ({ ...prev, line2: e.target.value }))
                  }
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-3"
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <input
                    type="text"
                    placeholder="Ciudad"
                    required
                    value={addressForm.city}
                    onChange={(e) =>
                      setAddressForm((prev) => ({ ...prev, city: e.target.value }))
                    }
                    className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-3"
                  />

                  <input
                    type="text"
                    placeholder="Estado"
                    required
                    value={addressForm.state}
                    onChange={(e) =>
                      setAddressForm((prev) => ({ ...prev, state: e.target.value }))
                    }
                    className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-3"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <input
                    type="text"
                    placeholder="Código postal"
                    required
                    value={addressForm.postalCode}
                    onChange={(e) =>
                      setAddressForm((prev) => ({
                        ...prev,
                        postalCode: e.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-3"
                  />

                  <input
                    type="text"
                    placeholder="País (ej. MX)"
                    required
                    value={addressForm.country}
                    onChange={(e) =>
                      setAddressForm((prev) => ({
                        ...prev,
                        country: e.target.value.toUpperCase(),
                      }))
                    }
                    className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-3"
                  />
                </div>

                <label className="flex items-center gap-3 text-sm text-neutral-300">
                  <input
                    type="checkbox"
                    checked={addressForm.makeDefault}
                    onChange={(e) =>
                      setAddressForm((prev) => ({
                        ...prev,
                        makeDefault: e.target.checked,
                      }))
                    }
                    className="h-4 w-4"
                  />
                  Marcar como dirección predeterminada
                </label>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="submit"
                    disabled={addressSubmitting}
                    className="rounded-lg bg-white px-4 py-3 font-semibold text-black transition hover:opacity-90 disabled:opacity-60"
                  >
                    {addressSubmitting
                      ? editingAddressId
                        ? "Guardando..."
                        : "Creando..."
                      : editingAddressId
                      ? "Guardar cambios"
                      : "Crear dirección"}
                  </button>

                  {editingAddressId && (
                    <button
                      type="button"
                      onClick={resetAddressForm}
                      className="rounded-lg border border-neutral-700 px-4 py-3 transition hover:bg-neutral-800"
                    >
                      Cancelar edición
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}