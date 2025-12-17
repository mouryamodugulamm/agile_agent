import { UserRole } from "./auth-storage"

// Define which roles can access which routes
export const ROLE_ROUTE_PERMISSIONS: Record<string, UserRole[]> = {
  "/mvp": ["admin", "product-owner"],
  "/stories": ["admin", "product-owner", "developer"],
  "/board": ["admin", "product-owner", "developer", "ai-agent"],
  "/ai-missions": ["admin", "product-owner", "ai-agent"],
  "/delivery-console": ["admin", "product-owner", "developer"],
  "/admin": ["admin"],
  "/profile": ["admin", "product-owner", "developer", "ai-agent"],
}

export function canAccessRoute(pathname: string, userRole: UserRole): boolean {
  // Check exact matches first
  if (ROLE_ROUTE_PERMISSIONS[pathname]) {
    return ROLE_ROUTE_PERMISSIONS[pathname].includes(userRole)
  }

  // Check prefix matches
  for (const [route, allowedRoles] of Object.entries(ROLE_ROUTE_PERMISSIONS)) {
    if (pathname.startsWith(route)) {
      return allowedRoles.includes(userRole)
    }
  }

  // Default: allow access if route is not in the list (public routes)
  return true
}

