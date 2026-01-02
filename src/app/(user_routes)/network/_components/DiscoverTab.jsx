"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { FiSearch, FiUserPlus, FiX, FiCheck, FiTrash2 } from "react-icons/fi"

export default function DiscoverTab({ 
  searchQuery, 
  handleSearchChange, 
  searchResults, 
  isLoading, 
  sendConnectionRequest,
  removeConnectionByUserId,
  cancelConnectionRequest,
  respondToRequestByUserId,
  toast
}) {
  const router = useRouter()
  const [openDialog, setOpenDialog] = useState(null)

  const handleRemoveConnection = async (userId, userName) => {
    try {
      await removeConnectionByUserId(userId)
      setOpenDialog(null)
      toast({
        title: "Success", 
        description: `${userName} has been removed from your connections`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove connection",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative max-w-md mx-auto">
        <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search by name, email, or location..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
        />
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Searching for farmers...</p>
        </div>
      )}

      {/* No Results */}
      {!isLoading && searchResults.length === 0 && searchQuery && (
        <div className="text-center py-16">
          <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
            <FiSearch className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No results found</h3>
          <p className="text-gray-600 dark:text-gray-400 max-w-sm mx-auto">
            Try searching with different keywords or check your spelling
          </p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && searchResults.length === 0 && !searchQuery && (
        <div className="text-center py-16">
          <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
            <FiSearch className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Discover farmers</h3>
          <p className="text-gray-600 dark:text-gray-400 max-w-sm mx-auto">
            Use the search bar above to find other farmers and agricultural professionals in your area
          </p>
        </div>
      )}

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {searchResults.map((user) => (
            <div key={user.user_id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200 overflow-hidden">
              <div className="p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <Avatar className="h-14 w-14 ring-2 ring-gray-100 dark:ring-gray-700">
                    <AvatarImage src={user.profile_image} alt={user.full_name} />
                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-600 text-white font-semibold">
                      {user.full_name?.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h4 
                      className="font-semibold text-gray-900 dark:text-white truncate cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      onClick={() => router.push(`/profile/${user.user_id}`)}
                    >
                      {user.full_name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                      {user.email}
                    </p>
                    {user.location && (
                      <p className="text-xs text-gray-500 dark:text-gray-500 flex items-center mt-1">
                        <span className="mr-1">📍</span>
                        {user.location}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  {user.is_connected ? (
                    <Dialog open={openDialog === user.user_id} onOpenChange={(open) => setOpenDialog(open ? user.user_id : null)}>
                      <DialogTrigger asChild>
                        <button 
                          className="w-full bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 font-medium py-2.5 px-4 rounded-full  transition-colors duration-200 flex items-center justify-center space-x-2"
                        >
                          <FiTrash2 className="h-4 w-4" />
                          <span>Remove Connection</span>
                        </button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Remove Connection</DialogTitle>
                          <DialogDescription>
                            Do you really want to remove <strong>{user.full_name}</strong> from your connections? This action cannot be undone.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <button
                            onClick={() => setOpenDialog(null)}
                            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full  transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleRemoveConnection(user.user_id, user.full_name)}
                            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-full  transition-colors"
                          >
                            Yes, Remove
                          </button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  ) : user.request_sent ? (
                    <button 
                      className="w-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium py-2.5 px-4 rounded-full  transition-colors duration-200 flex items-center justify-center space-x-2"
                      onClick={() => cancelConnectionRequest(user.user_id)}
                    >
                      <FiX className="h-4 w-4" />
                      <span>Cancel Request</span>
                    </button>
                  ) : user.request_received ? (
                    <>
                      <button 
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 px-4 rounded-full  transition-colors duration-200 flex items-center justify-center space-x-2"
                        onClick={() => respondToRequestByUserId(user.user_id, "accept")}
                      >
                        <FiCheck className="h-4 w-4" />
                        <span>Accept Request</span>
                      </button>
                      <button 
                        className="w-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium py-2.5 px-4 rounded-full  transition-colors duration-200 flex items-center justify-center space-x-2"
                        onClick={() => respondToRequestByUserId(user.user_id, "reject")}
                      >
                        <FiX className="h-4 w-4" />
                        <span>Decline Request</span>
                      </button>
                    </>
                  ) : (
                    <button 
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-full  transition-colors duration-200 flex items-center justify-center space-x-2"
                      onClick={() => sendConnectionRequest(user.user_id)}
                    >
                      <FiUserPlus className="h-4 w-4" />
                      <span>Connect</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
