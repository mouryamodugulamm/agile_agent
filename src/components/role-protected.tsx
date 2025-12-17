"use client"

import { usePathname, useRouter } from "next/navigation"
import { useEffect } from "react"
import { useAuth } from "@/contexts/clerk-auth-context"
import { canAccessRoute } from "@/lib/role-protection"
import { Loader2 } from "lucide-react"

type RoleProtectedProps = {
  children: React.ReactNode
  requiredRole?: "admin" | "product-owner" | "developer" | "ai-agent"
}

export function RoleProtected({ children, requiredRole }: RoleProtectedProps) {
  const { user, isLoading } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (isLoading) return

    if (!user) {
      router.push("/login")
      return
    }

    // Check role-based access
    if (requiredRole) {
      const roleHierarchy: Record<string, number> = {
        admin: 4,
        "product-owner": 3,
        developer: 2,
        "ai-agent": 1,
      }

      const userRoleLevel = roleHierarchy[user.role] || 0
      const requiredRoleLevel = roleHierarchy[requiredRole] || 0

      if (userRoleLevel < requiredRoleLevel) {
        router.push("/")
        return
      }
    } else {
      // Use route-based permissions
      if (!canAccessRoute(pathname, user.role)) {
        router.push("/")
        return
      }
    }
  }, [user, isLoading, pathname, router, requiredRole])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
        <div className="flex items-center gap-2 rounded-lg border border-slate-800/60 bg-slate-900/60 px-4 py-3 text-sm text-slate-300 shadow-inner">
          <Loader2 className="size-4 animate-spin text-white" />
          Verifying permissions…
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
        <div className="flex items-center gap-2 rounded-lg border border-slate-800/60 bg-slate-900/60 px-4 py-3 text-sm text-slate-300 shadow-inner">
          <Loader2 className="size-4 animate-spin text-white" />
          Redirecting to sign in…
        </div>
      </div>
    )
  }

  // Check if user has access
  if (requiredRole) {
    const roleHierarchy: Record<string, number> = {
      admin: 4,
      "product-owner": 3,
      developer: 2,
      "ai-agent": 1,
    }

    const userRoleLevel = roleHierarchy[user.role] || 0
    const requiredRoleLevel = roleHierarchy[requiredRole] || 0

    if (userRoleLevel < requiredRoleLevel) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
          <div className="rounded-lg border border-slate-800/60 bg-slate-900/60 px-4 py-3 text-sm text-slate-300 shadow-inner">
            Access denied. You don't have the required permissions.
          </div>
        </div>
      )
    }
  } else if (!canAccessRoute(pathname, user.role)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
        <div className="rounded-lg border border-slate-800/60 bg-slate-900/60 px-4 py-3 text-sm text-slate-300 shadow-inner">
          Access denied. You don't have the required permissions.
        </div>
      </div>
    )
  }

  return <>{children}</>
}

