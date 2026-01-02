import { NextResponse } from "next/server"
import { adminController } from "@/backend/controllers/adminController"

export async function PUT(request, { params }) {
  try {
    // Check admin authentication
    const adminToken = request.cookies.get("admin-token")?.value

    if (!adminToken) {
      return NextResponse.json({ success: false, message: "Admin authentication required" }, { status: 401 })
    }

    const { isBanned } = await request.json()
    const awaitedparams = await params
    const userId = awaitedparams.id

    const result = await adminController.updateUserBanStatus(userId, isBanned)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Admin ban user error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
