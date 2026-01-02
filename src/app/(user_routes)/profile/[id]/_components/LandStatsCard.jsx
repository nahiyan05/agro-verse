"use client"

import { useState, useEffect } from "react"
import { FiMap, FiLayers, FiMapPin, FiTrendingUp } from "react-icons/fi"

export default function LandStatsCard({ userId, isOwnProfile = false }) {
  const [landStats, setLandStats] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchLandStats()
  }, [userId])

  const fetchLandStats = async () => {
    try {
      let url = "/api/lands"
      if (!isOwnProfile && userId) {
        url += `?userId=${userId}`
      }

      const response = await fetch(url, {
        credentials: "include"
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          const lands = result.lands || []
          const totalArea = lands.reduce((sum, land) => sum + (parseFloat(land.area) || 0), 0)
          
          setLandStats({
            totalLands: lands.length,
            totalArea: totalArea.toFixed(2),
            lands: lands.slice(0, 3) // Show first 3 lands for preview
          })
        }
      }
    } catch (error) {
      console.error("Error fetching land stats:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700 shadow-md dark:shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg shadow-sm animate-pulse">
            <div className="w-5 h-5 bg-green-200 dark:bg-green-800 rounded"></div>
          </div>
          <div className="h-5 bg-gray-200 dark:bg-slate-700 rounded w-24 animate-pulse"></div>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-xl shadow-sm">
              <div className="w-8 h-8 bg-green-200 dark:bg-green-800 rounded mx-auto mb-2 animate-pulse"></div>
              <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded mb-1 animate-pulse"></div>
            </div>
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl shadow-sm">
              <div className="w-8 h-8 bg-blue-200 dark:bg-blue-800 rounded mx-auto mb-2 animate-pulse"></div>
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
        <div className="p-2 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900 dark:to-green-800 rounded-lg shadow-sm">
          <FiMap className="h-5 w-5 text-green-600 dark:text-green-400" />
        </div>
        <h3 className="font-semibold text-gray-900 dark:text-white">Land Portfolio</h3>
      </div>
      
      <div className="space-y-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl shadow-sm border border-green-200/50 dark:border-green-700/30">
            <div className="flex items-center justify-center mb-2">
              <div className="p-2 bg-green-500/10 dark:bg-green-400/10 rounded-lg">
                <FiMapPin className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {landStats?.totalLands || 0}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Properties</p>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl shadow-sm border border-blue-200/50 dark:border-blue-700/30">
            <div className="flex items-center justify-center mb-2">
              <div className="p-2 bg-blue-500/10 dark:bg-blue-400/10 rounded-lg">
                <FiLayers className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {landStats?.totalArea || "0.0"}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Total Acres</p>
          </div>
        </div>

        {/* Empty State */}
        {!landStats?.totalLands && (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center">
              <FiMap className="h-8 w-8 text-gray-400 dark:text-gray-500" />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {isOwnProfile ? "Add your first property to get started" : "No properties registered yet"}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
