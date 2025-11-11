"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

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
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { useAuth } from "@/contexts/auth-context"

export default function ProfilePage() {
  const router = useRouter()
  const {
    user,
    isLoading,
    updateProfile,
    resetPassword,
    refreshSession,
    logout,
  } = useAuth()

  const [name, setName] = useState("")
  const [company, setCompany] = useState("")
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [darkModePreference, setDarkModePreference] = useState(true)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [profileMessage, setProfileMessage] = useState<string | null>(null)
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null)
  const [sessionMessage, setSessionMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [isLoading, user, router])

  useEffect(() => {
    if (user) {
      setName(user.name)
      setCompany(user.company ?? "")
    }
  }, [user])

  if (isLoading || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-200">
        Loading profile...
      </main>
    )
  }

  const handleProfileSave = () => {
    const result = updateProfile({ name, company })
    if (result.success) {
      setProfileMessage("Profile updated successfully.")
    } else {
      setProfileMessage(result.message ?? "Unable to update profile.")
    }
  }

  const handlePasswordUpdate = () => {
    if (password.trim().length < 8) {
      setPasswordMessage("Password must be at least 8 characters long.")
      return
    }

    if (password !== confirmPassword) {
      setPasswordMessage("Passwords do not match.")
      return
    }

    const result = resetPassword(user.email, password)
    if (result.success) {
      setPassword("")
      setConfirmPassword("")
      setPasswordMessage("Password updated successfully.")
    } else {
      setPasswordMessage(result.message ?? "Unable to update password.")
    }
  }

  const handleSessionRefresh = () => {
    refreshSession()
    setSessionMessage("Sessions refreshed. Other devices will require a new login.")
  }

  const handleLogoutAll = () => {
    logout()
    router.push("/login")
  }

  return (
    <main className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900">
      <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-8 px-4 py-16 sm:px-6">
        <header>
          <h1 className="text-3xl font-semibold text-white">Profile & Settings</h1>
          <p className="mt-2 text-sm text-slate-300">
            Manage your personal information, security preferences, and sessions.
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-5">
          <Card className="border-slate-800/80 bg-slate-900/80 text-white backdrop-blur-lg lg:col-span-3">
            <CardHeader>
              <CardTitle>Personal information</CardTitle>
              <CardDescription className="text-slate-300">
                Keep your name and organization details up to date.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {profileMessage ? (
                <Alert
                  className="border-slate-700/60 bg-slate-800/50 text-slate-100"
                  variant="default"
                >
                  <AlertTitle>Status</AlertTitle>
                  <AlertDescription>{profileMessage}</AlertDescription>
                </Alert>
              ) : null}

              <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-200">
                  Full name
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="border-slate-700/80 bg-slate-950/60 text-white placeholder:text-slate-400 focus-visible:ring-primary/70"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-200">
                  Email
                </Label>
                <Input
                  id="email"
                  value={user.email}
                  disabled
                  className="border-slate-800/80 bg-slate-950/60 text-slate-400"
                />
                <p className="text-xs text-slate-400">
                  Email updates are handled by workspace administrators.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="company" className="text-slate-200">
                  Company / squad
                </Label>
                <Input
                  id="company"
                  value={company}
                  onChange={(event) => setCompany(event.target.value)}
                  placeholder="Aurora Sprint Labs"
                  className="border-slate-700/80 bg-slate-950/60 text-white placeholder:text-slate-400 focus-visible:ring-primary/70"
                />
              </div>

              <Separator className="bg-slate-800/80" />

              <div className="space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-300">
                  Preferences
                </h3>
                <div className="flex items-center justify-between rounded-xl border border-slate-800/70 bg-slate-950/60 px-4 py-3">
                  <div>
                    <p className="text-sm text-white">Email notifications</p>
                    <p className="text-xs text-slate-400">
                      Receive alerts for story updates, assignments, and mentions.
                    </p>
                  </div>
                  <Switch
                    checked={notificationsEnabled}
                    onCheckedChange={(checked) => setNotificationsEnabled(Boolean(checked))}
                    className="data-[state=checked]:bg-primary"
                  />
                </div>
                <div className="flex items-center justify-between rounded-xl border border-slate-800/70 bg-slate-950/60 px-4 py-3">
                  <div>
                    <p className="text-sm text-white">Appearance</p>
                    <p className="text-xs text-slate-400">
                      Toggle dark mode preference for future sessions.
                    </p>
                  </div>
                  <Switch
                    checked={darkModePreference}
                    onCheckedChange={(checked) => setDarkModePreference(Boolean(checked))}
                    className="data-[state=checked]:bg-primary"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleProfileSave} className="shadow-lg shadow-primary/20">
                  Save changes
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-8 lg:col-span-2">
            <Card className="border-slate-800/80 bg-slate-900/80 text-white backdrop-blur-lg">
              <CardHeader>
                <CardTitle>Password</CardTitle>
                <CardDescription className="text-slate-300">
                  Update your password to keep your account secure.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {passwordMessage ? (
                  <Alert
                    className="border-slate-700/60 bg-slate-800/40 text-slate-100"
                    variant="default"
                  >
                    <AlertTitle>Status</AlertTitle>
                    <AlertDescription>{passwordMessage}</AlertDescription>
                  </Alert>
                ) : null}
                <div className="space-y-2">
                  <Label htmlFor="new-password" className="text-slate-200">
                    New password
                  </Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Create a new password"
                    className="border-slate-700/80 bg-slate-950/60 text-white placeholder:text-slate-400 focus-visible:ring-primary/70"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password" className="text-slate-200">
                    Confirm password
                  </Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    placeholder="Re-enter new password"
                    className="border-slate-700/80 bg-slate-950/60 text-white placeholder:text-slate-400 focus-visible:ring-primary/70"
                  />
                </div>
                <Button onClick={handlePasswordUpdate} className="w-full justify-center">
                  Update password
                </Button>
              </CardContent>
            </Card>

            <Card className="border-slate-800/80 bg-slate-900/80 text-white backdrop-blur-lg">
              <CardHeader>
                <CardTitle>Sessions</CardTitle>
                <CardDescription className="text-slate-300">
                  Manage your active sessions and devices.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {sessionMessage ? (
                  <Alert
                    className="border-slate-700/60 bg-slate-800/40 text-slate-100"
                    variant="default"
                  >
                    <AlertTitle>Status</AlertTitle>
                    <AlertDescription>{sessionMessage}</AlertDescription>
                  </Alert>
                ) : null}
                <div className="space-y-2 text-sm text-slate-300">
                  <p>
                    <span className="font-medium text-white">Current device:</span>{" "}
                    Active session since{" "}
                    {new Date(user.createdAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                  <p className="text-xs text-slate-400">
                    Refresh your tokens or sign out everywhere to secure your account if a device is lost.
                  </p>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <Button
                    variant="secondary"
                    onClick={handleSessionRefresh}
                    className="w-full justify-center border border-slate-700 bg-slate-950/60 text-slate-100 hover:bg-slate-800/70"
                  >
                    Refresh tokens
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleLogoutAll}
                    className="w-full justify-center"
                  >
                    Sign out everywhere
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}

