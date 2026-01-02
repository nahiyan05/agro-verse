import { userConnectionController } from "@/backend/controllers/userConnectionController.js"
import { NextResponse } from "next/server"

// Get user's connections (friends)
export async function GET(request) {
  try {
    const authToken = request.cookies.get("auth-token")?.value
    
    if (!authToken) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    // Get userId from query parameters if provided (for viewing other user's connections)
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    const result = await userConnectionController.getUserConnections(authToken, userId)

    if (!result.success) {
      return NextResponse.json({ success: false, message: result.message }, { status: 400 })
    }

    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    console.error("Get connections API error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        error: process.env.NODE_ENV === "development" ? error.message : undefined
      },
      { status: 500 }
    )
  }
}
