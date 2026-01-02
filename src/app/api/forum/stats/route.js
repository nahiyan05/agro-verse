import { NextResponse } from "next/server"
import { forumModel } from "@/backend/models/forumModel"

export async function GET(request) {
  try {
    // Get the userId from query params for viewing other users' stats
    const { searchParams } = new URL(request.url)
    const targetUserId = searchParams.get('userId')
    
    // If no specific userId is provided, get the current user's stats
    let userId = targetUserId
    
    if (!targetUserId) {
      // Verify authentication for current user
      const authToken = request.cookies.get('auth-token')?.value
      if (!authToken) {
        return NextResponse.json({
          success: false,
          message: "Authentication required"
        }, { status: 401 })
      }
      
      userId = authToken // The auth token is the user ID
    }

    // Fetch user's posts
    const posts = await forumModel.getPostsByUser(userId, 1000) // Get all posts for stats

    // Calculate stats
    const totalPosts = posts.length
    const totalComments = posts.reduce((sum, post) => sum + (post.comments_count || 0), 0)
    const totalUpvotes = posts.reduce((sum, post) => sum + (post.votes_count || 0), 0)
    const totalViews = posts.reduce((sum, post) => sum + (post.views_count || 0), 0)
    
    // Get recent posts for preview
    const recentPosts = posts
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 3)

    const stats = {
      totalPosts,
      totalComments,
      totalUpvotes,
      totalViews,
      recentPosts: recentPosts.map(post => ({
        id: post.id,
        title: post.title,
        comments_count: post.comments_count || 0,
        votes_count: post.votes_count || 0,
        views_count: post.views_count || 0,
        created_at: post.created_at,
        flair: post.flair
      }))
    }

    return NextResponse.json({
      success: true,
      stats
    })
  } catch (error) {
    console.error("Forum stats API error:", error)
    return NextResponse.json({
      success: false,
      message: "Internal server error"
    }, { status: 500 })
  }
}
