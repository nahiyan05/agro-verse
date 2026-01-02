import { userConnectionModel } from "../models/userConnectionModel.js"
import { userModel } from "../models/userModel.js"
import { notificationController } from "./notificationController.js";

export const userConnectionController = {
  // Find farmers by location search
  async findFarmersByLocation(userId, location, area = null, name = null) {
    try {
      let farmers = [];
      
      if (location || area || name) {
        farmers = await userConnectionModel.findFarmersByLocation(userId, location, area, name)
      } else {
        farmers = await userConnectionModel.getAllFarmers(userId)
      }

      return {
        success: true,
        farmers,
        message: "Farmers retrieved successfully"
      }
    } catch (error) {
      console.error("Find farmers by location error:", error)
      return {
        success: false,
        message: error.message
      }
    }
  },

  // Find farmers from same area/city as current user
  async findNearbyFarmers(userId) {
    try {
      const farmers = await userConnectionModel.findNearbyFarmers(userId)

      return {
        success: true,
        farmers,
        message: "Nearby farmers retrieved successfully"
      }
    } catch (error) {
      console.error("Find nearby farmers error:", error)
      return {
        success: false,
        message: error.message
      }
    }
  },

  // Send connection request
  async sendConnectionRequest(requesterId, receiverId) {
    try {
      if (requesterId === receiverId) {
        throw new Error("Cannot send connection request to yourself")
      }

      // Check if receiver exists
      const receiver = await userModel.findUserById(receiverId)
      if (!receiver) {
        throw new Error("User not found")
      }

      // Get requester details for notification
      const requester = await userModel.findUserById(requesterId)
      if (!requester) {
        throw new Error("Requester not found")
      }

      const connectionRequest = await userConnectionModel.sendConnectionRequest(requesterId, receiverId)
      
      // Send notification to the receiver
      await notificationController.createNotificationForUser(
        receiverId,
        "Connection_request",
        `${requester.name || 'Someone'} has sent you a connection request`
      )

      return {
        success: true,
        connectionRequest,
        message: "Connection request sent successfully"
      }
    } catch (error) {
      console.error("Send connection request error:", error)
      return {
        success: false,
        message: error.message
      }
    }
  },

  // Respond to connection request
  async respondToConnectionRequest(userId, connectionId, response) {
    try {
      const updatedConnection = await userConnectionModel.respondToConnectionRequest(
        connectionId, 
        userId, 
        response
      )

      // Get the requester's details for notification
      const requester = await userModel.findUserById(updatedConnection.requester_id)
      const responder = await userModel.findUserById(userId)

      if (response === "accepted") {
        await notificationController.createNotificationForUser(
          updatedConnection.requester_id,
          "Connection_Accepted",
          `${responder?.name || 'Someone'} has accepted your connection request`
        )
      } else if (response === "rejected") {
        await notificationController.createNotificationForUser(
          updatedConnection.requester_id,
          "Connection_Rejected",
          `${responder?.name || 'Someone'} has declined your connection request`
        )
      }

      return {
        success: true,
        connection: updatedConnection,
        message: `Connection request ${response} successfully`
      }
    } catch (error) {
      console.error("Respond to connection request error:", error)
      return {
        success: false,
        message: error.message
      }
    }
  },

  // Get user's connection requests
  async getUserConnectionRequests(userId, type = 'all') {
    try {
      const requests = await userConnectionModel.getUserConnectionRequests(userId, type)

      return {
        success: true,
        requests,
        message: "Connection requests retrieved successfully"
      }
    } catch (error) {
      console.error("Get connection requests error:", error)
      return {
        success: false,
        message: error.message
      }
    }
  },

  // Get user's connections (friends)
  async getUserConnections(authToken, targetUserId = null) {
    try {
      // If targetUserId is provided, use it; otherwise use the auth token (which contains user ID)
      const userId = targetUserId || authToken;

      const connections = await userConnectionModel.getUserConnections(userId)

      return {
        success: true,
        connections,
        message: "Connections retrieved successfully"
      }
    } catch (error) {
      console.error("Get connections error:", error)
      return {
        success: false,
        message: error.message
      }
    }
  },

  // Remove connection
  async removeConnection(userId, connectionId) {
    try {
      const result = await userConnectionModel.removeConnection(userId, connectionId)

      return {
        success: true,
        message: "Connection removed successfully"
      }
    } catch (error) {
      console.error("Remove connection error:", error)
      return {
        success: false,
        message: error.message
      }
    }
  },

}
