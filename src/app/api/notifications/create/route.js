import { NextResponse } from "next/server"
import { notificationController } from "@/backend/controllers/notificationController.js"

export async function POST(request) {
  try {
    const authToken = request.cookies.get("auth-token")?.value

    if (!authToken) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { type, message } = body

    // Validate required fields
    if (!type || !message) {
      return NextResponse.json({ success: false, message: "Type and message are required" }, { status: 400 })
    }

    // Validate notification type
    const validTypes = [
      "welcome",
      "forum",
      "comment",
      "connection_request",
      "rental_reminder",
      "farm_update",
      "weather_alert",
      "market_update",
      "system",
    ]

    if (!validTypes.includes(type)) {
      return NextResponse.json(
        {
          success: false,
          message: `Invalid notification type. Valid types are: ${validTypes.join(", ")}`,
        },
        { status: 400 },
      )
    }

    const result = await notificationController.createNotificationForUser(authToken, type, message)

    if (!result.success) {
      return NextResponse.json({ success: false, message: result.message }, { status: 400 })
    }

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error("Create notification API error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        error: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    )
  }
}
