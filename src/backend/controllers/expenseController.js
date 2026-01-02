import { expenseModel } from "../models/expenseModel"

export const expenseController = {
  // Create expense/earning
  async createExpenseEarning(userId, data) {
    try {
      const { type, category, amount, description, date } = data

      // Validate required fields
      if (!type || !category || !amount || !date) {
        throw new Error("Type, category, amount, and date are required")
      }

      // Validate type
      if (!["expense", "earning"].includes(type)) {
        throw new Error("Type must be either 'expense' or 'earning'")
      }

      // Validate amount
      if (isNaN(amount) || Number.parseFloat(amount) <= 0) {
        throw new Error("Amount must be a positive number")
      }

      const expenseEarning = await expenseModel.createExpenseEarning({
        user_id: userId,
        type,
        category,
        amount: Number.parseFloat(amount),
        description,
        date,
      })

      return {
        success: true,
        data: expenseEarning,
        message: `${type === "expense" ? "Expense" : "Earning"} added successfully`,
      }
    } catch (error) {
      console.error("Create expense/earning error:", error)
      return {
        success: false,
        message: error.message,
      }
    }
  },

  // Get dashboard data
  async getDashboardData(userId) {
    try {
      const dashboardData = await expenseModel.getDashboardSummary(userId)

      // Process data for frontend
      const processedData = {
        currentMonth: this.processTypeData(dashboardData.currentMonth),
        last7Days: this.processTypeData(dashboardData.last7Days),
        yearlyData: this.processTypeData(dashboardData.yearlyData),
        availableYears: dashboardData.availableYears,
        previousMonth: this.processTypeData(dashboardData.previousMonth),
        last6Months: this.processChartData(dashboardData.last6Months),
        last6Years: this.processYearlyChartData(dashboardData.last6Years),
        recentTransactions: dashboardData.recentTransactions,
        currentYear: dashboardData.currentYear,
      }

      // Calculate percentage change for net income (earnings - expenses)
      const currentMonthNet = (processedData.currentMonth.earning || 0) - (processedData.currentMonth.expense || 0)
      const previousMonthNet = (processedData.previousMonth.earning || 0) - (processedData.previousMonth.expense || 0)

      let percentageChange = 0
      let suggestion = "Start tracking your finances to see insights!"
      let isPositive = true

      if (previousMonthNet !== 0) {
        percentageChange = ((currentMonthNet - previousMonthNet) / Math.abs(previousMonthNet)) * 100
        isPositive = percentageChange >= 0

        if (percentageChange > 0) {
          suggestion = `Excellent! Your net income improved by ${percentageChange.toFixed(1)}% this month. Keep up the great work!`
        } else {
          suggestion = `Your net income decreased by ${Math.abs(percentageChange).toFixed(1)}% this month. Consider reviewing your expenses or increasing earnings.`
        }
      } else if (currentMonthNet > 0) {
        percentageChange = 100
        suggestion = "Great start! You have positive net income this month. Keep building momentum!"
      } else if (currentMonthNet < 0) {
        percentageChange = -100
        isPositive = false
        suggestion = "Your expenses exceed earnings this month. Focus on reducing costs or increasing income."
      } else {
        percentageChange = 0
        suggestion = "No financial activity this month. Start tracking to see your progress!"
      }

      processedData.monthlyComparison = {
        percentageChange: Number.parseFloat(percentageChange.toFixed(1)),
        isPositive,
        suggestion,
        currentMonthNet,
        previousMonthNet,
      }

      return {
        success: true,
        data: processedData,
        message: "Dashboard data retrieved successfully",
      }
    } catch (error) {
      console.error("Get dashboard data error:", error)
      return {
        success: false,
        message: error.message,
      }
    }
  },

  // Get yearly data
  async getYearlyData(userId, year) {
    try {
      const yearlyData = await expenseModel.getYearlyData(userId, year)
      const processedData = this.processTypeData(yearlyData)

      return {
        success: true,
        data: processedData,
        message: "Yearly data retrieved successfully",
      }
    } catch (error) {
      console.error("Get yearly data error:", error)
      return {
        success: false,
        message: error.message,
      }
    }
  },

  // Delete expense/earning
  async deleteExpenseEarning(id, userId) {
    try {
      const deleted = await expenseModel.deleteExpenseEarning(id, userId)

      if (!deleted) {
        throw new Error("Expense/earning not found or unauthorized")
      }

      return {
        success: true,
        message: "Expense/earning deleted successfully",
      }
    } catch (error) {
      console.error("Delete expense/earning error:", error)
      return {
        success: false,
        message: error.message,
      }
    }
  },

  // Helper function to process type data
  processTypeData(data) {
    const result = { expense: 0, earning: 0 }
    data.forEach((item) => {
      result[item.type] = Number.parseFloat(item.total_amount) || 0
    })
    return result
  },

  // Helper function to process chart data
  processChartData(data) {
    const months = {}

    data.forEach((item) => {
      const key = item.month_year
      if (!months[key]) {
        months[key] = { month: key, expense: 0, earning: 0 }
      }
      months[key][item.type] = Number.parseFloat(item.total_amount) || 0
    })

    return Object.values(months)
  },

  // Helper function to process yearly chart data
  processYearlyChartData(data) {
    const years = {}

    data.forEach((item) => {
      const key = item.year.toString()
      if (!years[key]) {
        years[key] = { year: key, expense: 0, earning: 0 }
      }
      years[key][item.type] = Number.parseFloat(item.total_amount) || 0
    })

    return Object.values(years)
  },
}
