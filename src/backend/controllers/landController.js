import { landModel } from "../models/landModel.js"

export const landController = {
  // Create new land
  async createLand(userId, landData) {
    try {
      const { land_type, area, soil_quality, location_link, description, tags } = landData

      // Validate required fields
      if (!land_type || !area) {
        throw new Error("Land type and area are required")
      }

      // Validate area
      if (isNaN(area) || Number.parseFloat(area) <= 0) {
        throw new Error("Area must be a positive number")
      }

      // Process tags
      const processedTags = tags
        ? tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean)
        : []

      const land = await landModel.createLand({
        user_id: userId,
        land_type,
        area: Number.parseFloat(area),
        soil_quality,
        location_link,
        description,
        tags: processedTags,
        land_image: null, // Will be updated separately if image is uploaded
      })

      return {
        success: true,
        land,
        message: "Land added successfully",
      }
    } catch (error) {
      console.error("Create land error:", error)
      return {
        success: false,
        message: error.message,
      }
    }
  },

  // Get user lands
  async getUserLands(userId) {
    try {
      const lands = await landModel.getUserLands(userId)
      const stats = await landModel.getLandStats(userId)

      return {
        success: true,
        lands,
        stats,
        message: "Lands retrieved successfully",
      }
    } catch (error) {
      console.error("Get user lands error:", error)
      return {
        success: false,
        message: error.message,
      }
    }
  },

  // Get land by ID
  async getLandById(id, userId) {
    try {
      const land = await landModel.getLandById(id, userId)

      if (!land) {
        throw new Error("Land not found")
      }

      return {
        success: true,
        land,
        message: "Land retrieved successfully",
      }
    } catch (error) {
      console.error("Get land by ID error:", error)
      return {
        success: false,
        message: error.message,
      }
    }
  },

  // Update land
  async updateLand(id, userId, landData) {
    try {
      const { land_type, area, soil_quality, location_link, description, tags } = landData

      // Validate required fields
      if (!land_type || !area) {
        throw new Error("Land type and area are required")
      }

      // Validate area
      if (isNaN(area) || Number.parseFloat(area) <= 0) {
        throw new Error("Area must be a positive number")
      }

      // Process tags
      const processedTags = tags
        ? tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean)
        : []

      const updatedLand = await landModel.updateLand(id, userId, {
        land_type,
        area: Number.parseFloat(area),
        soil_quality,
        location_link,
        description,
        tags: processedTags,
      })

      if (!updatedLand) {
        throw new Error("Land not found or unauthorized")
      }

      return {
        success: true,
        land: updatedLand,
        message: "Land updated successfully",
      }
    } catch (error) {
      console.error("Update land error:", error)
      return {
        success: false,
        message: error.message,
      }
    }
  },

  // Update land image only
  async updateLandImage(id, userId, imageUrl) {
    try {
      const result = await landModel.updateLandImage(id, userId, imageUrl)

      if (!result) {
        throw new Error("Land not found or unauthorized")
      }

      return {
        success: true,
        land: result,
        message: "Land image updated successfully",
      }
    } catch (error) {
      console.error("Update land image error:", error)
      return {
        success: false,
        message: error.message,
      }
    }
  },

  // Delete land
  async deleteLand(id, userId) {
    try {
      const deleted = await landModel.deleteLand(id, userId)

      if (!deleted) {
        throw new Error("Land not found or unauthorized")
      }

      return {
        success: true,
        message: "Land deleted successfully",
      }
    } catch (error) {
      console.error("Delete land error:", error)
      return {
        success: false,
        message: error.message,
      }
    }
  },
}
