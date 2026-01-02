"use client"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { GiHolosphere } from "react-icons/gi"
import { FiSun, FiMoon, FiMenu, FiLogOut } from "react-icons/fi"
import { removeAuthCookies } from "@/lib/auth"
import { useRouter } from "next/navigation"
import { Prosto_One } from "next/font/google"
import { cn } from "@/lib/utils"

const inter = Prosto_One({ subsets: ["latin"] , weight: "400" })

export default function TopNavbar({ onMenuClick }) {
  const { theme, setTheme } = useTheme()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      })

      removeAuthCookies()

      router.push("/")
    } catch (error) {
      console.error("Logout error:", error)
      removeAuthCookies()
      router.push("/")
    }
  }

  return (
    <nav className="h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="flex h-full items-center justify-between px-4 md:pl-6">
        {/* Left side - Logo and Menu */}
        <div className="flex items-center gap-4">
          {/* Hamburger menu - only visible on mobile */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden" 
            onClick={onMenuClick}
            aria-label="Open navigation menu"
          >
            <FiMenu className="h-5 w-5" />
          </Button>

          {/* Logo */}
          <div className="flex items-center gap-2">
            <GiHolosphere className="h-8 w-8 text-green-400 drop-shadow-[0_5px_15px_rgba(34,197,94,0.5)] -rotate-45" />
            <span className={cn("text-3xl font-bold", inter.className)}>
              Agro
              {/* <GiHolosphere className="inline -ml-[1px] -mr-[1px] h-6 w-6 text-green-600 mx-0.5" /> */}
              sphere
            </span>
          </div>
        </div>

        {/* Right side - Theme toggle and Logout (Desktop only) */}
        <div className="hidden md:flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            {theme === "dark" ? <FiSun className="h-5 w-5" /> : <FiMoon className="h-5 w-5" />}
          </Button>

          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleLogout} 
            className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950 cursor-pointer"
          >
            <FiLogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </nav>
  )
}