import { marketplaceModel } from "../models/marketplaceModel.js"
import { deletePicture } from "@/lib/cloudinary.js"
export const marketplaceController = {
  // Create new marketplace listing
  async createListing(userId, listingData) {
    try {
      const {
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

      // Validate required fields
      if (!crop_name || !price_per_unit || !unit || !quantity_available) {
        throw new Error("Crop name, price per unit, unit, and quantity are required")
      }

      // Validate numeric fields
      if (isNaN(price_per_unit) || Number.parseFloat(price_per_unit) <= 0) {
        throw new Error("Price per unit must be a positive number")
      }

      if (isNaN(quantity_available) || Number.parseFloat(quantity_available) <= 0) {
        throw new Error("Quantity available must be a positive number")
      }

      const listing = await marketplaceModel.createListing({
        user_id: userId,
        crop_name: crop_name.trim(),
        description: description?.trim(),
        price_per_unit: Number.parseFloat(price_per_unit),
        unit: unit.trim(),
        quantity_available: Number.parseFloat(quantity_available),
        location: location?.trim(),
        contact_phone: contact_phone?.trim(),
        contact_email: contact_email?.trim(),
        images: images || []
      })

      return {
        success: true,
        listing,
        message: "Marketplace listing created successfully"
      }
    } catch (error) {
      console.error("Create listing error:", error)
      return {
        success: false,
        message: error.message
      }
    }
  },

  // Get all marketplace listings
  async getAllListings(filters = {}) {
    try {
      const listings = await marketplaceModel.getAllListings(filters)

      return {
        success: true,
        listings,
        message: "Listings retrieved successfully"
      }
    } catch (error) {
      console.error("Get listings error:", error)
      return {
        success: false,
        message: error.message
      }
    }
  },

  // Get user's listings
  async getUserListings(userId) {
    try {
      const listings = await marketplaceModel.getUserListings(userId)
      const stats = await marketplaceModel.getListingStats(userId)

      return {
        success: true,
        listings,
        stats,
        message: "User listings retrieved successfully"
      }
    } catch (error) {
      console.error("Get user listings error:", error)
      return {
        success: false,
        message: error.message
      }
    }
  },

  // Get single listing
  async getListingById(listingId) {
    try {
      const listing = await marketplaceModel.getListingById(listingId)

      if (!listing) {
        throw new Error("Listing not found")
      }

      return {
        success: true,
        listing,
        message: "Listing retrieved successfully"
      }
    } catch (error) {
      console.error("Get listing error:", error)
      return {
        success: false,
        message: error.message
      }
    }
  },

  // Update listing
  async updateListing(listingId, userId, updateData) {
    try {
      
      const oldListing = await marketplaceModel.getListingById(listingId)

      
      if (
        updateData.images && 
        oldListing && 
        oldListing.images && oldListing.images.length > 0 &&
        updateData.images[0] !== oldListing.images[0] 
      ) {
        const oldImageUrl = oldListing.images[0]
        

        const folderName = "agroverse/marketplace/"
        const publicIdStartIndex = oldImageUrl.indexOf(folderName)
        
        if (publicIdStartIndex !== -1) {
          const publicIdWithExtension = oldImageUrl.substring(publicIdStartIndex)
          const publicId = publicIdWithExtension.substring(0, publicIdWithExtension.lastIndexOf('.'))

          await deletePicture(publicId)
        }
      }

      // Validate numeric fields if provided
      if (updateData.price_per_unit && (isNaN(updateData.price_per_unit) || Number.parseFloat(updateData.price_per_unit) <= 0)) {
        throw new Error("Price per unit must be a positive number")
      }

      if (updateData.quantity_available && (isNaN(updateData.quantity_available) || Number.parseFloat(updateData.quantity_available) <= 0)) {
        throw new Error("Quantity available must be a positive number")
      }

      const processedData = {
        ...updateData,
        price_per_unit: updateData.price_per_unit ? Number.parseFloat(updateData.price_per_unit) : undefined,
        quantity_available: updateData.quantity_available ? Number.parseFloat(updateData.quantity_available) : undefined
      }


      const listing = await marketplaceModel.updateListing(listingId, userId, processedData)

      if (!listing) {
        throw new Error("Listing not found or you don't have permission to update it")
      }

      return {
        success: true,
        listing,
        message: "Listing updated successfully"
      }
    } catch (error) {
      console.error("Update listing error:", error)
      return {
        success: false,
        message: error.message
      }
    }
  },

  // Delete listing
  async deleteListing(listingId, userId) {
    try {
      const result = await marketplaceModel.deleteListing(listingId, userId)

      if (!result) {
        throw new Error("Listing not found or you don't have permission to delete it")
      }

      return {
        success: true,
        message: "Listing deleted successfully"
      }
    } catch (error) {
      console.error("Delete listing error:", error)
      return {
        success: false,
        message: error.message
      }
    }
  }
}
