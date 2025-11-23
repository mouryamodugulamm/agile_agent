"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { FormEvent, useState } from "react"
import { ArrowRight, UserPlus } from "lucide-react"

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
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/auth-context"
import type { UserRole } from "@/lib/auth-storage"
import { BrandLogo } from "@/components/brand-logo"

const ROLE_OPTIONS: Array<{ value: UserRole; label: string; description: string }> =
  [
    {
      value: "product-owner",
      label: "Product Owner",
      description: "Own the backlog, prioritize stories, run sprints.",
    },
    {
      value: "developer",
      label: "Developer",
      description: "Update stories, ship code, collaborate with the team.",
    },
    {
      value: "ai-agent",
      label: "AI Agent",
      description: "Handle automated tasks and bot-ready stories.",
    },
    {
      value: "admin",
      label: "Admin",
      description: "Manage integrations, settings, and workspace policies.",
    },
  ]

export default function RegisterPage() {
  const router = useRouter()
  const { register } = useAuth()

  const [name, setName] = useState("")
  const [company, setCompany] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [role, setRole] = useState<UserRole>("product-owner")
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    if (!agreeTerms) {
      setError("Please accept the terms to continue.")
      return
    }

    setIsSubmitting(true)
    const result = register({ name, email, password, company, role })

    if (!result.success) {
      setError(result.message ?? "Unable to create account.")
      setIsSubmitting(false)
      return
    }

    router.push("/")
  }

  return (
    <div className="bg-gradient-to-br from-indigo-900 via-slate-950 to-slate-900">
      <div className="flex min-h-screen flex-col items-center justify-center px-4 py-16">
        <Card className="w-full max-w-xl border-none bg-slate-900/90 text-slate-100 shadow-2xl backdrop-blur-lg">
          <CardHeader className="space-y-3">
            <BrandLogo className="text-white text-xl" accentClassName="text-rose-500" />
            <div className="flex items-center gap-2 text-sm font-medium text-white">
              <UserPlus className="size-4 text-white" />
              Create account
            </div>
            <CardTitle className="text-3xl font-semibold text-white">
              Join Agile Agent
            </CardTitle>
            <CardDescription className="text-slate-100">
              Register your workspace profile to start planning and shipping
              with AI support.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
              {error ? (
                <Alert
                  variant="destructive"
                  className="border-red-500/60 bg-red-500/10 text-red-100"
                >
                  <AlertTitle className="text-red-100">
                    Registration failed
                  </AlertTitle>
                  <AlertDescription className="text-red-200">
                    {error}
                  </AlertDescription>
                </Alert>
              ) : null}

              <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-slate-100">
                    Full name
                  </Label>
                  <Input
                    id="name"
                    placeholder="Jordan Lee"
                    required
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className="border-slate-700/80 bg-slate-950/60 text-white placeholder:text-slate-400 focus-visible:ring-primary/70"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company" className="text-slate-100">
                    Company or squad (optional)
                  </Label>
                  <Input
                    id="company"
                    placeholder="Aurora Sprint Labs"
                    value={company}
                    onChange={(event) => setCompany(event.target.value)}
                    className="border-slate-700/80 bg-slate-950/60 text-white placeholder:text-slate-400 focus-visible:ring-primary/70"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-100">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@team.com"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="border-slate-700/80 bg-slate-950/60 text-white placeholder:text-slate-400 focus-visible:ring-primary/70"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-slate-100">
                      Password
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Create a password"
                      autoComplete="new-password"
                      required
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      className="border-slate-700/80 bg-slate-950/60 text-white placeholder:text-slate-400 focus-visible:ring-primary/70"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password" className="text-slate-100">
                      Confirm password
                    </Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="Re-enter password"
                      autoComplete="new-password"
                      required
                      value={confirmPassword}
                      onChange={(event) =>
                        setConfirmPassword(event.target.value)
                      }
                      className="border-slate-700/80 bg-slate-950/60 text-white placeholder:text-slate-400 focus-visible:ring-primary/70"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role" className="text-slate-100">
                    Select your role
                  </Label>
                  <div className="relative">
                    <select
                      id="role"
                      value={role}
                      onChange={(event) =>
                        setRole(event.target.value as UserRole)
                      }
                      className="border-slate-700/80 bg-slate-950/60 text-white placeholder:text-slate-400 focus-visible:ring-primary/70 flex h-12 w-full appearance-none rounded-lg border px-4 text-sm outline-none transition focus-visible:ring-2"
                    >
                      {ROLE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <p className="text-xs text-slate-300">
                    {ROLE_OPTIONS.find((option) => option.value === role)
                      ?.description ?? ""}
                  </p>
                </div>

                <label className="flex items-start gap-3 rounded-2xl border border-slate-800/80 bg-slate-950/50 px-4 py-3 text-sm text-slate-200">
                  <Checkbox
                    checked={agreeTerms}
                    onCheckedChange={(checked) => setAgreeTerms(Boolean(checked))}
                    className="mt-0.5 border-slate-600 data-[state=checked]:border-primary data-[state=checked]:bg-primary"
                  />
                  <span>
                    I agree to the workspace terms and understand my credentials
                    are stored securely on this device.
                  </span>
                </label>

                <Button
                  type="submit"
                  className="w-full justify-center shadow-lg shadow-primary/20"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Creating..." : "Create account"}
                  <ArrowRight className="ml-2 size-4" />
                </Button>
              </form>

              <p className="text-sm text-white">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-medium text-white underline-offset-2 hover:underline"
                >
                  Sign in
                </Link>
              </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

