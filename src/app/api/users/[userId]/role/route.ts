import { auth, clerkClient } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"
import { UserRole, UserStatus } from "@/lib/auth-storage"

// PATCH /api/users/[userId]/role - Update user role (admin only, or self for new users)
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
    
    if (!client) {
      return NextResponse.json(
        { error: "Clerk client not available" },
        { status: 500 }
      )
    }
    
    // Get current user to check role
    const currentUser = await client.users.getUser(currentUserId)
    const currentRole = (currentUser.publicMetadata?.role as UserRole) || "product-owner"

    // Allow users to set their own role if they don't have one yet (during registration)
    const isSelfUpdate = currentUserId === userId
    const targetUser = await client.users.getUser(userId)
    const targetUserRole = (targetUser.publicMetadata?.role as UserRole) || null

    // If updating someone else, require admin role
    if (!isSelfUpdate && currentRole !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // If updating self, only allow if they don't have a role yet (registration flow)
    if (isSelfUpdate && targetUserRole && currentRole !== "admin") {
      return NextResponse.json(
        { error: "You cannot change your own role. Contact an administrator." },
        { status: 403 }
      )
    }

    let body
    try {
      body = await request.json()
    } catch (parseError) {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      )
    }

    const { role, status } = body as { role?: UserRole; status?: UserStatus }

    if (!role && !status) {
      return NextResponse.json(
        { error: "Either role or status must be provided" },
        { status: 400 }
      )
    }

    const previousRole = targetUserRole || "product-owner"

    // Update user metadata
    const updates: Record<string, unknown> = {}
    if (role) {
      updates.role = role
    }
    if (status) {
      updates.status = status
    }

    // Ensure publicMetadata is an object
    const currentMetadata = (targetUser.publicMetadata as Record<string, unknown>) || {}
    
    try {
      // Update user metadata - ensure we're passing valid data
      const metadataToUpdate: Record<string, unknown> = {
        ...currentMetadata,
      }
      
      if (role) {
        metadataToUpdate.role = role
      }
      if (status) {
        metadataToUpdate.status = status
      }
      
      await client.users.updateUser(userId, {
        publicMetadata: metadataToUpdate,
      })
    } catch (updateError) {
      console.error("Clerk updateUser error:", updateError)
      const errorDetails = updateError instanceof Error ? updateError.message : String(updateError)
      console.error("Error details:", errorDetails)
      throw new Error(`Failed to update user in Clerk: ${errorDetails}`)
    }

    // Log role change if role was updated (only for admin changes, not self-registration)
    // Note: In production, you should store this in a database
    // For now, we'll skip server-side audit logging as it requires a database
    // The client-side audit log will be maintained separately

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating user:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to update user"
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
