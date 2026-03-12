"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { apiFetch } from "@/lib/api"
import {
  clearAuthSession,
  getAuthSession,
  saveAuthSession,
  type AuthSession,
} from "@/lib/auth-storage"

export type UserProfile = {
  id: number
  email: string
  fullName: string
  phone: string
  role: string
  active: boolean
  emailVerified: boolean
  createdAt: string
}

type AuthContextValue = {
  user: UserProfile | null
  session: AuthSession | null
  isAuthenticated: boolean
  isLoading: boolean
  completeAuth: (session: AuthSession) => Promise<UserProfile>
  refreshUser: () => Promise<UserProfile | null>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [session, setSession] = useState<AuthSession | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshUser = useCallback(async () => {
    const storedSession = getAuthSession()

    if (!storedSession) {
      setSession(null)
      setUser(null)
      return null
    }

    const profile = await apiFetch<UserProfile>("/api/users/me", {
      method: "GET",
      requireAuth: true,
    })

    setSession(storedSession)
    setUser(profile)

    return profile
  }, [])

  const completeAuth = useCallback(async (nextSession: AuthSession) => {
    saveAuthSession(nextSession)
    setSession(nextSession)

    try {
      const profile = await apiFetch<UserProfile>("/api/users/me", {
        method: "GET",
        requireAuth: true,
      })

      setUser(profile)
      return profile
    } catch (error) {
      clearAuthSession()
      setSession(null)
      setUser(null)
      throw error
    }
  }, [])

  const logout = useCallback(() => {
    clearAuthSession()
    setSession(null)
    setUser(null)
  }, [])

  useEffect(() => {
    async function bootstrapAuth() {
      const storedSession = getAuthSession()

      if (!storedSession) {
        setSession(null)
        setUser(null)
        setIsLoading(false)
        return
      }

      try {
        setSession(storedSession)

        const profile = await apiFetch<UserProfile>("/api/users/me", {
          method: "GET",
          requireAuth: true,
        })

        setUser(profile)
      } catch (error) {
        console.error("Error restoring session:", error)
        clearAuthSession()
        setSession(null)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    bootstrapAuth()
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      session,
      isAuthenticated: !!user && !!session,
      isLoading,
      completeAuth,
      refreshUser,
      logout,
    }),
    [user, session, isLoading, completeAuth, refreshUser, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider")
  }

  return context
}