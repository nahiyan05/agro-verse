"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { FiPlus, FiMessageSquare, FiTrash2 } from "react-icons/fi"
import { motion, AnimatePresence } from "motion/react"
import { Skeleton } from "@/components/ui/skeleton"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

const ChatSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-3">
    <div className="flex items-center justify-between">
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-8 w-8 rounded-lg" />
    </div>
    <div className="flex items-center space-x-2">
      <Skeleton className="h-4 w-4" />
      <Skeleton className="h-4 w-32" />
    </div>
  </div>
)

export default function ChatbotPage() {
  const router = useRouter()
  const [chats, setChats] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreatingChat, setIsCreatingChat] = useState(false)
  const [error, setError] = useState("")
  const [chatToDelete, setChatToDelete] = useState(null)

  useEffect(() => {
    fetchChats()
  }, [])

  const fetchChats = async () => {
    try {
      const response = await fetch("/api/chatbot", {
        credentials: "include"
      })
      const result = await response.json()

      if (response.ok && result.success) {
        setChats(result.chats || [])
      } else {
        setError(result.message || "Failed to fetch chats")
      }
    } catch (error) {
      console.error("Error fetching chats:", error)
      setError("Network error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const createNewChat = async () => {
    if (isCreatingChat) return

    setIsCreatingChat(true)
    try {
      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({})
      })

      const result = await response.json()

      if (response.ok && result.success) {
        // Navigate to the new chat immediately
        router.push(`/chatbot/${result.chat.id}`)
      } else {
        setError(result.message || "Failed to create chat")
      }
    } catch (error) {
      console.error("Error creating chat:", error)
      setError("Network error occurred")
    } finally {
      setIsCreatingChat(false)
    }
  }

  const deleteChat = async (chatId = chatToDelete) => {
    if (!chatId) return

    try {
      const response = await fetch(`/api/chatbot/${chatId}`, {
        method: "DELETE",
        credentials: "include"
      })

      const result = await response.json()

      if (response.ok && result.success) {
        setChats(chats.filter(chat => chat.id !== chatId))
        setChatToDelete(null)
      } else {
        setError(result.message || "Failed to delete chat")
      }
    } catch (error) {
      console.error("Error deleting chat:", error)
      setError("Network error occurred")
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        {/* Header Skeleton */}
        <div className="text-center space-y-4">
          <Skeleton className="h-8 w-64 mx-auto" />
          <Skeleton className="h-5 w-96 mx-auto" />
          <Skeleton className="h-10 w-48 mx-auto rounded-full" />
        </div>

        {/* Chats Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <ChatSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center space-x-3"
        >
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-3 rounded-full">
            <FiMessageSquare className="text-white text-2xl" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            agroverse Chatbot
          </h1>
        </motion.div>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
        >
          Your friendly farming expert! Ask me about crops, soil, pests, livestock, and more! 🌱
        </motion.p>

        {/* Create New Chat Button */}
        <motion.button
          initial={{ opacity: 0  }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          onClick={createNewChat}
          disabled={isCreatingChat}
          className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-8 py-3 rounded-full font-medium transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 mx-auto"
        >
          <FiPlus className="text-lg" />
          <span>{isCreatingChat ? "Creating..." : "Start New Chat"}</span>
        </motion.button>
      </div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 text-red-800 dark:text-red-300 px-4 py-3 rounded-lg text-center"
        >
          {error}
        </motion.div>
      )}

      {/* Chats Grid */}
      {chats.length === 0 && !isLoading ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16 space-y-4"
        >
          <div className="bg-gray-100 dark:bg-gray-800 p-8 rounded-full w-24 h-24 mx-auto flex items-center justify-center">
            <FiMessageSquare className="text-3xl text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            No chats yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            Start your first conversation with our farming assistant! Ask about crops, soil health, pest control, or any agricultural topic.
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {chats.map((chat, index) => (
              <motion.div
                key={chat.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-200 cursor-pointer group"
                onClick={() => router.push(`/chatbot/${chat.id}`)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-2 rounded-lg group-hover:scale-110 transition-transform duration-200">
                      <FiMessageSquare className="text-white text-lg" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                        {chat.title}
                      </h3>
                    </div>
                  </div>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button
                        onClick={(e) => e.stopPropagation()}
                        className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-lg transition-all duration-200"
                        title="Delete chat"
                      >
                        <FiTrash2 className="text-lg" />
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Chat</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{chat.title}"? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteChat(chat.id)}
                          className="bg-red-500 hover:bg-red-600"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between text-sm text-green-600 dark:text-green-400 group-hover:text-green-700 dark:group-hover:text-green-300 transition-colors duration-200">
                    <span className="font-medium">Open Chat</span>
                    <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Bottom spacing */}
      <div className="h-8" />
    </div>
  )
}
