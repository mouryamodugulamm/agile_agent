import type { Metadata } from "next"
import { Geist_Mono, Manrope } from "next/font/google"
import "./globals.css"
import { ClerkProvider } from "@clerk/nextjs"

import { AppShell } from "@/components/app-shell"
import { ClerkAuthProvider } from "@/contexts/clerk-auth-context"

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "Agile Agent",
  description:
    "AI-powered story writer and scrum board for high-velocity hybrid teams.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${manrope.variable} ${manrope.className} ${geistMono.variable} antialiased`}
        >
          <ClerkAuthProvider>
            <AppShell>{children}</AppShell>
          </ClerkAuthProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
