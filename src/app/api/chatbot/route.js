import { NextResponse } from "next/server"
import { chatbotController } from "@/backend/controllers/chatbotController.js"

// GET - Get all user chats
export async function GET(request) {
  try {
    const authToken = request.cookies.get("auth-token")?.value
    if (!authToken) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const result = await chatbotController.getUserChats(authToken)
    
    if (result.success) {
      return NextResponse.json(result)
    } else {
      return NextResponse.json(result, { status: 400 })
    }
  } catch (error) {
    console.error("Get user chats error:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST - Create new chat
export async function POST(request) {
  try {
    const authToken = request.cookies.get("auth-token")?.value
    if (!authToken) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const { title } = await request.json()

    const result = await chatbotController.createChat(authToken, title)
    
    if (result.success) {
      return NextResponse.json(result, { status: 201 })
    } else {
      return NextResponse.json(result, { status: 400 })
    }
  } catch (error) {
    console.error("Create chat error:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}
