export type AuthSession = {
  token: string
  tokenType: string
}

const TOKEN_KEY = "token"
const TOKEN_TYPE_KEY = "tokenType"

export function saveAuthSession(session: AuthSession) {
  if (typeof window === "undefined") return

  localStorage.setItem(TOKEN_KEY, session.token)
  localStorage.setItem(TOKEN_TYPE_KEY, session.tokenType)
}

export function getAuthSession(): AuthSession | null {
  if (typeof window === "undefined") return null

  const token = localStorage.getItem(TOKEN_KEY)
  const tokenType = localStorage.getItem(TOKEN_TYPE_KEY)

  if (!token || !tokenType) return null

  return { token, tokenType }
}

export function clearAuthSession() {
  if (typeof window === "undefined") return

  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(TOKEN_TYPE_KEY)
}