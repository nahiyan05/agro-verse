"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { FiUsers, FiMessageCircle, FiUser, FiTrash2 } from "react-icons/fi"

export default function ConnectionsTab({ connections, removeConnection, toast }) {
  const router = useRouter()
  const [openDialog, setOpenDialog] = useState(null)

  const handleRemoveConnection = async (connectionId, userName) => {
    try {
      await removeConnection(connectionId)
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

  if (connections.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
          <FiUsers className="h-12 w-12 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No connections yet</h3>
        <p className="text-gray-600 dark:text-gray-400 max-w-sm mx-auto">
          Start building your network by discovering and connecting with other farmers
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {connections.map((connection) => (
        <div key={connection.connection_id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200 overflow-hidden">
          <div className="p-6">
            <div className="flex items-center space-x-4 mb-4">
              <Avatar className="h-14 w-14 ring-2 ring-gray-100 dark:ring-gray-700">
                <AvatarImage src={connection.friend_info.profile_pic} alt={connection.friend_info.name} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                  {connection.friend_info.name?.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h4 
                  className="font-semibold text-gray-900 dark:text-white truncate cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  onClick={() => router.push(`/profile/${connection.friend_info.id}`)}
                >
                  {connection.friend_info.name}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                  {connection.friend_info.phone || 'No phone provided'}
                </p>
                {(connection.friend_info.area || connection.friend_info.city) && (
                  <p className="text-xs text-gray-500 dark:text-gray-500 flex items-center mt-1">
                    <span className="mr-1">📍</span>
                    {[connection.friend_info.area, connection.friend_info.city, connection.friend_info.country].filter(Boolean).join(", ")}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex space-x-2">
              <button 
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-full transition-colors duration-200 flex items-center justify-center space-x-2"
                onClick={() => router.push(`/messages?user=${connection.friend_info.id}`)}
              >
                <FiMessageCircle className="h-4 w-4" />
                <span>Message</span>
              </button>
              <button 
                className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium py-2.5 px-4 rounded-full  transition-colors duration-200 flex items-center justify-center space-x-2"
                onClick={() => router.push(`/profile/${connection.friend_info.id}`)}
              >
                <FiUser className="h-4 w-4" />
                <span>Profile</span>
              </button>
              <Dialog open={openDialog === connection.id} onOpenChange={(open) => setOpenDialog(open ? connection.id : null)}>
                <DialogTrigger asChild>
                  <button 
                    className="bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 font-medium py-2.5 px-3 rounded-full  transition-colors duration-200 flex items-center space-x-1"
                  >
                    <FiTrash2 className="h-4 w-4" />
                    <span>Remove</span>
                  </button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Remove Connection</DialogTitle>
                    <DialogDescription>
                      Do you really want to remove <strong>{connection.friend_info.name}</strong> from your connections? This action cannot be undone.
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
                      onClick={() => handleRemoveConnection(connection.id, connection.friend_info.name)}
                      className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-full  transition-colors"
                    >
                      Yes, Remove
                    </button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
