"use client"

export default function ForumFilters({ filterBy, setFilterBy, sortBy, setSortBy }) {
  return (
    <div className="flex flex-wrap gap-4 mb-8 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="space-y-2">
        <label className="text-sm mr-4 font-semibold text-gray-700 dark:text-gray-300">Filter by location:</label>
        <select
          value={filterBy}
          onChange={(e) => setFilterBy(e.target.value)}
          className="px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-transparent outline-none transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 min-w-40"
        >
          <option value="all">All Posts</option>
          <option value="area">My Area</option>
          <option value="city">My City</option>
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-sm mr-4 font-semibold text-gray-700 dark:text-gray-300">Sort by:</label>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-transparent outline-none transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 min-w-40"
        >
          <option value="last_activity">Recent Activity</option>
          <option value="votes">Most Upvoted</option>
          <option value="views">Most Viewed</option>
          <option value="comments">Most Commented</option>
        </select>
      </div>
    </div>
  )
}
