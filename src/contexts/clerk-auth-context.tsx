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
import { useUser, useClerk } from "@clerk/nextjs"
import type { UserResource } from "@clerk/types"
import { UserRole, RoleAuditEntry, UserStatus } from "@/lib/auth-storage"
import {
  getUserRoleFromMetadata,
  getUserStatusFromMetadata,
  listRoleAudit,
} from "@/lib/clerk-role-storage"

export type ClerkUser = {
  id: string
  email: string
  name: string
  company?: string
  role: UserRole
  status: UserStatus
  imageUrl?: string
  hasRoleSet?: boolean // Indicates if role was explicitly set in metadata
}

type AuthContextValue = {
  user: ClerkUser | null
  isLoading: boolean
  logout: () => Promise<void>
  updateProfile: (updates: { name: string; company?: string }) => Promise<{
    success: boolean
    message?: string
  }>
  refreshSession: () => void
  updateAccountRole: (
    userId: string,
    role: UserRole
  ) => Promise<{ success: boolean; message?: string }>
  updateAccountStatus: (
    userId: string,
    status: UserStatus
  ) => Promise<{ success: boolean; message?: string }>
  listRoleAuditEntries: () => RoleAuditEntry[]
  listAllUsers: () => Promise<ClerkUser[]>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function ClerkAuthProvider({ children }: { children: ReactNode }) {
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser()
  const clerk = useClerk()
  const [user, setUser] = useState<ClerkUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Convert Clerk user to our user format
  const convertClerkUser = useCallback((clerkUser: UserResource | null): ClerkUser | null => {
    if (!clerkUser) return null

    const email =
      clerkUser.primaryEmailAddress?.emailAddress ||
      clerkUser.emailAddresses[0]?.emailAddress ||
      ""
    const firstName = clerkUser.firstName || ""
    const lastName = clerkUser.lastName || ""
    const name = `${firstName} ${lastName}`.trim() || email.split("@")[0]

    const role = getUserRoleFromMetadata(clerkUser)
    const hasRoleSet = clerkUser.publicMetadata?.role !== undefined

    return {
      id: clerkUser.id,
      email,
      name,
      company: (clerkUser.publicMetadata?.company as string) || undefined,
      role,
      status: getUserStatusFromMetadata(clerkUser),
      imageUrl: clerkUser.imageUrl,
      hasRoleSet,
    }
  }, [])

  useEffect(() => {
    if (!clerkLoaded) {
      setIsLoading(true)
      return
    }

    if (clerkUser) {
      const converted = convertClerkUser(clerkUser)
      setUser(converted)
    } else {
      setUser(null)
    }
    setIsLoading(false)
  }, [clerkUser, clerkLoaded, convertClerkUser])

  const logout = useCallback(async () => {
    await clerk.signOut()
    setUser(null)
  }, [clerk])

  const updateProfile = useCallback(
    async (updates: { name: string; company?: string }) => {
      if (!clerkUser) {
        return { success: false, message: "You must be signed in." }
      }

      try {
        // Update Clerk user name
        const nameParts = updates.name.split(" ")
        const firstName = nameParts[0] || ""
        const lastName = nameParts.slice(1).join(" ") || ""

        await clerkUser.update({
          firstName,
          lastName,
        })

        // Note: Company metadata updates should be done via API route
        // For now, we'll update the local state
        // In production, create an API route to update publicMetadata

        // Refresh local state
        await clerkUser.reload()
        const converted = convertClerkUser(clerkUser)
        if (converted) {
          if (updates.company !== undefined) {
            // Update local state with company (will be synced via API in production)
            setUser({ ...converted, company: updates.company })
          } else {
            setUser(converted)
          }
        }

        return { success: true }
      } catch (error) {
        if (error instanceof Error) {
          return { success: false, message: error.message }
        }
        return { success: false, message: "Unable to update profile." }
      }
    },
    [clerkUser, clerk, convertClerkUser]
  )

  const refreshSession = useCallback(() => {
    if (clerkUser) {
      clerkUser.reload()
    }
  }, [clerkUser])

  const updateAccountRole = useCallback(
    async (userId: string, role: UserRole) => {
      if (!clerkUser) {
        return { success: false, message: "You must be signed in." }
      }

      try {
        const response = await fetch(`/api/users/${userId}/role`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ role }),
        })

        if (!response.ok) {
          const error = await response.json()
          return { success: false, message: error.error || "Unable to update role." }
        }

        // Refresh current user if updating self
        if (userId === clerkUser.id) {
          await clerkUser.reload()
          const converted = convertClerkUser(clerkUser)
          setUser(converted)
        }

        return { success: true }
      } catch (error) {
        if (error instanceof Error) {
          return { success: false, message: error.message }
        }
        return { success: false, message: "Unable to update role." }
      }
    },
    [clerkUser, convertClerkUser]
  )

  const updateAccountStatus = useCallback(
    async (userId: string, status: UserStatus) => {
      if (!clerkUser) {
        return { success: false, message: "You must be signed in." }
      }

      try {
        const response = await fetch(`/api/users/${userId}/role`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        })

        if (!response.ok) {
          const error = await response.json()
          return { success: false, message: error.error || "Unable to update status." }
        }

        // If updating current user, refresh and sign out if disabled
        if (userId === clerkUser.id) {
          await clerkUser.reload()
          const converted = convertClerkUser(clerkUser)
          setUser(converted)

          if (status === "disabled") {
            await clerk.signOut()
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
    [clerkUser, clerk, convertClerkUser]
  )

  const listRoleAuditEntries = useCallback(() => listRoleAudit(), [])

  const listAllUsers = useCallback(async (): Promise<ClerkUser[]> => {
    try {
      const response = await fetch("/api/users")
      if (!response.ok) {
        throw new Error("Failed to fetch users")
      }
      const data = await response.json()
      return data.users || []
    } catch (error) {
      console.error("Error fetching users:", error)
      return []
    }
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      logout,
      updateProfile,
      refreshSession,
      updateAccountRole,
      updateAccountStatus,
      listRoleAuditEntries,
      listAllUsers,
    }),
    [
      user,
      isLoading,
      logout,
      updateProfile,
      refreshSession,
      updateAccountRole,
      updateAccountStatus,
      listRoleAuditEntries,
      listAllUsers,
    ]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within a ClerkAuthProvider")
  }
  return context
}

