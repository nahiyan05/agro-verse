"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import TopNavbar from "@/components/top-navbar"
import SideNavbar from "@/components/side-navbar"
import { isAuthenticated, getUserFromStorage } from "@/lib/auth"

export default function UserLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [user, setUser] = useState(null)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if user is authenticated
        if (!isAuthenticated()) {
          router.push("/")
          return
        }

        // Get user from localStorage
        const userData = getUserFromStorage()
        if (userData) {
          setUser(userData)

          // Check if user is banned
          if (userData.is_banned) {
            router.push("/banned")
            return
          }
        }

        // Verify with server
        const response = await fetch("/api/user/profile", {
          credentials: "include",
        })

        if (!response.ok) {
          // If server says unauthorized, redirect to login
          router.push("/")
          return
        }

        const result = await response.json()
        if (result.success && result.user) {
          // Check if user is banned
          if (result.user.is_banned) {
            router.push("/banned")
            return
          }

          setUser(result.user)
          // Update localStorage with fresh data
          localStorage.setItem("user", JSON.stringify(result.user))
        }
      } catch (error) {
        console.error("Auth check error:", error)
        router.push("/")
        return
      } finally {
      }
    }

    checkAuth()
  }, [router])



  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <TopNavbar onMenuClick={() => setIsSidebarOpen(true)} />

      {/* Side Navigation */}
      <SideNavbar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Content - Adjusted for sidebar */}
      <main className="md:ml-20 p-6 pt-6">{children}</main>
    </div>
  )
}
