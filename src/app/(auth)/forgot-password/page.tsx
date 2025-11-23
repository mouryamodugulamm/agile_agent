"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { FormEvent, useState } from "react"
import { ArrowRight, KeyRound } from "lucide-react"

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
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/auth-context"
import { BrandLogo } from "@/components/brand-logo"

type Step = "request" | "reset" | "done"

export default function ForgotPasswordPage() {
  const router = useRouter()
  const { listAccounts, resetPassword } = useAuth()

  const [step, setStep] = useState<Step>("request")
  const [email, setEmail] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)

  const handleEmailSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    const matches = listAccounts().some(
      (account) => account.email.trim().toLowerCase() === email.trim().toLowerCase()
    )

    if (!matches) {
      setError("We couldn't find an account with that email address.")
      return
    }

    setStep("reset")
  }

  const handlePasswordSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long.")
      return
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    const result = resetPassword(email, newPassword)

    if (!result.success) {
      setError(result.message ?? "Unable to update password.")
      return
    }

    setStep("done")
  }

  const renderContent = () => {
    switch (step) {
      case "request":
        return (
          <form className="space-y-5" onSubmit={handleEmailSubmit}>
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
                className="bg-slate-950/50 border-slate-700 text-white placeholder:text-slate-500"
              />
            </div>
            <Button type="submit" className="w-full justify-center">
              Continue
              <ArrowRight className="ml-2 size-4" />
            </Button>
          </form>
        )
      case "reset":
        return (
          <form className="space-y-5" onSubmit={handlePasswordSubmit}>
            <div className="space-y-2">
              <Label htmlFor="new-password" className="text-slate-100">
                New password
              </Label>
              <Input
                id="new-password"
                type="password"
                placeholder="Create a new password"
                autoComplete="new-password"
                required
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                className="bg-slate-950/50 border-slate-700 text-white placeholder:text-slate-500"
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
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="bg-slate-950/50 border-slate-700 text-white placeholder:text-slate-500"
              />
            </div>
            <Button type="submit" className="w-full justify-center">
              Save new password
              <ArrowRight className="ml-2 size-4" />
            </Button>
          </form>
        )
      case "done":
        return (
          <div className="space-y-5 text-center text-slate-200">
            <p className="text-lg font-medium">Password updated</p>
            <p className="text-sm text-slate-400">
              You can now sign in with your new credentials.
            </p>
            <Button
              className="w-full justify-center"
              onClick={() => router.push("/login")}
            >
              Back to sign in
              <ArrowRight className="ml-2 size-4" />
            </Button>
          </div>
        )
    }
  }

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900">
      <div className="flex min-h-screen flex-col items-center justify-center px-4 py-16">
        <div className="w-full max-w-xl">
          <Card className="border-none bg-slate-900/90 text-slate-100 shadow-2xl backdrop-blur-lg">
            <CardHeader className="space-y-2">
              <BrandLogo className="text-white text-xl" accentClassName="text-rose-500" />
              <div className="flex items-center gap-2 text-sm font-medium text-white">
                <KeyRound className="size-4 text-white" />
                Reset password
              </div>
              <CardTitle className="text-3xl font-semibold text-white">
                Recover access
              </CardTitle>
              <CardDescription className="text-slate-100">
                Confirm your email and choose a new password to get back into
                your workspace.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {error ? (
                <Alert
                  variant="destructive"
                  className="border-red-500/60 bg-red-500/10 text-red-100"
                >
                  <AlertTitle className="text-red-100">Action required</AlertTitle>
                  <AlertDescription className="text-red-200">
                    {error}
                  </AlertDescription>
                </Alert>
              ) : null}
              <div className="text-white">{renderContent()}</div>
            </CardContent>
            <CardFooter className="flex items-center justify-between text-sm text-white">
              <Link
                href="/login"
                className="text-white underline-offset-2 hover:underline"
              >
                Back to sign in
              </Link>
              <Link
                href="/register"
                className="text-white underline-offset-2 transition-colors hover:text-primary"
              >
                Need an account?
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}

