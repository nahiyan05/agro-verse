import { NextResponse } from "next/server"
import { forumModel } from "@/backend/models/forumModel"

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
    const { vote_type } = body 

    if (![1, -1].includes(vote_type)) {
      return NextResponse.json({
        success: false,
        message: "Vote type must be 1 (upvote) or -1 (downvote)"
      }, { status: 400 })
    }

    const result = await forumModel.voteOnPost({
      post_id: postId,
      user_id: authToken,
      vote_type
    })

    return NextResponse.json({
      success: true,
      message: "Vote recorded successfully",
      votes_count: result.votes_count,
      user_vote: result.user_vote
    })
  } catch (error) {
    console.error("Vote on post API error:", error)
    return NextResponse.json({
      success: false,
      message: "Internal server error"
    }, { status: 500 })
  }
}
