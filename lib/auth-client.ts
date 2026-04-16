import { API_BASE_URL } from "@/lib/api-config"

const AUTH_TIMEOUT_MS = 25_000

type AuthSuccess = {
  token: string
  tokenType?: string
}

function messageFromBody(data: unknown): string | undefined {
  if (data && typeof data === "object" && "message" in data) {
    const m = (data as { message?: unknown }).message
    if (typeof m === "string" && m.trim()) return m
  }
  return undefined
}

/**
 * POST a /api/auth/* con timeout. Devuelve error legible para UI.
 */
export async function postAuthJson(
  path: "/api/auth/login" | "/api/auth/register",
  body: Record<string, unknown>
): Promise<{ ok: true; data: AuthSuccess } | { ok: false; status: number; message: string }> {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), AUTH_TIMEOUT_MS)

  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
      signal: ctrl.signal,
      cache: "no-store",
    })

    const ct = res.headers.get("content-type") || ""
    let parsed: unknown = null
    if (ct.includes("application/json")) {
      parsed = await res.json().catch(() => null)
    } else {
      const text = await res.text().catch(() => "")
      if (text) parsed = { message: text }
    }

    if (!res.ok) {
      const msg =
        messageFromBody(parsed) ||
        (res.status === 401
          ? "Correo o contraseña incorrectos."
          : `Error ${res.status}`)
      return { ok: false, status: res.status, message: msg }
    }

    const token =
      parsed && typeof parsed === "object" && "token" in parsed
        ? String((parsed as { token?: unknown }).token || "")
        : ""

    if (!token) {
      return {
        ok: false,
        status: res.status,
        message: "La API no devolvió un token. Revisa que el backend sea la versión correcta.",
      }
    }

    const tokenType =
      parsed && typeof parsed === "object" && "tokenType" in parsed
        ? String((parsed as { tokenType?: unknown }).tokenType || "Bearer")
        : "Bearer"

    return { ok: true, data: { token, tokenType } }
  } catch (e) {
    if (e instanceof DOMException && e.name === "AbortError") {
      return {
        ok: false,
        status: 0,
        message: `Tiempo de espera agotado. ¿La API está en marcha en ${API_BASE_URL}?`,
      }
    }
    return {
      ok: false,
      status: 0,
      message: `No se pudo conectar con ${API_BASE_URL}. Comprueba que el servidor esté activo.`,
    }
  } finally {
    clearTimeout(timer)
  }
}
