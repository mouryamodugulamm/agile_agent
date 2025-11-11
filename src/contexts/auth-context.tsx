"use client"

import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"

import {
  RoleAuditEntry,
  StoredUser,
  UserRole,
  UserStatus,
  authenticateUser,
  clearSession,
  createUser,
  findUserByEmail,
  getStoredSession,
  listRoleAudit,
  listUsers,
  persistSession,
  updateUserPassword,
  updateUserProfile,
  updateUserRole,
  updateUserStatus,
} from "@/lib/auth-storage"

type AuthContextValue = {
  user: StoredUser | null
  isLoading: boolean
  login: (email: string, password: string, remember: boolean) => {
    success: boolean
    message?: string
  }
  logout: () => void
  register: (input: {
    name: string
    email: string
    password: string
    company?: string
    role: UserRole
  }) => { success: boolean; message?: string }
  resetPassword: (email: string, password: string) => {
    success: boolean
    message?: string
  }
  listAccounts: () => StoredUser[]
  updateProfile: (updates: { name: string; company?: string }) => {
    success: boolean
    message?: string
  }
  refreshSession: () => void
  updateAccountRole: (userId: string, role: UserRole) => {
    success: boolean
    message?: string
  }
  updateAccountStatus: (userId: string, status: UserStatus) => {
    success: boolean
    message?: string
  }
  listRoleAuditEntries: () => RoleAuditEntry[]
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<StoredUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(true)
    const session = getStoredSession()
    if (session?.userId) {
      const existing = listUsers().find((item) => item.id === session.userId)
      if (existing) {
        setUser(existing)
      } else {
        clearSession()
      }
    }
    setIsLoading(false)
  }, [])

  const login = useCallback(
    (email: string, password: string, remember: boolean) => {
      const account = authenticateUser(email, password)
      if (!account) {
        return { success: false, message: "Invalid email or password." }
      }

       if (account.status === "disabled") {
        return {
          success: false,
          message: "This account is disabled. Contact an administrator.",
        }
      }

      persistSession(account.id, remember)
      setUser(account)
      return { success: true }
    },
    []
  )

  const logout = useCallback(() => {
    clearSession()
    setUser(null)
  }, [])

  const register = useCallback(
    (input: {
      name: string
      email: string
      password: string
      company?: string
      role: UserRole
    }) => {
      try {
        const account = createUser({
          name: input.name,
          email: input.email,
          password: input.password,
          company: input.company,
          role: input.role,
          status: "active",
        })
        persistSession(account.id, true)
        setUser(account)
        return { success: true }
      } catch (error) {
        if (error instanceof Error) {
          return { success: false, message: error.message }
        }
        return { success: false, message: "Unable to create account." }
      }
    },
    []
  )

  const resetPassword = useCallback((email: string, password: string) => {
    const account = findUserByEmail(email)
    if (!account) {
      return { success: false, message: "Account not found." }
    }

    try {
      updateUserPassword(email, password)
      if (user && user.email === email) {
        setUser({ ...user, password })
      }
      return { success: true }
    } catch (error) {
      if (error instanceof Error) {
        return { success: false, message: error.message }
      }
      return { success: false, message: "Unable to update password." }
    }
  }, [user])

  const listAccounts = useCallback(() => listUsers(), [])

  const updateProfile = useCallback(
    (updates: { name: string; company?: string }) => {
      if (!user) {
        return { success: false, message: "You must be signed in." }
      }

      try {
        const updated = updateUserProfile(user.id, updates)
        setUser(updated)
        return { success: true }
      } catch (error) {
        if (error instanceof Error) {
          return { success: false, message: error.message }
        }
        return { success: false, message: "Unable to update profile." }
      }
    },
    [user]
  )

  const refreshSession = useCallback(() => {
    if (!user) {
      return
    }
    persistSession(user.id, true)
  }, [user])

  const updateAccountRole = useCallback(
    (userId: string, role: UserRole) => {
      if (!user) {
        return { success: false, message: "You must be signed in." }
      }

      try {
        const updated = updateUserRole(userId, role, user.id)
        if (user.id === userId) {
          setUser(updated)
        }
        return { success: true }
      } catch (error) {
        if (error instanceof Error) {
          return { success: false, message: error.message }
        }
        return { success: false, message: "Unable to update role." }
      }
    },
    [user]
  )

  const updateAccountStatus = useCallback(
    (userId: string, status: UserStatus) => {
      try {
        const updated = updateUserStatus(userId, status)
        if (user && user.id === userId) {
          setUser(updated)
          if (status === "disabled") {
            clearSession()
            setUser(null)
          }
        }
        return { success: true }
      } catch (error) {
        if (error instanceof Error) {
          return { success: false, message: error.message }
        }
        return { success: false, message: "Unable to update status." }
      }
    },
    [user]
  )

  const listRoleAuditEntries = useCallback(() => listRoleAudit(), [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      login,
      logout,
      register,
      resetPassword,
      listAccounts,
      updateProfile,
      refreshSession,
      updateAccountRole,
      updateAccountStatus,
      listRoleAuditEntries,
    }),
    [
      user,
      isLoading,
      login,
      logout,
      register,
      resetPassword,
      listAccounts,
      updateProfile,
      refreshSession,
      updateAccountRole,
      updateAccountStatus,
      listRoleAuditEntries,
    ]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

