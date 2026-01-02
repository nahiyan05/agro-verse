import { NextResponse } from "next/server"
import { uploadPicture } from "@/lib/cloudinary"

export async function POST(request) {
  try {
    // Verify authentication
    const authToken = request.cookies.get('auth-token')?.value
    if (!authToken) {
      return NextResponse.json({
        success: false,
        message: "Authentication required"
      }, { status: 401 })
    }

    const formData = await request.formData()
    const files = formData.getAll('images')
    
    if (!files || files.length === 0) {
      return NextResponse.json({
        success: false,
        message: "No images provided"
      }, { status: 400 })
    }

    // Limit to 5 images per post
    if (files.length > 5) {
      return NextResponse.json({
        success: false,
        message: "Maximum 5 images allowed per post"
      }, { status: 400 })
    }

    const uploadPromises = files.map(async (file) => {
      // Convert file to base64 for Cloudinary
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const base64 = `data:${file.type};base64,${buffer.toString('base64')}`
      
      return uploadPicture(base64, "agroverse/forum")
    })

    const uploadResults = await Promise.all(uploadPromises)
    
    // Check if any uploads failed
    const failedUploads = uploadResults.filter(result => !result.success)
    if (failedUploads.length > 0) {
      return NextResponse.json({
        success: false,
        message: "Some images failed to upload",
        errors: failedUploads
      }, { status: 500 })
    }

    const imageUrls = uploadResults.map(result => result.url)

    return NextResponse.json({
      success: true,
      message: "Images uploaded successfully",
      images: imageUrls
    })
  } catch (error) {
    console.error("Upload images API error:", error)
    return NextResponse.json({
      success: false,
      message: "Internal server error"
    }, { status: 500 })
  }
}
