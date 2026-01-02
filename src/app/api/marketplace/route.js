import { marketplaceController } from "@/backend/controllers/marketplaceController.js"
import { NextResponse } from "next/server"
import { uploadPicture, deletePicture } from "@/lib/cloudinary.js"

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    
    const filters = {
      crop_name: searchParams.get("crop_name"),
      location: searchParams.get("location"),
      limit: parseInt(searchParams.get("limit")) || 20,
      offset: parseInt(searchParams.get("offset")) || 0
    }

    const result = await marketplaceController.getAllListings(filters)

    if (!result.success) {
      return NextResponse.json({ success: false, message: result.message }, { status: 400 })
    }

    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    console.error("Get marketplace listings API error:", error)
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

    const result = await marketplaceController.createListing(authToken, body)

    if (!result.success) {
      return NextResponse.json({ success: false, message: result.message }, { status: 400 })
    }

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error("Create marketplace listing API error:", error)
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

export async function PUT(request) {
  try {
    const authToken = request.cookies.get("auth-token")?.value

    if (!authToken) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("image")

    if (!file) {
      return NextResponse.json({ success: false, message: "No image file provided" }, { status: 400 })
    }

    // Convert file to base64 for Cloudinary upload
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = `data:${file.type};base64,${buffer.toString('base64')}`

    // Upload to Cloudinary
    const uploadResult = await uploadPicture(base64, "agroverse/marketplace")

    if (!uploadResult.success) {
      return NextResponse.json(
        { success: false, message: uploadResult.message },
        { status: 500 }
      )
    }

      return NextResponse.json({
        success: true,
        url: uploadResult.url,
        public_id: uploadResult.public_id,
        imageData: {
          url: uploadResult.url,
          public_id: uploadResult.public_id
        },
        message: "Image uploaded successfully"
      }, { status: 200 })  } catch (error) {
    console.error("Image upload API error:", error)
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
