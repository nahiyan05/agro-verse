"use client"
import { MdArrowUpward, MdArrowDownward, MdComment, MdVisibility } from "react-icons/md"

export default function PostContent({ post, handleVote }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 hover-lift p-8 mb-8">
      <div className="flex gap-6">
        {/* Vote buttons */}
        <div className="flex flex-col items-center gap-2">
          <button
            className={`p-3 h-12 w-12 rounded-full transition-all duration-200 ${
              post.userVote === 1 
                ? 'text-green-600 bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/50 shadow-sm' 
                : 'text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20'
            }`}
            onClick={() => handleVote(1)}
          >
            <MdArrowUpward className="text-xl" />
          </button>
          <span className="font-bold text-xl text-gray-800 dark:text-gray-200 min-w-[2rem] text-center">
            {post.votes_count || 0}
          </span>
          <button
            className={`p-3 h-12 w-12 rounded-full transition-all duration-200 ${
              post.userVote === -1 
                ? 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 shadow-sm' 
                : 'text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'
            }`}
            onClick={() => handleVote(-1)}
          >
            <MdArrowDownward className="text-xl" />
          </button>
        </div>

        {/* Post content */}
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100 leading-tight">
            {post.title}
          </h1>
          
          <div className="prose max-w-none mb-8">
            <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
              {post.content}
            </p>
          </div>

          {/* Display images if any */}
          {post.images && post.images.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {post.images.map((imageUrl, index) => (
                <div key={index} className="relative group rounded-2xl overflow-hidden">
                  <img
                    src={imageUrl}
                    alt={`Post image ${index + 1}`}
                    className="w-full h-80 md:h-96 object-cover cursor-pointer transition-transform duration-300 hover:scale-105"
                    onClick={() => window.open(imageUrl, '_blank')}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                </div>
              ))}
            </div>
          )}

          {/* Post stats */}
          <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700 rounded-full px-4 py-2">
              <MdComment className="text-base" />
              <span className="font-medium">{post.comments_count || 0} comments</span>
            </div>
            <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700 rounded-full px-4 py-2">
              <MdVisibility className="text-base" />
              <span className="font-medium">{post.views_count || 0} views</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
