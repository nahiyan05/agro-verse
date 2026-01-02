// @ts-nocheck
"use client"
import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { FiEdit, FiMail, FiPhone, FiMapPin, FiCalendar, FiUser, FiMap, FiLayers, FiMessageSquare, FiTrendingUp, FiSend } from "react-icons/fi"
import { FaSeedling } from "react-icons/fa";
import { FaUserPlus } from "react-icons/fa6"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import LandStatsCard from "./_components/LandStatsCard"
import ForumStatsCard from "./_components/ForumStatsCard"
import CropPlansCard from "./_components/CropPlansCard"
import EditProfileDialog from "./_components/editprofile"
import Image from "next/image";
import { getUserFromStorage } from "@/lib/auth"
import "./_components/ProfileStyles.css"

export default function ProfilePage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  
  const [user, setUser] = useState(null)
  const [currentUser, setCurrentUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [requestSent, setRequestSent] = useState(false)
  const [connections, setConnections] = useState([])
  const [connectionRequests, setConnectionRequests] = useState([])
  const [isOwnProfile, setIsOwnProfile] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState(null) 

  useEffect(() => {
    const loggedInUser = getUserFromStorage()
    if (loggedInUser) {
      setCurrentUser(loggedInUser)
      setIsOwnProfile(loggedInUser.id.toString() === params.id)
    }
    fetchUserProfile(loggedInUser)
    fetchConnectionRequests()
  }, [params.id])

  // Separate useEffect for fetching connections after isOwnProfile is determined
  useEffect(() => {
    if (currentUser !== null) { // Only fetch connections after currentUser is set
      fetchConnections()
    }
  }, [params.id, isOwnProfile, currentUser])


  useEffect(() => {
    checkConnectionStatus()
  }, [connections, connectionRequests, params.id])

  const checkConnectionStatus = () => {
    if (!params.id || !currentUser) return

    // Don't check connection status for own profile
    if (isOwnProfile) return

    // Check if already connected
    const isConnected = connections.some(conn => 
      conn.friend_info?.id?.toString() === params.id.toString()
    )
    
    if (isConnected) {
      setConnectionStatus('connected')
      return
    }

    // Check if request already sent or received
    const existingRequest = connectionRequests.find(req => {
      const isRelatedToThisUser = (
        req.other_user_id?.toString() === params.id.toString() ||
        req.requester_id?.toString() === params.id.toString() ||
        req.receiver_id?.toString() === params.id.toString()
      )
      return isRelatedToThisUser && req.status === 'pending'
    })

    if (existingRequest) {
      // Determine if current user sent the request or received it
      if (existingRequest.requester_id?.toString() === currentUser?.id?.toString()) {
        setConnectionStatus('sent')
        setRequestSent(true)
      } else {
        setConnectionStatus('pending')
      }
    } else {
      setConnectionStatus(null)
      setRequestSent(false)
    }
  }

  const fetchConnectionRequests = async () => {
    try {
      const response = await fetch("/api/user-connections?type=all", {
        credentials: "include"
      })
      const result = await response.json()
      if (response.ok && result.success) {
        setConnectionRequests(result.requests || [])
      }
    } catch (error) {
      console.error("Error fetching connection requests:", error)
    }
  }

  const fetchUserProfile = async (loggedInUser) => {
    try {
      let url = "/api/user/profile"
      
      // If not own profile, add userId query param
      if (loggedInUser && loggedInUser.id.toString() !== params.id) {
        url += `?userId=${params.id}`
      }

      const response = await fetch(url, { credentials: "include" })
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setUser(result.user)
        } else {
          console.error("API error fetching profile:", result.message)
          setUser(null)
        }
      } else {
        console.error("HTTP error fetching profile:", response.status)
        setUser(null)
      }
    } catch (error) {
      console.error("Network error fetching profile:", error)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchConnections = async () => {
    try {
      // Always fetch current user's connections to check connection status
      const response = await fetch("/api/user-connections/friends", {
        credentials: "include"
      })
      const result = await response.json()
      if (response.ok && result.success) {
        setConnections(result.connections || [])
      }
    } catch (error) {
      console.error("Error fetching connections:", error)
    }
  }

  const handleConnect = async () => {
    try {
      const response = await fetch("/api/user-connections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ receiverId: params.id })
      })
      const result = await response.json()

      if (response.ok && result.success) {
        toast({
          title: "Success",
          description: "Connection request sent!",
        })
        setConnectionStatus('sent')
        setRequestSent(true)
        fetchConnectionRequests() // Refresh connection requests
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to send request",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Network Error",
        description: "A network error occurred.",
        variant: "destructive"
      })
    }
  }

  const handleMessage = () => {
    if (connectionStatus !== 'connected') {
      toast({
        title: "Not Connected",
        description: "You can only message users you are connected with.",
        variant: "destructive"
      })
      return
    }

    // Simply redirect to messages tab
    router.push('/messages')
  }

  const handleProfileUpdate = (updatedUser) => {
    setUser(updatedUser)
    if (typeof window !== "undefined") {
      localStorage.setItem("user", JSON.stringify(updatedUser))
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-4 sm:p-6 min-h-screen">
        {/* Profile section skeleton */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-slate-800 dark:to-slate-900 rounded-xl p-6 border border-green-200 dark:border-slate-700 shadow-lg dark:shadow-2xl mb-6">
          <div className="flex flex-col sm:flex-row items-center gap-6 mb-6">
            <Skeleton className="w-24 h-24 sm:w-32 sm:h-32 rounded-lg" />
            <div className="text-center sm:text-left flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-8 w-48 mx-auto sm:mx-0" />
                  <Skeleton className="h-4 w-64 mx-auto sm:mx-0" />
                  <Skeleton className="h-4 w-40 mx-auto sm:mx-0" />
                </div>
                <Skeleton className="h-10 w-32 mt-4 sm:mt-0" />
              </div>
            </div>
          </div>
          
          <div className="space-y-4 mb-6">
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="w-8 h-8 rounded-lg" />
                  <div className="space-y-1">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-gray-200 dark:border-slate-700 shadow-md dark:shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <Skeleton className="w-8 h-8 rounded-lg" />
                <Skeleton className="h-5 w-24" />
              </div>
              <div className="text-center">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Skeleton className="h-8 w-16 mx-auto mb-2" />
                    <Skeleton className="h-4 w-20 mx-auto" />
                  </div>
                  <div>
                    <Skeleton className="h-8 w-16 mx-auto mb-2" />
                    <Skeleton className="h-4 w-20 mx-auto" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-xl text-gray-600 dark:text-gray-400">Could not load user profile.</p>
        <p className="text-gray-500">Please try refreshing the page.</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 min-h-screen">
      {/* Profile Section */}
      <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-slate-800 dark:to-slate-900 rounded-xl p-6 border border-green-200 dark:border-slate-700 shadow-lg dark:shadow-2xl mb-6">
        {/* Profile Header */}
        <div className="flex flex-col sm:flex-row items-center gap-6 mb-6">
          <div className="relative flex h-24 w-24 sm:h-32 sm:w-32 shrink-0 overflow-hidden rounded-full shadow-lg">
            {user.profile_pic ? (
              <Image
                  src={user.profile_pic}
                  alt={user.name}
                  width={200} 
                  height={200}
                  className="aspect-square h-full w-full object-cover"
                />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-green-600 text-white">
                <span className="text-3xl font-bold">{user.name?.charAt(0)?.toUpperCase()}</span>
              </div>
            )}
          </div>
          <div className="text-center sm:text-left flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{user.name}</h2>
                {user.email && (
                  <div className="flex items-center justify-center sm:justify-start gap-2 mt-2 text-gray-700 dark:text-gray-300">
                    <FiMail className="h-4 w-4" />
                    <span>{user.email}</span>
                  </div>
                )}
                {user.created_at && (
                  <div className="flex items-center justify-center sm:justify-start gap-2 mt-1 text-sm text-gray-600 dark:text-gray-400">
                    <FiCalendar className="h-4 w-4" />
                    <span>Joined {new Date(user.created_at).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
              
              {isOwnProfile ? (
                <button 
                  onClick={() => setIsEditDialogOpen(true)} 
                  className="inline-flex items-center justify-center rounded-full text-sm font-medium h-10 px-4 py-2 bg-green-600 text-white  hover:-translate-y-1 cursor-pointer transition-all duration-300 mt-4 sm:mt-0 shadow-md hover:shadow-lg"
                >
                  <FiEdit className="mr-2 h-4 w-4" /> Edit Profile
                </button>
              ) : (
                <div className="flex items-start flex-col md:flex-row gap-4 mt-4 sm:mt-0">
                  {/* Connection count - enhanced styling */}
                  <div 
                    className="text-center mx-auto flex-shrink-0 mt-2 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-xl p-3 border border-green-200/50 dark:border-slate-700/50"
                  >
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {connections.length}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                      connections
                    </div>
                  </div>
                 
                  <div className="flex flex-row md:flex-col gap-3 min-w-[140px]">
                    <button
                      onClick={handleConnect}
                      disabled={connectionStatus === 'sent' || connectionStatus === 'connected' || connectionStatus === 'pending'}
                      className={`
                        inline-flex items-center justify-center rounded-full text-sm font-semibold
                        h-11 w-full px-4 py-2 transition-all duration-300 shadow-lg hover:shadow-xl
                        transform hover:scale-[1.02] active:scale-[0.98]
                        ${connectionStatus === 'sent' || connectionStatus === 'connected' || connectionStatus === 'pending'
                          ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white cursor-default'
                          : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 cursor-pointer'
                        }
                      `}
                    >
                      {connectionStatus === 'connected' ? (
                        <>
                          <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <span className="whitespace-nowrap">Connected</span>
                        </>
                      ) : connectionStatus === 'sent' ? (
                        <>
                          <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <span className="whitespace-nowrap">Request Sent</span>
                        </>
                      ) : connectionStatus === 'pending' ? (
                        <>
                          <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="whitespace-nowrap">Request Received</span>
                        </>
                      ) : (
                        <>
                          <FaUserPlus className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span className="whitespace-nowrap">Connect</span>
                        </>
                      )}
                    </button>

                    {/* Message Button - Only show for connected users */}
                    {connectionStatus === 'connected' && (
                      <button
                        onClick={handleMessage}
                        className="
                          inline-flex items-center justify-center rounded-full text-sm font-semibold
                          h-11 w-full px-4 py-2 transition-all duration-300 shadow-lg hover:shadow-xl
                          transform hover:scale-[1.02] active:scale-[0.98]
                          bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700 cursor-pointer
                        "
                      >
                        <FiSend className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span className="whitespace-nowrap">Message</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="mb-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6">
            {user.phone && (
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg shadow-sm">
                  <FiPhone className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Phone</p>
                  <p className="font-medium text-gray-900 dark:text-white">{user.phone}</p>
                </div>
              </div>
            )}
            
            {user.age && (
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg shadow-sm">
                  <FiUser className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Age</p>
                  <p className="font-medium text-gray-900 dark:text-white">{user.age} years old</p>
                </div>
              </div>
            )}
            
            {(user.city || user.country) && (
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg shadow-sm">
                  <FiMapPin className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Location</p>
                  <p className="font-medium text-gray-900 dark:text-white">{[user.city, user.country].filter(Boolean).join(", ")}</p>
                </div>
              </div>
            )}

            {user.area && (
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg shadow-sm">
                  <FiMapPin className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Area</p>
                  <p className="font-medium text-gray-900 dark:text-white">{user.area}</p>
                </div>
              </div>
            )}
            
            {user.preferred_crops?.length > 0 && (
              <div className="flex items-start gap-3 lg:col-span-2">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg shadow-sm">
                  <FaSeedling className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Preferred Crops</p>
                  <div className="flex flex-wrap gap-2">
                    {user.preferred_crops.map((crop, i) => (
                      <div key={i} className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200 shadow-sm">
                        {crop}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards  */}
      <div className="space-y-6">
        {/* Top Row - Land and Forum Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Land Statistics */}
          <LandStatsCard userId={params.id} isOwnProfile={isOwnProfile} />

          {/* Forum Statistics */}
          <ForumStatsCard userId={params.id} isOwnProfile={isOwnProfile} />
        </div>

        {/* Bottom Row - Crop Plans Full Width */}
        <div className="w-full">
          <CropPlansCard userId={params.id} isOwnProfile={isOwnProfile} />
        </div>
      </div>

      {isOwnProfile && (
        <EditProfileDialog 
          isOpen={isEditDialogOpen} 
          onClose={() => setIsEditDialogOpen(false)} 
          user={user} 
          onProfileUpdate={handleProfileUpdate} 
        />
      )}
    </div>
  )
}