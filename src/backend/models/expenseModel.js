import sql from "../config/database.js"

export const expenseModel = {
  // Create a new expense/earning
  async createExpenseEarning(data) {
    const { user_id, type, category, amount, description, date } = data
    const result = await sql`
      INSERT INTO expenses_earnings (user_id, type, category, amount, description, date)
      VALUES (${user_id}, ${type}, ${category}, ${amount}, ${description || null}, ${date})
      RETURNING id, user_id, type, category, amount, description, date, year, month, created_at
    `
    return result[0]
  },

  // Get current month expenses and earnings
  async getCurrentMonthData(userId) {
    const result = await sql`
      SELECT 
        type,
        SUM(amount) as total_amount,
        COUNT(*) as count
      FROM expenses_earnings 
      WHERE user_id = ${userId} 
        AND year = EXTRACT(YEAR FROM CURRENT_DATE)
        AND month = EXTRACT(MONTH FROM CURRENT_DATE)
      GROUP BY type
    `
    return result
  },

  // Get last 7 days expenses and earnings
  async getLast7DaysData(userId) {
    const result = await sql`
      SELECT 
        type,
        SUM(amount) as total_amount,
        COUNT(*) as count
      FROM expenses_earnings 
      WHERE user_id = ${userId} 
        AND date >= CURRENT_DATE - INTERVAL '7 days'
      GROUP BY type
    `
    return result
  },

  // Get yearly data
  async getYearlyData(userId, year) {
    const result = await sql`
      SELECT 
        type,
        SUM(amount) as total_amount,
        COUNT(*) as count
      FROM expenses_earnings 
      WHERE user_id = ${userId} 
        AND year = ${year}
      GROUP BY type
    `
    return result
  },

  // Get available years for user
  async getAvailableYears(userId) {
    const result = await sql`
      SELECT DISTINCT year
      FROM expenses_earnings 
      WHERE user_id = ${userId}
      ORDER BY year DESC
    `
    return result.map((row) => row.year)
  },

  // Get previous month data for comparison
  async getPreviousMonthData(userId) {
    const result = await sql`
      SELECT 
        type,
        SUM(amount) as total_amount
      FROM expenses_earnings 
      WHERE user_id = ${userId} 
        AND year = EXTRACT(YEAR FROM (CURRENT_DATE - INTERVAL '1 month'))
        AND month = EXTRACT(MONTH FROM (CURRENT_DATE - INTERVAL '1 month'))
      GROUP BY type
    `
    return result
  },

  // Get last 6 months data for chart
  async getLast6MonthsData(userId) {
    const result = await sql`
      SELECT 
        year,
        month,
        type,
        SUM(amount) as total_amount,
        TO_CHAR(DATE(year || '-' || month || '-01'), 'Mon YYYY') as month_year
      FROM expenses_earnings 
      WHERE user_id = ${userId} 
        AND date >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '5 months'
      GROUP BY year, month, type
      ORDER BY year, month
    `
    return result
  },

  // Get last 6 years data for chart
  async getLast6YearsData(userId) {
    const result = await sql`
      SELECT 
        year,
        type,
        SUM(amount) as total_amount
      FROM expenses_earnings 
      WHERE user_id = ${userId} 
        AND year >= EXTRACT(YEAR FROM CURRENT_DATE) - 5
      GROUP BY year, type
      ORDER BY year
    `
    return result
  },

  // Get last 30 transactions
  async getLast30Transactions(userId) {
    const result = await sql`
      SELECT id, type, category, amount, date, created_at
      FROM expenses_earnings 
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT 30
    `
    return result
  },

  // Delete expense/earning
  async deleteExpenseEarning(id, userId) {
    const result = await sql`
      DELETE FROM expenses_earnings 
      WHERE id = ${id} AND user_id = ${userId}
      RETURNING id
    `
    return result[0]
  },

  // Get dashboard summary
  async getDashboardSummary(userId) {
    const currentMonth = await this.getCurrentMonthData(userId)
    const last7Days = await this.getLast7DaysData(userId)
    const currentYear = new Date().getFullYear()
    const yearlyData = await this.getYearlyData(userId, currentYear)
    const availableYears = await this.getAvailableYears(userId)
    const previousMonth = await this.getPreviousMonthData(userId)
    const last6Months = await this.getLast6MonthsData(userId)
    const last6Years = await this.getLast6YearsData(userId)
    const recentTransactions = await this.getLast30Transactions(userId)

    return {
      currentMonth,
      last7Days,
      yearlyData,
      availableYears,
      previousMonth,
      last6Months,
      last6Years,
      recentTransactions,
      currentYear,
    }
  },
}
