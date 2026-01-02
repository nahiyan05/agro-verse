"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

export function PaymentDialog({ loan, onSuccess, onClose }) {
  const [paymentAmount, setPaymentAmount] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (isSubmitting) return
    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/loans/${loan.id}/payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payment_amount: paymentAmount }),
        credentials: "include",
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          onSuccess() 
          setPaymentAmount("")
        } else {
          alert(result.message || "Failed to process payment")
        }
      } else {
        alert("Failed to process payment")
      }
    } catch (error) {
      console.error("Error processing payment:", error)
      alert("Error processing payment")
    } finally {
      setIsSubmitting(false)
    }
  }

  const remainingAmount = loan ? loan.loan_amount - loan.paid_amount : 0
  const maxPaymentAmount = remainingAmount

  return (
    <Dialog open={!!loan} onOpenChange={() => onClose()}>
      <DialogContent className="bg-white dark:bg-gray-800 sm:max-w-md p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">
            Make Payment
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {/* Loan Info */}
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Loan Details</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Total Loan:</span>
                <span className="font-medium text-gray-900 dark:text-white">৳{loan?.loan_amount?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Already Paid:</span>
                <span className="font-medium text-green-600 dark:text-green-400">৳{loan?.paid_amount?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-t pt-2 dark:border-gray-700">
                <span className="text-gray-900 dark:text-white font-medium">Remaining:</span>
                <span className="font-bold text-red-600 dark:text-red-400">৳{remainingAmount?.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="grid gap-4">
            {/* Payment Amount */}
            <div className="grid gap-2">
              <label htmlFor="payment_amount" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Payment Amount (৳)
              </label>
              <input
                id="payment_amount"
                type="number"
                step="0.01"
                min="0.01"
                max={maxPaymentAmount}
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder={`Max: ৳${maxPaymentAmount?.toLocaleString()}`}
                required
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Enter the amount you want to pay. Maximum: ৳{maxPaymentAmount?.toLocaleString()}
              </p>
            </div>

            {/* Quick Amount Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPaymentAmount((remainingAmount / 2).toString())}
                className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
              >
                Half (৳{(remainingAmount / 2)?.toLocaleString()})
              </button>
              <button
                type="button"
                onClick={() => setPaymentAmount(remainingAmount.toString())}
                className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
              >
                Full Amount
              </button>
            </div>

            <DialogFooter className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !paymentAmount || Number.parseFloat(paymentAmount) <= 0}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed rounded-md transition-colors"
              >
                {isSubmitting ? "Processing..." : "Make Payment"}
              </button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
