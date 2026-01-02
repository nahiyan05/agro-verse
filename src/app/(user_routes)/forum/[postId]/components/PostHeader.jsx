"use client"
import { MdEdit } from "react-icons/md"

export default function PostHeader({ post, user, formatTimeAgo, onEditPost }) {
  return (
    <div className="top-0 z-40 border-b border-gray-200/50 dark:border-gray-700/50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Post Header Info */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 ring-3 ring-green-100 dark:ring-green-900 rounded-full overflow-hidden bg-green-100 dark:bg-green-900 flex items-center justify-center">
              {post.author_profile_pic ? (
                <img 
                  src={post.author_profile_pic} 
                  alt={post.author_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-green-700 dark:text-green-300 font-semibold text-lg">
                  {post.author_name?.[0]}
                </span>
              )}
            </div>
            <div>
              <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">{post.author_name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {formatTimeAgo(post.created_at)}
                {(post.area || post.city) && (
                  <span> • {post.area && post.city ? `${post.area}, ${post.city}` : post.area || post.city}</span>
                )}
                {post.updated_at !== post.created_at && (
                  <span className="text-amber-600 dark:text-amber-400"> • edited</span>
                )}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {post.flair && (
              <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-800 rounded-full px-3 py-1 text-sm font-medium transition-colors">
                {post.flair}
              </span>
            )}
            {user && user.id === post.user_id && (
              <button
                onClick={onEditPost}
                className="rounded-full border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-500 transition-colors px-4 py-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                <MdEdit className="text-base" />
                Edit
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
