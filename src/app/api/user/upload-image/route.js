import { NextResponse } from "next/server"
import { uploadPicture } from "@/lib/cloudinary.js"
import { userController } from "@/backend/controllers/userController.js"

export async function POST(request) {
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

    // Convert file to base64
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = `data:${file.type};base64,${buffer.toString("base64")}`

    // Upload to Cloudinary
    const uploadResult = await uploadPicture(base64, "agroverse/profile-pictures")

    if (!uploadResult.success) {
      return NextResponse.json({ success: false, message: uploadResult.message }, { status: 400 })
    }

    // Update user profile picture in database
    const result = await userController.updateProfilePicture(authToken, uploadResult.url)

    if (!result.success) {
      return NextResponse.json({ success: false, message: result.message }, { status: 400 })
    }

    return NextResponse.json(
      {
        success: true,
        user: result.user,
        imageUrl: uploadResult.url,
        message: "Profile picture updated successfully",
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Upload image error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
