import { NextResponse } from "next/server"
import { forumModel } from "@/backend/models/forumModel"

export async function GET(request) {
  try {
    // Verify authentication
    const authToken = request.cookies.get('auth-token')?.value
    if (!authToken) {
      return NextResponse.json({
        success: false,
        message: "Authentication required"
      }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    const posts = await forumModel.getPostsByUser(authToken, limit, offset)

    return NextResponse.json({
      success: true,
      posts
    })
  } catch (error) {
    console.error("My posts API error:", error)
    return NextResponse.json({
      success: false,
      message: "Internal server error"
    }, { status: 500 })
  }
}
