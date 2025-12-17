"use client"

import Link from "next/link"
import {
  ArrowRight,
  BrainCircuit,
  PanelsTopLeft,
  Rocket,
  ShieldCheck,
  Sparkles,
  Timer,
  Workflow,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useAuth } from "@/contexts/clerk-auth-context"
import type { UserRole } from "@/lib/auth-storage"
import { BrandLogo } from "@/components/brand-logo"

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
      <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.08),transparent_55%),radial-gradient(circle_at_bottom,_rgba(14,165,233,0.1),transparent_55%)] bg-slate-950 text-slate-100">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-x-0 top-0 h-[480px] bg-[radial-gradient(circle_at_top,_rgba(168,85,247,0.25),transparent_60%)] blur-3xl" />
          <div className="absolute inset-x-0 bottom-0 h-[420px] bg-[radial-gradient(circle_at_bottom,_rgba(34,197,94,0.18),transparent_60%)] blur-3xl" />
        </div>
        <div className="relative z-10 flex min-h-screen flex-col">
          <header className="px-6 py-8 sm:px-12">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <Link href="/" className="flex items-center gap-3 text-left">
                <BrandLogo className="text-white text-lg sm:text-xl" accentClassName="text-rose-500" />
                <span className="text-xs text-slate-500">
                  Product orchestration for teams of humans and AI agents
                </span>
              </Link>
              <div className="flex gap-2">
                <Button
                  asChild
                  variant="ghost"
                  className="hidden text-slate-300 hover:text-white sm:inline-flex"
                >
                  <Link href="/login">Sign in</Link>
                </Button>
                <Button asChild className="shadow-md shadow-primary/25 hover:shadow-primary/45">
                  <Link href="/register">Create account</Link>
                </Button>
              </div>
            </div>
          </header>

          <section className="flex flex-1 flex-col items-center justify-center px-6 pb-24 pt-10 text-center sm:px-12">
            <div className="mx-auto flex max-w-6xl flex-col items-center gap-10">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-primary-foreground">
                AI powered story writer & scrum board
              </span>
              <h1 className="text-balance text-4xl font-semibold tracking-tight text-white sm:text-5xl md:text-6xl">
                Launch product stories, sprints, and delivery pipelines from one sleek cockpit
              </h1>
              <p className="max-w-3xl text-pretty text-base text-slate-300 sm:text-lg">
                Agile Agent transforms MVP briefs into engineered user stories, pairs them with bots or builders,
                and keeps every commit, build, and deployment transparent in real time.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Button asChild size="lg" className="gap-2 px-8 text-sm font-medium shadow-lg shadow-primary/30 hover:shadow-primary/45">
                  <Link href="/register">
                    Start free workspace
                    <ArrowRight className="size-4 text-white" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="border-slate-700/80 bg-slate-950/70 px-8 text-sm font-medium text-white hover:bg-slate-800/70"
                >
                  <Link href="/login">I already have an account</Link>
                </Button>
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
              <div className="relative mt-6 w-full max-w-5xl overflow-hidden rounded-[32px] border border-slate-800/60 bg-transparent shadow-[0_35px_80px_-30px_rgba(59,130,246,0.35)]">
                <div className="absolute inset-0 bg-[conic-gradient(from_140deg_at_30%_50%,rgba(37,99,235,0.18),rgba(168,85,247,0.12),transparent_60%)] blur-3xl" />
                <div className="relative grid gap-6 bg-gradient-to-br from-slate-950/95 via-slate-950/80 to-slate-950/95 px-8 py-10 sm:grid-cols-[0.6fr_0.4fr] sm:px-12">
                  <div className="space-y-8 text-left">
                    <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-300">
                      <PanelsTopLeft className="size-4 text-sky-300" />
                      Flow at a glance
                    </div>
                    <div className="grid gap-4">
                      {[
                        {
                          title: "Capture MVP signal",
                          description:
                            "Paste strategic briefs or upload files. We parse personas, objectives, and constraints instantly.",
                          accent: "text-sky-300",
                        },
                        {
                          title: "Generate sprint-ready stories",
                          description:
                            "AI drafts user stories with points, tags, and acceptance criteria. Product owners fine-tune in Story Studio.",
                          accent: "text-emerald-300",
                        },
                        {
                          title: "Automate delivery",
                          description:
                            "Commits, builds, and deploys stay in sync with each story. Trigger pipelines or roll back in seconds.",
                          accent: "text-purple-300",
                        },
                      ].map((item) => (
                        <div
                          key={item.title}
                          className="group rounded-2xl border border-slate-800/70 bg-slate-950/85 p-5 shadow-inner shadow-slate-950/40 transition hover:border-primary/40 hover:shadow-primary/20"
                        >
                          <p className={`text-xs uppercase tracking-wide ${item.accent}`}>{item.title}</p>
                          <p className="mt-2 text-sm text-slate-300">{item.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col justify-between gap-4">
                    <div className="flex h-full flex-col justify-between rounded-2xl border border-primary/30 bg-primary/10 p-6 text-left text-sm text-primary-foreground shadow-inner shadow-primary/20">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-slate-100">Live preview</p>
                        <h3 className="mt-2 text-lg font-semibold text-white">
                          Story Studio, Scrum Board, Delivery Console
                        </h3>
                        <p className="mt-3 text-xs text-slate-100/90">
                          Real product screens — no lorem ipsum. Dark theme out of the box, high contrast for late-night sprints.
                        </p>
                      </div>
                      <div className="mt-6 grid gap-3 text-xs text-slate-200">
                        <div className="rounded-xl border border-slate-800/50 bg-slate-950/60 p-4">
                          <p className="text-[11px] uppercase tracking-wide text-slate-400">Velocity gain</p>
                          <p className="text-2xl font-semibold text-white">+37%</p>
                          <p className="text-[11px] text-slate-400">Throughput vs manual workflows</p>
                        </div>
                        <div className="rounded-xl border border-slate-800/50 bg-slate-950/60 p-4">
                          <p className="text-[11px] uppercase tracking-wide text-slate-400">Backlog speed</p>
                          <p className="text-2xl font-semibold text-white">60%</p>
                          <p className="text-[11px] text-slate-400">Faster from MVP to groomed stories</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-20 sm:px-12">
            <div className="grid gap-6 lg:grid-cols-3">
              {[
                {
                  title: "Parse & plan in minutes",
                  description:
                    "Upload MVP documents and watch them become tagged stories with acceptance criteria, story points, and personas automatically linked.",
                  icon: BrainCircuit,
                  accent: "text-sky-300",
                },
                {
                  title: "Automate sprints with bots",
                  description:
                    "Route documentation, scaffolding, or testing stories to AI agents. Monitor progress and override at any step.",
                  icon: Workflow,
                  accent: "text-emerald-300",
                },
                {
                  title: "Ship with confidence",
                  description:
                    "Commits, pipelines, and deploy status stay in sync with each story. Get instant alerts when builds fail or releases go live.",
                  icon: ShieldCheck,
                  accent: "text-purple-300",
                },
              ].map((feature) => {
                const Icon = feature.icon
                return (
                  <Card
                    key={feature.title}
                    className="group border-slate-800/70 bg-slate-900/70 text-left shadow-inner shadow-slate-950/40 backdrop-blur transition hover:-translate-y-1 hover:border-primary/50 hover:shadow-primary/15"
                  >
                    <CardHeader className="space-y-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 text-primary group-hover:scale-105 group-hover:border-primary/40">
                        <Icon className={`size-6 ${feature.accent}`} />
                      </div>
                      <CardTitle className="text-lg text-white">{feature.title}</CardTitle>
                      <CardDescription className="text-sm text-slate-300">
                        {feature.description}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                )
              })}
            </div>
          </section>

          <section className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-24 sm:px-12">
            <div className="grid gap-6 rounded-3xl border border-slate-800/70 bg-slate-900/70 p-8 shadow-inner shadow-slate-950/50 backdrop-blur xl:grid-cols-[0.6fr_0.4fr]">
              <div className="space-y-8 text-left">
                <span className="inline-flex items-center gap-2 rounded-full border border-slate-800/60 bg-slate-950/70 px-3 py-1 text-[11px] uppercase tracking-wide text-slate-300">
                  End-to-end orchestration
                </span>
                <h2 className="text-3xl font-semibold text-white md:text-4xl">
                  Three layers working together out of the box
                </h2>
                <div className="space-y-4 text-sm text-slate-300">
                    <div className="flex gap-3 rounded-2xl border border-slate-800/70 bg-slate-950/80 p-4">
                      <Sparkles className="size-5 text-primary" />
                    <div>
                      <p className="font-medium text-white">Story intelligence</p>
                      <p className="text-slate-400">
                        AI parses requirements, drafts stories, and suggests refinement steps so your backlog stays clean.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3 rounded-2xl border border-slate-800/70 bg-slate-950/80 p-4">
                      <Timer className="size-5 text-sky-300" />
                    <div>
                      <p className="font-medium text-white">Sprint automation</p>
                      <p className="text-slate-400">
                        Scrum board pairs humans and bots. Drag, drop, and watch progress update instantly for every teammate.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3 rounded-2xl border border-slate-800/70 bg-slate-950/80 p-4">
                      <Rocket className="size-5 text-emerald-300" />
                    <div>
                      <p className="font-medium text-white">Delivery console</p>
                      <p className="text-slate-400">
                        Git commits, builds, and releases are captured in one console with quick actions when anything fails.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid gap-4 rounded-2xl border border-slate-800/60 bg-slate-950/80 p-6 text-left text-sm text-slate-300 shadow-inner shadow-slate-950/40">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">Why teams choose Agile Agent</p>
                  <div className="mt-4 space-y-3">
                    <div className="rounded-xl border border-slate-800/70 bg-slate-900/70 p-4">
                      <p className="font-semibold text-white">60% faster story prep</p>
                      <p className="text-xs text-slate-400">AI-assisted parsing removes manual backlog grooming.</p>
                    </div>
                    <div className="rounded-xl border border-slate-800/70 bg-slate-900/70 p-4">
                      <p className="font-semibold text-white">Real-time role-based UI</p>
                      <p className="text-xs text-slate-400">Product owners, devs, and bots share a unified workspace.</p>
                    </div>
                    <div className="rounded-xl border border-slate-800/70 bg-slate-900/70 p-4">
                      <p className="font-semibold text-white">Built for dark mode</p>
                      <p className="text-xs text-slate-400">High contrast design keeps late-night sprints comfortable.</p>
                    </div>
                  </div>
                </div>
                <Button asChild className="mt-auto w-full justify-center shadow-lg shadow-primary/20 hover:shadow-primary/35">
                  <Link href="/register">Reserve your workspace</Link>
                </Button>
              </div>
            </div>
          </section>
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
              className="border-slate-700 text-slate-100 hover:bg-slate-800/70 focus-visible:ring-2 focus-visible:ring-primary/60"
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
                    Account
                  </p>
                  <p className="mt-1 text-base text-white">
                    Active member
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
              className="w-full justify-center border border-slate-700 bg-slate-950/70 text-slate-100 hover:bg-slate-800/70 focus-visible:ring-2 focus-visible:ring-primary/60"
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
                  className="w-full justify-center border-slate-700 text-slate-100 hover:bg-slate-800/70"
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
