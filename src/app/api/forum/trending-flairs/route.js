import { NextResponse } from "next/server"
import { forumModel } from "../../../../backend/models/forumModel.js"

export async function GET(request) {
  try {
    const flairs = await forumModel.getTrendingFlairs()
    return NextResponse.json({
      success: true,
      flairs
    })
  } catch (error) {
    console.error("Trending flairs API error:", error)
    return NextResponse.json({
      success: false,
      message: "Internal server error"
    }, { status: 500 })
  }
}
