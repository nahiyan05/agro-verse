import { NextResponse } from "next/server"
import { uploadPicture } from "@/lib/cloudinary.js"
import { landController } from "@/backend/controllers/landController.js"

export async function POST(request) {
  try {
    const authToken = request.cookies.get("auth-token")?.value

    if (!authToken) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("image")
    const landId = formData.get("landId")

    if (!file) {
      return NextResponse.json({ success: false, message: "No image file provided" }, { status: 400 })
    }

    if (!landId) {
      return NextResponse.json({ success: false, message: "Land ID is required" }, { status: 400 })
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = `data:${file.type};base64,${buffer.toString("base64")}`

    // Upload to Cloudinary using existing uploadPicture function with land-images folder
    const uploadResult = await uploadPicture(base64, "agroverse/land-images")

    if (!uploadResult.success) {
      return NextResponse.json({ success: false, message: uploadResult.message }, { status: 400 })
    }

    // Update land image in database
    const result = await landController.updateLandImage(landId, authToken, uploadResult.url)

    if (!result.success) {
      return NextResponse.json({ success: false, message: result.message }, { status: 400 })
    }

    return NextResponse.json(
      {
        success: true,
        land: result.land,
        imageUrl: uploadResult.url,
        message: "Land image updated successfully",
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Upload land image error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
