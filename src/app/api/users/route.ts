import { auth, clerkClient } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { UserRole, UserStatus } from "@/lib/auth-storage"

// GET /api/users - List all users (admin only)
export async function GET() {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const client = await clerkClient()
    
    // Get current user to check role
    const currentUser = await client.users.getUser(userId)
    const currentRole = (currentUser.publicMetadata?.role as UserRole) || "product-owner"

    if (currentRole !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // List all users
    const users = await client.users.getUserList({
      limit: 100,
    })

    const formattedUsers = users.data.map((user) => {
      const email =
        user.primaryEmailAddress?.emailAddress ||
        user.emailAddresses[0]?.emailAddress ||
        ""
      const firstName = user.firstName || ""
      const lastName = user.lastName || ""
      const name = `${firstName} ${lastName}`.trim() || email.split("@")[0]

      return {
        id: user.id,
        email,
        name,
        company: (user.publicMetadata?.company as string) || undefined,
        role: (user.publicMetadata?.role as UserRole) || "product-owner",
        status: (user.publicMetadata?.status as UserStatus) || "active",
        imageUrl: user.imageUrl,
        createdAt: user.createdAt,
      }
    })

    return NextResponse.json({ users: formattedUsers })
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    )
  }
}

