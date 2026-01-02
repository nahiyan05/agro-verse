import { NextResponse } from "next/server"
import sql from "@/backend/config/database.js"

// Search users
export async function GET(request) {
  try {
    const authToken = request.cookies.get("auth-token")?.value
    
    if (!authToken) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const userId = authToken // Auth token is just the user ID
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q")

    if (!query || query.length < 2) {
      return NextResponse.json({ 
        success: false, 
        message: "Search query must be at least 2 characters" 
      }, { status: 400 })
    }

    // Search for users by name, email, or location
    const searchQuery = `%${query.toLowerCase()}%`
    const users = await sql`
      SELECT 
        u.id as user_id,
        u.name as full_name,
        u.email,
        u.profile_pic as profile_image,
        u.city,
        u.area,
        u.country,
        CASE 
          WHEN uc.id IS NOT NULL AND uc.status = 'accepted' THEN true
          ELSE false
        END as is_connected,
        CASE 
          WHEN uc.id IS NOT NULL AND uc.status = 'pending' AND uc.requester_id = ${userId} THEN true
          ELSE false
        END as request_sent,
        CASE 
          WHEN uc.id IS NOT NULL AND uc.status = 'pending' AND uc.receiver_id = ${userId} THEN true
          ELSE false
        END as request_received
      FROM users u
      LEFT JOIN user_connections uc ON (
        (uc.requester_id = ${userId} AND uc.receiver_id = u.id) OR
        (uc.receiver_id = ${userId} AND uc.requester_id = u.id)
      )
      WHERE u.id != ${userId} 
      AND u.is_banned = FALSE
      AND (
        LOWER(u.name) LIKE ${searchQuery} OR
        LOWER(u.email) LIKE ${searchQuery} OR
        LOWER(u.city) LIKE ${searchQuery} OR
        LOWER(u.area) LIKE ${searchQuery} OR
        LOWER(u.country) LIKE ${searchQuery}
      )
      ORDER BY u.name
      LIMIT 20
    `

    // Format the location for each user
    const formattedUsers = users.map(user => ({
      ...user,
      location: [user.area, user.city, user.country].filter(Boolean).join(", ")
    }))

    return NextResponse.json({ 
      success: true, 
      users: formattedUsers
    })

  } catch (error) {
    console.error("Search users API error:", error)
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
