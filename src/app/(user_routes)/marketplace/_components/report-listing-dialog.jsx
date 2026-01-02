"use client"

import { useState } from "react"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog"
import { FiAlertTriangle, FiFlag, FiLoader } from "react-icons/fi"

const PREDEFINED_REASONS = [
    "Spam or misleading information",
    "Inappropriate content",
    "Fraud or scam",
    "Overpricing or unfair pricing",
    "Poor quality products",
    "Other"
]

export default function ReportListingDialog({ 
  open, 
  onOpenChange, 
  listing,
  onReportSubmit 
}) {
  const [reportReason, setReportReason] = useState("")
  const [customReason, setCustomReason] = useState("")
  const [reportDetails, setReportDetails] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    
    if (!reportReason || !reportDetails.trim()) {
      alert("Please fill in all required fields")
      return
    }

    if (reportReason === "Other" && !customReason.trim()) {
      alert("Please specify your reason for reporting")
      return
    }

    setIsSubmitting(true)
    
    const finalReason = reportReason === "Other" ? customReason : reportReason
    
    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
          reportedUserId: listing.user_id,
          reportReason: finalReason,
          reportDetails: reportDetails.trim()
        })
      })

      const result = await response.json()

      if (response.ok && result.success) {
        handleClose()
        if (onReportSubmit) onReportSubmit()
      } else {
        alert(`Error: ${result.message || "Failed to submit report"}`)
      }
    } catch (error) {
      console.error("Error submitting report:", error)
      alert("An error occurred while submitting the report. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setReportReason("")
    setCustomReason("")
    setReportDetails("")
    setIsSubmitting(false)
    onOpenChange(false)
  }

  if (!listing) return null

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <FiFlag className="h-5 w-5" />
            Report Listing
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              You are reporting:
            </p>
            <p className="font-medium text-gray-900 dark:text-white">
              {listing.crop_name} by {listing.seller_name}
            </p>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <FiAlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5" />
              <div className="text-sm text-yellow-800 dark:text-yellow-200">
                <p className="font-medium mb-1">Before you report:</p>
                <ul className="text-xs space-y-0.5">
                  <li>• Make sure this listing violates our community guidelines</li>
                  <li>• Consider contacting the seller first for minor issues</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="reason" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Reason for reporting *
              </label>
              <select
                id="reason"
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Select a reason...</option>
                {PREDEFINED_REASONS.map((reason) => (
                  <option key={reason} value={reason}>
                    {reason}
                  </option>
                ))}
              </select>
            </div>

            {reportReason === "Other" && (
              <div>
                <label htmlFor="customReason" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Please specify *
                </label>
                <input
                  type="text"
                  id="customReason"
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  placeholder="Enter your reason..."
                  className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            )}

            <div>
              <label htmlFor="details" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Additional details *
              </label>
              <textarea
                id="details"
                value={reportDetails}
                onChange={(e) => setReportDetails(e.target.value)}
                placeholder="Please provide more details"
                rows={4}
                maxLength={500}
                className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white resize-none"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {reportDetails.length}/500 characters
              </p>
            </div>
          </div>

          <DialogFooter className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 rounded-full hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || !reportReason || !reportDetails.trim()}
              className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-full focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <FiLoader className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <FiFlag className="h-4 w-4 mr-2" />
                  Submit Report
                </>
              )}
            </button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}