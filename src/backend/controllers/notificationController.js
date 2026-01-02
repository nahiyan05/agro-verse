import { notificationModel } from "../models/notificationModel.js"

export const notificationController = {
  // Create notification for user
  async createNotificationForUser(userId, type, message) {
    try {
      const notification = await notificationModel.createNotification({
        user_id: userId,
        type,
        message,
      })

      return {
        success: true,
        notification,
        message: "Notification created successfully",
      }
    } catch (error) {
      console.error("Create notification error:", error)
      return {
        success: false,
        message: error.message,
      }
    }
  },

  // Get user notifications
  async getUserNotifications(userId) {
    try {

      try {
        await notificationModel.deleteOldNotifications()
      } catch (cleanupError) {
        console.warn("Warning: Could not clean up old notifications:", cleanupError.message)
      }

      // Then get user notifications
      const notifications = await notificationModel.getUserNotifications(userId)

      return {
        success: true,
        notifications,
        message: "Notifications retrieved successfully",
      }
    } catch (error) {
      console.error("Get notifications error:", error)
      return {
        success: false,
        message: error.message,
      }
    }
  },

  // Mark notification as read
  async markAsRead(notificationId, userId) {
    try {
      const notification = await notificationModel.markAsRead(notificationId, userId)

      if (!notification) {
        throw new Error("Notification not found")
      }

      return {
        success: true,
        notification,
        message: "Notification marked as read",
      }
    } catch (error) {
      console.error("Mark as read error:", error)
      return {
        success: false,
        message: error.message,
      }
    }
  },

  // Mark all notifications as read
  async markAllAsRead(userId) {
    try {
      const result = await notificationModel.markAllAsRead(userId)

      return {
        success: true,
        updatedCount: result?.updated_count || 0,
        message: "All notifications marked as read",
      }
    } catch (error) {
      console.error("Mark all as read error:", error)
      return {
        success: false,
        message: error.message,
      }
    }
  },

  // Get unread count
  async getUnreadCount(userId) {
    try {
      const count = await notificationModel.getUnreadCount(userId)

      return {
        success: true,
        count,
        message: "Unread count retrieved successfully",
      }
    } catch (error) {
      console.error("Get unread count error:", error)
      return {
        success: false,
        message: error.message,
      }
    }
  },

  // Send broadcast notification to all users
  async sendBroadcastNotification(message) {
    try {
      const result = await notificationModel.createBroadcastNotification(message)
      
      return {
        success: true,
        notifiedCount: result.notifiedCount,
        message: `Broadcast notification sent to ${result.notifiedCount} users`,
      }
    } catch (error) {
      console.error("Broadcast notification error:", error)
      return {
        success: false,
        message: error.message,
      }
    }
  },
}
