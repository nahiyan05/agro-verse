import { messageModel } from "../models/messageModel.js"

export const messageController = {
  // Send a message
  async sendMessage(senderId, messageData) {
    try {
      const { conversationId, content } = messageData

      if (!conversationId || !content?.trim()) {
        return {
          success: false,
          message: "Conversation ID and content are required",
          status: 400
        }
      }

      // Verify user is part of the conversation
      const isUserInConversation = await messageModel.isUserInConversation(conversationId, senderId)
      if (!isUserInConversation) {
        return {
          success: false,
          message: "You are not part of this conversation",
          status: 403
        }
      }

      // Create the message
      const messageResult = await messageModel.createMessage({
        conversationId,
        senderId,
        content: content.trim()
      })

      // Update conversation last_message_at
      await messageModel.updateConversationLastMessage(conversationId)

      // Get the created message with sender info
      const message = await messageModel.getMessageWithSender(messageResult.message_id)

      return {
        success: true,
        data: {
          message_id: message.message_id,
          conversation_id: message.conversation_id,
          sender_id: message.sender_id,
          content: message.content,
          created_at: message.created_at,
          sender: {
            full_name: message.full_name,
            profile_image: message.profile_image
          }
        },
        message: "Message sent successfully",
        status: 201
      }

    } catch (error) {
      console.error("Send message controller error:", error)
      return {
        success: false,
        message: "Failed to send message",
        error: process.env.NODE_ENV === "development" ? error.message : undefined,
        status: 500
      }
    }
  },

  // Get messages for a conversation
  async getConversationMessages(userId, conversationId, page = 1, limit = 50) {
    try {
      if (!conversationId) {
        return {
          success: false,
          message: "Conversation ID is required",
          status: 400
        }
      }

      // Verify user is part of the conversation
      const isUserInConversation = await messageModel.isUserInConversation(conversationId, userId)
      if (!isUserInConversation) {
        return {
          success: false,
          message: "You are not part of this conversation",
          status: 403
        }
      }

      const offset = (page - 1) * limit
      const messages = await messageModel.getConversationMessages(conversationId, limit, offset)

      // Mark messages as read
      await messageModel.markMessagesAsRead(conversationId, userId)

      return {
        success: true,
        data: messages.map(msg => ({
          message_id: msg.message_id,
          conversation_id: msg.conversation_id,
          sender_id: msg.sender_id,
          content: msg.content,
          created_at: msg.created_at,
          is_read: msg.is_read,
          sender: {
            full_name: msg.full_name,
            profile_image: msg.profile_image
          }
        })),
        pagination: {
          page,
          limit,
          hasMore: messages.length === limit
        },
        message: "Messages retrieved successfully",
        status: 200
      }

    } catch (error) {
      console.error("Get conversation messages controller error:", error)
      return {
        success: false,
        message: "Failed to get messages",
        error: process.env.NODE_ENV === "development" ? error.message : undefined,
        status: 500
      }
    }
  },

  // Get user conversations
  async getUserConversations(userId, page = 1, limit = 20) {
    try {
      const offset = (page - 1) * limit
      const conversations = await messageModel.getUserConversations(userId, limit, offset)

      if (conversations.length === 0) {
        return {
          success: true,
          data: [],
          pagination: {
            page,
            limit,
            hasMore: false
          },
          message: "No conversations found",
          status: 200
        }
      }

      // Get participants for all conversations
      const conversationIds = conversations.map(c => c.conversation_id)
      const participants = await messageModel.getConversationParticipants(conversationIds)

      // Group participants by conversation
      const participantsByConversation = participants.reduce((acc, participant) => {
        if (!acc[participant.conversation_id]) {
          acc[participant.conversation_id] = []
        }
        acc[participant.conversation_id].push({
          user_id: participant.user_id,
          full_name: participant.full_name,
          email: participant.email,
          profile_image: participant.profile_image
        })
        return acc
      }, {})

      return {
        success: true,
        data: conversations.map(conv => ({
          conversation_id: conv.conversation_id,
          created_at: conv.created_at,
          last_message_at: conv.last_message_at,
          last_message: {
            content: conv.last_message_content,
            created_at: conv.last_message_time
          },
          unread_count: parseInt(conv.unread_count) || 0,
          participants: participantsByConversation[conv.conversation_id] || []
        })),
        pagination: {
          page,
          limit,
          hasMore: conversations.length === limit
        },
        message: "Conversations retrieved successfully",
        status: 200
      }

    } catch (error) {
      console.error("Get user conversations controller error:", error)
      return {
        success: false,
        message: "Failed to get conversations",
        error: process.env.NODE_ENV === "development" ? error.message : undefined,
        status: 500
      }
    }
  },

  // Start a new conversation
  async startConversation(userId, otherUserId) {
    try {
      if (!otherUserId || userId === otherUserId) {
        return {
          success: false,
          message: "Valid other user ID is required",
          status: 400
        }
      }

      // Check if conversation already exists between these users
      let conversation = await messageModel.findConversationBetweenUsers(userId, otherUserId)

      if (!conversation) {
        // Create new conversation
        const newConversation = await messageModel.createConversation()
        await messageModel.addConversationParticipants(newConversation.conversation_id, [userId, otherUserId])
        conversation = newConversation
      }

      return {
        success: true,
        data: {
          conversation_id: conversation.conversation_id
        },
        message: "Conversation ready",
        status: 200
      }

    } catch (error) {
      console.error("Start conversation controller error:", error)
      return {
        success: false,
        message: "Failed to start conversation",
        error: process.env.NODE_ENV === "development" ? error.message : undefined,
        status: 500
      }
    }
  },

  // Get unread message count
  async getUnreadMessageCount(userId) {
    try {
      const unreadCount = await messageModel.getUnreadMessageCount(userId)

      return {
        success: true,
        data: {
          unread_count: unreadCount
        },
        message: "Unread count retrieved successfully",
        status: 200
      }

    } catch (error) {
      console.error("Get unread message count controller error:", error)
      return {
        success: false,
        message: "Failed to get unread count",
        error: process.env.NODE_ENV === "development" ? error.message : undefined,
        status: 500
      }
    }
  }
}
