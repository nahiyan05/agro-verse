"use client"

export default function LoadingState() {
  return (
    <div className="min-h-screen ">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="animate-pulse-slow space-y-8">
          {/* Header skeleton */}
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-2xl shadow-sm p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded-full w-20"></div>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
              <div className="flex-1">
                <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-32 mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
              </div>
            </div>
          </div>

          {/* Post content skeleton */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-8">
            <div className="flex gap-6">
              <div className="flex flex-col items-center gap-2">
                <div className="h-12 w-12 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                <div className="h-6 w-8 bg-gray-300 dark:bg-gray-600 rounded"></div>
                <div className="h-12 w-12 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
              </div>
              <div className="flex-1">
                <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-6"></div>
                <div className="space-y-3 mb-8">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                </div>
                <div className="flex gap-4">
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-full w-20"></div>
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-full w-16"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Comments skeleton */}
          <div className="space-y-4">
            <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-40 mb-6"></div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                <div className="flex gap-4">
                  <div className="h-10 w-10 bg-gray-300 dark:bg-gray-600 rounded-full flex-shrink-0"></div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-24"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/5"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
