import sql from "../config/database.js"

export const userConnectionModel = {
  // Find farmers by location search
  async findFarmersByLocation(userId, location, area = null, name = null, limit = 20) {
    let whereClause = sql`WHERE u.id != ${userId} AND u.is_banned = FALSE`
    
    if (location) {
      whereClause = sql`${whereClause} AND (
        LOWER(u.city) LIKE LOWER(${'%' + location.trim() + '%'}) OR 
        LOWER(u.area) LIKE LOWER(${'%' + location.trim() + '%'}) OR 
        LOWER(u.country) LIKE LOWER(${'%' + location.trim() + '%'})
      )`
    }
    
    if (area) {
      whereClause = sql`${whereClause} AND LOWER(u.area) LIKE LOWER(${'%' + area.trim() + '%'})`
    }

    if (name) {
      whereClause = sql`${whereClause} AND LOWER(u.name) LIKE LOWER(${'%' + name.trim() + '%'})`
    }

    const result = await sql`
      SELECT 
        u.id, u.name, u.profile_pic, u.area, u.city, u.country, u.phone,
        u.preferred_crops, u.created_at, u.age,
        CASE 
          WHEN uc.id IS NOT NULL THEN uc.status
          ELSE NULL
        END as connection_status,
        CASE 
          WHEN uc.requester_id = ${userId} THEN 'sent'
          WHEN uc.receiver_id = ${userId} THEN 'received'
          ELSE NULL
        END as request_direction
      FROM users u
      LEFT JOIN user_connections uc ON 
        (uc.requester_id = ${userId} AND uc.receiver_id = u.id) OR
        (uc.receiver_id = ${userId} AND uc.requester_id = u.id)
      ${whereClause}
      ORDER BY u.created_at DESC
      LIMIT ${limit}
    `
    return result
  },

  // Find farmers from the same area/city as current user
  async findNearbyFarmers(userId, limit = 20) {
    // First get the current user's area and city
    const currentUser = await sql`
      SELECT area, city FROM users WHERE id = ${userId}
    `
    
    if (currentUser.length === 0) {
      return []
    }

    const { area: currentArea, city: currentCity } = currentUser[0]
    
    // If user has no area or city, return empty array
    if (!currentArea && !currentCity) {
      return []
    }

    let whereClause = sql`WHERE u.id != ${userId} AND u.is_banned = FALSE`
    
    if (currentArea && currentCity) {
      // Match either area or city
      whereClause = sql`${whereClause} AND (
        (u.area IS NOT NULL AND LOWER(u.area) = LOWER(${currentArea}))
        OR (u.city IS NOT NULL AND LOWER(u.city) = LOWER(${currentCity}))
      )`
    } else if (currentArea) {
      // Match area only
      whereClause = sql`${whereClause} AND u.area IS NOT NULL AND LOWER(u.area) = LOWER(${currentArea})`
    } else if (currentCity) {
      // Match city only
      whereClause = sql`${whereClause} AND u.city IS NOT NULL AND LOWER(u.city) = LOWER(${currentCity})`
    }

    const result = await sql`
      SELECT 
        u.id, u.name, u.profile_pic, u.area, u.city, u.country, u.phone,
        u.preferred_crops, u.created_at, u.age,
        CASE 
          WHEN uc.id IS NOT NULL THEN uc.status
          ELSE NULL
        END as connection_status,
        CASE 
          WHEN uc.requester_id = ${userId} THEN 'sent'
          WHEN uc.receiver_id = ${userId} THEN 'received'
          ELSE NULL
        END as request_direction
      FROM users u
      LEFT JOIN user_connections uc ON 
        (uc.requester_id = ${userId} AND uc.receiver_id = u.id) OR
        (uc.receiver_id = ${userId} AND uc.requester_id = u.id)
      ${whereClause}
      ORDER BY u.created_at DESC
      LIMIT ${limit}
    `
    return result
  },

  // Get all farmers 
  async getAllFarmers(userId, limit = 20, offset = 0) {
    const result = await sql`
      SELECT 
        u.id, u.name, u.profile_pic, u.area, u.city, u.country, u.phone,
        u.preferred_crops, u.created_at, u.age,
        CASE 
          WHEN uc.id IS NOT NULL THEN uc.status
          ELSE NULL
        END as connection_status,
        CASE 
          WHEN uc.requester_id = ${userId} THEN 'sent'
          WHEN uc.receiver_id = ${userId} THEN 'received'
          ELSE NULL
        END as request_direction
      FROM users u
      LEFT JOIN user_connections uc ON 
        (uc.requester_id = ${userId} AND uc.receiver_id = u.id) OR
        (uc.receiver_id = ${userId} AND uc.requester_id = u.id)
      WHERE u.id != ${userId} AND u.is_banned = FALSE
      ORDER BY u.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `
    return result
  },

  // Send connection request
  async sendConnectionRequest(requesterId, receiverId) {
    try {
      // Check if connection already exists
      const existingConnection = await sql`
        SELECT id, status FROM user_connections
        WHERE (requester_id = ${requesterId} AND receiver_id = ${receiverId})
           OR (requester_id = ${receiverId} AND receiver_id = ${requesterId})
      `

      if (existingConnection.length > 0) {
        throw new Error("Connection request already exists")
      }

      const result = await sql`
        INSERT INTO user_connections (requester_id, receiver_id, status)
        VALUES (${requesterId}, ${receiverId}, 'pending')
        RETURNING id, requester_id, receiver_id, status, created_at
      `
      return result[0]
    } catch (error) {
      throw error
    }
  },

  // Respond to connection request (accept/reject)
  async respondToConnectionRequest(connectionId, userId, response) {
    if (!['accepted', 'rejected'].includes(response)) {
      throw new Error("Invalid response. Must be 'accepted' or 'rejected'")
    }

    const result = await sql`
      UPDATE user_connections 
      SET status = ${response}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${connectionId} 
        AND receiver_id = ${userId}
        AND status = 'pending'
      RETURNING id, requester_id, receiver_id, status, updated_at
    `

    if (result.length === 0) {
      throw new Error("Connection request not found or unauthorized")
    }

    return result[0]
  },

  // Get user's connection requests
  async getUserConnectionRequests(userId, type = 'all') {
    let whereClause = sql``
    
    if (type === 'sent') {
      whereClause = sql`WHERE uc.requester_id = ${userId} AND uc.status = 'pending'`
    } else if (type === 'received') {
      whereClause = sql`WHERE uc.receiver_id = ${userId} AND uc.status = 'pending'`
    } else {
      whereClause = sql`WHERE (uc.requester_id = ${userId} OR uc.receiver_id = ${userId}) AND uc.status = 'pending'`
    }

    const result = await sql`
      SELECT 
        uc.id, uc.requester_id, uc.receiver_id, uc.status,
        uc.created_at, uc.updated_at,
        CASE 
          WHEN uc.requester_id = ${userId} THEN u2.name
          ELSE u1.name
        END as other_user_name,
        CASE 
          WHEN uc.requester_id = ${userId} THEN u2.profile_pic
          ELSE u1.profile_pic
        END as other_user_profile_pic,
        CASE 
          WHEN uc.requester_id = ${userId} THEN u2.area
          ELSE u1.area
        END as other_user_area,
        CASE 
          WHEN uc.requester_id = ${userId} THEN u2.id
          ELSE u1.id
        END as other_user_id,
        CASE 
          WHEN uc.requester_id = ${userId} THEN 'sent'
          ELSE 'received'
        END as request_direction
      FROM user_connections uc
      JOIN users u1 ON uc.requester_id = u1.id AND u1.is_banned = FALSE
      JOIN users u2 ON uc.receiver_id = u2.id AND u2.is_banned = FALSE
      ${whereClause}
      ORDER BY uc.created_at DESC
    `
    return result
  },

  // Get user's accepted connections (friends)
  async getUserConnections(userId) {
    const result = await sql`
      SELECT 
        uc.id as connection_id, 
        uc.created_at as connected_since,
        CASE 
          WHEN uc.requester_id = ${userId} THEN u2.id
          ELSE u1.id
        END as friend_info_id,
        CASE 
          WHEN uc.requester_id = ${userId} THEN u2.name
          ELSE u1.name
        END as friend_info_name,
        CASE 
          WHEN uc.requester_id = ${userId} THEN u2.profile_pic
          ELSE u1.profile_pic
        END as friend_info_profile_pic,
        CASE 
          WHEN uc.requester_id = ${userId} THEN u2.area
          ELSE u1.area
        END as friend_info_area,
        CASE 
          WHEN uc.requester_id = ${userId} THEN u2.city
          ELSE u1.city
        END as friend_info_city,
        CASE 
          WHEN uc.requester_id = ${userId} THEN u2.country
          ELSE u1.country
        END as friend_info_country,
        CASE 
          WHEN uc.requester_id = ${userId} THEN u2.phone
          ELSE u1.phone
        END as friend_info_phone,
        CASE 
          WHEN uc.requester_id = ${userId} THEN u2.preferred_crops
          ELSE u1.preferred_crops
        END as friend_info_preferred_crops,
        CASE 
          WHEN uc.requester_id = ${userId} THEN u2.age
          ELSE u1.age
        END as friend_info_age,
        CASE 
          WHEN uc.requester_id = ${userId} THEN u2.created_at
          ELSE u1.created_at
        END as friend_info_created_at
      FROM user_connections uc
      JOIN users u1 ON uc.requester_id = u1.id AND u1.is_banned = FALSE
      JOIN users u2 ON uc.receiver_id = u2.id AND u2.is_banned = FALSE
      WHERE (uc.requester_id = ${userId} OR uc.receiver_id = ${userId})
        AND uc.status = 'accepted'
      ORDER BY uc.created_at DESC
    `
    
    // Transform the result to match the expected structure
    return result.map(row => ({
      id: row.connection_id, // Add this for remove functionality
      connection_id: row.connection_id,
      connected_since: row.connected_since,
      friend_info: {
        id: row.friend_info_id,
        name: row.friend_info_name,
        profile_pic: row.friend_info_profile_pic,
        area: row.friend_info_area,
        city: row.friend_info_city,
        country: row.friend_info_country,
        phone: row.friend_info_phone,
        preferred_crops: row.friend_info_preferred_crops,
        age: row.friend_info_age,
        created_at: row.friend_info_created_at
      }
    }))
  },

  // Get connection between two users
  async getConnectionBetweenUsers(userId1, userId2) {
    const result = await sql`
      SELECT * FROM user_connections
      WHERE (requester_id = ${userId1} AND receiver_id = ${userId2})
         OR (requester_id = ${userId2} AND receiver_id = ${userId1})
    `
    return result[0]
  },

  // Remove connection
  async removeConnection(userId, connectionId) {
    const result = await sql`
      DELETE FROM user_connections 
      WHERE id = ${connectionId} 
        AND (requester_id = ${userId} OR receiver_id = ${userId})
        AND (status = 'accepted' OR (status = 'pending' AND requester_id = ${userId}))
      RETURNING id
    `

    if (result.length === 0) {
      throw new Error("Connection not found or unauthorized")
    }

    return result[0]
  }
}
