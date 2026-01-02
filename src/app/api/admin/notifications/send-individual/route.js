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

    const { userId, message } = await request.json()

    // Validate input
    if (!userId || !message) {
      return NextResponse.json(
        { success: false, message: "User ID and message are required" },
        { status: 400 }
      )
    }

    // Send notification to individual user
    const result = await notificationController.createNotificationForUser(
      userId,
      "admin",
      message.trim()
    )

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Notification sent to user ${userId} successfully`,
        notification: result.notification
      })
    } else {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error("Send individual notification error:", error)
    return NextResponse.json(
      { success: false, message: "Failed to send notification" },
      { status: 500 }
    )
  }
}
