import sql from "../config/database.js"

export const landModel = {
  // Create a new land
  async createLand(landData) {
    const { user_id, land_type, area, soil_quality, location_link, description, tags, land_image } = landData
    const result = await sql`
      INSERT INTO lands (user_id, land_type, area, soil_quality, location_link, description, tags, land_image)
      VALUES (${user_id}, ${land_type}, ${area}, ${soil_quality || null}, ${location_link || null}, ${description || null}, ${tags || []}, ${land_image || null})
      RETURNING id, user_id, land_type, area, soil_quality, location_link, description, tags, land_image, created_at, updated_at
    `
    return result[0]
  },

  // Get all lands for a user
  async getUserLands(userId) {
    const result = await sql`
      SELECT id, user_id, land_type, area, soil_quality, location_link, description, tags, land_image, created_at, updated_at
      FROM lands 
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `
    return result
  },

  // Get land by ID
  async getLandById(id, userId) {
    const result = await sql`
      SELECT id, user_id, land_type, area, soil_quality, location_link, description, tags, land_image, created_at, updated_at
      FROM lands 
      WHERE id = ${id} AND user_id = ${userId}
    `
    return result[0]
  },

  // Update land 
  async updateLand(id, userId, landData) {
    const { land_type, area, soil_quality, location_link, description, tags } = landData
    const result = await sql`
      UPDATE lands 
      SET land_type = ${land_type}, 
          area = ${area}, 
          soil_quality = ${soil_quality || null}, 
          location_link = ${location_link || null}, 
          description = ${description || null}, 
          tags = ${tags || []}, 
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id} AND user_id = ${userId}
      RETURNING id, user_id, land_type, area, soil_quality, location_link, description, tags, land_image, created_at, updated_at
    `
    return result[0]
  },

  // Update only land image
  async updateLandImage(id, userId, imageUrl) {
    const result = await sql`
      UPDATE lands 
      SET land_image = ${imageUrl},
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id} AND user_id = ${userId}
      RETURNING id, user_id, land_type, area, soil_quality, location_link, description, tags, land_image, created_at, updated_at
    `
    return result[0]
  },

  // Delete land
  async deleteLand(id, userId) {
    const result = await sql`
      DELETE FROM lands 
      WHERE id = ${id} AND user_id = ${userId}
      RETURNING id
    `
    return result[0]
  },

  // Get land statistics for user
  async getLandStats(userId) {
    const result = await sql`
      SELECT 
        COUNT(*) as total_lands,
        SUM(area) as total_area,
        land_type,
        COUNT(*) as type_count
      FROM lands 
      WHERE user_id = ${userId}
      GROUP BY land_type
    `
    return result
  },
}
