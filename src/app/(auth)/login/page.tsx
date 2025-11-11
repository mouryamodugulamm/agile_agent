"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { FormEvent, useState } from "react"
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Github,
  LogIn,
  Mail,
  ShieldCheck,
} from "lucide-react"

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
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { useAuth } from "@/contexts/auth-context"

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(true)
  const [useMfa, setUseMfa] = useState(false)
  const [mfaCode, setMfaCode] = useState("")
  const [captchaChecked, setCaptchaChecked] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    if (!captchaChecked) {
      setError("Please confirm the CAPTCHA challenge before continuing.")
      setIsSubmitting(false)
      return
    }

    if (useMfa && mfaCode.trim().length !== 6) {
      setError("Enter the 6-digit MFA code sent to your authenticator app.")
      setIsSubmitting(false)
      return
    }

    const result = login(email, password, rememberMe)

    if (!result.success) {
      setError(result.message ?? "Unable to sign in.")
      setIsSubmitting(false)
      return
    }

    router.push("/")
  }

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900">
      <div className="flex min-h-screen flex-col items-center justify-center px-4 py-16">
        <div className="flex w-full max-w-5xl flex-col gap-10 lg:flex-row">
          <Card className="border-none bg-slate-900/90 text-slate-100 shadow-2xl backdrop-blur-lg lg:w-[440px]">
            <CardHeader className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-white">
                <LogIn className="size-4 text-white" />
                Sign in
              </div>
              <CardTitle className="text-3xl font-semibold text-white">
                Welcome back
              </CardTitle>
              <CardDescription className="text-slate-100">
                Enter your credentials to access the Agile Agent workspace.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {error ? (
                <Alert
                  variant="destructive"
                  className="border-red-500/60 bg-red-500/10 text-red-100"
                >
                  <AlertTitle className="flex items-center gap-2 text-red-100">
                    <AlertCircle className="size-4" />
                    Login failed
                  </AlertTitle>
                  <AlertDescription className="text-red-200">
                    {error}
                  </AlertDescription>
                </Alert>
              ) : null}

              <div className="grid gap-3 sm:grid-cols-2">
                <Button
                  type="button"
                  variant="outline"
                  className="border-slate-700/70 bg-slate-950/50 text-slate-200 shadow-sm transition hover:bg-slate-800/70"
                  onClick={() =>
                    setError(
                      "Google sign-in is coming soon. Connect your OAuth provider in the integrations step."
                    )
                  }
                >
                  <Mail className="mr-2 size-4" />
                  Google
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="border-slate-700/70 bg-slate-950/50 text-slate-200 shadow-sm transition hover:bg-slate-800/70"
                  onClick={() =>
                    setError(
                      "GitHub sign-in is not configured yet. Add client credentials to enable it."
                    )
                  }
                >
                  <Github className="mr-2 size-4" />
                  GitHub
                </Button>
              </div>

              <div className="relative">
                <Separator className="bg-slate-800/80" />
                <span className="bg-slate-900/90 text-slate-300 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 px-3 text-xs uppercase tracking-wide">
                  or continue with email
                </span>
              </div>

              <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="space-y-2 text-white">
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

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-slate-100">
                      Password
                    </Label>
                    <Link
                      href="/forgot-password"
                      className="text-xs font-medium text-white underline-offset-2 hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="border-slate-700/80 bg-slate-950/60 text-white placeholder:text-slate-400 focus-visible:ring-primary/70"
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-white">
                  <label className="flex items-center gap-2">
                    <Checkbox
                      checked={rememberMe}
                      onCheckedChange={(checked) =>
                        setRememberMe(Boolean(checked))
                      }
                      className="border-slate-600 data-[state=checked]:border-primary data-[state=checked]:bg-primary"
                    />
                    Remember me
                  </label>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={useMfa}
                      onCheckedChange={(checked) => {
                        setUseMfa(Boolean(checked))
                        setMfaCode("")
                      }}
                      className="data-[state=checked]:bg-primary"
                    />
                    <span className="text-xs uppercase tracking-wide text-slate-200">
                      Use MFA
                    </span>
                  </div>
                  <span className="text-white">
                    New user?{" "}
                    <Link
                      href="/register"
                      className="font-medium text-white underline-offset-2 hover:underline"
                    >
                      Create account
                    </Link>
                  </span>
                </div>

                {useMfa ? (
                  <div className="space-y-2">
                    <Label htmlFor="mfa-code" className="text-slate-100">
                      MFA code
                    </Label>
                    <Input
                      id="mfa-code"
                      type="text"
                      inputMode="numeric"
                      placeholder="Enter 6-digit code"
                      maxLength={6}
                      value={mfaCode}
                      onChange={(event) =>
                        setMfaCode(event.target.value.replace(/\D/g, ""))
                      }
                      className="border-slate-700/80 bg-slate-950/60 text-white placeholder:text-slate-400 focus-visible:ring-primary/70"
                    />
                    <p className="text-xs text-slate-300">
                      Check your authenticator app or SMS for the latest code.
                    </p>
                  </div>
                ) : null}

                <div className="space-y-3 rounded-2xl border border-slate-800/70 bg-slate-950/40 px-4 py-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-white">
                    <ShieldCheck className="size-4 text-primary" />
                    CAPTCHA verification
                  </div>
                  <label className="flex items-center gap-3 rounded-xl border border-slate-800/70 bg-slate-900/70 px-4 py-3 text-sm text-slate-200">
                    <Checkbox
                      checked={captchaChecked}
                      onCheckedChange={(checked) =>
                        setCaptchaChecked(Boolean(checked))
                      }
                      className="border-slate-600 data-[state=checked]:border-primary data-[state=checked]:bg-primary"
                    />
                    I&apos;m not a robot
                  </label>
                  <p className="text-xs text-slate-400">
                    Bot mitigation is handled locally for now. We&apos;ll hook this
                    into reCAPTCHA once the backend is ready.
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full justify-center shadow-lg shadow-primary/20"
                  disabled={
                    isSubmitting ||
                    !captchaChecked ||
                    (useMfa && mfaCode.trim().length !== 6)
                  }
                >
                  {isSubmitting ? "Signing in..." : "Sign in"}
                  <ArrowRight className="ml-2 size-4" />
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="border-slate-800/70 bg-slate-900/70 text-slate-100 flex-1 rounded-3xl border p-10 backdrop-blur-lg">
            <div className="max-w-md space-y-8 text-left">
              <div>
                <h2 className="text-3xl font-semibold tracking-tight text-white">
                  Build and ship with confidence
                </h2>
                <p className="mt-3 text-slate-200">
                  Agile Agent keeps product owners, engineers, and AI teammates
                  aligned with a unified backlog, sprint board, and automated
                  delivery checks.
                </p>
              </div>

              <div className="grid gap-6 text-sm text-slate-200">
                <div className="rounded-2xl border border-slate-800/80 bg-slate-950/60 px-5 py-4 shadow-inner">
                  <p className="font-medium text-white">Account security</p>
                  <p className="mt-2 text-slate-200">
                    Multi-factor prompts and CAPTCHA help protect access until we
                    wire up production-grade identity services.
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-800/80 bg-slate-950/60 px-5 py-4 shadow-inner">
                  <p className="font-medium text-white">Story intelligence</p>
                  <p className="mt-2 text-slate-200">
                    Generate refined user stories with acceptance criteria in
                    seconds and let AI suggest effort sizing.
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-800/80 bg-slate-950/60 px-5 py-4 shadow-inner">
                  <p className="font-medium text-white">Connected delivery</p>
                  <p className="mt-2 text-slate-200">
                    Sync progress with Git, trigger pipelines, and surface build
                    health without leaving the board.
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-800/80 bg-slate-950/60 px-5 py-4 shadow-inner">
                  <p className="font-medium text-white">Secure access</p>
                  <p className="mt-2 text-slate-200">
                    Role-aware controls, MFA, and audit trails keep every team
                    member on the right track.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

