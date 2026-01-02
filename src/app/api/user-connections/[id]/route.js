import { userConnectionController } from "@/backend/controllers/userConnectionController.js"
import { NextResponse } from "next/server"

// Respond to connection request (accept/reject)
export async function PATCH(request, { params }) {
  try {
    const authToken = request.cookies.get("auth-token")?.value
    
    if (!authToken) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { response } = body

    if (!response || !['accepted', 'rejected'].includes(response)) {
      return NextResponse.json(
        { success: false, message: "Response must be 'accepted' or 'rejected'" }, 
        { status: 400 }
      )
    }

    const result = await userConnectionController.respondToConnectionRequest(authToken, id, response)

    if (!result.success) {
      return NextResponse.json({ success: false, message: result.message }, { status: 400 })
    }

    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    console.error("Respond to connection request API error:", error)
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

// Delete connection (remove connection/friend)
export async function DELETE(request, { params }) {
  try {
    const authToken = request.cookies.get("auth-token")?.value
    
    if (!authToken) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const userId = authToken // The auth token is the user ID

    const result = await userConnectionController.removeConnection(userId, id)

    if (!result.success) {
      return NextResponse.json({ success: false, message: result.message }, { status: 400 })
    }

    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    console.error("Remove connection API error:", error)
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
