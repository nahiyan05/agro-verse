import { NextResponse } from "next/server"
import { adminController } from "@/backend/controllers/adminController"

export async function POST(request) {
  try {
    // Check user authentication
    const authToken = request.cookies.get("auth-token")?.value

    if (!authToken) {
      return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 })
    }

    const reporterId = authToken
    const { reportedUserId, reportReason, reportDetails } = await request.json()

    // Validate required fields
    if (!reportedUserId || !reportReason || !reportDetails) {
      return NextResponse.json({ success: false, message: "All fields are required" }, { status: 400 })
    }

    // Check if user is trying to report themselves
    if (reporterId === reportedUserId.toString()) {
      return NextResponse.json({ success: false, message: "You cannot report yourself" }, { status: 400 })
    }

    const result = await adminController.createReport(reporterId, reportedUserId, reportReason, reportDetails)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Create report error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
