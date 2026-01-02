"use client"

import { useState, useEffect } from "react"
import { FaSeedling } from "react-icons/fa"
import { FiCalendar, FiTrendingUp, FiMapPin } from "react-icons/fi"

// Crop emojis mapping
const cropEmojis = {
  Rice: "🍚",
  Wheat: "🌾",
  Maize: "🌽",
  Potato: "🥔",
  Onion: "🧅",
  Garlic: "🧄",
  Chili: "🌶️",
  Tomato: "🍅",
  Vegetables: "🥬",
  Fruits: "🍎",
  Spices: "🌿",
  Jute: "🌾",
  Mustard: "🟡",
  other: "🌱",
}

const getCropEmoji = (cropName) => {
  return cropEmojis[cropName] || cropEmojis.other
}

const getSeasonColor = (season) => {
  switch (season?.toLowerCase()) {
    case 'winter':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-700/50'
    case 'summer':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 border-orange-200 dark:border-orange-700/50'
    case 'monsoon':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-700/50'
    case 'spring':
      return 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300 border-pink-200 dark:border-pink-700/50'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300 border-gray-200 dark:border-gray-700/50'
  }
}

export default function CropPlansCard({ userId, isOwnProfile = false }) {
  const [cropPlans, setCropPlans] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchCropPlans()
  }, [userId])

  const fetchCropPlans = async () => {
    try {
      let url = "/api/crop-plans"
      
      if (!isOwnProfile && userId) {
        // For other users, fetch public crop plans and filter by user (if API supports it)
        // For now, we'll get all public plans and filter client-side
        url += "?public=true&limit=1000"
      }

      const response = await fetch(url, {
        credentials: "include"
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          let plans = result.cropPlans || []
          
          // If viewing another user's profile, filter plans by that user
          if (!isOwnProfile && userId) {
            plans = plans.filter(plan => plan.user_id?.toString() === userId.toString())
          }
          
          // Calculate stats
          const totalPlans = plans.length
          const activePlans = plans.filter(plan => 
            !plan.expected_harvest_date || new Date(plan.expected_harvest_date) > new Date()
          ).length
          const totalExpectedYield = plans.reduce((sum, plan) => 
            sum + (parseFloat(plan.estimated_yield) || 0), 0
          )

          // Get current season plans
          const currentDate = new Date()
          const currentMonth = currentDate.getMonth() + 1 // 1-12
          let currentSeason = 'Winter'
          
          if (currentMonth >= 3 && currentMonth <= 5) {
            currentSeason = 'Spring'
          } else if (currentMonth >= 6 && currentMonth <= 8) {
            currentSeason = 'Summer'
          } else if (currentMonth >= 9 && currentMonth <= 11) {
            currentSeason = 'Monsoon'
          }

          const currentSeasonPlans = plans.filter(plan => 
            plan.season === currentSeason
          )

          // Get recent plans for preview
          const recentPlans = plans
            .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
            .slice(0, 4)

          setCropPlans({
            totalPlans,
            activePlans,
            totalExpectedYield,
            currentSeason,
            currentSeasonPlans,
            recentPlans
          })
        }
      }
    } catch (error) {
      console.error("Error fetching crop plans:", error)
      // Set empty stats on error
      setCropPlans({
        totalPlans: 0,
        activePlans: 0,
        totalExpectedYield: 0,
        currentSeason: 'Winter',
        currentSeasonPlans: [],
        recentPlans: []
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700 shadow-md dark:shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-emerald-100 dark:bg-emerald-900 rounded-lg shadow-sm animate-pulse">
            <div className="w-5 h-5 bg-emerald-200 dark:bg-emerald-800 rounded"></div>
          </div>
          <div className="h-5 bg-gray-200 dark:bg-slate-700 rounded w-32 animate-pulse"></div>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl shadow-sm">
              <div className="w-8 h-8 bg-emerald-200 dark:bg-emerald-800 rounded mx-auto mb-2 animate-pulse"></div>
              <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded mb-1 animate-pulse"></div>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-xl shadow-sm">
              <div className="w-8 h-8 bg-green-200 dark:bg-green-800 rounded mx-auto mb-2 animate-pulse"></div>
              <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded mb-1 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700 shadow-md dark:shadow-xl hover:shadow-lg dark:hover:shadow-2xl transition-all duration-300">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-900 dark:to-emerald-800 rounded-lg shadow-sm">
          <FaSeedling className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h3 className="font-semibold text-gray-900 dark:text-white">Crop Planning</h3>
      </div>
      
      <div className="space-y-6">
        {/* Stats Grid - Full width layout */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 rounded-xl shadow-sm border border-emerald-200/50 dark:border-emerald-700/30">
            <div className="flex items-center justify-center mb-2">
              <div className="p-2 bg-emerald-500/10 dark:bg-emerald-400/10 rounded-lg">
                <FaSeedling className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {cropPlans?.totalPlans || 0}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Total Plans</p>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl shadow-sm border border-green-200/50 dark:border-green-700/30">
            <div className="flex items-center justify-center mb-2">
              <div className="p-2 bg-green-500/10 dark:bg-green-400/10 rounded-lg">
                <FiCalendar className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {cropPlans?.activePlans || 0}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Active Plans</p>
          </div>

          {/* Expected Yield */}
          <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl shadow-sm border border-orange-200/50 dark:border-orange-700/30">
            <div className="flex items-center justify-center mb-2">
              <div className="p-2 bg-orange-500/10 dark:bg-orange-400/10 rounded-lg">
                <FiTrendingUp className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {cropPlans?.totalExpectedYield?.toFixed(0) || 0}kg
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Expected Yield</p>
          </div>

          {/* Current Season */}
          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl shadow-sm border border-blue-200/50 dark:border-blue-700/30">
            <div className="flex items-center justify-center mb-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getSeasonColor(cropPlans?.currentSeason)}`}>
                {cropPlans?.currentSeason}
              </span>
            </div>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {cropPlans?.currentSeasonPlans?.length || 0}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Current Season</p>
          </div>
        </div>

        {/* Recent Plans Preview */}
        {cropPlans?.recentPlans && cropPlans.recentPlans.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Recent Crop Plans</p>
              {cropPlans.totalPlans > 4 && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  +{cropPlans.totalPlans - 4} more
                </p>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {cropPlans.recentPlans.map((plan, index) => (
                <div key={index} className="p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg border border-gray-200/50 dark:border-slate-600/50 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xl">{getCropEmoji(plan.crop_name)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                        {plan.crop_name}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium border ${getSeasonColor(plan.season)}`}>
                      {plan.season}
                    </span>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      {plan.estimated_yield && (
                        <span>{plan.estimated_yield}{plan.yield_unit || 'kg'}</span>
                      )}
                      {plan.expected_harvest_date && (
                        <span>
                          {new Date(plan.expected_harvest_date).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {cropPlans?.totalPlans === 0 && (
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center">
              <FaSeedling className="h-10 w-10 text-gray-400 dark:text-gray-500" />
            </div>
            <p className="text-base text-gray-500 dark:text-gray-400 font-medium mb-2">
              {isOwnProfile ? "Plan Your First Crop" : "No Crop Plans Yet"}
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              {isOwnProfile ? "Create your first crop plan to get started with seasonal planning" : "This user hasn't shared any crop plans yet"}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
