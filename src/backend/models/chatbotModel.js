import sql from "../config/database.js"

export const chatbotModel = {
  // Create a new chat
  async createChat(userId, title) {
    const result = await sql`
      INSERT INTO AIchats (user_id, title)
      VALUES (${userId}, ${title})
      RETURNING id, user_id, title, created_at
    `
    return result[0]
  },

  // Get all chats for a user
  async getUserChats(userId) {
    const result = await sql`
      SELECT id, title, created_at
      FROM AIchats 
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `
    return result
  },

  // Get chat by ID
  async getChatById(chatId, userId) {
    const result = await sql`
      SELECT id, user_id, title, created_at
      FROM AIchats 
      WHERE id = ${chatId} AND user_id = ${userId}
    `
    return result[0]
  },

  // Update chat title
  async updateChatTitle(chatId, userId, newTitle) {
    const result = await sql`
      UPDATE AIchats 
      SET title = ${newTitle}
      WHERE id = ${chatId} AND user_id = ${userId}
      RETURNING id, user_id, title, created_at
    `
    return result[0]
  },

  // Delete chat and all its messages
  async deleteChat(chatId, userId) {
    const result = await sql`
      DELETE FROM AIchats 
      WHERE id = ${chatId} AND user_id = ${userId}
      RETURNING id
    `
    return result[0]
  },

  // Add message to chat
  async addMessage(chatId, role, content, imageUrl = null) {
    const result = await sql`
      INSERT INTO AImessages (chat_id, role, content, image_url)
      VALUES (${chatId}, ${role}, ${content}, ${imageUrl})
      RETURNING id, chat_id, role, content, image_url, timestamp
    `
    return result[0]
  },

  // Get messages for a chat
  async getChatMessages(chatId, userId) {
    // First verify the chat belongs to the user
    const chatExists = await sql`
      SELECT id FROM AIchats 
      WHERE id = ${chatId} AND user_id = ${userId}
    `
    
    if (!chatExists.length) {
      throw new Error("Chat not found or unauthorized")
    }

    const result = await sql`
      SELECT id, role, content, image_url, timestamp
      FROM AImessages 
      WHERE chat_id = ${chatId}
      ORDER BY timestamp ASC
    `
    return result
  },

  // Get latest messages for context (last 20 messages)
  async getRecentMessages(chatId, userId, limit = 20) {
    // First verify the chat belongs to the user
    const chatExists = await sql`
      SELECT id FROM AIchats 
      WHERE id = ${chatId} AND user_id = ${userId}
    `
    
    if (!chatExists.length) {
      throw new Error("Chat not found or unauthorized")
    }

    const result = await sql`
      SELECT role, content, image_url, timestamp
      FROM AImessages 
      WHERE chat_id = ${chatId}
      ORDER BY timestamp DESC
      LIMIT ${limit}
    `
    return result.reverse()
  },

  // Delete a specific message
  async deleteMessage(messageId, userId) {
    const result = await sql`
      DELETE FROM AImessages 
      WHERE id = ${messageId} 
      AND chat_id IN (
        SELECT id FROM AIchats WHERE user_id = ${userId}
      )
      RETURNING id
    `
    return result[0]
  },

  // Get message count for a chat
  async getChatMessageCount(chatId, userId) {
    const result = await sql`
      SELECT COUNT(*) as count
      FROM AImessages m
      JOIN AIchats c ON m.chat_id = c.id
      WHERE c.id = ${chatId} AND c.user_id = ${userId}
    `
    return parseInt(result[0].count)
  }
}
