import { NextResponse } from "next/server"
import { messageController } from "@/backend/controllers/messageController.js"

// Get messages for a conversation
export async function GET(request, { params }) {
  try {
    const authToken = request.cookies.get("auth-token")?.value
    
    if (!authToken) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const userId = authToken // Auth token is just the user ID
    const { conversationId } = await params
    
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "50")

    const result = await messageController.getConversationMessages(userId, conversationId, page, limit)

    return NextResponse.json(
      { 
        success: result.success, 
        messages: result.data,
        pagination: result.pagination,
        message: result.message,
        error: result.error 
      }, 
      { status: result.status }
    )

  } catch (error) {
    console.error("Get messages API error:", error)
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
