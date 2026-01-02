"use client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function PostCard({ post, user, handleVote, formatTimeAgo, router }) {
  return (
    <div 
      className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg dark:hover:shadow-gray-900/20 transition-all cursor-pointer p-6"
      onClick={() => router.push(`/forum/${post.id}`)}
    >
      <div className="flex gap-4">
        {/* Vote buttons */}
        <div className="flex flex-col items-center gap-1 rounded-lg p-2">
          <button
            className={`p-2 rounded-lg transition-colors ${
              post.userVote === 1 
                ? 'text-green-600 bg-green-100 dark:bg-green-900 hover:bg-green-200 dark:hover:bg-green-800' 
                : 'text-gray-500 dark:text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30'
            }`}
            onClick={(e) => {
              e.stopPropagation()
              handleVote(post.id, 1, post.userVote)
            }}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </button>
          <span className="font-bold text-lg text-gray-800 dark:text-gray-200">{post.votes_count || 0}</span>
          <button
            className={`p-2 rounded-lg transition-colors ${
              post.userVote === -1 
                ? 'text-blue-600 bg-blue-100 dark:bg-blue-900 hover:bg-blue-200 dark:hover:bg-blue-800' 
                : 'text-gray-500 dark:text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30'
            }`}
            onClick={(e) => {
              e.stopPropagation()
              handleVote(post.id, -1, post.userVote)
            }}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* Post content */}
        <div className="flex-1">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 ring-2 ring-green-100 dark:ring-green-900">
                <AvatarImage src={post.author_profile_pic} />
                <AvatarFallback className="bg-gradient-to-r from-green-400 to-emerald-500 text-white font-semibold">
                  {post.author_name?.[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-gray-800 dark:text-gray-200">{post.author_name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {formatTimeAgo(post.created_at)}
                  {(post.area || post.city) && (
                    <span> • 📍 {post.area && post.city ? `${post.area}, ${post.city}` : post.area || post.city}</span>
                  )}
                </p>
              </div>
            </div>
            {post.flair && (
              <span className="px-3 py-1 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900 text-green-700 dark:text-green-300 text-xs font-semibold rounded-full">
                {post.flair}
              </span>
            )}
          </div>

          <h3 className="font-bold text-xl mb-3 text-gray-900 dark:text-gray-100 hover:text-green-600 dark:hover:text-green-400 transition-colors">
            {post.title}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3 leading-relaxed">{post.content}</p>

          {/* images if any */}
          {post.images && post.images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
              {post.images.slice(0, 4).map((imageUrl, index) => (
                <div key={index} className="relative overflow-hidden rounded-lg">
                  <img
                    src={imageUrl}
                    alt={`Post image ${index + 1}`}
                    className="w-full h-20 object-cover hover:scale-105 transition-transform cursor-pointer"
                    onClick={(e) => e.stopPropagation()}
                  />
                  {index === 3 && post.images.length > 4 && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-lg">
                        +{post.images.length - 4}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span className="font-medium">{post.comments_count || 0} comments</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span className="font-medium">{post.views_count || 0} views</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
