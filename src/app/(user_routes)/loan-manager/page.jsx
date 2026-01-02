"use client"

import { useState, useEffect } from "react"
import { motion } from "motion/react"
import { FiPlus, FiEdit, FiTrash2, FiDollarSign, FiCalendar, FiClock, FiTrendingUp, FiTrendingDown } from "react-icons/fi"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { AddLoanDialog } from "./_components/AddLoanDialog"
import { EditLoanDialog } from "./_components/EditLoanDialog"
import { PaymentDialog } from "./_components/PaymentDialog"

// Animated number component
const AnimatedNumber = ({ value }) => {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    const duration = 800 
    const steps = 50
    const startValue = displayValue
    const difference = value - startValue
    let current = 0

    if (value === displayValue) return

    const timer = setInterval(() => {
      current += 1
      const progress = current / steps
      const easeOutQuart = 1 - Math.pow(1 - progress, 4) 
      const newValue = startValue + (difference * easeOutQuart)
      
      if (current >= steps) {
        setDisplayValue(value)
        clearInterval(timer)
      } else {
        setDisplayValue(newValue)
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [value])

  const formatNumber = (num) => {
    const isNegative = num < 0
    const absoluteNum = Math.abs(num)
    const formatted = absoluteNum.toLocaleString("en-US", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    })
    return (isNegative ? "-৳" : "৳") + formatted
  }

  return <span>{formatNumber(displayValue)}</span>
}

export default function LoanManager() {
  const [loanData, setLoanData] = useState(null)
  const [chartData, setChartData] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingLoan, setEditingLoan] = useState(null)
  const [paymentLoan, setPaymentLoan] = useState(null)

  const fetchLoans = async () => {
    try {
      const response = await fetch("/api/loans", { credentials: "include" })
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setLoanData(result.data)
        }
      }
    } catch (error) {
      console.error("Error fetching loans:", error)
    }
  }

  const fetchChartData = async () => {
    try {
      const response = await fetch("/api/loans/statistics", { credentials: "include" })
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setChartData(result.data)
        }
      }
    } catch (error) {
      console.error("Error fetching chart data:", error)
    }
  }

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      await Promise.all([fetchLoans(), fetchChartData()])
      setIsLoading(false)
    }
    loadData()
  }, [])



  const handleLoanAdded = () => {
    setIsAddDialogOpen(false)
    fetchLoans()
    fetchChartData()
  }

  const handleLoanUpdated = () => {
    setEditingLoan(null)
    fetchLoans()
    fetchChartData()
  }

  const handlePaymentMade = () => {
    setPaymentLoan(null)
    fetchLoans()
    fetchChartData()
  }

  const handleDeleteLoan = async (loanId) => {
    if (!confirm("Are you sure you want to delete this loan?")) return

    try {
      const response = await fetch(`/api/loans/${loanId}`, {
        method: "DELETE",
        credentials: "include"
      })
      if (response.ok) {
        fetchLoans()
        fetchChartData()
      }
    } catch (error) {
      console.error("Error deleting loan:", error)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400'
      case 'completed': return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400'
      case 'overdue': return 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400'
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400'
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getDaysRemaining = (dueDateString) => {
    const dueDate = new Date(dueDateString)
    const today = new Date()
    const timeDiff = dueDate.getTime() - today.getTime()
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24))
    return daysDiff
  }

  const getDaysRemainingText = (daysRemaining) => {
    if (daysRemaining < 0) {
      return `${Math.abs(daysRemaining)} days overdue`
    } else if (daysRemaining === 0) {
      return "Due today"
    } else if (daysRemaining === 1) {
      return "Due tomorrow"
    } else {
      return `${daysRemaining} days left`
    }
  }

  const getDaysRemainingColor = (daysRemaining) => {
    if (daysRemaining < 0) {
      return "text-red-600 dark:text-red-400"
    } else if (daysRemaining <= 3) {
      return "text-orange-600 dark:text-orange-400"
    } else if (daysRemaining <= 10) {
      return "text-yellow-600 dark:text-yellow-400"
    } else {
      return "text-green-600 dark:text-green-400"
    }
  }

  const isOverdue = (dueDateString, status) => {
    if (status === 'completed') return false
    return new Date(dueDateString) < new Date()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen ">
        <div className="max-w-[85vw] mx-auto pt-8 space-y-8">
          <div className="flex items-center justify-between">
              <div>
                  <Skeleton className="h-9 w-64 mb-3" />
                  <Skeleton className="h-5 w-96" />
              </div>
              <Skeleton className="h-11 w-28" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1 space-y-8">
                  <Skeleton className="h-56 w-full" />
                  <Skeleton className="h-64 w-full" />
              </div>
              <div className="lg:col-span-2 space-y-8">
                  <Skeleton className="h-[400px] w-full" />
                  <Skeleton className="h-[600px] w-full" />
              </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-[85vw] mx-auto pt-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Loan Manager
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg">Track and manage your agricultural loans</p>
          </div>
          
          <div className="flex items-center gap-3">
            
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <button className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-full transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-medium">
                  <FiPlus className="h-5 w-5" />
                  Add Loan
                </button>
              </DialogTrigger>
              <AddLoanDialog onSuccess={handleLoanAdded} />
            </Dialog>
          </div>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-1 space-y-8">
            {/* Summary Cards */}
            <div className="bg-green-100/60 dark:bg-gray-800 rounded-2xl p-7 border border-gray-200 dark:border-gray-700 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Loan Summary</h3>
              <div className="space-y-5">
                <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800/30">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-800/50 rounded-lg">
                      <FiDollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="text-gray-700 dark:text-gray-300 font-medium">Total Loan</span>
                  </div>
                  <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    <AnimatedNumber value={loanData?.summary?.total_loan_amount || 0} />
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-800/30">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 dark:bg-green-800/50 rounded-lg">
                      <FiTrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-gray-700 dark:text-gray-300 font-medium">Paid</span>
                  </div>
                  <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                    <AnimatedNumber value={loanData?.summary?.total_paid_amount || 0} />
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-800/30">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-100 dark:bg-red-800/50 rounded-lg">
                      <FiTrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />
                    </div>
                    <span className="text-gray-700 dark:text-gray-300 font-medium">Remaining</span>
                  </div>
                  <span className="text-2xl font-bold text-red-600 dark:text-red-400">
                    <AnimatedNumber value={loanData?.summary?.total_remaining_amount || 0} />
                  </span>
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700 grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{loanData?.summary?.active_loans || 0}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Active</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">{loanData?.summary?.completed_loans || 0}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">{loanData?.summary?.overdue_loans || 0}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Overdue</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Chart */}
            <div className="bg-emerald-100/70 dark:bg-gray-800 rounded-2xl p-7 border border-gray-200 dark:border-gray-700 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Last 4 Months</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} barCategoryGap={20}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="month_year" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      formatter={(value) => [`৳${value.toLocaleString()}`, '']}
                      labelStyle={{ color: 'black' }}
                    />
                    <Legend />
                    <Bar dataKey="loan_taken" name="Loan Taken" fill="#ef4444" barSize={30} />
                    <Bar dataKey="money_repaid" name="Money Repaid" fill="#22c55e" barSize={30} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Right Column - Loan List */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-7 border border-gray-200 dark:border-gray-700 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Your Loans</h3>
              
              {loanData?.loans?.length === 0 ? (
                <div className="text-center py-12">
                  <FiDollarSign className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <h4 className="text-xl font-medium text-gray-500 dark:text-gray-400 mb-2">No loans found</h4>
                  <p className="text-gray-400 dark:text-gray-500">Add your first loan to get started</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {loanData?.loans?.map((loan) => (
                    <motion.div
                      key={loan.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-6 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-900/80 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(loan.status)}`}>
                              {loan.status}
                            </span>
                            {isOverdue(loan.payment_due_date, loan.status) && (
                              <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400">
                                Overdue
                              </span>
                            )}
                          </div>
                          {loan.notes && (
                            <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">{loan.notes}</p>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setPaymentLoan(loan)}
                            className="p-2 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                            title="Make Payment"
                            disabled={loan.status === 'completed'}
                          >
                            <FiDollarSign className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setEditingLoan(loan)}
                            className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                            title="Edit Loan"
                          >
                            <FiEdit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteLoan(loan.id)}
                            className="p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="Delete Loan"
                          >
                            <FiTrash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Loan Amount</p>
                          <p className="text-lg font-semibold text-gray-900 dark:text-white">৳{loan.loan_amount.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Paid Amount</p>
                          <p className="text-lg font-semibold text-green-600 dark:text-green-400">৳{loan.paid_amount.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Remaining</p>
                          <p className="text-lg font-semibold text-red-600 dark:text-red-400">৳{loan.remaining_amount.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Due Date</p>
                          <div className="flex items-center gap-1 mb-1">
                            <FiCalendar className="h-4 w-4 text-gray-400" />
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">{formatDate(loan.payment_due_date)}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            <FiClock className="h-3 w-3 text-gray-400" />
                            <p className={`text-sm font-medium ${getDaysRemainingColor(getDaysRemaining(loan.payment_due_date))}`}>
                              {getDaysRemainingText(getDaysRemaining(loan.payment_due_date))}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="mt-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600 dark:text-gray-400">Payment Progress</span>
                          <span className="text-gray-900 dark:text-white font-medium">
                            {Math.round((loan.paid_amount / loan.loan_amount) * 100)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${Math.min((loan.paid_amount / loan.loan_amount) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Edit Loan Dialog */}
        {editingLoan && (
          <EditLoanDialog 
            loan={editingLoan} 
            onSuccess={handleLoanUpdated} 
            onClose={() => setEditingLoan(null)}
          />
        )}

        {/* Payment Dialog */}
        {paymentLoan && (
          <PaymentDialog 
            loan={paymentLoan} 
            onSuccess={handlePaymentMade} 
            onClose={() => setPaymentLoan(null)}
          />
        )}
      </div>
    </div>
  )
}
