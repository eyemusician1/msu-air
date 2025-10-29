// API route to manage user data
import { getUserById, updateUser } from "@/lib/firestore"
import { type NextRequest, NextResponse } from "next/server"

// Add this line to force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 })
    }

    const user = await getUserById(userId)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error in users API:", error)
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 })
    }

    const body = await request.json()
    await updateUser(userId, body)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
  }
}