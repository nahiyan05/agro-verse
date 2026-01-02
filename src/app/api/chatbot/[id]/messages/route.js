import { NextResponse } from "next/server"
import { chatbotController } from "@/backend/controllers/chatbotController.js"

// POST - Send message to chat
export async function POST(request, { params }) {
  try {
    const authToken = request.cookies.get("auth-token")?.value
    if (!authToken) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const formData = await request.formData()
    
    const content = formData.get("content")
    const imageFile = formData.get("image")

    if (!content) {
      return NextResponse.json({ success: false, message: "Message content is required" }, { status: 400 })
    }

    // Convert image file to base64 if provided
    let imageBase64 = null
    if (imageFile && imageFile.size > 0) {
      const bytes = await imageFile.arrayBuffer()
      const buffer = Buffer.from(bytes)
      imageBase64 = `data:${imageFile.type};base64,${buffer.toString("base64")}`
    }

    const result = await chatbotController.sendMessage(id, authToken, content, imageBase64)
    
    if (result.success) {
      return NextResponse.json(result)
    } else {
      return NextResponse.json(result, { status: 400 })
    }
  } catch (error) {
    console.error("Send message error:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}
