import { NextResponse } from "next/server"
import { chatbotController } from "@/backend/controllers/chatbotController.js"

// specific chat with messages
export async function GET(request, { params }) {
  try {
    const authToken = request.cookies.get("auth-token")?.value
    if (!authToken) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const result = await chatbotController.getChatWithMessages(id, authToken)
    
    if (result.success) {
      return NextResponse.json(result)
    } else {
      return NextResponse.json(result, { status: 400 })
    }
  } catch (error) {
    console.error("Get chat with messages error:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}

// PUT - Update chat title
export async function PUT(request, { params }) {
  try {
    const authToken = request.cookies.get("auth-token")?.value
    if (!authToken) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const { title } = await request.json()

    const result = await chatbotController.updateChatTitle(id, authToken, title)
    
    if (result.success) {
      return NextResponse.json(result)
    } else {
      return NextResponse.json(result, { status: 400 })
    }
  } catch (error) {
    console.error("Update chat title error:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}

// DELETE - Delete chat
export async function DELETE(request, { params }) {
  try {
    const authToken = request.cookies.get("auth-token")?.value
    if (!authToken) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const result = await chatbotController.deleteChat(id, authToken)
    
    if (result.success) {
      return NextResponse.json(result)
    } else {
      return NextResponse.json(result, { status: 400 })
    }
  } catch (error) {
    console.error("Delete chat error:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}
