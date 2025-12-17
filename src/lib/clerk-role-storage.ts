import { UserRole, RoleAuditEntry, UserStatus } from "./auth-storage"

const ROLE_AUDIT_KEY = "agile-agent-role-audit"

function readStorageItem<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") {
    return fallback
  }

  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) {
      return fallback
    }
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function writeStorageItem<T>(key: string, value: T) {
  if (typeof window === "undefined") {
    return
  }

  window.localStorage.setItem(key, JSON.stringify(value))
}

export function appendRoleAudit(entry: RoleAuditEntry) {
  const entries = readStorageItem<RoleAuditEntry[]>(ROLE_AUDIT_KEY, [])
  entries.unshift(entry)
  writeStorageItem(ROLE_AUDIT_KEY, entries.slice(0, 50))
}

export function listRoleAudit(): RoleAuditEntry[] {
  return readStorageItem<RoleAuditEntry[]>(ROLE_AUDIT_KEY, [])
}

// Helper to get role from Clerk user metadata
export function getUserRoleFromMetadata(user: {
  publicMetadata?: Record<string, unknown>
}): UserRole {
  const role = user.publicMetadata?.role as UserRole | undefined
  if (role && ["admin", "product-owner", "developer", "ai-agent"].includes(role)) {
    return role
  }
  return "product-owner" // default role
}

// Helper to get status from Clerk user metadata
export function getUserStatusFromMetadata(user: {
  publicMetadata?: Record<string, unknown>
}): UserStatus {
  const status = user.publicMetadata?.status as UserStatus | undefined
  if (status && ["active", "disabled"].includes(status)) {
    return status
  }
  return "active" // default status
}

