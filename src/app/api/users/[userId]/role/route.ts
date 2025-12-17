import { auth, clerkClient } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"
import { UserRole, UserStatus } from "@/lib/auth-storage"

// PATCH /api/users/[userId]/role - Update user role (admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId: currentUserId } = await auth()
  const { userId } = await params

  if (!currentUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const client = await clerkClient()
    
    // Get current user to check role
    const currentUser = await client.users.getUser(currentUserId)
    const currentRole = (currentUser.publicMetadata?.role as UserRole) || "product-owner"

    if (currentRole !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { role, status } = body as { role?: UserRole; status?: UserStatus }

    if (!role && !status) {
      return NextResponse.json(
        { error: "Either role or status must be provided" },
        { status: 400 }
      )
    }

    // Get target user
    const targetUser = await client.users.getUser(userId)
    const previousRole = (targetUser.publicMetadata?.role as UserRole) || "product-owner"

    // Update user metadata
    const updates: Record<string, unknown> = {}
    if (role) {
      updates.role = role
    }
    if (status) {
      updates.status = status
    }

    await client.users.updateUser(userId, {
      publicMetadata: {
        ...targetUser.publicMetadata,
        ...updates,
      },
    })

    // Log role change if role was updated
    // Note: In production, you should store this in a database
    // For now, we'll skip server-side audit logging as it requires a database
    // The client-side audit log will be maintained separately

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    )
  }
}

