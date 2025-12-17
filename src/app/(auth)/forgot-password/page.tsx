"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { KeyRound } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BrandLogo } from "@/components/brand-logo"

export default function ForgotPasswordPage() {
  const router = useRouter()

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
                Password reset is handled through Clerk. Please use the "Forgot password?" link on the sign-in page.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="rounded-lg border border-slate-800/70 bg-slate-950/40 p-4 text-sm text-slate-300">
                <p className="mb-2 font-medium text-white">How to reset your password:</p>
                <ol className="list-inside list-decimal space-y-1">
                  <li>Go to the sign-in page</li>
                  <li>Click "Forgot password?"</li>
                  <li>Enter your email address</li>
                  <li>Check your email for the reset link</li>
                </ol>
              </div>
            </CardContent>
            <CardFooter className="flex items-center justify-between text-sm text-white">
              <Button
                variant="outline"
                className="border-slate-700/70 bg-slate-950/50 text-slate-200 hover:bg-slate-800/70"
                onClick={() => router.push("/login")}
              >
                Back to sign in
              </Button>
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
