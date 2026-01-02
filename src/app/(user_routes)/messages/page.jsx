"use client"

import { useState, useEffect, useRef, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getUserFromStorage } from "@/lib/auth"
import { FiMessageSquare, FiSend, FiUser } from "react-icons/fi"

function MessagesContent() {
  const [conversations, setConversations] = useState([])
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState("")
  const [currentUser, setCurrentUser] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [notification, setNotification] = useState(null)
  const messagesEndRef = useRef(null)
  const searchParams = useSearchParams()
  const router = useRouter()
  const userParam = searchParams.get("user")

  useEffect(() => {
    const user = getUserFromStorage()
    setCurrentUser(user)
    fetchConversations()

    // If user parameter is provided, start conversation with that user
    if (userParam) {
      startConversationWithUser(userParam)
    }
  }, [userParam])

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.conversation_id)
    }
  }, [selectedConversation])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const showNotification = (message, type = "error") => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 5000)
  }

  const fetchConversations = async () => {
    try {
      const response = await fetch("/api/messages/conversations")
      const data = await response.json()
      if (data.success) {
        setConversations(data.conversations)
      }
    } catch (error) {
      console.error("Error fetching conversations:", error)
      showNotification("Failed to load conversations")
    }
  }

  const fetchMessages = async (conversationId) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/messages/${conversationId}`)
      const data = await response.json()
      if (data.success) {
        setMessages(data.messages)
      } else {
        showNotification(data.message || "Failed to load messages")
      }
    } catch (error) {
      console.error("Error fetching messages:", error)
      showNotification("Failed to load messages")
    } finally {
      setIsLoading(false)
    }
  }

  const startConversationWithUser = async (userId) => {
    try {
      const response = await fetch("/api/messages/conversations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ participantId: userId }),
      })

      const data = await response.json()
      if (data.success) {
        setSelectedConversation(data.conversation)
        fetchConversations()
      } else {
        throw new Error(data.message)
      }
    } catch (error) {
      console.error("Error starting conversation:", error)
      showNotification(error.message || "Failed to start conversation")
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || isSending) return

    setIsSending(true)
    const messageText = newMessage.trim()
    setNewMessage("")

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conversationId: selectedConversation.conversation_id,
          content: messageText,
        }),
      })

      const data = await response.json()
      if (data.success) {
        setMessages(prev => [...prev, data.message])
        fetchConversations()
        showNotification("Message sent!", "success")
      } else {
        throw new Error(data.message)
      }
    } catch (error) {
      console.error("Error sending message:", error)
      setNewMessage(messageText)
      showNotification(error.message || "Failed to send message")
    } finally {
      setIsSending(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const formatMessageTime = (timestamp) => {
    const now = new Date()
    const messageTime = new Date(timestamp)
    const diffInDays = Math.floor((now.getTime() - messageTime.getTime()) / (1000 * 60 * 60 * 24))

    if (diffInDays === 0) {
      return messageTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } else if (diffInDays === 1) {
      return 'Yesterday'
    } else if (diffInDays < 7) {
      return messageTime.toLocaleDateString([], { weekday: 'long' })
    } else {
      return messageTime.toLocaleDateString([], { month: 'short', day: 'numeric' })
    }
  }

  return (
    <div className="min-h-scree">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
          notification.type === "success" ? "bg-green-500" : "bg-red-500"
        } text-white`}>
          {notification.message}
        </div>
      )}

      <div className="container mx-auto p-6 h-screen flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Messages</h1>
          </div>
          <div className="p-3 bg-green-100 dark:bg-green-800 rounded-full">
            <FiMessageSquare className="h-8 w-8 text-green-600 dark:text-green-300" />
          </div>
        </div>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden">
          {/* Conversations List */}
          <div className="lg:col-span-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Conversations</h2>
              <p className="text-sm text-gray-600 dark:text-gray-300">Your recent messages</p>
            </div>
            
            <div className="overflow-y-auto h-full">
              {conversations.length === 0 ? (
                <div className="text-center p-8">
                  <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <FiMessageSquare className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">No conversations yet</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Start messaging your connections from the Network page</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                  {conversations.map((conversation) => {
                    const otherParticipant = conversation.participants?.find(
                      p => p.user_id !== currentUser?.id
                    )
                    const isSelected = selectedConversation?.conversation_id === conversation.conversation_id
                    const lastMessageContent = typeof conversation.last_message === 'object' 
                      ? conversation.last_message?.content || 'No messages yet'
                      : conversation.last_message || 'No messages yet'

                    return (
                      <div
                        key={conversation.conversation_id}
                        className={`p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                          isSelected ? 'bg-green-50 dark:bg-green-900/30 border-r-4 border-green-400 dark:border-green-500' : ''
                        }`}
                        onClick={() => setSelectedConversation(conversation)}
                      >
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-12 w-12 border-2 border-gray-200 dark:border-gray-600">
                            <AvatarImage src={otherParticipant?.profile_image} />
                            <AvatarFallback className="bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-300 font-semibold">
                              {otherParticipant?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h4 
                                className="font-semibold text-gray-800 dark:text-gray-200 truncate cursor-pointer hover:text-green-600 dark:hover:text-green-400 transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  router.push(`/profile/${otherParticipant?.user_id}`)
                                }}
                              >
                                {otherParticipant?.full_name || 'Unknown User'}
                              </h4>
                              {conversation.last_message_at && (
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {formatMessageTime(conversation.last_message_at)}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                              {lastMessageContent}
                            </p>
                          </div>
                          {conversation.unread_count > 0 && (
                            <div className="bg-red-500 dark:bg-red-600 text-white rounded-full px-2 py-1 text-xs font-semibold min-w-[20px] text-center">
                              {conversation.unread_count}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10 border-2 border-gray-200 dark:border-gray-600">
                      <AvatarImage src={
                        selectedConversation.participants?.find(
                          p => p.user_id !== currentUser?.id
                        )?.profile_image
                      } />
                      <AvatarFallback className="bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-300 font-semibold">
                        {selectedConversation.participants?.find(
                          p => p.user_id !== currentUser?.id
                        )?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 
                        className="font-semibold text-gray-800 dark:text-gray-200 cursor-pointer hover:text-green-600 dark:hover:text-green-400 transition-colors"
                        onClick={() => {
                          const otherUser = selectedConversation.participants?.find(
                            p => p.user_id !== currentUser?.id
                          )
                          router.push(`/profile/${otherUser?.user_id}`)
                        }}
                      >
                        {selectedConversation.participants?.find(
                          p => p.user_id !== currentUser?.id
                        )?.full_name || 'Unknown User'}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {selectedConversation.participants?.find(
                          p => p.user_id !== currentUser?.id
                        )?.email || 'No email'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900" style={{maxHeight: "calc(100vh - 300px)"}}>
                  {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400"></div>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center h-full flex items-center justify-center">
                      <div>
                        <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                          <FiMessageSquare className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">Start the conversation</h3>
                        <p className="text-gray-600 dark:text-gray-400">Send your first message below</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      {messages.map((message) => {
                        const isOwnMessage = message.sender_id === currentUser?.id
                        
                        return (
                          <div
                            key={message.message_id}
                            className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className={`max-w-[70%] ${isOwnMessage ? 'order-2' : 'order-1'}`}>
                              <div
                                className={`rounded-full px-4 py-3 ${
                                  isOwnMessage
                                    ? 'bg-green-500 dark:bg-green-600 text-white'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                                }`}
                              >
                                <p className="text-sm leading-relaxed">{message.content}</p>
                              </div>
                              <p className={`text-xs text-gray-500 dark:text-gray-400 mt-1 px-1 ${
                                isOwnMessage ? 'text-right' : 'text-left'
                              }`}>
                                {formatMessageTime(message.created_at)}
                              </p>
                            </div>
                          </div>
                        )
                      })}
                      <div ref={messagesEndRef} />
                    </>
                  )}
                </div>

                {/* Message Input */}
                <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-700">
                  <div className="flex space-x-3">
                    <input
                      type="text"
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="flex-1 px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-green-400 dark:focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400"
                      disabled={isSending}
                    />
                    <button 
                      onClick={sendMessage} 
                      disabled={!newMessage.trim() || isSending}
                      className="bg-green-400 hover:bg-green-500 dark:bg-green-600 dark:hover:bg-green-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white rounded-full p-3 transition-colors focus:outline-none focus:ring-2 focus:ring-green-400 dark:focus:ring-green-500 focus:ring-offset-2"
                    >
                      <FiSend className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="text-center">
                  <div className="p-6 bg-gray-100 dark:bg-gray-700 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                    <FiMessageSquare className="h-12 w-12 text-gray-400 dark:text-gray-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">Select a conversation</h3>
                  <p className="text-gray-600 dark:text-gray-400">Choose a conversation from the left to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function MessagesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400 dark:border-green-500"></div>
      </div>
    }>
      <MessagesContent />
    </Suspense>
  )
}
