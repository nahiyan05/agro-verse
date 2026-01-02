import { NextResponse } from "next/server"
import { adminController } from "@/backend/controllers/adminController"

export async function GET(request) {
  try {
    // Check admin authentication
    const adminToken = request.cookies.get("admin-token")?.value

    if (!adminToken) {
      return NextResponse.json({ success: false, message: "Admin authentication required" }, { status: 401 })
    }

    const result = await adminController.getAllUsers()
    return NextResponse.json(result)
  } catch (error) {
    console.error("Admin users error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
