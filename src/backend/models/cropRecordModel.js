import sql from "../config/database.js"

export const cropRecordModel = {
  // Create a new crop record
  async createCropRecord(recordData) {
    const {
      land_id,
      crop_name,
      season,
      year,
      planting_date,
      harvest_date,
      total_yield,
      yield_unit,
      total_expenses,
      total_revenue,
      notes
    } = recordData

    const result = await sql`
      INSERT INTO crop_records (
        land_id, crop_name, season, year, planting_date, harvest_date, 
        total_yield, yield_unit, total_expenses, total_revenue, notes,
        created_at, updated_at
      ) 
      VALUES (
        ${land_id}, ${crop_name}, ${season}, ${year}, ${planting_date}, ${harvest_date}, 
        ${total_yield}, ${yield_unit}, ${total_expenses}, ${total_revenue}, ${notes},
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      ) 
      RETURNING *
    `
    return result[0]
  },

  // Get crop records by land ID
  async getCropRecordsByLandId(landId) {
    const result = await sql`
      SELECT * FROM crop_records 
      WHERE land_id = ${landId} 
      ORDER BY year DESC, 
      CASE 
        WHEN season = 'Winter' THEN 1
        WHEN season = 'Spring' THEN 2  
        WHEN season = 'Summer' THEN 3
        WHEN season = 'Monsoon' THEN 4
      END
    `
    return result
  },

  // Get crop record by ID
  async getCropRecordById(recordId) {
    const result = await sql`
      SELECT cr.*, l.user_id 
      FROM crop_records cr
      JOIN lands l ON cr.land_id = l.id 
      WHERE cr.id = ${recordId}
    `
    return result[0]
  },

  // Update crop record
  async updateCropRecord(recordId, updateData) {
    const {
      crop_name,
      season,
      year,
      planting_date,
      harvest_date,
      total_yield,
      yield_unit,
      total_expenses,
      total_revenue,
      notes
    } = updateData

    const result = await sql`
      UPDATE crop_records 
      SET crop_name = ${crop_name}, 
          season = ${season}, 
          year = ${year}, 
          planting_date = ${planting_date}, 
          harvest_date = ${harvest_date},
          total_yield = ${total_yield}, 
          yield_unit = ${yield_unit},
          total_expenses = ${total_expenses}, 
          total_revenue = ${total_revenue},
          notes = ${notes}, 
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${recordId}
      RETURNING *
    `
    return result[0]
  },

  // Delete crop record
  async deleteCropRecord(recordId) {
    const result = await sql`
      DELETE FROM crop_records WHERE id = ${recordId}
      RETURNING *
    `
    return result[0]
  },

  // Verify land ownership
  async verifyLandOwnership(landId, userId) {
    const result = await sql`
      SELECT id FROM lands WHERE id = ${landId} AND user_id = ${userId}
    `
    return result.length > 0
  },

  // Verify record ownership through land
  async verifyRecordOwnership(recordId, userId) {
    const result = await sql`
      SELECT cr.id 
      FROM crop_records cr
      JOIN lands l ON cr.land_id = l.id 
      WHERE cr.id = ${recordId} AND l.user_id = ${userId}
    `
    return result.length > 0
  },

  // Get all crop records for a user
  async getUserCropRecords(userId, filters = {}) {
    const { landId, season, year } = filters

    let whereClause = sql`WHERE l.user_id = ${userId}`
    
    if (landId) {
      whereClause = sql`${whereClause} AND cr.land_id = ${landId}`
    }
    
    if (season) {
      whereClause = sql`${whereClause} AND cr.season = ${season}`
    }
    
    if (year) {
      whereClause = sql`${whereClause} AND cr.year = ${year}`
    }

    const result = await sql`
      SELECT cr.*, l.land_name, l.location
      FROM crop_records cr
      JOIN lands l ON cr.land_id = l.id 
      ${whereClause}
      ORDER BY cr.year DESC, 
      CASE 
        WHEN cr.season = 'Winter' THEN 1
        WHEN cr.season = 'Spring' THEN 2  
        WHEN cr.season = 'Summer' THEN 3
        WHEN cr.season = 'Monsoon' THEN 4
      END
    `
    return result
  }
}
