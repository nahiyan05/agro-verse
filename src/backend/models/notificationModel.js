import sql from "../config/database.js"

export const notificationModel = {
  // Create a new notification
  async createNotification(notificationData) {
    const { user_id, type, message } = notificationData
    const result = await sql`
      INSERT INTO notifications (user_id, type, message, created_at)
      VALUES (${user_id}, ${type}, ${message}, NOW() AT TIME ZONE 'Asia/Dhaka')
      RETURNING id, user_id, type, message, is_read, 
               created_at AT TIME ZONE 'Asia/Dhaka' as created_at
    `
    return result[0]
  },

  // Get all notifications for a user (only last 30 days)
  async getUserNotifications(userId) {
    const result = await sql`
      SELECT id, user_id, type, message, is_read, 
             created_at AT TIME ZONE 'Asia/Dhaka' as created_at
      FROM notifications 
      WHERE user_id = ${userId} 
        AND created_at >= NOW() AT TIME ZONE 'Asia/Dhaka' - INTERVAL '30 days'
      ORDER BY created_at DESC
    `
    return result
  },

  // Mark notification as read
  async markAsRead(notificationId, userId) {
    const result = await sql`
      UPDATE notifications 
      SET is_read = TRUE
      WHERE id = ${notificationId} AND user_id = ${userId}
      RETURNING id, is_read
    `
    return result[0]
  },

  // Mark all notifications as read for a user
  async markAllAsRead(userId) {
    const result = await sql`
      UPDATE notifications 
      SET is_read = TRUE
      WHERE user_id = ${userId} AND is_read = FALSE
    `
    return { updated_count: result.length }
  },

  // Delete old notifications (older than 30 days)
  async deleteOldNotifications() {
    try {
      const countResult = await sql`
        SELECT COUNT(*) as count_to_delete
        FROM notifications 
        WHERE created_at < NOW() AT TIME ZONE 'Asia/Dhaka' - INTERVAL '30 days'
      `

      const countToDelete = Number.parseInt(countResult[0]?.count_to_delete || 0)

      if (countToDelete > 0) {
        await sql`
          DELETE FROM notifications 
          WHERE created_at < NOW() AT TIME ZONE 'Asia/Dhaka' - INTERVAL '30 days'
        `
      }

      return { deleted_count: countToDelete }
    } catch (error) {
      console.error("Error deleting old notifications:", error)
      return { deleted_count: 0 }
    }
  },

  // Get unread notification count for a user
  async getUnreadCount(userId) {
    const result = await sql`
      SELECT COUNT(*) as unread_count
      FROM notifications 
      WHERE user_id = ${userId} 
        AND is_read = FALSE
        AND created_at >= NOW() AT TIME ZONE 'Asia/Dhaka' - INTERVAL '30 days'
    `
    return Number.parseInt(result[0]?.unread_count || 0)
  },

  // Create broadcast notification for all users
  async createBroadcastNotification(message) {
    try {
      // Get all active user IDs
      const users = await sql`
        SELECT id FROM users 
        WHERE is_banned = FALSE
      `

      if (users.length === 0) {
        return { notifiedCount: 0 }
      }

      // Create notifications for all users using a batch insert
      const notifications = users.map(user => ({
        user_id: user.id,
        type: 'admin',
        message: message
      }))

      for (const notification of notifications) {
        await sql`
          INSERT INTO notifications (user_id, type, message, created_at)
          VALUES (${notification.user_id}, ${notification.type}, ${notification.message}, NOW() AT TIME ZONE 'Asia/Dhaka')
        `
      }

      return { notifiedCount: users.length }
    } catch (error) {
      console.error("Broadcast notification error:", error)
      throw error
    }
  },
}