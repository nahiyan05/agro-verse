import sql from "../config/database.js"

export const loanModel = {
  // Create a new loan
  async createLoan(data) {
    const { user_id, loan_amount, payment_due_date, notes } = data
    const result = await sql`
      INSERT INTO loans (user_id, loan_amount, payment_due_date, notes)
      VALUES (${user_id}, ${loan_amount}, ${payment_due_date}, ${notes || null})
      RETURNING id, user_id, loan_amount, paid_amount, payment_due_date, status, notes, created_at, updated_at
    `
    return result[0]
  },

  // Get all loans for a user
  async getUserLoans(userId) {
    const result = await sql`
      SELECT 
        id, user_id, loan_amount, paid_amount, payment_due_date, status, notes, created_at, updated_at,
        (loan_amount - paid_amount) as remaining_amount
      FROM loans 
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `
    return result
  },

  // Get loan by ID
  async getLoanById(loanId, userId) {
    const result = await sql`
      SELECT 
        id, user_id, loan_amount, paid_amount, payment_due_date, status, notes, created_at, updated_at,
        (loan_amount - paid_amount) as remaining_amount
      FROM loans 
      WHERE id = ${loanId} AND user_id = ${userId}
    `
    return result[0]
  },

  // Update loan details
  async updateLoan(loanId, userId, data) {
    const { loan_amount, payment_due_date, notes } = data
    const result = await sql`
      UPDATE loans 
      SET 
        loan_amount = ${loan_amount},
        payment_due_date = ${payment_due_date},
        notes = ${notes || null},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${loanId} AND user_id = ${userId}
      RETURNING id, user_id, loan_amount, paid_amount, payment_due_date, status, notes, created_at, updated_at
    `
    return result[0]
  },

  // Make payment on loan
  async makePayment(loanId, userId, paymentAmount) {
    // Update loan
    const result = await sql`
      UPDATE loans 
      SET 
        paid_amount = LEAST(paid_amount + ${paymentAmount}, loan_amount),
        status = CASE 
          WHEN paid_amount + ${paymentAmount} >= loan_amount THEN 'completed'
          ELSE status 
        END,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${loanId} AND user_id = ${userId}
      RETURNING id, user_id, loan_amount, paid_amount, payment_due_date, status, notes, created_at, updated_at
    `
    
    return result[0]
  },

  // Delete loan
  async deleteLoan(loanId, userId) {
    const result = await sql`
      DELETE FROM loans 
      WHERE id = ${loanId} AND user_id = ${userId}
      RETURNING id
    `
    return result[0]
  },

  // Get loan statistics for charts (last 4 months)
  async getLoanStatistics(userId) {
    const result = await sql`
      WITH last_4_months AS (
        SELECT 
          EXTRACT(YEAR FROM month_date) as year,
          EXTRACT(MONTH FROM month_date) as month,
          TO_CHAR(month_date, 'Mon YYYY') as month_year
        FROM generate_series(
          date_trunc('month', CURRENT_DATE) - interval '3 months',
          date_trunc('month', CURRENT_DATE),
          '1 month'::interval
        ) as month_date
      ),
      loan_taken AS (
        SELECT 
          EXTRACT(YEAR FROM created_at) as year,
          EXTRACT(MONTH FROM created_at) as month,
          SUM(loan_amount) as total_loan_taken
        FROM loans
        WHERE user_id = ${userId}
          AND created_at >= date_trunc('month', CURRENT_DATE) - interval '3 months'
        GROUP BY EXTRACT(YEAR FROM created_at), EXTRACT(MONTH FROM created_at)
      ),
      payments_made AS (
        SELECT 
          EXTRACT(YEAR FROM updated_at) as year,
          EXTRACT(MONTH FROM updated_at) as month,
          SUM(
            CASE 
              WHEN status = 'completed' THEN paid_amount
              WHEN updated_at > created_at + interval '1 minute' THEN paid_amount
              ELSE 0 
            END
          ) as total_paid
        FROM loans
        WHERE user_id = ${userId}
          AND updated_at >= date_trunc('month', CURRENT_DATE) - interval '3 months'
        GROUP BY EXTRACT(YEAR FROM updated_at), EXTRACT(MONTH FROM updated_at)
      )
      SELECT 
        lm.month_year,
        COALESCE(lt.total_loan_taken, 0) as loan_taken,
        COALESCE(pm.total_paid, 0) as money_repaid
      FROM last_4_months lm
      LEFT JOIN loan_taken lt ON lm.year = lt.year AND lm.month = lt.month
      LEFT JOIN payments_made pm ON lm.year = pm.year AND lm.month = pm.month
      ORDER BY lm.year, lm.month
    `
    return result
  },

  // Get loan summary
  async getLoanSummary(userId) {
    const result = await sql`
      SELECT 
        COUNT(*) as total_loans,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_loans,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_loans,
        COUNT(CASE WHEN status = 'overdue' THEN 1 END) as overdue_loans,
        COALESCE(SUM(loan_amount), 0) as total_loan_amount,
        COALESCE(SUM(paid_amount), 0) as total_paid_amount,
        COALESCE(SUM(loan_amount - paid_amount), 0) as total_remaining_amount
      FROM loans 
      WHERE user_id = ${userId}
    `
    return result[0]
  },

  // Update overdue loans
  async updateOverdueLoans() {
    const result = await sql`
      UPDATE loans 
      SET status = 'overdue'
      WHERE status = 'active' 
        AND payment_due_date < CURRENT_DATE
      RETURNING id
    `
    return result.length
  },

  // Get loans that need reminders (10, 5, 3, 1 days before due date)
  async getLoansNeedingReminders() {
    const result = await sql`
      SELECT 
        id, user_id, loan_amount, paid_amount, payment_due_date, notes,
        (payment_due_date - CURRENT_DATE) as days_until_due
      FROM loans 
      WHERE status = 'active' 
        AND (payment_due_date - CURRENT_DATE) IN (10, 5, 3, 1)
        AND (loan_amount - paid_amount) > 0
    `
    return result
  },

  // Check for loans needing reminders for a specific user
  async checkUserLoanReminders(userId) {
    const result = await sql`
      SELECT DISTINCT
        l.id, l.user_id, l.loan_amount, l.paid_amount, l.payment_due_date, l.notes,
        (l.payment_due_date - CURRENT_DATE) as days_until_due
      FROM loans l
      LEFT JOIN notifications n ON (
        n.user_id = l.user_id 
        AND n.type = 'loan_reminder' 
        AND n.created_at > CURRENT_DATE - INTERVAL '1 day'
        AND n.message LIKE '%' || (l.payment_due_date - CURRENT_DATE) || ' days%'
      )
      WHERE l.status = 'active' 
        AND l.user_id = ${userId}
        AND (l.payment_due_date - CURRENT_DATE) IN (10, 5, 3, 1)
        AND (l.loan_amount - l.paid_amount) > 0
        AND n.id IS NULL  -- Only get loans that haven't had recent notifications
    `
    return result
  }
}
