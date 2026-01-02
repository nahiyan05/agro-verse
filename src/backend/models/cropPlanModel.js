import sql from "../config/database.js"

export const cropPlanModel = {
  // Create a new crop plan
  async createCropPlan(planData) {
    const {
      user_id,
      land_id,
      crop_name,
      season,
      planting_date,
      expected_harvest_date,
      estimated_yield,
      yield_unit,
      notes
    } = planData

    const result = await sql`
      INSERT INTO seasonal_crop_plans (
        user_id, land_id, crop_name, season, planting_date,
        expected_harvest_date, estimated_yield, yield_unit, notes,
        created_at, updated_at
      )
      VALUES (
        ${user_id}, ${land_id}, ${crop_name}, ${season}, ${planting_date},
        ${expected_harvest_date}, ${estimated_yield}, ${yield_unit}, ${notes},
        NOW() AT TIME ZONE 'Asia/Dhaka', NOW() AT TIME ZONE 'Asia/Dhaka'
      )
      RETURNING id, user_id, land_id, crop_name, season, planting_date,
                expected_harvest_date, estimated_yield, yield_unit, notes, status,
                created_at AT TIME ZONE 'Asia/Dhaka' as created_at,
                updated_at AT TIME ZONE 'Asia/Dhaka' as updated_at
    `
    return result[0]
  },

  // Get all crop plans for a user
  async getUserCropPlans(userId, filters = {}) {
    const { season, status, land_id } = filters

    let whereClause = sql`WHERE scp.user_id = ${userId}`
    
    if (season) {
      whereClause = sql`${whereClause} AND scp.season = ${season}`
    }
    
    if (status) {
      whereClause = sql`${whereClause} AND scp.status = ${status}`
    }
    
    if (land_id) {
      whereClause = sql`${whereClause} AND scp.land_id = ${land_id}`
    }

    const result = await sql`
      SELECT 
        scp.id, scp.user_id, scp.land_id, scp.crop_name, scp.season,
        scp.planting_date, scp.expected_harvest_date, scp.estimated_yield,
        scp.yield_unit, scp.notes, scp.status,
        scp.created_at AT TIME ZONE 'Asia/Dhaka' as created_at,
        scp.updated_at AT TIME ZONE 'Asia/Dhaka' as updated_at,
        l.land_type, l.area as land_area, l.soil_quality
      FROM seasonal_crop_plans scp
      LEFT JOIN lands l ON scp.land_id = l.id
      ${whereClause}
      ORDER BY scp.planting_date DESC, scp.created_at DESC
    `
    return result
  },

  // Get public crop plans (for viewing others' upcoming harvest plans)
  async getPublicCropPlans(filters = {}) {
    const { season, crop_name, location, limit = 20, offset = 0 } = filters

    let whereClause = sql`WHERE scp.status IN ('planned', 'planted')`
    
    if (season) {
      whereClause = sql`${whereClause} AND scp.season = ${season}`
    }
    
    if (crop_name) {
      whereClause = sql`${whereClause} AND scp.crop_name ILIKE ${'%' + crop_name + '%'}`
    }
    
    if (location) {
      whereClause = sql`${whereClause} AND (u.area ILIKE ${'%' + location + '%'} OR u.city ILIKE ${'%' + location + '%'})`
    }

    const result = await sql`
      SELECT 
        scp.id, scp.user_id, scp.crop_name, scp.season,
        scp.planting_date, scp.expected_harvest_date, scp.estimated_yield,
        scp.yield_unit, scp.status,
        scp.created_at AT TIME ZONE 'Asia/Dhaka' as created_at,
        u.name as farmer_name, u.profile_pic as farmer_profile_pic, 
        u.area as farmer_area, u.city as farmer_city,
        l.land_type, l.area as land_area
      FROM seasonal_crop_plans scp
      JOIN users u ON scp.user_id = u.id
      LEFT JOIN lands l ON scp.land_id = l.id
      ${whereClause}
      ORDER BY scp.expected_harvest_date ASC
      LIMIT ${limit} OFFSET ${offset}
    `
    return result
  },

  // Get single crop plan by ID
  async getCropPlanById(planId) {
    const result = await sql`
      SELECT 
        scp.id, scp.user_id, scp.land_id, scp.crop_name, scp.season,
        scp.planting_date, scp.expected_harvest_date, scp.estimated_yield,
        scp.yield_unit, scp.notes, scp.status,
        scp.created_at AT TIME ZONE 'Asia/Dhaka' as created_at,
        scp.updated_at AT TIME ZONE 'Asia/Dhaka' as updated_at,
        l.land_type, l.area as land_area, l.soil_quality, l.description as land_description
      FROM seasonal_crop_plans scp
      LEFT JOIN lands l ON scp.land_id = l.id
      WHERE scp.id = ${planId}
    `
    return result[0]
  },

  // Update crop plan
  async updateCropPlan(planId, userId, updateData) {
    const {
      land_id,
      crop_name,
      season,
      planting_date,
      expected_harvest_date,
      estimated_yield,
      yield_unit,
      notes,
      status
    } = updateData

    const result = await sql`
      UPDATE seasonal_crop_plans
      SET 
        land_id = COALESCE(${land_id}, land_id),
        crop_name = COALESCE(${crop_name}, crop_name),
        season = COALESCE(${season}, season),
        planting_date = COALESCE(${planting_date}, planting_date),
        expected_harvest_date = COALESCE(${expected_harvest_date}, expected_harvest_date),
        estimated_yield = COALESCE(${estimated_yield}, estimated_yield),
        yield_unit = COALESCE(${yield_unit}, yield_unit),
        notes = COALESCE(${notes}, notes),
        status = COALESCE(${status}, status),
        updated_at = NOW() AT TIME ZONE 'Asia/Dhaka'
      WHERE id = ${planId} AND user_id = ${userId}
      RETURNING id, land_id, crop_name, season, planting_date,
                expected_harvest_date, estimated_yield, yield_unit, notes, status,
                updated_at AT TIME ZONE 'Asia/Dhaka' as updated_at
    `
    return result[0]
  },

  // Delete crop plan
  async deleteCropPlan(planId, userId) {
    const result = await sql`
      DELETE FROM seasonal_crop_plans
      WHERE id = ${planId} AND user_id = ${userId}
      RETURNING id
    `
    return result[0]
  },

  // Get crop plan statistics
  async getCropPlanStats(userId) {
    const result = await sql`
      SELECT 
        COUNT(*) as total_plans,
        COUNT(*) FILTER (WHERE status = 'planned') as planned_count,
        COUNT(*) FILTER (WHERE status = 'planted') as planted_count,
        COUNT(*) FILTER (WHERE status = 'harvested') as harvested_count,
        COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled_count
      FROM seasonal_crop_plans
      WHERE user_id = ${userId}
    `
    return result[0]
  },

  // Get upcoming harvests (next 3 months)
  async getUpcomingHarvests(userId) {
    const result = await sql`
      SELECT 
        scp.id, scp.crop_name, scp.expected_harvest_date, scp.estimated_yield,
        scp.yield_unit, scp.status,
        l.land_type, l.area as land_area
      FROM seasonal_crop_plans scp
      LEFT JOIN lands l ON scp.land_id = l.id
      WHERE scp.user_id = ${userId} 
        AND scp.status IN ('planned', 'planted')
        AND scp.expected_harvest_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '3 months'
      ORDER BY scp.expected_harvest_date ASC
    `
    return result
  }
}
