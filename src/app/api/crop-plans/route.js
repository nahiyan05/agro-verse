import { cropPlanController } from "@/backend/controllers/cropPlanController.js"
import { NextResponse } from "next/server"

export async function GET(request) {
  try {
    const authToken = request.cookies.get("auth-token")?.value
    const { searchParams } = new URL(request.url)
    
    const isPublic = searchParams.get("public") === "true"
    
    if (isPublic) {
      // Get public crop plans 
      const filters = {
        season: searchParams.get("season"),
        crop_name: searchParams.get("crop_name"),
        location: searchParams.get("location"),
        limit: parseInt(searchParams.get("limit")) || 20,
        offset: parseInt(searchParams.get("offset")) || 0
      }

      const result = await cropPlanController.getPublicCropPlans(filters)

      if (!result.success) {
        return NextResponse.json({ success: false, message: result.message }, { status: 400 })
      }

      return NextResponse.json(result, { status: 200 })
    } else {
      // Get user's own crop plans
      if (!authToken) {
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
      }

      const filters = {
        season: searchParams.get("season"),
        status: searchParams.get("status"),
        land_id: searchParams.get("land_id")
      }

      const result = await cropPlanController.getUserCropPlans(authToken, filters)

      if (!result.success) {
        return NextResponse.json({ success: false, message: result.message }, { status: 400 })
      }

      return NextResponse.json(result, { status: 200 })
    }
  } catch (error) {
    console.error("Get crop plans API error:", error)
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

export async function POST(request) {
  try {
    const authToken = request.cookies.get("auth-token")?.value

    if (!authToken) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    const result = await cropPlanController.createCropPlan(authToken, body)

    if (!result.success) {
      return NextResponse.json({ success: false, message: result.message }, { status: 400 })
    }

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error("Create crop plan API error:", error)
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
