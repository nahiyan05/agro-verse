import { cropPlanModel } from "../models/cropPlanModel.js"

export const cropPlanController = {
  // Create new crop plan
  async createCropPlan(userId, planData) {
    try {
      const {
        land_id,
        crop_name,
        season,
        planting_date,
        expected_harvest_date,
        estimated_yield,
        yield_unit,
        notes
      } = planData

      // Validate required fields
      if (!crop_name || !season) {
        throw new Error("Crop name and season are required")
      }

      // Validate dates if provided
      if (planting_date && expected_harvest_date) {
        const plantingDate = new Date(planting_date)
        const harvestDate = new Date(expected_harvest_date)
        
        if (harvestDate <= plantingDate) {
          throw new Error("Expected harvest date must be after planting date")
        }
      }

      // Validate yield if provided
      if (estimated_yield && (isNaN(estimated_yield) || Number.parseFloat(estimated_yield) < 0)) {
        throw new Error("Estimated yield must be a non-negative number")
      }

      const cropPlan = await cropPlanModel.createCropPlan({
        user_id: userId,
        land_id: land_id || null,
        crop_name: crop_name.trim(),
        season: season.trim(),
        planting_date: planting_date || null,
        expected_harvest_date: expected_harvest_date || null,
        estimated_yield: estimated_yield ? Number.parseFloat(estimated_yield) : null,
        yield_unit: yield_unit?.trim() || null,
        notes: notes?.trim() || null
      })

      return {
        success: true,
        cropPlan,
        message: "Crop plan created successfully"
      }
    } catch (error) {
      console.error("Create crop plan error:", error)
      return {
        success: false,
        message: error.message
      }
    }
  },

  // Get user's crop plans
  async getUserCropPlans(userId, filters = {}) {
    try {
      const cropPlans = await cropPlanModel.getUserCropPlans(userId, filters)
      const stats = await cropPlanModel.getCropPlanStats(userId)
      const upcomingHarvests = await cropPlanModel.getUpcomingHarvests(userId)

      return {
        success: true,
        cropPlans,
        stats,
        upcomingHarvests,
        message: "Crop plans retrieved successfully"
      }
    } catch (error) {
      console.error("Get user crop plans error:", error)
      return {
        success: false,
        message: error.message
      }
    }
  },

  // Get public crop plans (others' upcoming harvest plans)
  async getPublicCropPlans(filters = {}) {
    try {
      const cropPlans = await cropPlanModel.getPublicCropPlans(filters)

      return {
        success: true,
        cropPlans,
        message: "Public crop plans retrieved successfully"
      }
    } catch (error) {
      console.error("Get public crop plans error:", error)
      return {
        success: false,
        message: error.message
      }
    }
  },

  // Get single crop plan
  async getCropPlanById(planId, userId = null) {
    try {
      const cropPlan = await cropPlanModel.getCropPlanById(planId)

      if (!cropPlan) {
        throw new Error("Crop plan not found")
      }

      // Check if user has permission to view (if userId provided)
      if (userId && cropPlan.user_id !== userId) {
        // For public viewing, only show non-sensitive info
        delete cropPlan.notes
      }

      return {
        success: true,
        cropPlan,
        message: "Crop plan retrieved successfully"
      }
    } catch (error) {
      console.error("Get crop plan error:", error)
      return {
        success: false,
        message: error.message
      }
    }
  },

  // Update crop plan
  async updateCropPlan(planId, userId, updateData) {
    try {
      // Validate dates if provided
      if (updateData.planting_date && updateData.expected_harvest_date) {
        const plantingDate = new Date(updateData.planting_date)
        const harvestDate = new Date(updateData.expected_harvest_date)
        
        if (harvestDate <= plantingDate) {
          throw new Error("Expected harvest date must be after planting date")
        }
      }

      // Validate yield if provided
      if (updateData.estimated_yield && (isNaN(updateData.estimated_yield) || Number.parseFloat(updateData.estimated_yield) < 0)) {
        throw new Error("Estimated yield must be a non-negative number")
      }

      // Process the update data
      const processedData = {
        ...updateData,
        estimated_yield: updateData.estimated_yield ? Number.parseFloat(updateData.estimated_yield) : undefined
      }

      const cropPlan = await cropPlanModel.updateCropPlan(planId, userId, processedData)

      if (!cropPlan) {
        throw new Error("Crop plan not found or you don't have permission to update it")
      }

      return {
        success: true,
        cropPlan,
        message: "Crop plan updated successfully"
      }
    } catch (error) {
      console.error("Update crop plan error:", error)
      return {
        success: false,
        message: error.message
      }
    }
  },

  // Delete crop plan
  async deleteCropPlan(planId, userId) {
    try {
      const result = await cropPlanModel.deleteCropPlan(planId, userId)

      if (!result) {
        throw new Error("Crop plan not found or you don't have permission to delete it")
      }

      return {
        success: true,
        message: "Crop plan deleted successfully"
      }
    } catch (error) {
      console.error("Delete crop plan error:", error)
      return {
        success: false,
        message: error.message
      }
    }
  },

  // Get seasonal recommendations
  async getSeasonalRecommendations() {
    try {
      const currentMonth = new Date().getMonth() + 1 // 1-12
      let currentSeason = "Winter"
      let recommendedCrops = []

      // Determine current season based on month (Bangladesh seasons)
      if (currentMonth >= 3 && currentMonth <= 5) {
        currentSeason = "Spring"
        recommendedCrops = ["Rice", "Wheat", "Maize", "Vegetables", "Mustard"]
      } else if (currentMonth >= 6 && currentMonth <= 8) {
        currentSeason = "Monsoon"
        recommendedCrops = ["Rice", "Jute", "Sugarcane", "Vegetables", "Fodder"]
      } else if (currentMonth >= 9 && currentMonth <= 11) {
        currentSeason = "Autumn"
        recommendedCrops = ["Rice", "Potato", "Onion", "Garlic", "Spices"]
      } else {
        currentSeason = "Winter"
        recommendedCrops = ["Wheat", "Barley", "Mustard", "Potato", "Winter Vegetables"]
      }

      return {
        success: true,
        currentSeason,
        recommendedCrops,
        message: "Seasonal recommendations retrieved successfully"
      }
    } catch (error) {
      console.error("Get seasonal recommendations error:", error)
      return {
        success: false,
        message: error.message
      }
    }
  }
}
