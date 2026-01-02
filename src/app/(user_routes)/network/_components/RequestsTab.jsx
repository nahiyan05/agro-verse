"use client"

import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { FiUserPlus, FiCheck, FiX } from "react-icons/fi"

export default function RequestsTab({ pendingRequests, respondToRequest }) {
  const router = useRouter()

  if (pendingRequests.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
          <FiUserPlus className="h-12 w-12 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No pending requests</h3>
        <p className="text-gray-600 dark:text-gray-400 max-w-sm mx-auto">
          You'll see connection requests from other farmers here
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {pendingRequests.map((request) => (
        <div key={request.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-14 w-14 ring-2 ring-gray-100 dark:ring-gray-700">
                <AvatarImage src={request.other_user_profile_pic} alt={request.other_user_name} />
                <AvatarFallback className="bg-gradient-to-br from-green-500 to-blue-600 text-white font-semibold">
                  {request.other_user_name?.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h4 
                  className="font-semibold text-gray-900 dark:text-white cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  onClick={() => router.push(`/profile/${request.other_user_id}`)}
                >
                  {request.other_user_name}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center mt-1">
                  <span className="mr-1">📍</span>
                  {request.other_user_area || 'No area specified'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  Sent {new Date(request.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex space-x-3 ml-4">
              <button
                onClick={() => respondToRequest(request.id, "accept")}
                className="bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 px-4 rounded-full transition-colors duration-200 flex items-center space-x-2"
              >
                <FiCheck className="h-4 w-4" />
                <span>Accept</span>
              </button>
              <button
                onClick={() => respondToRequest(request.id, "reject")}
                className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 border border-red-200 dark:border-red-800 font-medium py-2.5 px-4 rounded-full  transition-colors duration-200 flex items-center space-x-2"
              >
                <FiX className="h-4 w-4" />
                <span>Decline</span>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
