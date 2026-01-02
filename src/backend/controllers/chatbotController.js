import { chatbotModel } from "../models/chatbotModel.js"
import { uploadPicture } from "@/lib/cloudinary.js"

export const chatbotController = {
  // Create a new chat
  async createChat(userId, title = null) {
    try {
      // Generate auto title if not provided
      if (!title) {
        const existingChats = await chatbotModel.getUserChats(userId)
        const chatCount = existingChats.length + 1
        title = `Farming ${chatCount}`
      }

      const newChat = await chatbotModel.createChat(userId, title)
      
      return {
        success: true,
        chat: newChat,
        message: "Chat created successfully"
      }
    } catch (error) {
      console.error("Create chat error:", error)
      return {
        success: false,
        message: error.message
      }
    }
  },

  // Get all user chats
  async getUserChats(userId) {
    try {
      const chats = await chatbotModel.getUserChats(userId)
      
      return {
        success: true,
        chats,
        message: "Chats retrieved successfully"
      }
    } catch (error) {
      console.error("Get user chats error:", error)
      return {
        success: false,
        message: error.message
      }
    }
  },

  // Get chat by ID with messages
  async getChatWithMessages(chatId, userId) {
    try {
      const chat = await chatbotModel.getChatById(chatId, userId)
      if (!chat) {
        throw new Error("Chat not found or unauthorized")
      }

      const messages = await chatbotModel.getChatMessages(chatId, userId)
      
      return {
        success: true,
        chat: {
          ...chat,
          messages
        },
        message: "Chat retrieved successfully"
      }
    } catch (error) {
      console.error("Get chat with messages error:", error)
      return {
        success: false,
        message: error.message
      }
    }
  },

  // Update chat title
  async updateChatTitle(chatId, userId, newTitle) {
    try {
      if (!newTitle || newTitle.trim().length === 0) {
        throw new Error("Title cannot be empty")
      }

      const updatedChat = await chatbotModel.updateChatTitle(chatId, userId, newTitle.trim())
      if (!updatedChat) {
        throw new Error("Chat not found or unauthorized")
      }

      return {
        success: true,
        chat: updatedChat,
        message: "Chat title updated successfully"
      }
    } catch (error) {
      console.error("Update chat title error:", error)
      return {
        success: false,
        message: error.message
      }
    }
  },

  // Delete chat
  async deleteChat(chatId, userId) {
    try {
      const deleted = await chatbotModel.deleteChat(chatId, userId)
      if (!deleted) {
        throw new Error("Chat not found or unauthorized")
      }

      return {
        success: true,
        message: "Chat deleted successfully"
      }
    } catch (error) {
      console.error("Delete chat error:", error)
      return {
        success: false,
        message: error.message
      }
    }
  },

  // Send message and get AI response
  async sendMessage(chatId, userId, content, imageFile = null) {
    try {
      // Verify chat exists and belongs to user
      const chat = await chatbotModel.getChatById(chatId, userId)
      if (!chat) {
        throw new Error("Chat not found or unauthorized")
      }

      let imageUrl = null

      // Handle image upload if provided
      if (imageFile) {
        const uploadResult = await uploadPicture(imageFile, "agroverse/chatbot-images")
        if (!uploadResult.success) {
          throw new Error("Failed to upload image: " + uploadResult.message)
        }
        imageUrl = uploadResult.url
      }

      // Check if the message is a greeting
      if (this.isGreeting(content)) {
        // Save user message
        await chatbotModel.addMessage(chatId, "user", content, imageUrl)
        
        // Save bot response
        const botResponse = "Hello! I am agroverse chatbot 🤖🌱 Ask me anything related to farming and I'll be happy to help!"
        await chatbotModel.addMessage(chatId, "assistant", botResponse)

        return {
          success: true,
          userMessage: { role: "user", content, image_url: imageUrl },
          assistantMessage: { role: "assistant", content: botResponse },
          message: "Message sent successfully"
        }
      }

      // Check if the message is farming-related (if there's an image, assume it's farming-related)
      // Also check conversation context for farming discussion
      const hasFarmingContext = await this.hasFarmingContext(chatId, userId)
      
      if (!imageUrl && !this.isFarmingRelated(content) && !hasFarmingContext) {
        // Save user message
        await chatbotModel.addMessage(chatId, "user", content, imageUrl)
        
        // Save bot response
        const botResponse = "Sorry, I only chat about farming related things! 🌱 Ask me anything about crops, soil, pests, livestock, weather, or agricultural practices and I'll be happy to help!"
        await chatbotModel.addMessage(chatId, "assistant", botResponse)

        return {
          success: true,
          userMessage: { role: "user", content, image_url: imageUrl },
          assistantMessage: { role: "assistant", content: botResponse },
          message: "Message sent successfully"
        }
      }

      // Get recent messages for context
      const recentMessages = await chatbotModel.getRecentMessages(chatId, userId, 15)
      
      // Save user message
      const userMessage = await chatbotModel.addMessage(chatId, "user", content, imageUrl)

      // Prepare messages for GPT-4o
      const systemPrompt = `You are FarmBot, a cheerful and knowledgeable agricultural expert! 🌱 

You ONLY answer questions about farming and agriculture including:
- Crops (planting, harvesting, varieties, diseases)
- Soil (health, testing, fertilizers, composting) 
- Pests and diseases (identification, organic/chemical treatments)
- Livestock (care, feeding, breeding, health)
- Weather and climate (seasonal planning, protection)
- Farm equipment and tools
- Irrigation and water management
- Organic farming and sustainable practices
- Market prices and crop economics
- Land management and crop rotation

When analyzing images:
- Identify plant diseases, pest problems, nutrient deficiencies
- Provide specific treatment recommendations
- Suggest prevention methods
- Be encouraging and supportive

For ANY non-farming questions, respond ONLY with: "Sorry, I only chat about farming related things! 🌱"

Always be enthusiastic, helpful, and use farming emojis! Keep responses practical and actionable.`

      const messages = [
        { role: "system", content: systemPrompt }
      ]

      // Add conversation history
      for (const msg of recentMessages) {
        if (msg.role === "user") {
          const userContent = []
          
          // Add text content
          if (msg.content) {
            userContent.push({
              type: "text",
              text: msg.content
            })
          }
          
          // Add image content if exists
          if (msg.image_url) {
            userContent.push({
              type: "image_url",
              image_url: {
                url: msg.image_url
              }
            })
          }
          
          messages.push({
            role: "user",
            content: userContent.length === 1 && userContent[0].type === "text" 
              ? userContent[0].text 
              : userContent
          })
        } else {
          // Assistant messages are always text
          messages.push({
            role: "assistant",
            content: msg.content
          })
        }
      }

      // Add current user message
      const currentUserContent = []
      
      // Add text content
      if (content) {
        currentUserContent.push({
          type: "text",
          text: content
        })
      }
      
      // Add image content if exists
      if (imageUrl) {
        currentUserContent.push({
          type: "image_url",
          image_url: {
            url: imageUrl
          }
        })
      }

      messages.push({
        role: "user",
        content: currentUserContent.length === 1 && currentUserContent[0].type === "text" 
          ? currentUserContent[0].text 
          : currentUserContent
      })

      // Call GPT-4o API
      const aiResponse = await this.callGPT4o(messages)
      
      // Save assistant response
      const assistantMessage = await chatbotModel.addMessage(chatId, "assistant", aiResponse)

      return {
        success: true,
        userMessage,
        assistantMessage,
        message: "Message sent successfully"
      }
    } catch (error) {
      console.error("Send message error:", error)
      return {
        success: false,
        message: error.message
      }
    }
  },

  // Check if content is a greeting
  isGreeting(content) {
    const greetingKeywords = [
      'hi', 'hello', 'hey', 'hola', 'greetings', 'good morning', 'good afternoon', 'good evening',
      'howdy', 'sup', 'whats up', "what's up", 'yo', 'hii', 'heyyy', 'heyy', 'helloo'
    ]

    const contentLower = content.toLowerCase().trim()
    return greetingKeywords.some(keyword => 
      contentLower === keyword || 
      contentLower.startsWith(keyword + ' ') ||
      contentLower.endsWith(' ' + keyword) ||
      contentLower === keyword + '!'
    )
  },

  // Check if content is farming-related
  isFarmingRelated(content) {
    const farmingKeywords = [
      // General farming
      'farm', 'farming', 'agriculture', 'agricultural', 'agri', 'crop', 'crops', 'harvest', 'plant', 'planting', 'grow', 'growing',
      // Crops
      'wheat', 'rice', 'corn', 'maize', 'barley', 'oats', 'soybean', 'potato', 'tomato', 'onion', 'carrot', 'lettuce', 'cabbage',
      'fruits', 'vegetables', 'grains', 'cereals', 'legumes', 'beans', 'peas', 'cotton', 'sugarcane', 'tobacco', 'paddy',
      // Plant parts and conditions
      'leaf', 'leaves', 'stem', 'stems', 'root', 'roots', 'flower', 'flowers', 'fruit', 'seeds', 'seedling', 'seedlings',
      'branch', 'branches', 'trunk', 'bark', 'yellowing', 'browning', 'wilting', 'drooping', 'spots', 'lesions',
      // Soil and fertilizers
      'soil', 'fertilizer', 'fertiliser', 'compost', 'manure', 'nitrogen', 'phosphorus', 'potassium', 'ph', 'nutrients',
      'organic', 'mulch', 'tillage', 'cultivation',
      // Pests and diseases
      'pest', 'pests', 'insect', 'insects', 'bug', 'bugs', 'disease', 'diseases', 'fungus', 'fungi', 'pesticide', 'herbicide',
      'weed', 'weeds', 'aphid', 'caterpillar', 'beetle', 'locust', 'blight', 'rust', 'mold', 'rot', 'infection', 'pathogen',
      'bacterial', 'viral', 'fungal', 'canker', 'scab', 'mildew', 'anthracnose', 'wilt', 'necrosis', 'medicine',
      // Livestock
      'livestock', 'cattle', 'cow', 'cows', 'bull', 'pig', 'pigs', 'sheep', 'goat', 'goats', 'chicken', 'chickens', 'duck',
      'poultry', 'dairy', 'milk', 'eggs', 'feed', 'fodder', 'grazing', 'pasture', 'barn', 'stable',
      // Equipment and tools
      'tractor', 'plow', 'plough', 'harrow', 'seeder', 'sprayer', 'harvester', 'thresher', 'irrigation', 'pump',
      'greenhouse', 'polytunnel', 'shed', 'silo', 'barn',
      // Weather and climate
      'weather', 'rain', 'drought', 'season', 'seasonal', 'climate', 'temperature', 'frost', 'hail', 'storm',
      // Methods and practices
      'organic', 'sustainable', 'permaculture', 'hydroponics', 'greenhouse', 'rotation', 'intercropping', 'monoculture',
      'yield', 'productivity', 'efficiency', 'conservation',
      // Economics
      'market', 'price', 'profit', 'cost', 'investment', 'subsidy', 'insurance', 'cooperative', 'supply chain',
      // Questions that indicate plant problems or follow-up questions
      'what happened', 'whats wrong', "what's wrong", 'help', 'problem', 'issue', 'damage', 'healthy', 'unhealthy',
      'what should', 'what do', 'what can', 'how do', 'how should', 'how can', 'what to do', 'what next', 'next step',
      'how to fix', 'how to treat', 'how to prevent', 'how to care for', 'how to grow', 'how to plant', 'how to harvest',
      'treatment', 'cure', 'remedy', 'solution', 'fix', 'repair', 'solve', 'manage', 'control', 'prevent',
      'spray', 'apply', 'use', 'recommend', 'suggest', 'advice', 'tips', 'steps', 'procedure', 'method',
      'should i', 'can i', 'do i', 'will it', 'is it', 'does it', 'when to', 'where to', 'why is',
      'tell me', 'explain', 'describe', 'identify', 'diagnose', 'analyze', 'examine', 'check'
    ]

    const contentLower = content.toLowerCase()
    return farmingKeywords.some(keyword => contentLower.includes(keyword))
  },

  // Check if the conversation context suggests farming discussion
  async hasFarmingContext(chatId, userId) {
    try {
      // Get recent messages to check for farming context
      const recentMessages = await chatbotModel.getRecentMessages(chatId, userId, 5)
      
      // Check if any recent message had an image (likely farming-related) or farming keywords
      return recentMessages.some(msg => {
        if (msg.image_url) return true // Images are assumed to be farming-related
        if (msg.content && this.isFarmingRelated(msg.content)) return true
        return false
      })
    } catch (error) {
      console.error("Error checking farming context:", error)
      return false
    }
  },

  // Call GPT-4o API
  async callGPT4o(messages) {
    try {
      const response = await fetch("https://api.laozhang.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.LAOZHANG_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: messages,
          max_tokens: 1500,
          temperature: 0.7
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error("API Error:", errorData)
        throw new Error(`API request failed: ${response.status} - ${errorData.error?.message || 'Unknown error'}`)
      }

      const data = await response.json()
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error("Invalid API response format")
      }

      return data.choices[0].message.content
    } catch (error) {
      console.error("GPT-4o API error:", error)
      // Fallback response
      return "I'm having trouble connecting to my knowledge base right now. Please try again in a moment! 🌱 In the meantime, feel free to ask me about crops, soil health, pest management, or any other farming topics!"
    }
  }
}
