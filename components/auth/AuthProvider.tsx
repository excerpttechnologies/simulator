"use client"

import { createContext, useContext, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import type { User, Role } from "@/lib/types"

interface AuthContextValue {
  user: User | null
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function refresh() {
    setLoading(true)
    try {
      const response = await fetch("/api/auth/me", { cache: "no-store" })
      if (!response.ok) {
        setUser(null)
        setError("Session expired")
      } else {
        const data = await response.json()
        setUser(data.user)
        setError(null)
      }
    } catch (err) {
      setUser(null)
      setError("Unable to verify session")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" })
    setUser(null)
    setError(null)
    router.push("/login")
  }

  const value = useMemo(
    () => ({ user, loading, error, refresh, logout }),
    [user, loading, error]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login")
    }
  }, [loading, user, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse rounded-xl border border-border bg-card p-8 text-center">
          <p className="text-sm text-muted-foreground">Checking access...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return <>{children}</>
}

export function RequireRoles({ allowedRoles, children }: { allowedRoles: Role[]; children: React.ReactNode }) {
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!loading && user && !allowedRoles.includes(user.role)) {
      router.replace("/access-denied")
    }
  }, [loading, user, router, allowedRoles])

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse rounded-xl border border-border bg-card p-8 text-center">
          <p className="text-sm text-muted-foreground">Validating permissions...</p>
        </div>
      </div>
    )
  }

  if (!allowedRoles.includes(user.role)) {
    return null
  }

  return <>{children}</>
}
