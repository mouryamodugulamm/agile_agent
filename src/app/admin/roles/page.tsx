"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Check, ShieldQuestion, Users } from "lucide-react"

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useAuth } from "@/contexts/clerk-auth-context"
import type { RoleAuditEntry, UserRole, UserStatus } from "@/lib/auth-storage"

const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Admin",
  "product-owner": "Product Owner",
  developer: "Developer",
  "ai-agent": "AI Agent",
}

const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  admin: "Full system administration",
  "product-owner": "Backlog & sprint management",
  developer: "Story updates & delivery",
  "ai-agent": "Automated execution tasks",
}

export default function RoleManagementPage() {
  const router = useRouter()
  const {
    user,
    isLoading,
    listAllUsers,
    updateAccountRole,
    updateAccountStatus,
    listRoleAuditEntries,
  } = useAuth()

  const [users, setUsers] = useState<Awaited<ReturnType<typeof listAllUsers>>>([])
  const [auditEntries, setAuditEntries] = useState<RoleAuditEntry[]>([])
  const [filterText, setFilterText] = useState("")
  const [feedback, setFeedback] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoading && user && user.role !== "admin") {
      router.push("/")
    }
  }, [isLoading, user, router])

  useEffect(() => {
    const loadData = async () => {
      const allUsers = await listAllUsers()
      setUsers(allUsers)
      setAuditEntries(listRoleAuditEntries())
    }
    if (user?.role === "admin") {
      loadData()
    }
  }, [listAllUsers, listRoleAuditEntries, user])

  const filteredUsers = useMemo(() => {
    return users.filter((item) => {
      const target = `${item.name} ${item.email}`.toLowerCase()
      return target.includes(filterText.toLowerCase())
    })
  }, [users, filterText])

  if (isLoading || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-200">
        Loading role manager...
      </main>
    )
  }

  if (user.role !== "admin") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-slate-200">
        <Card className="max-w-lg border-slate-800 bg-slate-900/80 text-white backdrop-blur-lg">
          <CardHeader className="space-y-3">
            <CardTitle className="flex items-center gap-2 text-xl">
              <ShieldQuestion className="size-5 text-primary" />
              Access restricted
            </CardTitle>
            <CardDescription className="text-slate-300">
              Only administrators can manage team roles. Reach out to an administrator for help.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="secondary" asChild className="w-full justify-center">
              <Link href="/">Return home</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    )
  }

  const handleRoleChange = async (userId: string, role: UserRole) => {
    const result = await updateAccountRole(userId, role)
    if (result.success) {
      setFeedback("Role updated successfully.")
      const allUsers = await listAllUsers()
      setUsers(allUsers)
      setAuditEntries(listRoleAuditEntries())
    } else {
      setFeedback(result.message ?? "Unable to update role.")
    }
  }

  const handleStatusToggle = async (userId: string, status: UserStatus) => {
    const result = await updateAccountStatus(userId, status)
    if (result.success) {
      setFeedback(`Account ${status === "active" ? "enabled" : "disabled"} successfully.`)
      const allUsers = await listAllUsers()
      setUsers(allUsers)
      setAuditEntries(listRoleAuditEntries())
    } else {
      setFeedback(result.message ?? "Unable to update account status.")
    }
  }

  return (
    <main className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 px-4 py-16 sm:px-6">
        <header className="flex flex-col gap-3 text-white">
          <h1 className="text-3xl font-semibold">Role management</h1>
          <p className="text-sm text-slate-300">
            Review user privileges, manage account access, and track role changes.
          </p>
        </header>

        {feedback ? (
          <Alert
            variant="default"
            className="border-slate-700/60 bg-slate-900/70 text-slate-100 backdrop-blur"
          >
            <AlertTitle>Status</AlertTitle>
            <AlertDescription>{feedback}</AlertDescription>
          </Alert>
        ) : null}

        <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
          <Card className="border-slate-800/80 bg-slate-900/80 text-white backdrop-blur-lg">
            <CardHeader className="space-y-3">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Users className="size-5 text-primary" />
                Team roster
              </CardTitle>
              <CardDescription className="text-slate-300">
                Assign roles and toggle access for members across your workspace.
              </CardDescription>
              <Input
                placeholder="Filter by name or email"
                value={filterText}
                onChange={(event) => setFilterText(event.target.value)}
                className="border-slate-700/70 bg-slate-950/60 text-white placeholder:text-slate-400 focus-visible:ring-primary/70"
              />
            </CardHeader>
            <CardContent className="space-y-4">
              {filteredUsers.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-800/70 bg-slate-950/40 px-4 py-6 text-center text-sm text-slate-400">
                  No users found. Adjust your filter criteria.
                </div>
              ) : null}
              <div className="grid gap-4">
                {filteredUsers.map((account) => (
                  <div
                    key={account.id}
                    className="rounded-2xl border border-slate-800/70 bg-slate-950/50 p-5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-white">{account.name}</p>
                        <p className="text-xs text-slate-400">{account.email}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Label className="text-xs uppercase tracking-wide text-slate-300">
                          Role
                        </Label>
                        <Select
                          value={account.role}
                          onValueChange={async (value: UserRole) =>
                            await handleRoleChange(account.id, value)
                          }
                        >
                          <SelectTrigger className="w-44 border-slate-700/70 bg-slate-950/60 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="border-slate-800 bg-slate-950 text-white">
                            {Object.entries(ROLE_LABELS).map(([value, label]) => (
                              <SelectItem key={value} value={value}>
                                <div className="flex flex-col">
                                  <span>{label}</span>
                                  <span className="text-xs text-slate-400">
                                    {ROLE_DESCRIPTIONS[value as UserRole]}
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={account.status === "active"}
                          onCheckedChange={async (checked) =>
                            await handleStatusToggle(account.id, checked ? "active" : "disabled")
                          }
                          className="data-[state=checked]:bg-primary"
                        />
                        <span>
                          {account.status === "active" ? "Active" : "Disabled"} account
                        </span>
                      </div>
                      <span>
                        Role defined: <strong>{ROLE_LABELS[account.role]}</strong>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-800/80 bg-slate-900/80 text-white backdrop-blur-lg">
            <CardHeader>
              <CardTitle>Role definitions</CardTitle>
              <CardDescription className="text-slate-300">
                Understand the privileges associated with each role.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-slate-200">
              {Object.entries(ROLE_LABELS).map(([value, label]) => (
                <div
                  key={value}
                  className="rounded-xl border border-slate-800/70 bg-slate-950/60 px-4 py-3"
                >
                  <p className="font-medium text-white">{label}</p>
                  <p className="mt-1 text-slate-300">
                    {ROLE_DESCRIPTIONS[value as UserRole]}
                  </p>
                </div>
              ))}

              <div className="space-y-3">
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Audit log (last {auditEntries.length})
                </p>
                {auditEntries.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-800/70 bg-slate-950/40 px-4 py-3 text-xs text-slate-400">
                    Role changes will appear here once updates are made.
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {auditEntries.map((entry) => {
                      const changedUser = users.find((item) => item.id === entry.userId)
                      const actor = users.find((item) => item.id === entry.changedById)
                      return (
                        <div
                          key={entry.id}
                          className="rounded-xl border border-slate-800/70 bg-slate-950/50 px-4 py-3 text-xs text-slate-300"
                        >
                          <p className="flex items-center gap-2 text-slate-200">
                            <Check className="size-3 text-primary" />
                            {ROLE_LABELS[entry.previousRole]} → {ROLE_LABELS[entry.newRole]}
                          </p>
                          <p>
                            Target:{" "}
                            <span className="font-medium text-white">
                              {changedUser?.name ?? "Unknown user"}
                            </span>{" "}
                            • By:{" "}
                            <span className="font-medium text-white">
                              {actor?.name ?? "Unknown"}
                            </span>
                          </p>
                          <p className="text-[10px] text-slate-500">
                            {new Date(entry.timestamp).toLocaleString()}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}




