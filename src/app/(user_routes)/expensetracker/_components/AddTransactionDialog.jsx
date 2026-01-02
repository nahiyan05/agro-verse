"use client"

import { useState } from "react"
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

// Static category lists
const expenseCategoriesList = [
  "Fertilizer", "Seeds", "Irrigation", "Labor", "Pest Control",
  "Machinery Rent", "Fuel", "Equipment", "Insurance", "Others",
]
const earningCategoriesList = [
  "Selling Crops", "Renting Items", "Consulting", "Government Subsidies",
  "Contract Farming", "Livestock Sales", "Others",
]

export function AddTransactionDialog({ onSuccess }) {
  const [formData, setFormData] = useState({
    type: "expense",
    category: "",
    amount: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (isSubmitting) return
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
        credentials: "include",
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          onSuccess() // This will close the dialog and refresh data
        }
      } else {
        console.error("Failed to add transaction")
      }
    } catch (error) {
      console.error("Error creating transaction:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleTypeChange = (e) => {
    setFormData({
      ...formData,
      type: e.target.value,
      category: "", // Reset category when type changes
    })
  }

  const categories = formData.type === "expense" ? expenseCategoriesList : earningCategoriesList

  return (
    <DialogContent className="bg-white dark:bg-gray-800 sm:max-w-md p-6">
      <DialogHeader>
        <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">
          Add {formData.type === "expense" ? "Expense" : "Earning"}
        </DialogTitle>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="grid gap-4 py-4">
        {/* Type Selection */}
        <div className="flex gap-4">
            <label className="flex items-center cursor-pointer">
              <input type="radio" value="expense" checked={formData.type === "expense"} onChange={handleTypeChange} className="mr-2 h-4 w-4 accent-green-600" />
              <span className="text-gray-900 dark:text-gray-200">Expense</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input type="radio" value="earning" checked={formData.type === "earning"} onChange={handleTypeChange} className="mr-2 h-4 w-4 accent-green-600" />
              <span className="text-gray-900 dark:text-gray-200">Earning</span>
            </label>
        </div>

        {/* Form Fields */}
        <div className="grid gap-2">
          <label htmlFor="category" className="text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
          <select
            id="category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            required
          >
            <option value="" disabled>Select a category...</option>
            {categories.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        <div className="grid gap-2">
          <label htmlFor="amount" className="text-sm font-medium text-gray-700 dark:text-gray-300">Amount ($)</label>
          <input
            id="amount"
            type="number" step="0.01" min="0"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            required
          />
        </div>

        <div className="grid gap-2">
          <label htmlFor="description" className="text-sm font-medium text-gray-700 dark:text-gray-300">Description (Optional)</label>
          <input
            id="description"
            type="text"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="e.g., Spring wheat seeds"
          />
        </div>

        <div className="grid gap-2">
          <label htmlFor="date" className="text-sm font-medium text-gray-700 dark:text-gray-300">Date</label>
          <input
            id="date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            required
          />
        </div>

        <DialogFooter className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-4 px-4 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 transition-colors disabled:bg-green-400 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Adding..." : `Add Transaction`}
          </button>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}