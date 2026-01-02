import { NextResponse } from "next/server"
import { messageController } from "@/backend/controllers/messageController.js"

// Get unread message count for the user
export async function GET(request) {
  try {
    const authToken = request.cookies.get("auth-token")?.value
    
    if (!authToken) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const userId = authToken // Auth token is just the user ID

    const result = await messageController.getUnreadMessageCount(userId)

    return NextResponse.json(
      { 
        success: result.success, 
        unread_count: result.data?.unread_count,
        message: result.message,
        error: result.error 
      }, 
      { status: result.status }
    )

  } catch (error) {
    console.error("Get unread count API error:", error)
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
