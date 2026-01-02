"use client"

import { useState } from "react"
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

export function AddLoanDialog({ onSuccess }) {
  const [formData, setFormData] = useState({
    loan_amount: "",
    payment_due_date: "",
    notes: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (isSubmitting) return
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/loans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
        credentials: "include",
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          onSuccess() // This will close the dialog and refresh data
          // Reset form
          setFormData({
            loan_amount: "",
            payment_due_date: "",
            notes: "",
          })
        } else {
          alert(result.message || "Failed to create loan")
        }
      } else {
        alert("Failed to create loan")
      }
    } catch (error) {
      console.error("Error creating loan:", error)
      alert("Error creating loan")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Get tomorrow's date as minimum date
  const getTomorrowDate = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split("T")[0]
  }

  return (
    <DialogContent className="bg-white dark:bg-gray-800 sm:max-w-md p-6">
      <DialogHeader>
        <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">
          Add New Loan
        </DialogTitle>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="grid gap-4 py-4">
        {/* Loan Amount */}
        <div className="grid gap-2">
          <label htmlFor="loan_amount" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Loan Amount (৳)
          </label>
          <input
            id="loan_amount"
            type="number"
            step="0.01"
            min="1"
            value={formData.loan_amount}
            onChange={(e) => setFormData({ ...formData, loan_amount: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Enter loan amount"
            required
          />
        </div>

        {/* Due Date */}
        <div className="grid gap-2">
          <label htmlFor="payment_due_date" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Payment Due Date
          </label>
          <input
            id="payment_due_date"
            type="date"
            min={getTomorrowDate()}
            value={formData.payment_due_date}
            onChange={(e) => setFormData({ ...formData, payment_due_date: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
            required
          />
        </div>

        {/* Notes */}
        <div className="grid gap-2">
          <label htmlFor="notes" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Notes (Optional)
          </label>
          <textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
            placeholder="Add notes about this loan (purpose, lender, etc.)"
            rows={3}
          />
        </div>

        <DialogFooter className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={() => onSuccess()}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed rounded-md transition-colors"
          >
            {isSubmitting ? "Adding..." : "Add Loan"}
          </button>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}
