"use client"
import { MdComment } from "react-icons/md"

export default function CommentList({ comments, formatTimeAgo }) {
  if (comments.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 hover-lift p-8 text-center">
        <div className="text-gray-400 dark:text-gray-500 mb-4">
          <MdComment className="text-6xl mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-gray-600 dark:text-gray-300 mb-2">No comments yet</h3>
        <p className="text-gray-500 dark:text-gray-400">
          Be the first to share your thoughts on this post!
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Comments ({comments.length})
        </h2>
      </div>
      
      <div className="space-y-4">
        {comments.map((comment, index) => (
          <div key={comment.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover-lift transition-all-smooth rounded-lg">
            <div className="p-6">
              <div className="flex gap-4">
                <div className="h-10 w-10 ring-2 ring-gray-100 dark:ring-gray-700 flex-shrink-0 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                  {comment.author_profile_pic ? (
                    <img 
                      src={comment.author_profile_pic}
                      alt={comment.author_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-600 dark:text-gray-300 font-medium text-sm">
                      {comment.author_name?.[0]}
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">{comment.author_name}</h4>
                    <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-full px-3 py-1">
                      {formatTimeAgo(comment.created_at)}
                    </span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                    {comment.content}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
