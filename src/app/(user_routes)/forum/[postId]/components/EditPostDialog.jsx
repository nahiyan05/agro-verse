"use client"
import { MdClose } from "react-icons/md"

const predefinedFlairs = [
  "Question",
  "Discussion", 
  "Tips",
  "News",
  "Problem",
  "Success Story",
  "Help Needed",
  "Market Info"
]

export default function EditPostDialog({ 
  isOpen, 
  onOpenChange, 
  editPost, 
  setEditPost, 
  handleSubmitEdit 
}) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50" 
        onClick={() => onOpenChange(false)}
      />
      
      {/* Dialog */}
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 rounded-t-2xl border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Edit Post</h2>
          <button
            onClick={() => onOpenChange(false)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <MdClose className="text-xl text-gray-500 dark:text-gray-400" />
          </button>
        </div>
        
        <form onSubmit={handleSubmitEdit} className="p-6 space-y-6">
          <div>
            <label htmlFor="editTitle" className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
              Title
            </label>
            <input
              id="editTitle"
              type="text"
              value={editPost.title}
              onChange={(e) => setEditPost({ ...editPost, title: e.target.value })}
              placeholder="Enter your post title..."
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 focus:border-green-500 focus:ring-2 focus:ring-green-500 focus:ring-opacity-20 text-lg transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
              style={{ outline: 'none' }}
            />
          </div>
          
          <div>
            <label htmlFor="editContent" className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
              Content
            </label>
            <textarea
              id="editContent"
              value={editPost.content}
              onChange={(e) => setEditPost({ ...editPost, content: e.target.value })}
              placeholder="Share your thoughts, experiences, or ask questions..."
              className="w-full px-4 py-3 min-h-40 rounded-xl border border-gray-300 dark:border-gray-600 focus:border-green-500 focus:ring-2 focus:ring-green-500 focus:ring-opacity-20 text-base resize-none transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
              style={{ outline: 'none' }}
            />
          </div>

          <div>
            <label htmlFor="editFlair" className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
              Flair (Optional)
            </label>
            <select
              id="editFlair"
              value={editPost.flair}
              onChange={(e) => setEditPost({ ...editPost, flair: e.target.value === "none" ? "" : e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 focus:border-green-500 focus:ring-2 focus:ring-green-500 focus:ring-opacity-20 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              style={{ outline: 'none' }}
            >
              <option value="">Choose a category for your post</option>
              <option value="none">No Flair</option>
              {predefinedFlairs.map((flair) => (
                <option key={flair} value={flair}>
                  {flair}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button 
              type="submit" 
              className="flex-1 rounded-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 transition-colors"
            >
              Update Post
            </button>
            <button 
              type="button" 
              onClick={() => onOpenChange(false)}
              className="flex-1 rounded-full border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium py-3 transition-colors text-gray-900 dark:text-gray-100"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
