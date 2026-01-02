import { NextResponse } from "next/server"
import { notificationController } from "@/backend/controllers/notificationController"

export async function POST(request) {
  try {
    // Check admin authentication
    const adminToken = request.cookies.get("admin-token")?.value

    if (!adminToken) {
      return NextResponse.json(
        { success: false, message: "Admin authentication required" },
        { status: 401 }
      )
    }

    const { message } = await request.json()

    // Validate input
    if (!message) {
      return NextResponse.json(
        { success: false, message: "Message is required" },
        { status: 400 }
      )
    }

    // Send broadcast notification to all users
    const result = await notificationController.sendBroadcastNotification(message.trim())

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message,
        notifiedCount: result.notifiedCount
      })
    } else {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error("Send broadcast notification error:", error)
    return NextResponse.json(
      { success: false, message: "Failed to send broadcast notification" },
      { status: 500 }
    )
  }
}
