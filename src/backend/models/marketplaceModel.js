import sql from "../config/database.js"

export const marketplaceModel = {
  // Create a new marketplace listing
  async createListing(listingData) {
    const {
      user_id,
      crop_name,
      description,
      price_per_unit,
      unit,
      quantity_available,
      location,
      contact_phone,
      contact_email,
      images
    } = listingData

    const result = await sql`
      INSERT INTO marketplace_listings (
        user_id, crop_name, description, price_per_unit, unit,
        quantity_available, location, contact_phone, contact_email, images,
        created_at, updated_at
      )
      VALUES (
        ${user_id}, ${crop_name}, ${description}, ${price_per_unit}, ${unit},
        ${quantity_available}, ${location}, ${contact_phone}, ${contact_email}, ${images || []},
        NOW() AT TIME ZONE 'Asia/Dhaka', NOW() AT TIME ZONE 'Asia/Dhaka'
      )
      RETURNING id, user_id, crop_name, description, price_per_unit, unit,
                quantity_available, location, contact_phone, contact_email, images, status,
                created_at AT TIME ZONE 'Asia/Dhaka' as created_at,
                updated_at AT TIME ZONE 'Asia/Dhaka' as updated_at
    `
    return result[0]
  },

  // Get all active marketplace listings with user info
  async getAllListings(filters = {}) {
    const { crop_name, location, limit = 20, offset = 0 } = filters

    let whereClause = sql`WHERE ml.status = 'active'`
    
    if (crop_name) {
      whereClause = sql`${whereClause} AND ml.crop_name ILIKE ${'%' + crop_name + '%'}`
    }
    
    if (location) {
      whereClause = sql`${whereClause} AND ml.location ILIKE ${'%' + location + '%'}`
    }

    const result = await sql`
      SELECT 
        ml.id, ml.user_id, ml.crop_name, ml.description, ml.price_per_unit, ml.unit,
        ml.quantity_available, ml.location, ml.contact_phone, ml.contact_email, 
        ml.images, ml.status,
        ml.created_at AT TIME ZONE 'Asia/Dhaka' as created_at,
        ml.updated_at AT TIME ZONE 'Asia/Dhaka' as updated_at,
        u.name as seller_name, u.profile_pic as seller_profile_pic, u.area as seller_area
      FROM marketplace_listings ml
      JOIN users u ON ml.user_id = u.id
      ${whereClause}
      ORDER BY ml.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `
    return result
  },

  // Get listings by user
  async getUserListings(userId) {
    const result = await sql`
      SELECT 
        id, user_id, crop_name, description, price_per_unit, unit,
        quantity_available, location, contact_phone, contact_email, images, status,
        created_at AT TIME ZONE 'Asia/Dhaka' as created_at,
        updated_at AT TIME ZONE 'Asia/Dhaka' as updated_at
      FROM marketplace_listings
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `
    return result
  },

  // Get single listing by ID
  async getListingById(listingId) {
    const result = await sql`
      SELECT 
        ml.id, ml.user_id, ml.crop_name, ml.description, ml.price_per_unit, ml.unit,
        ml.quantity_available, ml.location, ml.contact_phone, ml.contact_email, 
        ml.images, ml.status,
        ml.created_at AT TIME ZONE 'Asia/Dhaka' as created_at,
        ml.updated_at AT TIME ZONE 'Asia/Dhaka' as updated_at,
        u.name as seller_name, u.profile_pic as seller_profile_pic, 
        u.area as seller_area, u.phone as seller_phone
      FROM marketplace_listings ml
      JOIN users u ON ml.user_id = u.id
      WHERE ml.id = ${listingId}
    `
    return result[0]
  },

  // Update listing
async updateListing(listingId, userId, updateData) {
    const {
      crop_name,
      description,
      price_per_unit,
      unit,
      quantity_available,
      location,
      contact_phone,
      contact_email,
      status,
      images 
    } = updateData

    const result = await sql`
      UPDATE marketplace_listings
      SET 
        crop_name = COALESCE(${crop_name}, crop_name),
        description = COALESCE(${description}, description),
        price_per_unit = COALESCE(${price_per_unit}, price_per_unit),
        unit = COALESCE(${unit}, unit),
        quantity_available = COALESCE(${quantity_available}, quantity_available),
        location = COALESCE(${location}, location),
        contact_phone = COALESCE(${contact_phone}, contact_phone),
        contact_email = COALESCE(${contact_email}, contact_email),
        status = COALESCE(${status}, status),
        images = COALESCE(${images}, images), 
        updated_at = NOW() AT TIME ZONE 'Asia/Dhaka'
      WHERE id = ${listingId} AND user_id = ${userId}
      RETURNING id, crop_name, description, price_per_unit, unit,
                quantity_available, location, contact_phone, contact_email, images, status, -- <-- ADD 'images' HERE
                updated_at AT TIME ZONE 'Asia/Dhaka' as updated_at
    `
    return result[0]
  },
  // Delete listing
  async deleteListing(listingId, userId) {
    const result = await sql`
      DELETE FROM marketplace_listings
      WHERE id = ${listingId} AND user_id = ${userId}
      RETURNING id
    `
    return result[0]
  },

  // Get listing statistics
  async getListingStats(userId) {
    const result = await sql`
      SELECT 
        COUNT(*) as total_listings,
        COUNT(*) FILTER (WHERE status = 'active') as active_listings,
        COUNT(*) FILTER (WHERE status = 'sold') as sold_listings,
        COUNT(*) FILTER (WHERE status = 'inactive') as inactive_listings
      FROM marketplace_listings
      WHERE user_id = ${userId}
    `
    return result[0]
  }
}
