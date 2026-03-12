import { getAuthSession } from "@/lib/auth-storage"

export const API_BASE_URL = "https://store-cherrys.onrender.com"

type ApiFetchOptions = RequestInit & {
  requireAuth?: boolean
}

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

    headers.set("Authorization", `${session.tokenType} ${session.token}`)
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
    const message =
      typeof data === "object" &&
      data !== null &&
      "message" in data &&
      typeof (data as { message?: unknown }).message === "string"
        ? (data as { message: string }).message
        : `Error ${response.status}`

    throw new Error(message)
  }

  return data as T
}