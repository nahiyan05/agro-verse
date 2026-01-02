import { userConnectionController } from "@/backend/controllers/userConnectionController.js"
import { NextResponse } from "next/server"

export async function GET(request) {
  try {
    const authToken = request.cookies.get("auth-token")?.value
    
    if (!authToken) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const location = searchParams.get("location")
    const area = searchParams.get("area")
    const name = searchParams.get("name")
    const nearby = searchParams.get("nearby")

    let result;
    
    // If nearby=true, find farmers from same area/city as current user
    if (nearby === "true") {
      result = await userConnectionController.findNearbyFarmers(authToken)
    } else {
      // Otherwise search with provided filters
      result = await userConnectionController.findFarmersByLocation(authToken, location, area, name)
    }

    if (!result.success) {
      return NextResponse.json({ success: false, message: result.message }, { status: 400 })
    }

    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    console.error("Find farmers API error:", error)
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