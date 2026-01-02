import { NextResponse } from "next/server"
import { authController } from "@/backend/controllers/authController.js"

export async function POST(request) {
  try {
    const body = await request.json()
    const { email , password } = body

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json({ success: false, message: "Email and password are required" }, { status: 400 })
    }

    // Login user
    const result = await authController.login({ email, password })

    if (!result.success) {
      return NextResponse.json({ success: false, message: result.message }, { status: 401 })
    }

    // Create response with user data
    const response = NextResponse.json(result, { status: 200 })

    // Set HTTP-only cookie for server-side authentication
    response.cookies.set("auth-token", result.user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
