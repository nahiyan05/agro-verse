import { cropRecordModel } from "../models/cropRecordModel.js"
import { expenseModel } from "../models/expenseModel.js"

export const cropRecordController = {
  // Get crop records by land ID
  async getCropRecordsByLandId(userId, landId) {
    try {
      if (!landId) {
        throw new Error("Land ID is required")
      }

      // Verify land ownership
      const hasOwnership = await cropRecordModel.verifyLandOwnership(landId, userId)
      if (!hasOwnership) {
        throw new Error("Land not found or unauthorized")
      }

      const records = await cropRecordModel.getCropRecordsByLandId(landId)
      
      return {
        success: true,
        data: records
      }
    } catch (error) {
      console.error("Error fetching crop records:", error)
      throw new Error(error.message || "Failed to fetch crop records")
    }
  },

  // Create a new crop record
  async createCropRecord(userId, recordData) {
    try {
      const {
        landId,
        cropName,
        season,
        year,
        plantingDate,
        harvestDate,
        totalYield,
        yieldUnit,
        totalExpenses,
        totalRevenue,
        notes
      } = recordData

      // Validate required fields
      if (!landId || !cropName || !season || !year || !plantingDate) {
        throw new Error("Missing required fields: landId, cropName, season, year, and plantingDate are required")
      }

      // Verify land ownership
      const hasOwnership = await cropRecordModel.verifyLandOwnership(landId, userId)
      if (!hasOwnership) {
        throw new Error("Land not found or unauthorized")
      }

      // Validate year
      const currentYear = new Date().getFullYear()
      if (isNaN(year) || year < 1900 || year > currentYear + 10) {
        throw new Error("Invalid year")
      }

      // Validate dates
      if (harvestDate && plantingDate) {
        const plantDate = new Date(plantingDate)
        const harvestDateObj = new Date(harvestDate)
        if (harvestDateObj <= plantDate) {
          throw new Error("Harvest date must be after planting date")
        }
      }

      // Validate numeric values
      if (totalYield && (isNaN(totalYield) || Number.parseFloat(totalYield) < 0)) {
        throw new Error("Total yield must be a non-negative number")
      }

      if (totalExpenses && (isNaN(totalExpenses) || Number.parseFloat(totalExpenses) < 0)) {
        throw new Error("Total expenses must be a non-negative number")
      }

      if (totalRevenue && (isNaN(totalRevenue) || Number.parseFloat(totalRevenue) < 0)) {
        throw new Error("Total revenue must be a non-negative number")
      }

      // Create the crop record
      const cropRecord = await cropRecordModel.createCropRecord({
        land_id: landId,
        crop_name: cropName.trim(),
        season: season.trim(),
        year: parseInt(year),
        planting_date: plantingDate,
        harvest_date: harvestDate || null,
        total_yield: totalYield ? Number.parseFloat(totalYield) : null,
        yield_unit: yieldUnit?.trim() || null,
        total_expenses: totalExpenses ? Number.parseFloat(totalExpenses) : null,
        total_revenue: totalRevenue ? Number.parseFloat(totalRevenue) : null,
        notes: notes?.trim() || null
      })

      // Handle expense tracking
      await this.handleExpenseTracking(userId, cropRecord, landId)

      return {
        success: true,
        data: cropRecord,
        message: "Crop record added successfully"
      }
    } catch (error) {
      console.error("Error creating crop record:", error)
      throw new Error(error.message || "Failed to create crop record")
    }
  },

  // Update crop record
  async updateCropRecord(userId, recordId, updateData) {
    try {
      const {
        cropName,
        season,
        year,
        plantingDate,
        harvestDate,
        totalYield,
        yieldUnit,
        totalExpenses,
        totalRevenue,
        notes
      } = updateData

      // Verify record ownership
      const hasOwnership = await cropRecordModel.verifyRecordOwnership(recordId, userId)
      if (!hasOwnership) {
        throw new Error("Record not found or unauthorized")
      }

      // Validate required fields
      if (!cropName || !season || !year || !plantingDate) {
        throw new Error("Missing required fields: cropName, season, year, and plantingDate are required")
      }

      // Validate year
      const currentYear = new Date().getFullYear()
      if (isNaN(year) || year < 1900 || year > currentYear + 10) {
        throw new Error("Invalid year")
      }

      // Validate dates
      if (harvestDate && plantingDate) {
        const plantDate = new Date(plantingDate)
        const harvestDateObj = new Date(harvestDate)
        if (harvestDateObj <= plantDate) {
          throw new Error("Harvest date must be after planting date")
        }
      }

      // Validate numeric values
      if (totalYield && (isNaN(totalYield) || Number.parseFloat(totalYield) < 0)) {
        throw new Error("Total yield must be a non-negative number")
      }

      if (totalExpenses && (isNaN(totalExpenses) || Number.parseFloat(totalExpenses) < 0)) {
        throw new Error("Total expenses must be a non-negative number")
      }

      if (totalRevenue && (isNaN(totalRevenue) || Number.parseFloat(totalRevenue) < 0)) {
        throw new Error("Total revenue must be a non-negative number")
      }

      const updatedRecord = await cropRecordModel.updateCropRecord(recordId, {
        crop_name: cropName.trim(),
        season: season.trim(),
        year: parseInt(year),
        planting_date: plantingDate,
        harvest_date: harvestDate || null,
        total_yield: totalYield ? Number.parseFloat(totalYield) : null,
        yield_unit: yieldUnit?.trim() || null,
        total_expenses: totalExpenses ? Number.parseFloat(totalExpenses) : null,
        total_revenue: totalRevenue ? Number.parseFloat(totalRevenue) : null,
        notes: notes?.trim() || null
      })

      return {
        success: true,
        data: updatedRecord,
        message: "Crop record updated successfully"
      }
    } catch (error) {
      console.error("Error updating crop record:", error)
      throw new Error(error.message || "Failed to update crop record")
    }
  },

  // Delete crop record
  async deleteCropRecord(userId, recordId) {
    try {
      // Verify record ownership
      const hasOwnership = await cropRecordModel.verifyRecordOwnership(recordId, userId)
      if (!hasOwnership) {
        throw new Error("Record not found or unauthorized")
      }

      await cropRecordModel.deleteCropRecord(recordId)

      return {
        success: true,
        message: "Crop record deleted successfully"
      }
    } catch (error) {
      console.error("Error deleting crop record:", error)
      throw new Error(error.message || "Failed to delete crop record")
    }
  },

  // Get all crop records for a user with optional filters
  async getUserCropRecords(userId, filters = {}) {
    try {
      const records = await cropRecordModel.getUserCropRecords(userId, filters)
      
      return {
        success: true,
        data: records
      }
    } catch (error) {
      console.error("Error fetching user crop records:", error)
      throw new Error(error.message || "Failed to fetch crop records")
    }
  },

  // Handle expense tracking when creating crop records
  async handleExpenseTracking(userId, cropRecord, landId) {
    try {
      const { total_expenses, total_revenue, season, year, crop_name, planting_date, harvest_date } = cropRecord

      // Add expenses to expense tracker
      if (total_expenses && total_expenses > 0) {
        await expenseModel.createExpenseEarning({
          user_id: userId,
          type: 'expense',
          category: 'Crop Expenses',
          amount: total_expenses,
          description: `${season} ${year} - ${crop_name} (Land: ${landId})`,
          date: planting_date
        })
      }

      // Add profit to expense tracker if there's revenue
      if (total_revenue && total_revenue > 0) {
        const profit = total_revenue - (total_expenses || 0)
        const recordDate = harvest_date || planting_date
        
        if (profit > 0) {
          await expenseModel.createExpenseEarning({
            user_id: userId,
            type: 'earning',
            category: 'Crop Profit',
            amount: profit,
            description: `${season} ${year} - ${crop_name} (Land: ${landId})`,
            date: recordDate
          })
        }
      }
    } catch (error) {
      // Log the error but don't throw it as expense tracking is secondary
      console.warn("Error in expense tracking:", error.message)
    }
  }
}
