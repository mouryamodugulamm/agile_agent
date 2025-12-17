"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  ChevronDown,
  ChevronUp,
  Loader2,
  Menu,
  UserCircle2,
} from "lucide-react"
import { ReactNode, useEffect, useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger,
} from "@/components/ui/sheet"
import { useAuth } from "@/contexts/clerk-auth-context"
import type { UserRole } from "@/lib/auth-storage"
import { BrandLogo } from "@/components/brand-logo"

type AppShellProps = {
  children: ReactNode
}

type NavItem = {
  label: string
  href: string
  roles: UserRole[]
  description?: string
}

const BASE_NAV: NavItem[] = [
  {
    label: "MVP Intake",
    href: "/mvp",
    roles: ["admin", "product-owner"],
    description: "Upload MVP docs and parse features",
  },
  {
    label: "Story Studio",
    href: "/stories",
    roles: ["admin", "product-owner", "developer"],
    description: "Refine user stories & acceptance criteria",
  },
  {
    label: "Scrum Board",
    href: "/board",
    roles: ["admin", "product-owner", "developer", "ai-agent"],
    description: "Visualize sprint progress and move cards",
  },
  {
    label: "AI Assignments",
    href: "/ai-missions",
    roles: ["admin", "product-owner", "ai-agent"],
    description: "Review automation-ready tasks",
  },
  {
    label: "Delivery Console",
    href: "/delivery-console",
    roles: ["admin", "product-owner", "developer"],
    description: "Manage Git automation & pipeline health",
  },
]

const ADMIN_NAV: NavItem[] = [
  {
    label: "Role Manager",
    href: "/admin/roles",
    roles: ["admin"],
    description: "Adjust permissions and monitor audit log",
  },
]

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout: handleLogout, isLoading } = useAuth()
  const [showNav, setShowNav] = useState(true)

  const publicRoutes = useMemo(() => ["/", "/login", "/register", "/forgot-password"], [])
  const authOnlyRoutes = useMemo(() => ["/login", "/register", "/forgot-password"], [])

  const isPublicRoute = useMemo(() => {
    return publicRoutes.some((route) =>
      route === "/" ? pathname === route : pathname.startsWith(route)
    )
  }, [pathname, publicRoutes])

  useEffect(() => {
    if (isLoading) {
      return
    }

    if (!user && !isPublicRoute && pathname !== "/login") {
      router.replace("/login")
      return
    }

    if (
      user &&
      authOnlyRoutes.some((route) => pathname.startsWith(route)) &&
      pathname !== "/"
    ) {
      router.replace("/")
    }
  }, [authOnlyRoutes, isLoading, isPublicRoute, pathname, router, user])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
        <div className="flex items-center gap-2 rounded-lg border border-slate-800/60 bg-slate-900/60 px-4 py-3 text-sm text-slate-300 shadow-inner">
          <Loader2 className="size-4 animate-spin text-white" />
          Verifying session…
        </div>
      </div>
    )
  }

  if (!user && !isPublicRoute) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
        <div className="flex items-center gap-2 rounded-lg border border-slate-800/60 bg-slate-900/60 px-4 py-3 text-sm text-slate-300 shadow-inner">
          <Loader2 className="size-4 animate-spin text-white" />
          Redirecting to sign in…
        </div>
      </div>
    )
  }

  if (!user) {
    return <div className="min-h-screen">{children}</div>
  }

  const navItems = useMemo(() => {
    const eligible = [...BASE_NAV]
    if (user.role === "admin") {
      eligible.push(...ADMIN_NAV)
    }

    return eligible.filter((item) => item.roles.includes(user.role))
  }, [user])

  const activeLabel =
    navItems.find((item) => pathname.startsWith(item.href))?.label ?? null

  const navContent = (
    <nav className="flex flex-col gap-1">
      {navItems.map((item) => {
        const isActive = pathname.startsWith(item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={`rounded-lg border px-3 py-2 text-sm text-left transition ${
              isActive
                ? "border-slate-700 bg-slate-800/80 text-white shadow-sm"
                : "border-transparent text-slate-200 hover:border-slate-700 hover:bg-slate-800/60 hover:text-white"
            }`}
          >
            <p
              className={`font-medium ${
                isActive ? "text-white" : "text-slate-200"
              }`}
            >
              {item.label}
            </p>
            {item.description ? (
              <p className="text-xs text-slate-400">{item.description}</p>
            ) : null}
          </Link>
        )
      })}
    </nav>
  )

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-slate-100">
      <header className="sticky top-0 z-40 border-b border-slate-800/70 bg-slate-900/85 px-4 py-2 backdrop-blur-md">
        <div className="flex w-full items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Sheet>
              <SheetTrigger asChild className="lg:hidden">
                <Button
                  variant="outline"
                  size="icon"
                  className="border-slate-700 bg-slate-950/60 text-slate-200 hover:bg-slate-800/70"
                >
                  <Menu className="size-4 text-white" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 border-slate-800 bg-slate-900 text-slate-100">
                <SheetHeader>
                  <p className="text-sm text-slate-400">Navigate</p>
                </SheetHeader>
                <div className="mt-6">{navContent}</div>
              </SheetContent>
            </Sheet>
            <Link href="/" className="flex flex-col">
              <BrandLogo className="text-white" />
              <span className="text-xs text-slate-300">
                AI-driven story writing & delivery
              </span>
            </Link>
            {activeLabel ? (
              <span className="hidden text-xs text-slate-400 lg:inline">
                / {activeLabel}
              </span>
            ) : null}
            <Button
              size="icon"
              variant="ghost"
              className="hidden h-8 w-8 text-slate-300 hover:bg-slate-800/70 lg:flex"
              onClick={() => setShowNav((prev) => !prev)}
            >
              {showNav ? <ChevronUp className="size-4 text-white" /> : <ChevronDown className="size-4 text-white" />}
            </Button>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2 px-2 text-slate-100 hover:bg-slate-800/70"
              >
                <UserCircle2 className="size-6 text-white" />
                <div className="hidden text-left text-xs leading-tight sm:block">
                  <span className="block font-medium text-white">
                    {user?.name ?? "Unknown"}
                  </span>
                  <span className="text-slate-400">Role: {user ? user.role.replace("-", " ") : ""}</span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 border-slate-800 bg-slate-900 text-slate-200">
              <DropdownMenuLabel>Account</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-slate-800" />
              <DropdownMenuItem asChild>
                <Link href="/profile">Profile & Settings</Link>
              </DropdownMenuItem>
              {user?.role === "admin" ? (
                <DropdownMenuItem asChild>
                  <Link href="/admin/roles">Role Management</Link>
                </DropdownMenuItem>
              ) : null}
              <DropdownMenuSeparator className="bg-slate-800" />
              <DropdownMenuItem
                onClick={async () => {
                  await handleLogout()
                }}
                className="text-red-400 focus:text-red-400"
              >
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {showNav ? (
        <div className="sticky top-[53px] z-30 hidden border-b border-slate-800/70 bg-slate-900/80 py-2 shadow-inner backdrop-blur-md lg:block">
          <div className="flex w-full items-center gap-3 px-4">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`rounded-md border px-3 py-1.5 text-xs font-medium transition ${
                  isActive
                    ? "border-slate-700 bg-slate-800/80 text-white shadow-sm"
                    : "border-transparent text-slate-300 hover:border-slate-700 hover:bg-slate-800/70 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            )
          })}
        </div>
        </div>
      ) : null}

      <main className="flex-1">
        <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">{children}</div>
      </main>
    </div>
  )
}

