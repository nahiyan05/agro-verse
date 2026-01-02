import bcrypt from "bcryptjs"
import { adminModel } from "../models/adminModel.js"
import { notificationController } from "./notificationController.js" 

export const adminController = {
  // Admin login
  login: async (username, password) => {
    try {
      const admin = await adminModel.findByUsername(username)

      if (!admin) {
        return { success: false, message: "Invalid credentials" }
      }

      const isPasswordValid = await bcrypt.compare(password, admin.password)

      if (!isPasswordValid) {
        return { success: false, message: "Invalid credentials" }
      }

      return {
        success: true,
        admin: {
          id: admin.id,
          username: admin.username,
          email: admin.email,
        },
      }
    } catch (error) {
      throw error
    }
  },

  // Get dashboard statistics
  getDashboardStats: async () => {
    try {
      const stats = await adminModel.getDashboardStats()
      return { success: true, data: stats }
    } catch (error) {
      throw error
    }
  },

  // Get all users
  getAllUsers: async () => {
    try {
      const users = await adminModel.getAllUsers()
      return { success: true, data: users }
    } catch (error) {
      throw error
    }
  },

  // Ban/Unban user
  updateUserBanStatus: async (userId, isBanned) => {
    try {
      const user = await adminModel.updateUserBanStatus(userId, isBanned)
      return { success: true, data: user }
    } catch (error) {
      throw error
    }
  },

  // Create a new report
  createReport: async (reporterId, reportedUserId, reportReason, reportDetails) => {
    try {
      const report = await adminModel.createReport(reporterId, reportedUserId, reportReason, reportDetails)
      notificationController.createNotificationForUser(
        reportedUserId,
        "report",
        `Someone reported you for : ${reportReason}`
      )
      return { success: true, data: report, message: "Report submitted successfully" }
    } catch (error) {
      return { success: false, message: error.message }
    }
  },

  // Get all reports
  getAllReports: async () => {
    try {
      const reports = await adminModel.getAllReports()
      return { success: true, data: reports }
    } catch (error) {
      throw error
    }
  },

  // Update report status
  updateReportStatus: async (reportId, status) => {
    try {
      const report = await adminModel.updateReportStatus(reportId, status)
      return { success: true, data: report }
    } catch (error) {
      throw error
    }
  },
}
