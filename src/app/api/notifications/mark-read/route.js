import { NextResponse } from "next/server"
import { notificationController } from "@/backend/controllers/notificationController.js"

export async function PUT(request) {
  try {
    const authToken = request.cookies.get("auth-token")?.value

    if (!authToken) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { notificationId } = body

    if (!notificationId) {
      return NextResponse.json({ success: false, message: "Notification ID is required" }, { status: 400 })
    }

    const result = await notificationController.markAsRead(notificationId, authToken)

    if (!result.success) {
      return NextResponse.json({ success: false, message: result.message }, { status: 400 })
    }

    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    console.error("Mark as read error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
