import bcrypt from "bcryptjs"
import { userModel } from "../models/userModel.js"
import { notificationController } from "./notificationController.js"

export const authController = {
  async register(userData) {
    try {
      const { name, email, password } = userData

      // Check if user already exists
      const existingUser = await userModel.findUserByEmail(email)
      if (existingUser) {
        throw new Error("User already exists with this email")
      }

      // Hash password
      const saltRounds = 12
      const hashedPassword = await bcrypt.hash(password, saltRounds)

      // Create user
      const newUser = await userModel.createUser({
        name,
        email,
        password: hashedPassword,
      })

      // Create welcome notification for new user
      await notificationController.createNotificationForUser(
        newUser.id,
        "welcome",
        "Welcome to agroverse! 🌱 Start exploring our features to manage your farm effectively.",
      
      )

      return {
        success: true,
        user: newUser,
        message: "User registered successfully",
      }
    } catch (error) {
      return {
        success: false,
        message: error.message,
      }
    }
  },

  async login(credentials) {
    try {
      const { email, password } = credentials

      // Find user by email
      const user = await userModel.findUserByEmail(email)
      if (!user) {
        throw new Error("Invalid email or password")
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password)
      if (!isPasswordValid) {
        throw new Error("Invalid email or password")
      }

      // Remove password from user object
      const { password: _, ...userWithoutPassword } = user

      return {
        success: true,
        user: userWithoutPassword,
        message: "Login successful",
      }
    } catch (error) {
      return {
        success: false,
        message: error.message,
      }
    }
  },
}
