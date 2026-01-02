import { NextResponse } from "next/server"
import { forumModel } from "@/backend/models/forumModel"
import { notificationController } from "@/backend/controllers/notificationController"

export async function GET(request, { params }) {
  try {
    const { postId } = await params
    const comments = await forumModel.getCommentsByPostId(postId)

    return NextResponse.json({
      success: true,
      comments
    })
  } catch (error) {
    console.error("Get comments API error:", error)
    return NextResponse.json({
      success: false,
      message: "Internal server error"
    }, { status: 500 })
  }
}

export async function POST(request, { params }) {
  try {
    // Verify authentication
    const authToken = request.cookies.get('auth-token')?.value
    if (!authToken) {
      return NextResponse.json({
        success: false,
        message: "Authentication required"
      }, { status: 401 })
    }

    const { postId } = await params
    const body = await request.json()
    const { content, parent_comment_id = null } = body

    if (!content) {
      return NextResponse.json({
        success: false,
        message: "Comment content is required"
      }, { status: 400 })
    }

    const comment = await forumModel.createComment({
      post_id: postId,
      user_id: authToken,
      content,
      parent_comment_id
    })

    // Send notification to post author (if not commenting on own post)
    const postAuthorId = await forumModel.getPostAuthor(postId)
    if (postAuthorId && postAuthorId !== authToken) {
      const notificationType = parent_comment_id ? 'forum_reply' : 'forum_comment'
      const message = parent_comment_id ? 'Someone replied to a comment on your forum post' : 'Someone commented on your forum post'
      
      await notificationController.createNotificationForUser(
        postAuthorId,
        notificationType,
        message
      )
    }

    return NextResponse.json({
      success: true,
      message: "Comment created successfully",
      comment
    }, { status: 201 })
  } catch (error) {
    console.error("Create comment API error:", error)
    return NextResponse.json({
      success: false,
      message: "Internal server error"
    }, { status: 500 })
  }
}
