import sql from "../config/database.js"

export const adminModel = {
  // Find admin by username
  findByUsername: async (username) => {
    try {
      const result = await sql`
        SELECT * FROM admin 
        WHERE username = ${username}
      `
      return result[0] || null
    } catch (error) {
      throw error
    }
  },

  // Get dashboard stats
  getDashboardStats: async () => {
    try {
      const [usersResult, landsResult, expensesResult, marketplaceResult] = await Promise.all([
        sql`SELECT COUNT(*) as count FROM users`,
        sql`SELECT COUNT(*) as count FROM lands`,
        sql`SELECT COUNT(*) as count FROM expenses_earnings`,
        sql`SELECT COUNT(*) as count FROM marketplace_listings`,
      ])

      return {
        totalUsers: Number.parseInt(usersResult[0].count),
        totalLands: Number.parseInt(landsResult[0].count),
        totalExpenses: Number.parseInt(expensesResult[0].count),
        totalMarketplaceListings: Number.parseInt(marketplaceResult[0].count),
      }
    } catch (error) {
      throw error
    }
  },

  // Get all users with ban status
  getAllUsers: async () => {
    try {
      const result = await sql`
        SELECT id, name, email, phone, is_banned, created_at
        FROM users
        ORDER BY created_at DESC
      `
      return result
    } catch (error) {
      throw error
    }
  },

  // Ban/Unban user
  updateUserBanStatus: async (userId, isBanned) => {
    try {
      const result = await sql`
        UPDATE users 
        SET is_banned = ${isBanned}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${userId}
        RETURNING id, name, is_banned
      `
      return result[0]
    } catch (error) {
      throw error
    }
  },

  // Create a new report
  createReport: async (reporterId, reportedUserId, reportReason, reportDetails) => {
    try {
      // Check if the reported user exists
      const userExists = await sql`
        SELECT id FROM users WHERE id = ${reportedUserId}
      `

      if (userExists.length === 0) {
        throw new Error("Reported user does not exist")
      }


      const result = await sql`
        INSERT INTO reports (reporter_id, reported_user_id, report_reason, report_details)
        VALUES (${reporterId}, ${reportedUserId}, ${reportReason}, ${reportDetails})
        RETURNING *
      `
      return result[0]
    } catch (error) {
      throw error
    }
  },

  // Get all reports
  getAllReports: async () => {
    try {
      const result = await sql`
        SELECT 
          r.id,
          r.report_reason,
          r.report_details,
          r.status,
          r.created_at,
          reporter.name as reporter_name,
          reporter.email as reporter_email,
          reported.name as reported_user_name,
          reported.email as reported_user_email,
          reported.is_banned as reported_user_banned
        FROM reports r
        JOIN users reporter ON r.reporter_id = reporter.id
        JOIN users reported ON r.reported_user_id = reported.id
        ORDER BY r.created_at DESC
      `
      return result
    } catch (error) {
      throw error
    }
  },

  // Update report status
  updateReportStatus: async (reportId, status) => {
    try {
      const result = await sql`
        UPDATE reports 
        SET status = ${status}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${reportId}
        RETURNING *
      `
      return result[0]
    } catch (error) {
      throw error
    }
  },
}
