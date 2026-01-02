import { NextResponse } from "next/server"
import { forumModel } from "@/backend/models/forumModel"

export async function GET(request, { params }) {
  try {
    const { postId } = await params
    const authToken = request.cookies.get('auth-token')?.value

    const post = await forumModel.getPostById(postId)
    if (!post) {
      return NextResponse.json({
        success: false,
        message: "Post not found"
      }, { status: 404 })
    }

    // Increment view count (but not if it's the author viewing)
    if (authToken !== post.user_id) {
      await forumModel.incrementViewCount(postId)
      post.views_count += 1
    }

    // Get user's vote if authenticated
    let userVote = 0
    if (authToken) {
      userVote = await forumModel.getUserVote(postId, authToken)
    }

    return NextResponse.json({
      success: true,
      post: {
        ...post,
        userVote
      }
    })
  } catch (error) {
    console.error("Get forum post API error:", error)
    return NextResponse.json({
      success: false,
      message: "Internal server error"
    }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    // Verify authentication
    const authToken = request.cookies.get('auth-token')?.value
    if (!authToken) {
      return NextResponse.json({
        success: false,
        message: "Authentication required"
      }, { status: 401 })
    }

    const { postId } = params
    const body = await request.json()
    const { title, content, flair } = body

    if (!title || !content) {
      return NextResponse.json({
        success: false,
        message: "Title and content are required"
      }, { status: 400 })
    }

    // Check if user can edit this post
    const canEdit = await forumModel.canUserEditPost(postId, authToken)
    if (!canEdit) {
      return NextResponse.json({
        success: false,
        message: "You can only edit your own posts"
      }, { status: 403 })
    }

    const updatedPost = await forumModel.updatePost(postId, authToken, {
      title,
      content,
      flair
    })

    if (!updatedPost) {
      return NextResponse.json({
        success: false,
        message: "Failed to update post"
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Post updated successfully",
      post: updatedPost
    })
  } catch (error) {
    console.error("Update forum post API error:", error)
    return NextResponse.json({
      success: false,
      message: "Internal server error"
    }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
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

    const deletedPost = await forumModel.deletePost(postId, authToken)

    return NextResponse.json({
      success: true,
      message: "Post deleted successfully",
      post: deletedPost
    })
  } catch (error) {
    console.error("Delete forum post API error:", error)
    const message = error.message === 'Post not found' || error.message === 'Unauthorized to delete this post' 
      ? error.message 
      : "Internal server error"
    
    const status = error.message === 'Post not found' ? 404 
      : error.message === 'Unauthorized to delete this post' ? 403 
      : 500

    return NextResponse.json({
      success: false,
      message
    }, { status })
  }
}
