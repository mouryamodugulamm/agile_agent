"use client"

import Link from "next/link"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useAuth } from "@/contexts/auth-context"
import type { UserRole } from "@/lib/auth-storage"

const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Admin",
  "product-owner": "Product Owner",
  developer: "Developer",
  "ai-agent": "AI Agent",
}

export default function Home() {
  const { user, logout, isLoading } = useAuth()

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-300">
        Loading workspace...
      </main>
    )
  }

  if (!user) {
    return (
      <main className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900">
        <div className="flex min-h-screen flex-col items-center justify-center px-6 py-24 text-center text-slate-100 sm:px-12">
          <div className="mx-auto max-w-3xl space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-800/70 bg-slate-950/70 px-4 py-1 text-xs font-medium uppercase tracking-wide text-slate-300">
              AI Powered Story Writer & Scrum Board
            </span>
            <h1 className="text-balance text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Orchestrate your hybrid team from one control center.
            </h1>
            <p className="text-pretty text-lg text-slate-300 sm:text-xl">
              Sign in or create an account to generate user stories, plan sprints,
              and collaborate with AI agents.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/20 transition hover:bg-primary/90"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-lg border border-slate-700 px-6 py-3 text-sm font-medium text-white transition hover:bg-slate-900/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
              >
                Create account
              </Link>
            </div>
            <div className="text-xs text-slate-400">
              Forgot your password?{" "}
              <Link
                href="/forgot-password"
                className="font-medium text-white underline-offset-2 hover:underline"
              >
                Reset it here
              </Link>
              .
            </div>
          </div>
        </div>
      </main>
    )
  }

  const initials = user.name
    .split(" ")
    .map((part) => part[0]?.toUpperCase())
    .slice(0, 2)
    .join("")

  return (
    <main className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900">
      <div className="flex min-h-screen flex-col items-center justify-center px-6 py-24 text-slate-200 sm:px-12">
        <div className="w-full max-w-4xl space-y-8">
          <div className="flex flex-col items-start justify-between gap-4 text-left sm:flex-row sm:items-center">
            <div>
              <p className="text-sm text-slate-300">Signed in as</p>
              <h1 className="text-3xl font-semibold text-white sm:text-4xl">
                {user.name}
              </h1>
              <p className="text-slate-300">{user.email}</p>
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Role: <span className="text-slate-200">{ROLE_LABELS[user.role]}</span>
              </p>
            </div>
            <Button
              variant="outline"
              className="border-slate-700 text-slate-100 hover:bg-slate-900/60 focus-visible:ring-2 focus-visible:ring-primary/60"
              onClick={() => logout()}
            >
              Sign out
            </Button>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <Card className="border-slate-800/80 bg-slate-900/75 text-white backdrop-blur-lg">
              <CardHeader>
                <CardTitle>Workspace overview</CardTitle>
                <CardDescription className="text-slate-300">
                  This is your home while we wire up the backlog, board, and AI
                  orchestration modules.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 text-sm text-slate-200 sm:grid-cols-2">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    Name
                  </p>
                  <p className="mt-1 text-base text-white">{user.name}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    Company
                  </p>
                  <p className="mt-1 text-base text-white">
                    {user.company || "Not provided"}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    Role
                  </p>
                  <p className="mt-1 text-base text-white">
                    {ROLE_LABELS[user.role]}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    Member since
                  </p>
                  <p className="mt-1 text-base text-white">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-800/80 bg-slate-900/75 text-white backdrop-blur-lg">
              <CardHeader className="space-y-1">
                <CardTitle>Profile</CardTitle>
                <CardDescription className="text-slate-300">
                  Manage your access, devices, and upcoming AI assignments.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center gap-4 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full border border-slate-700 bg-slate-950 text-lg font-semibold text-white">
                  {initials}
                </div>
                <p className="text-sm text-slate-300">
                  Update your personal information, security preferences, and session
                  settings in the profile center.
                </p>
                <Button
                  variant="secondary"
                  asChild
                  className="w-full justify-center border border-slate-700 bg-slate-950/70 text-slate-100 hover:bg-slate-900 focus-visible:ring-2 focus-visible:ring-primary/60"
                >
                  <Link href="/profile">Open profile & settings</Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {user.role === "admin" ? (
            <Card className="border-slate-800/80 bg-slate-900/75 text-white backdrop-blur-lg">
              <CardHeader>
                <CardTitle>Admin shortcuts</CardTitle>
                <CardDescription className="text-slate-300">
                  Manage workspace roles and keep an eye on audit activity.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 sm:flex-row">
                <Button
                  asChild
                  className="w-full justify-center shadow-lg shadow-primary/20"
                >
                  <Link href="/admin/roles">Role management</Link>
                </Button>
                <Button
                  variant="outline"
                  asChild
                  className="w-full justify-center border-slate-700 text-slate-100 hover:bg-slate-900/60"
                >
                  <Link href="/profile">View my profile</Link>
                </Button>
              </CardContent>
            </Card>
          ) : null}

          <Card className="rounded-3xl border border-slate-800/80 bg-slate-900/70 p-6 text-sm text-slate-200 backdrop-blur-lg">
            <CardTitle className="text-white">Next up</CardTitle>
            <CardDescription className="mt-2 text-slate-300">
              We&apos;re bringing the story writer, scrum board, and AI agent automation
              online. Your account will carry over as we connect the remaining modules.
            </CardDescription>
          </Card>
        </div>
      </div>
    </main>
  )
}
