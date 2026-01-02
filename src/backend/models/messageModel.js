import sql from "../config/database.js"

export const messageModel = {
  // Create a new message
  async createMessage(messageData) {
    const { conversationId, senderId, content } = messageData
    const result = await sql`
      INSERT INTO messages (conversation_id, sender_id, content, created_at) 
      VALUES (${conversationId}, ${senderId}, ${content.trim()}, NOW())
      RETURNING message_id
    `
    return result[0]
  },

  // Get message with sender information
  async getMessageWithSender(messageId) {
    const result = await sql`
      SELECT m.*, u.name as full_name, u.profile_pic as profile_image 
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.message_id = ${messageId}
    `
    return result[0]
  },

  // Check if user is part of conversation
  async isUserInConversation(conversationId, userId) {
    const result = await sql`
      SELECT conversation_id FROM conversation_participants 
      WHERE conversation_id = ${conversationId} AND user_id = ${userId}
    `
    return result.length > 0
  },

  // Update conversation last message timestamp
  async updateConversationLastMessage(conversationId) {
    await sql`
      UPDATE conversations SET last_message_at = NOW() WHERE conversation_id = ${conversationId}
    `
  },

  // Get messages for a conversation
  async getConversationMessages(conversationId, limit = 50, offset = 0) {
    const result = await sql`
      SELECT m.*, u.name as full_name, u.profile_pic as profile_image 
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.conversation_id = ${conversationId}
      ORDER BY m.created_at ASC
      LIMIT ${limit} OFFSET ${offset}
    `
    return result
  },

  // Get conversations for a user
  async getUserConversations(userId, limit = 20, offset = 0) {
    const result = await sql`
      SELECT DISTINCT
        c.conversation_id,
        c.created_at,
        c.last_message_at,
        (
          SELECT content 
          FROM messages m 
          WHERE m.conversation_id = c.conversation_id 
          ORDER BY m.created_at DESC 
          LIMIT 1
        ) as last_message_content,
        (
          SELECT created_at 
          FROM messages m 
          WHERE m.conversation_id = c.conversation_id 
          ORDER BY m.created_at DESC 
          LIMIT 1
        ) as last_message_time,
        (
          SELECT COUNT(*)
          FROM messages m
          WHERE m.conversation_id = c.conversation_id
          AND m.sender_id != ${userId}
          AND m.is_read = FALSE
        ) as unread_count
      FROM conversations c
      JOIN conversation_participants cp ON c.conversation_id = cp.conversation_id
      WHERE cp.user_id = ${userId}
      ORDER BY c.last_message_at DESC NULLS LAST, c.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `
    return result
  },

  // Get participants for conversations
  async getConversationParticipants(conversationIds) {
    const result = await sql`
      SELECT 
        cp.conversation_id,
        u.id as user_id, 
        u.name as full_name, 
        u.email, 
        u.profile_pic as profile_image
      FROM conversation_participants cp
      JOIN users u ON cp.user_id = u.id
      WHERE cp.conversation_id = ANY(${conversationIds})
      ORDER BY cp.conversation_id, u.name
    `
    return result
  },

  // Create a new conversation
  async createConversation() {
    const result = await sql`
      INSERT INTO conversations (created_at, last_message_at) 
      VALUES (NOW(), NOW())
      RETURNING conversation_id
    `
    return result[0]
  },

  // Add participants to conversation
  async addConversationParticipants(conversationId, userIds) {
    const participants = userIds.map(userId => ({ conversationId, userId }))
    
    for (const participant of participants) {
      await sql`
        INSERT INTO conversation_participants (conversation_id, user_id, joined_at)
        VALUES (${participant.conversationId}, ${participant.userId}, NOW())
        ON CONFLICT (conversation_id, user_id) DO NOTHING
      `
    }
  },

  // Find existing conversation between users
  async findConversationBetweenUsers(user1Id, user2Id) {
    const result = await sql`
      SELECT c.conversation_id
      FROM conversations c
      JOIN conversation_participants cp1 ON c.conversation_id = cp1.conversation_id
      JOIN conversation_participants cp2 ON c.conversation_id = cp2.conversation_id
      WHERE cp1.user_id = ${user1Id} AND cp2.user_id = ${user2Id}
      GROUP BY c.conversation_id
      HAVING COUNT(cp1.conversation_id) = 2
    `
    return result[0]
  },

  // Mark messages as read
  async markMessagesAsRead(conversationId, userId) {
    await sql`
      UPDATE messages 
      SET is_read = TRUE 
      WHERE conversation_id = ${conversationId} 
      AND sender_id != ${userId}
      AND is_read = FALSE
    `
  },

  // Get unread message count for user
  async getUnreadMessageCount(userId) {
    const result = await sql`
      SELECT COUNT(*) as unread_count
      FROM messages m
      JOIN conversation_participants cp ON m.conversation_id = cp.conversation_id
      WHERE cp.user_id = ${userId} 
      AND m.sender_id != ${userId}
      AND m.is_read = FALSE
    `
    return parseInt(result[0].unread_count) || 0
  }
}
