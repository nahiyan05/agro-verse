import { cropPlanController } from "@/backend/controllers/cropPlanController.js"
import { NextResponse } from "next/server"

export async function GET(request) {
  try {
    const result = await cropPlanController.getSeasonalRecommendations()

    if (!result.success) {
      return NextResponse.json({ success: false, message: result.message }, { status: 400 })
    }

    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    console.error("Get seasonal recommendations API error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        error: process.env.NODE_ENV === "development" ? error.message : undefined
      },
      { status: 500 }
    )
  }
}
