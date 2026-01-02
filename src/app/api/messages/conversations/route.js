import { NextResponse } from "next/server"
import { messageController } from "@/backend/controllers/messageController.js"

// Get user conversations
export async function GET(request) {
  try {
    const authToken = request.cookies.get("auth-token")?.value
    
    if (!authToken) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const userId = authToken // Auth token is just the user ID
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")

    const result = await messageController.getUserConversations(userId, page, limit)

    return NextResponse.json(
      { 
        success: result.success, 
        conversations: result.data,
        pagination: result.pagination,
        message: result.message,
        error: result.error 
      }, 
      { status: result.status }
    )

  } catch (error) {
    console.error("Get conversations API error:", error)
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

// Create a new conversation
export async function POST(request) {
  try {
    const authToken = request.cookies.get("auth-token")?.value
    
    if (!authToken) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const userId = authToken // Auth token is just the user ID

    const body = await request.json()
    const { participantId } = body

    const result = await messageController.startConversation(userId, participantId)

    return NextResponse.json(
      { 
        success: result.success, 
        conversation: result.data,
        message: result.message,
        error: result.error 
      }, 
      { status: result.status }
    )

  } catch (error) {
    console.error("Create conversation API error:", error)
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
