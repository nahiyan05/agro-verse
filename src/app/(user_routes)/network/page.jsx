"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "motion/react"
import { useToast } from "@/components/ui/use-toast"
import { FiUsers, FiUserCheck, FiUserPlus, FiSearch } from "react-icons/fi"


import ConnectionsTab from "./_components/ConnectionsTab"
import RequestsTab from "./_components/RequestsTab"
import SentTab from "./_components/SentTab"
import DiscoverTab from "./_components/DiscoverTab"

export default function NetworkPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("connections")
  const [connections, setConnections] = useState([])
  const [pendingRequests, setPendingRequests] = useState([])
  const [sentRequests, setSentRequests] = useState([])
  const [searchResults, setSearchResults] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  // Tab configuration
  const tabs = [
    { 
      id: "connections", 
      label: `My Network (${connections.length})`, 
      icon: FiUsers 
    },
    { 
      id: "requests", 
      label: `Requests (${pendingRequests.length})`, 
      icon: FiUserCheck 
    },
    { 
      id: "sent", 
      label: `Sent (${sentRequests.length})`, 
      icon: FiUserPlus 
    },
    { 
      id: "discover", 
      label: "Discover", 
      icon: FiSearch 
    }
  ]

  useEffect(() => {
    fetchConnections()
    fetchConnectionRequests()
  }, [])

  const fetchConnections = async () => {
    try {
      const response = await fetch("/api/user-connections/friends")
      const data = await response.json()
      if (data.success) {
        setConnections(data.connections)
      }
    } catch (error) {
      console.error("Error fetching connections:", error)
    }
  }

  const fetchConnectionRequests = async () => {
    try {
      const response = await fetch("/api/user-connections?type=received")
      const data = await response.json()
      if (data.success) {
        setPendingRequests(data.requests)
      }

      const sentResponse = await fetch("/api/user-connections?type=sent")
      const sentData = await sentResponse.json()
      if (sentData.success) {
        setSentRequests(sentData.requests)
      }
    } catch (error) {
      console.error("Error fetching connection requests:", error)
    }
  }

  const searchUsers = async (query) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/user/search?q=${encodeURIComponent(query)}`)
      const data = await response.json()
      if (data.success) {
        setSearchResults(data.users)
      }
    } catch (error) {
      console.error("Error searching users:", error)
      toast({
        title: "Error",
        description: "Failed to search users",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const sendConnectionRequest = async (userId) => {
    try {
      const response = await fetch("/api/user-connections", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ receiverId: userId }),
      })

      const data = await response.json()
      if (data.success) {
        toast({
          title: "Success",
          description: "Connection request sent successfully",
        })
        // Update search results to show request sent
        setSearchResults(prev => 
          prev.map(user => 
            user.user_id === userId 
              ? { ...user, request_sent: true }
              : user
          )
        )
      } else {
        throw new Error(data.message)
      }
    } catch (error) {
      console.error("Error sending connection request:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to send connection request",
        variant: "destructive",
      })
    }
  }

  const respondToRequest = async (requestId, action) => {
    try {
      const response = await fetch(`/api/user-connections/${requestId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ response: action === "accept" ? "accepted" : "rejected" }),
      })

      const data = await response.json()
      if (data.success) {
        toast({
          title: "Success",
          description: `Connection request ${action}ed successfully`,
        })
        fetchConnectionRequests()
        if (action === "accept") {
          fetchConnections()
        }
      } else {
        throw new Error(data.message)
      }
    } catch (error) {
      console.error("Error responding to request:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to respond to request",
        variant: "destructive",
      })
    }
  }

  const removeConnection = async (connectionId) => {
    try {
      const response = await fetch(`/api/user-connections/${connectionId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()
      if (data.success) {
        fetchConnections()
        return { success: true }
      } else {
        throw new Error(data.message)
      }
    } catch (error) {
      console.error("Error removing connection:", error)
      throw error
    }
  }

  const removeConnectionByUserId = async (userId) => {
    try {
      const connection = connections.find(conn => 
        conn.friend_info.id === userId
      )
      
      if (connection) {
        await removeConnection(connection.id)
        if (searchQuery) {
          searchUsers(searchQuery)
        }
        return { success: true }
      }
    } catch (error) {
      console.error("Error removing connection by user ID:", error)
      throw error
    }
  }

  const cancelConnectionRequest = async (userId) => {
    try {
      // Find the sent request
      const request = sentRequests.find(req => req.other_user_id === userId)
      
      if (request) {
        const response = await fetch(`/api/user-connections/${request.id}`, {
          method: "DELETE",
        })

        const data = await response.json()
        if (data.success) {
          toast({
            title: "Success",
            description: "Connection request cancelled",
          })
          fetchConnectionRequests()
          // Refresh search results to update button state
          if (searchQuery) {
            searchUsers(searchQuery)
          }
        } else {
          throw new Error(data.message)
        }
      }
    } catch (error) {
      console.error("Error cancelling request:", error)
      toast({
        title: "Error",
        description: "Failed to cancel request",
        variant: "destructive",
      })
    }
  }

  const respondToRequestByUserId = async (userId, action) => {
    try {
      // Find the pending request from this user
      const request = pendingRequests.find(req => req.other_user_id === userId)
      
      if (request) {
        await respondToRequest(request.id, action)
        // Refresh search results to update button state
        if (searchQuery) {
          searchUsers(searchQuery)
        }
      }
    } catch (error) {
      console.error("Error responding to request by user ID:", error)
      toast({
        title: "Error",
        description: "Failed to respond to request",
        variant: "destructive",
      })
    }
  }

  const handleSearchChange = (e) => {
    const query = e.target.value
    setSearchQuery(query)
    
    // Debounce search
    const timeoutId = setTimeout(() => {
      searchUsers(query)
    }, 300)

    return () => clearTimeout(timeoutId)
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-blue-100 dark:bg-blue-900/30 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
            <FiUsers className="h-10 w-10 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Network</h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Connect with fellow farmers, build your agricultural network, and grow together in the farming community
          </p>
        </div>

        {/*  Navigation */}
        <div className="flex justify-center mb-8">
          <div className="relative w-full sm:w-[80%] lg:w-[60%] flex space-x-1 bg-gray-200 dark:bg-gray-800 rounded-full p-1">
            <motion.div
              className="absolute top-1 bottom-1 bg-white dark:bg-gray-700 rounded-full shadow-sm"
              initial={false}
              animate={{
                x: `${tabs.findIndex((tab) => tab.id === activeTab) * 98}%`,
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
              }}
              style={{ width: `calc(100% / ${tabs.length})` }}
            />
            {tabs.map((tab) => {
              const IconComponent = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative z-10 flex-1 px-4 py-3 rounded-full text-sm font-medium transition-colors flex items-center justify-center space-x-2 ${
                    activeTab === tab.id
                      ? "text-gray-900 dark:text-white"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  <IconComponent className="h-4 w-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className=" p-6">
          {activeTab === "connections" && (
            <ConnectionsTab
              connections={connections}
              removeConnection={removeConnection}
              toast={toast}
            />
          )}
          
          {activeTab === "requests" && (
            <RequestsTab
              pendingRequests={pendingRequests}
              respondToRequest={respondToRequest}
            />
          )}
          
          {activeTab === "sent" && (
            <SentTab
              sentRequests={sentRequests}
              cancelConnectionRequest={cancelConnectionRequest}
            />
          )}
          
          {activeTab === "discover" && (
            <DiscoverTab
              searchQuery={searchQuery}
              handleSearchChange={handleSearchChange}
              searchResults={searchResults}
              isLoading={isLoading}
              sendConnectionRequest={sendConnectionRequest}
              removeConnectionByUserId={removeConnectionByUserId}
              cancelConnectionRequest={cancelConnectionRequest}
              respondToRequestByUserId={respondToRequestByUserId}
              toast={toast}
            />
          )}
        </div>
      </div>
    </div>
  )
}
