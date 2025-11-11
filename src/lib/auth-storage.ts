"use client"

export type UserRole = "admin" | "product-owner" | "developer" | "ai-agent"

export type UserStatus = "active" | "disabled"

export type StoredUser = {
  id: string
  email: string
  password: string
  name: string
  company?: string
  role: UserRole
  status: UserStatus
  createdAt: number
}

const USERS_KEY = "agile-agent-users"
const SESSION_KEY = "agile-agent-session"
const ROLE_AUDIT_KEY = "agile-agent-role-audit"

type SessionPayload = {
  userId: string
  remember: boolean
  timestamp: number
}

export type RoleAuditEntry = {
  id: string
  userId: string
  changedById: string
  previousRole: UserRole
  newRole: UserRole
  timestamp: number
}

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

export function listUsers(): StoredUser[] {
  const rawUsers = readStorageItem<StoredUser[]>(USERS_KEY, [])
  let needsNormalization = false
  const normalized = rawUsers.map((user) => {
    const next: StoredUser = {
      ...user,
      role: user.role ?? "product-owner",
      status: user.status ?? "active",
    }
    if (next.role !== user.role || next.status !== user.status) {
      needsNormalization = true
    }
    return next
  })

  if (needsNormalization) {
    writeStorageItem(USERS_KEY, normalized)
  }

  return normalized
}

export function findUserByEmail(email: string): StoredUser | null {
  const users = listUsers()
  return users.find(
    (user) => user.email.trim().toLowerCase() === email.trim().toLowerCase()
  ) ?? null
}

export function createUser(
  input: Omit<StoredUser, "id" | "createdAt" | "status"> & {
    status?: UserStatus
  }
) {
  const users = listUsers()
  const existing = findUserByEmail(input.email)

  if (existing) {
    throw new Error("An account with this email already exists.")
  }

  const user: StoredUser = {
    ...input,
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    status: input.status ?? "active",
    createdAt: Date.now(),
  }

  users.push(user)
  writeStorageItem(USERS_KEY, users)

  return user
}

export function authenticateUser(
  email: string,
  password: string
): StoredUser | null {
  const user = findUserByEmail(email)
  if (!user) {
    return null
  }

  if (user.password !== password) {
    return null
  }

  return user
}

export function updateUserPassword(email: string, password: string) {
  const users = listUsers()
  const index = users.findIndex(
    (user) => user.email.trim().toLowerCase() === email.trim().toLowerCase()
  )

  if (index === -1) {
    throw new Error("Account not found.")
  }

  users[index] = { ...users[index], password }
  writeStorageItem(USERS_KEY, users)

  const currentSession = getStoredSession()
  if (currentSession?.userId === users[index].id) {
    persistSession(users[index].id, currentSession.remember)
  }

  return users[index]
}

export function updateUserProfile(
  userId: string,
  updates: Partial<Pick<StoredUser, "name" | "company">>
): StoredUser {
  const users = listUsers()
  const index = users.findIndex((user) => user.id === userId)

  if (index === -1) {
    throw new Error("Account not found.")
  }

  users[index] = { ...users[index], ...updates }
  writeStorageItem(USERS_KEY, users)

  return users[index]
}

export function appendRoleAudit(entry: RoleAuditEntry) {
  const entries = readStorageItem<RoleAuditEntry[]>(ROLE_AUDIT_KEY, [])
  entries.unshift(entry)
  writeStorageItem(ROLE_AUDIT_KEY, entries.slice(0, 50))
}

export function listRoleAudit(): RoleAuditEntry[] {
  return readStorageItem<RoleAuditEntry[]>(ROLE_AUDIT_KEY, [])
}

export function updateUserRole(
  userId: string,
  role: UserRole,
  changedById: string
): StoredUser {
  const users = listUsers()
  const index = users.findIndex((user) => user.id === userId)

  if (index === -1) {
    throw new Error("Account not found.")
  }

  const previousRole = users[index].role
  users[index] = { ...users[index], role }
  writeStorageItem(USERS_KEY, users)

  appendRoleAudit({
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    userId,
    changedById,
    previousRole,
    newRole: role,
    timestamp: Date.now(),
  })

  return users[index]
}

export function updateUserStatus(
  userId: string,
  status: UserStatus
): StoredUser {
  const users = listUsers()
  const index = users.findIndex((user) => user.id === userId)

  if (index === -1) {
    throw new Error("Account not found.")
  }

  users[index] = { ...users[index], status }
  writeStorageItem(USERS_KEY, users)

  return users[index]
}

export function persistSession(userId: string, remember: boolean) {
  const payload: SessionPayload = {
    userId,
    remember,
    timestamp: Date.now(),
  }

  writeStorageItem(SESSION_KEY, payload)
}

export function getStoredSession(): SessionPayload | null {
  return readStorageItem<SessionPayload | null>(SESSION_KEY, null)
}

export function clearSession() {
  if (typeof window === "undefined") {
    return
  }

  window.localStorage.removeItem(SESSION_KEY)
}

