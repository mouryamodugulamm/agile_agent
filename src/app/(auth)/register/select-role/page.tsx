"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { useUser } from "@clerk/nextjs"
import { UserRole } from "@/lib/auth-storage"
import { BrandLogo } from "@/components/brand-logo"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import { Loader2, ShieldCheck, Users, Code, Bot } from "lucide-react"

const ROLE_OPTIONS: Array<{
  value: UserRole
  label: string
  description: string
  icon: React.ReactNode
}> = [
  {
    value: "product-owner",
    label: "Product Owner",
    description: "Own the backlog, prioritize stories, run sprints.",
    icon: <Users className="size-5" />,
  },
  {
    value: "developer",
    label: "Developer",
    description: "Update stories, ship code, collaborate with the team.",
    icon: <Code className="size-5" />,
  },
  {
    value: "ai-agent",
    label: "AI Agent",
    description: "Handle automated tasks and bot-ready stories.",
    icon: <Bot className="size-5" />,
  },
  {
    value: "admin",
    label: "Admin",
    description: "Manage integrations, settings, and workspace policies.",
    icon: <ShieldCheck className="size-5" />,
  },
]

export default function SelectRolePage() {
  const router = useRouter()
  const { user, isLoaded } = useUser()
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
        <div className="flex items-center gap-2 rounded-lg border border-slate-800/60 bg-slate-900/60 px-4 py-3 text-sm text-slate-300 shadow-inner">
          <Loader2 className="size-4 animate-spin text-white" />
          Loading...
        </div>
      </div>
    )
  }

  if (!user) {
    router.push("/register")
    return null
  }

  // Check if user already has a role set in metadata
  const hasRoleSet = user.publicMetadata?.role !== undefined
  if (hasRoleSet) {
    // User already has a role, redirect to home
    router.push("/")
    return null
  }

  const handleSubmit = async () => {
    if (!selectedRole) {
      setError("Please select a role to continue.")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      // Update user metadata with selected role
      const response = await fetch(`/api/users/${user.id}/role`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: selectedRole }),
      })

      if (!response.ok) {
        let errorMessage = "Failed to set role"
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorMessage
        } catch {
          // If response is not JSON, use status text
          errorMessage = response.statusText || errorMessage
        }
        throw new Error(errorMessage)
      }

      // Reload user to get updated metadata
      await user.reload()
      
      // Redirect to MVP intake page
      window.location.href = "/mvp"
    } catch (err) {
      // If role setting fails, still allow user to proceed to MVP
      // They can set their role later from profile
      console.error("Failed to set role:", err)
      // Redirect to MVP anyway - role can be set later
      window.location.href = "/mvp"
    }
  }

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900">
      <div className="flex min-h-screen flex-col items-center justify-center px-4 py-16">
        <div className="mb-8 flex flex-col items-center gap-2">
          <BrandLogo className="text-white text-2xl" accentClassName="text-rose-500" />
          <p className="text-sm text-slate-300">AI-driven story writing & delivery</p>
        </div>
        <Card className="w-full max-w-2xl border-none bg-slate-900/90 text-slate-100 shadow-2xl backdrop-blur-lg">
          <CardHeader className="space-y-3">
            <CardTitle className="text-3xl font-semibold text-white">
              Select Your Role
            </CardTitle>
            <CardDescription className="text-slate-300">
              Choose the role that best describes your responsibilities in the team. 
              You can change this later from your profile settings.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error ? (
              <Alert
                variant="destructive"
                className="border-red-500/60 bg-red-500/10 text-red-100"
              >
                <AlertTitle>Error</AlertTitle>
                <AlertDescription className="text-red-200">{error}</AlertDescription>
              </Alert>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-2">
              {ROLE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setSelectedRole(option.value)}
                  className={`group relative rounded-xl border-2 p-5 text-left transition-all ${
                    selectedRole === option.value
                      ? "border-primary bg-primary/10 shadow-lg shadow-primary/20"
                      : "border-slate-800/70 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-900/60"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`rounded-lg p-2 ${
                        selectedRole === option.value
                          ? "bg-primary/20 text-primary"
                          : "bg-slate-800/70 text-slate-400"
                      }`}
                    >
                      {option.icon}
                    </div>
                    <div className="flex-1">
                      <h3
                        className={`font-semibold ${
                          selectedRole === option.value ? "text-white" : "text-slate-200"
                        }`}
                      >
                        {option.label}
                      </h3>
                      <p className="mt-1 text-sm text-slate-400">{option.description}</p>
                    </div>
                    {selectedRole === option.value && (
                      <div className="absolute right-3 top-3">
                        <div className="flex size-5 items-center justify-center rounded-full bg-primary text-white">
                          <svg
                            className="size-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>

            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => router.push("/mvp")}
                className="border-slate-700/70 bg-slate-950/50 text-slate-200 hover:bg-slate-800/70"
                disabled={isSubmitting}
              >
                Skip for now
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!selectedRole || isSubmitting}
                className="shadow-lg shadow-primary/20"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Setting role...
                  </>
                ) : (
                  "Continue"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

