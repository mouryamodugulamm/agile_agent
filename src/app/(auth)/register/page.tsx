"use client"

import { SignUp } from "@clerk/nextjs"
import { BrandLogo } from "@/components/brand-logo"

export default function RegisterPage() {
  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900">
      <div className="flex min-h-screen flex-col items-center justify-center px-4 py-16">
        <div className="mb-8 flex flex-col items-center gap-2">
          <BrandLogo className="text-white text-2xl" accentClassName="text-rose-500" />
          <p className="text-sm text-slate-300">AI-driven story writing & delivery</p>
        </div>
        <div className="flex items-center justify-center">
          <SignUp
            appearance={{
              elements: {
                rootBox: "mx-auto",
                card: "bg-slate-900/90 border-slate-800 text-slate-100 shadow-2xl backdrop-blur-lg",
                headerTitle: "text-white",
                headerSubtitle: "text-slate-300",
                socialButtonsBlockButton:
                  "border-slate-700/70 bg-slate-950/50 text-slate-200 hover:bg-slate-800/70",
                formButtonPrimary:
                  "bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20",
                formFieldInput:
                  "border-slate-700/80 bg-slate-950/60 text-white placeholder:text-slate-400",
                formFieldLabel: "text-slate-100",
                footerActionLink: "text-primary hover:text-primary/80",
                identityPreviewText: "text-slate-200",
                identityPreviewEditButton: "text-slate-400 hover:text-slate-200",
                formResendCodeLink: "text-primary hover:text-primary/80",
              },
            }}
            routing="path"
            path="/register"
            signInUrl="/login"
            afterSignUpUrl="/"
          />
        </div>
      </div>
    </div>
  )
}
