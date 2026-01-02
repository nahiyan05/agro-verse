import { userModel } from "../models/userModel.js"
import { landModel } from "../models/landModel.js"

export const userController = {
  async getUserProfile(userId) {
    try {
      const user = await userModel.findUserById(userId)
      if (!user) {
        throw new Error("User not found")
      }
      const landStats = await landModel.getLandStats(userId)
      const totalLands = landStats.reduce((sum, stat) => sum + Number.parseInt(stat.type_count || 0), 0)
      const totalArea = landStats.reduce((sum, stat) => sum + Number.parseFloat(stat.total_area || 0), 0)

      return {
        success: true,
        user: {
          ...user,
          landStats: {
            totalLands,
            totalArea: totalArea.toFixed(1),
          },
        },
        message: "User profile retrieved successfully",
      }
    } catch (error) {
      return {
        success: false,
        message: error.message,
      }
    }
  },

  async updateUserProfile(userId, userData) {
    try {
      const updatedUser = await userModel.updateUser(userId, userData)
      if (!updatedUser) {
        throw new Error("User not found")
      }

      // Get land stats
      const landStats = await landModel.getLandStats(userId)
      const totalLands = landStats.reduce((sum, stat) => sum + Number.parseInt(stat.type_count || 0), 0)
      const totalArea = landStats.reduce((sum, stat) => sum + Number.parseFloat(stat.total_area || 0), 0)

      return {
        success: true,
        user: {
          ...updatedUser,
          landStats: {
            totalLands,
            totalArea: totalArea.toFixed(1),
          },
        },
        message: "Profile updated successfully",
      }
    } catch (error) {
      return {
        success: false,
        message: error.message,
      }
    }
  },

  async updateProfilePicture(userId, profilePicUrl) {
    try {
      const updatedUser = await userModel.updateProfilePicture(userId, profilePicUrl)
      if (!updatedUser) {
        throw new Error("User not found")
      }

      return {
        success: true,
        user: updatedUser,
        message: "Profile picture updated successfully",
      }
    } catch (error) {
      return {
        success: false,
        message: error.message,
      }
    }
  },

  async getUserProfileById(currentUserId, targetUserId) {
    try {
      // verify that the current user is authenticated
      const currentUser = await userModel.findUserById(currentUserId)
      if (!currentUser) {
        throw new Error("Unauthorized")
      }

      //user's profile
      const user = await userModel.findUserById(targetUserId)
      if (!user) {
        throw new Error("User not found")
      }

      // land stats for the target user
      const landStats = await landModel.getLandStats(targetUserId)
      const totalLands = landStats.reduce((sum, stat) => sum + Number.parseInt(stat.type_count || 0), 0)
      const totalArea = landStats.reduce((sum, stat) => sum + Number.parseFloat(stat.total_area || 0), 0)

      // public profile information 
      return {
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          profile_pic: user.profile_pic,
          city: user.city,
          area: user.area,
          country: user.country,
          phone: user.phone,
          age: user.age,
          preferred_crops: user.preferred_crops,
          created_at: user.created_at, 
          landStats: {
            totalLands,
            totalArea: totalArea.toFixed(1),
          },
        },
        message: "User profile retrieved successfully",
      }
    } catch (error) {
      return {
        success: false,
        message: error.message,
      }
    }
  },
}
