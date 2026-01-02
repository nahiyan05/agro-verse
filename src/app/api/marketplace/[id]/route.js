import { marketplaceController } from "@/backend/controllers/marketplaceController.js"
import { NextResponse } from "next/server"

export async function GET(request, { params }) {
  try {
    const { id } = params

    const result = await marketplaceController.getListingById(id)

    if (!result.success) {
      return NextResponse.json({ success: false, message: result.message }, { status: 404 })
    }

    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    console.error("Get marketplace listing API error:", error)
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

export async function PUT(request, { params }) {
  try {
    const authToken = request.cookies.get("auth-token")?.value

    if (!authToken) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    const result = await marketplaceController.updateListing(id, authToken, body)

    if (!result.success) {
      return NextResponse.json({ success: false, message: result.message }, { status: 400 })
    }

    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    console.error("Update marketplace listing API error:", error)
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

export async function DELETE(request, { params }) {
  try {
    const authToken = request.cookies.get("auth-token")?.value

    if (!authToken) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const result = await marketplaceController.deleteListing(id, authToken)

    if (!result.success) {
      return NextResponse.json({ success: false, message: result.message }, { status: 400 })
    }

    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    console.error("Delete marketplace listing API error:", error)
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
