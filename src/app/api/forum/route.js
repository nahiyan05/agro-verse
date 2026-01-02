import { NextRequest, NextResponse } from "next/server"
import { forumModel } from "@/backend/models/forumModel"

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const area = searchParams.get('area')
    const city = searchParams.get('city')
    const sortBy = searchParams.get('sortBy') || 'last_activity'
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    const posts = await forumModel.getPosts({
      area,
      city,
      sortBy,
      limit,
      offset
    })

    return NextResponse.json({
      success: true,
      posts
    })
  } catch (error) {
    console.error("Forum posts API error:", error)
    return NextResponse.json({
      success: false,
      message: "Internal server error"
    }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    // Verify authentication
    const authToken = request.cookies.get('auth-token')?.value
    if (!authToken) {
      return NextResponse.json({
        success: false,
        message: "Authentication required"
      }, { status: 401 })
    }

    const body = await request.json()
    const { title, content, flair, area, city, images } = body

    if (!title || !content) {
      return NextResponse.json({
        success: false,
        message: "Title and content are required"
      }, { status: 400 })
    }

    const post = await forumModel.createPost({
      user_id: authToken,
      title,
      content,
      flair: flair || null,
      area: area || null,
      city: city || null,
      images: images && images.length > 0 ? images : null
    })

    return NextResponse.json({
      success: true,
      message: "Post created successfully",
      post
    }, { status: 201 })
  } catch (error) {
    console.error("Create forum post API error:", error)
    return NextResponse.json({
      success: false,
      message: "Internal server error"
    }, { status: 500 })
  }
}
