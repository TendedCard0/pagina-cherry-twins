/** Evita open redirects: solo rutas relativas internas. */
export function safeReturnPath(raw: string | null, fallback = "/account"): string {
  if (!raw || typeof raw !== "string") return fallback
  const t = raw.trim()
  if (!t.startsWith("/") || t.startsWith("//")) return fallback
  return t
}
