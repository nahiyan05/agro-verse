import { NextResponse } from "next/server"
import { adminController } from "@/backend/controllers/adminController"

export async function POST(request) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json({ success: false, message: "Username and password are required" }, { status: 400 })
    }

    const result = await adminController.login(username, password)

    if (!result.success) {
      return NextResponse.json(result, { status: 401 })
    }

    // Set admin cookie
    const response = NextResponse.json(result)
    response.cookies.set("admin-token", result.admin.id.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24, 
    })

    return response
  } catch (error) {
    console.error("Admin login error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
