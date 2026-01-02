"use client"

import { useState, useEffect } from "react"
import { FiMessageSquare, FiMessageCircle, FiThumbsUp, FiTrendingUp } from "react-icons/fi"

export default function ForumStatsCard({ userId, isOwnProfile = false }) {
  const [forumStats, setForumStats] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchForumStats()
  }, [userId])

  const fetchForumStats = async () => {
    try {
      let url = "/api/forum/stats"
      
      // If viewing someone else's profile, add userId parameter
      if (!isOwnProfile && userId) {
        url += `?userId=${userId}`
      }
      
      const response = await fetch(url, {
        credentials: "include"
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setForumStats(result.stats)
        }
      }
    } catch (error) {
      console.error("Error fetching forum stats:", error)
      // Set empty stats on error
      setForumStats({
        totalPosts: 0,
        totalComments: 0,
        totalUpvotes: 0,
        recentPosts: []
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700 shadow-md dark:shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg shadow-sm animate-pulse">
            <div className="w-5 h-5 bg-blue-200 dark:bg-blue-800 rounded"></div>
          </div>
          <div className="h-5 bg-gray-200 dark:bg-slate-700 rounded w-24 animate-pulse"></div>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl shadow-sm">
              <div className="w-8 h-8 bg-blue-200 dark:bg-blue-800 rounded mx-auto mb-2 animate-pulse"></div>
              <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded mb-1 animate-pulse"></div>
            </div>
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl shadow-sm">
              <div className="w-8 h-8 bg-purple-200 dark:bg-purple-800 rounded mx-auto mb-2 animate-pulse"></div>
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
        <div className="p-2 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 rounded-lg shadow-sm">
          <FiMessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        </div>
        <h3 className="font-semibold text-gray-900 dark:text-white">Forum Activity</h3>
      </div>
      
      <div className="space-y-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl shadow-sm border border-blue-200/50 dark:border-blue-700/30">
            <div className="flex items-center justify-center mb-2">
              <div className="p-2 bg-blue-500/10 dark:bg-blue-400/10 rounded-lg">
                <FiMessageSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {forumStats?.totalPosts || 0}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Posts</p>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl shadow-sm border border-purple-200/50 dark:border-purple-700/30">
            <div className="flex items-center justify-center mb-2">
              <div className="p-2 bg-purple-500/10 dark:bg-purple-400/10 rounded-lg">
                <FiMessageCircle className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {forumStats?.totalComments || 0}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Comments</p>
          </div>
        </div>

        {/* Engagement Stats */}
        {forumStats?.totalUpvotes > 0 && (
          <div className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl border border-orange-200/50 dark:border-orange-700/30">
            <div className="flex items-center justify-center gap-2">
              <div className="p-1 bg-orange-500/10 dark:bg-orange-400/10 rounded">
                <FiThumbsUp className="h-3 w-3 text-orange-600 dark:text-orange-400" />
              </div>
              <span className="text-lg font-bold text-orange-600 dark:text-orange-400">
                {forumStats.totalUpvotes}
              </span>
              <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                Total Upvotes
              </span>
            </div>
          </div>
        )}

        {/* Empty State */}
        {forumStats?.totalPosts === 0 && (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center">
              <FiMessageSquare className="h-8 w-8 text-gray-400 dark:text-gray-500" />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {isOwnProfile ? "Share your first post in the forum" : "No forum activity yet"}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
