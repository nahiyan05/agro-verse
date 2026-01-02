"use client"
import { useState } from "react"
import { MdSend } from "react-icons/md"

export default function FixedCommentBox({ user, newComment, setNewComment, handleSubmitComment }) {
  const [isFocused, setIsFocused] = useState(false)

  if (!user) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 p-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">Please log in to join the conversation</p>
          <button 
            onClick={() => window.location.href = '/login'} 
            className="rounded-full bg-green-600 hover:bg-green-700 transition-colors px-6 py-3 text-white font-medium"
          >
            Log In to Comment
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed translate-x-11 bottom-0 left-0 right-0 z-50 p-6">
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmitComment} className="space-y-4">
          <div className="flex gap-4">
            <div className="h-10 w-10 ring-2 ring-green-100 dark:ring-green-900 flex-shrink-0 rounded-full overflow-hidden bg-green-100 dark:bg-green-900 flex items-center justify-center">
              {user.profile_pic ? (
                <img 
                  src={user.profile_pic}
                  alt={user.name || user.email}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-green-700 dark:text-green-300 font-semibold text-sm">
                  {user.name?.[0] || user.email?.[0]}
                </span>
              )}
            </div>
            
            <div className="flex-1 flex items-start gap-3">
              <div className="flex-1">
                <textarea
                  value={newComment}  
                  onChange={(e) => setNewComment(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  placeholder="Share your thoughts, advice, or ask a question..."
                  className={`w-full h-12 resize-none rounded-xl border-gray-300 dark:border-gray-600 focus:border-green-500 focus:ring-green-500 transition-all duration-200 p-3 glass-morphism text-gray-900  placeholder-gray-500 dark:placeholder-gray-400 text-sm ${
                    isFocused ? 'shadow-lg' : ''
                  }`}
                  style={{ outline: 'none' }}
                />
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {newComment.length}/500 characters
                </div>
              </div>
              
              <button 
                type="submit" 
                disabled={!newComment.trim() || newComment.length > 500}
                className="rounded-full bg-green-600 translate-y-0.5 hover:bg-green-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 transition-all duration-200 p-4 flex items-center justify-center text-white disabled:cursor-not-allowed"
              >
                <MdSend className="text-sm" />
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
