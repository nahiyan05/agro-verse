import { loanModel } from "../models/loanModel.js"
import { notificationController } from "./notificationController.js"

export const loanController = {
  // Create loan
  async createLoan(userId, data) {
    try {
      const { loan_amount, payment_due_date, notes } = data

      // Validate required fields
      if (!loan_amount || !payment_due_date) {
        throw new Error("Loan amount and payment due date are required")
      }

      // Validate amount
      if (isNaN(loan_amount) || Number.parseFloat(loan_amount) <= 0) {
        throw new Error("Loan amount must be a positive number")
      }

      // Validate date
      const dueDate = new Date(payment_due_date)
      if (isNaN(dueDate.getTime()) || dueDate <= new Date()) {
        throw new Error("Payment due date must be a valid future date")
      }

      const loan = await loanModel.createLoan({
        user_id: userId,
        loan_amount: Number.parseFloat(loan_amount),
        payment_due_date,
        notes,
      })

      return {
        success: true,
        data: loan,
        message: "Loan created successfully",
      }
    } catch (error) {
      console.error("Create loan error:", error)
      return {
        success: false,
        message: error.message,
      }
    }
  },

  // Get user loans
  async getUserLoans(userId) {
    try {
      // Update overdue loans first
      await loanModel.updateOverdueLoans()
      
      // Check for loans needing reminders and send notifications
      try {
        const loansNeedingReminders = await loanModel.checkUserLoanReminders(userId)
        
        for (const loan of loansNeedingReminders) {
          const daysUntilDue = parseInt(loan.days_until_due)
          const remainingAmount = loan.loan_amount - loan.paid_amount
          
          let message = ""
          if (daysUntilDue === 1) {
            message = `⚠️ Urgent: Your loan payment of ৳${remainingAmount.toLocaleString()} is due tomorrow!`
          } else {
            message = `🔔 Reminder: You have a loan that needs to be paid in ${daysUntilDue} days. Amount remaining: ৳${remainingAmount.toLocaleString()}`
          }

          // Send notification 
          await notificationController.createNotificationForUser(
            userId,
            "loan_reminder",
            message
          ).catch(notifError => {
            console.warn("Failed to send loan reminder notification:", notifError)
          })
        }
      } catch (reminderError) {
        console.warn("Failed to check loan reminders:", reminderError)
        // Don't let this failure stop the main process
      }
      
      const loans = await loanModel.getUserLoans(userId)
      const summary = await loanModel.getLoanSummary(userId)

      return {
        success: true,
        data: {
          loans,
          summary,
        },
      }
    } catch (error) {
      console.error("Get user loans error:", error)
      return {
        success: false,
        message: error.message,
      }
    }
  },

  // Get loan statistics for charts
  async getLoanStatistics(userId) {
    try {
      const statistics = await loanModel.getLoanStatistics(userId)

      return {
        success: true,
        data: statistics,
      }
    } catch (error) {
      console.error("Get loan statistics error:", error)
      return {
        success: false,
        message: error.message,
      }
    }
  },

  // Update loan
  async updateLoan(userId, loanId, data) {
    try {
      const { loan_amount, payment_due_date, notes } = data

      // Validate required fields
      if (!loan_amount || !payment_due_date) {
        throw new Error("Loan amount and payment due date are required")
      }

      // Validate amount
      if (isNaN(loan_amount) || Number.parseFloat(loan_amount) <= 0) {
        throw new Error("Loan amount must be a positive number")
      }

      // Validate date
      const dueDate = new Date(payment_due_date)
      if (isNaN(dueDate.getTime()) || dueDate <= new Date()) {
        throw new Error("Payment due date must be a valid future date")
      }

      // Get current loan to check if it exists
      const currentLoan = await loanModel.getLoanById(loanId, userId)
      if (!currentLoan) {
        throw new Error("Loan not found")
      }

      const updatedLoan = await loanModel.updateLoan(loanId, userId, {
        loan_amount: Number.parseFloat(loan_amount),
        payment_due_date,
        notes,
      })

      if (!updatedLoan) {
        throw new Error("Failed to update loan")
      }

      return {
        success: true,
        data: updatedLoan,
        message: "Loan updated successfully",
      }
    } catch (error) {
      console.error("Update loan error:", error)
      return {
        success: false,
        message: error.message,
      }
    }
  },

  // Make payment on loan
  async makePayment(userId, loanId, data) {
    try {
      const { payment_amount } = data

      // Validate payment amount
      if (!payment_amount || isNaN(payment_amount) || Number.parseFloat(payment_amount) <= 0) {
        throw new Error("Payment amount must be a positive number")
      }

      // Get current loan to check if it exists and is active
      const currentLoan = await loanModel.getLoanById(loanId, userId)
      if (!currentLoan) {
        throw new Error("Loan not found")
      }

      if (currentLoan.status === 'completed') {
        throw new Error("This loan has already been completed")
      }

      const updatedLoan = await loanModel.makePayment(loanId, userId, Number.parseFloat(payment_amount))

      if (!updatedLoan) {
        throw new Error("Failed to process payment")
      }

      const message = updatedLoan.status === 'completed' 
        ? "Payment processed successfully. Loan completed!"
        : "Payment processed successfully"

      return {
        success: true,
        data: updatedLoan,
        message,
      }
    } catch (error) {
      console.error("Make payment error:", error)
      return {
        success: false,
        message: error.message,
      }
    }
  },

  // Delete loan
  async deleteLoan(userId, loanId) {
    try {
      const deletedLoan = await loanModel.deleteLoan(loanId, userId)

      if (!deletedLoan) {
        throw new Error("Loan not found or could not be deleted")
      }

      return {
        success: true,
        message: "Loan deleted successfully",
      }
    } catch (error) {
      console.error("Delete loan error:", error)
      return {
        success: false,
        message: error.message,
      }
    }
  },

  // Send loan reminders
  async sendLoanReminders() {
    try {
      const loansNeedingReminders = await loanModel.getLoansNeedingReminders()
      let notificationsSent = 0

      for (const loan of loansNeedingReminders) {
        const daysUntilDue = parseInt(loan.days_until_due)
        const remainingAmount = loan.loan_amount - loan.paid_amount
        
        let message = ""
        if (daysUntilDue === 1) {
          message = `⚠️ Urgent: Your loan payment of ৳${remainingAmount.toLocaleString()} is due tomorrow!`
        } else {
          message = `🔔 Reminder: You have a loan that needs to be paid in ${daysUntilDue} days. Amount remaining: ৳${remainingAmount.toLocaleString()}`
        }

        const result = await notificationController.createNotificationForUser(
          loan.user_id,
          "loan_reminder",
          message
        )

        if (result.success) {
          notificationsSent++
        }
      }

      return {
        success: true,
        message: `${notificationsSent} loan reminder notifications sent`,
        notificationsSent,
      }
    } catch (error) {
      console.error("Send loan reminders error:", error)
      return {
        success: false,
        message: error.message,
      }
    }
  },
}
