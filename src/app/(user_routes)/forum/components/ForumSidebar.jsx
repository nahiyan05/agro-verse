"use client"

export default function ForumSidebar({ 
  user, 
  isMyPostsDialogOpen, 
  setIsMyPostsDialogOpen, 
  fetchMyPosts, 
  myPosts, 
  deletePost, 
  formatTimeAgo,
  trendingFlairs,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
}) {
  return (
    <div className="space-y-6">
      {/* My Posts Button */}
      {user && (
        <Dialog open={isMyPostsDialogOpen} onOpenChange={setIsMyPostsDialogOpen}>
          <DialogTrigger asChild>
            <button 
              className="w-full px-4 py-3 bg-gradient-to-r from-green-400 to-emerald-500 text-white rounded-full hover:from-green-500 hover:to-emerald-600 transition-all font-semibold flex items-center justify-center gap-2"
              onClick={fetchMyPosts}
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              My Posts
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-400 bg-clip-text text-transparent">
                My Posts
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-6">
              {myPosts.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 text-lg">You haven't created any posts yet.</p>
                  <p className="text-gray-400 dark:text-gray-500">Start sharing your agricultural knowledge!</p>
                </div>
              ) : (
                myPosts.map((post) => (
                  <div key={post.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-2">{post.title}</h3>
                        {post.flair && (
                          <span className="px-3 py-1 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900 text-green-700 dark:text-green-300 text-xs font-semibold rounded-full">
                            {post.flair}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => deletePost(post.id)}
                        className="p-2 text-red-500 hover:text-red-700 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">{post.content}</p>
                    
                    {/* Display images if any */}
                    {post.images && post.images.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
                        {post.images.slice(0, 4).map((imageUrl, index) => (
                          <div key={index} className="relative">
                            <img
                              src={imageUrl}
                              alt={`Post image ${index + 1}`}
                              className="w-full h-16 object-cover rounded-md"
                            />
                            {index === 3 && post.images.length > 4 && (
                              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-md flex items-center justify-center">
                                <span className="text-white font-semibold text-sm">
                                  +{post.images.length - 4}
                                </span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                        <span>{post.votes_count || 0} votes</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <span>{post.comments_count || 0} comments</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <span>{post.views_count || 0} views</span>
                      </div>
                      <span>Created {formatTimeAgo(post.created_at)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Trending Topics */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            Trending Topics
          </h3>
        </div>
        <div className="p-4">
          {trendingFlairs.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No trending topics yet</p>
          ) : (
            <div className="space-y-3">
              {trendingFlairs.map((flair, index) => (
                <div key={flair.flair} className="flex justify-between items-center p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-400 w-6 h-6 rounded-full flex items-center justify-center">
                      {index + 1}
                    </span>
                    <span className="px-3 py-1 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-full">
                      {flair.flair}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400 font-semibold">{flair.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Forum Rules */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">Forum Guidelines</h3>
        </div>
        <div className="p-4 text-sm space-y-3 text-gray-600 dark:text-gray-300">
          <div className="flex items-start gap-2">
            <span className="text-green-500 font-bold">•</span>
            <span>Be respectful and helpful to fellow farmers</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-500 font-bold">•</span>
            <span>Share accurate information and cite sources</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-500 font-bold">•</span>
            <span>Use appropriate categories for your posts</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-500 font-bold">•</span>
            <span>Search before posting duplicate questions</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-500 font-bold">•</span>
            <span>Report spam or inappropriate content</span>
          </div>
        </div>
      </div>
    </div>
  )
}
