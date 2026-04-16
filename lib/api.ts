import { getAuthSession } from "@/lib/auth-storage"
import { API_BASE_URL } from "@/lib/api-config"

export { API_BASE_URL }

type ApiFetchOptions = RequestInit & {
  requireAuth?: boolean
}

/** JWT debe ir como `Bearer <token>`; el backend compara el prefijo de forma estricta. */
function authorizationHeader(session: { token: string; tokenType: string }): string {
  let raw = session.token.trim()
  if (/^bearer\s+/i.test(raw)) {
    raw = raw.replace(/^bearer\s+/i, "").trim()
  }
  const t = session.tokenType.trim()
  const scheme = t.toLowerCase() === "bearer" ? "Bearer" : t
  return `${scheme} ${raw}`
}

type ErrorBody = { message?: unknown; fields?: Record<string, string> }

export async function apiFetch<T>(
  endpoint: string,
  options: ApiFetchOptions = {}
): Promise<T> {
  const { requireAuth = false, ...fetchOptions } = options
  const headers = new Headers(fetchOptions.headers || {})

  if (fetchOptions.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json")
  }

  if (requireAuth) {
    const session = getAuthSession()

    if (!session) {
      throw new Error("No hay sesión activa")
    }

    headers.set("Authorization", authorizationHeader(session))
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
    cache: "no-store",
  })

  const contentType = response.headers.get("content-type") || ""

  let data: unknown = null

  if (contentType.includes("application/json")) {
    data = await response.json().catch(() => null)
  } else {
    data = await response.text().catch(() => null)
  }

  if (!response.ok) {
    const body = typeof data === "object" && data !== null ? (data as ErrorBody) : null
    let message =
      body && typeof body.message === "string" && body.message.trim()
        ? body.message
        : `Error ${response.status}`

    if (response.status === 401 || response.status === 403) {
      if (!body?.message || body.message === "Validation error") {
        message =
          "No autorizado (sesión inválida o expirada). Cierra sesión y vuelve a entrar."
      }
    }

    throw new Error(message)
  }

  return data as T
}