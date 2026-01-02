// @ts-nocheck
"use client"
import { useState, useEffect, useRef } from "react"
import { FiCamera, FiLoader } from "react-icons/fi"

const Dialog = ({ open, onOpenChange, children }) => {
  const [isMounted, setIsMounted] = useState(open)

  useEffect(() => {
    if (open) {
      setIsMounted(true)
    } else {
      const timer = setTimeout(() => setIsMounted(false), 200) 
      return () => clearTimeout(timer)
    }
  }, [open])

  if (!isMounted) return null

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 transition-opacity duration-200 ${open ? "opacity-100" : "opacity-0"}`}
        onClick={() => onOpenChange(false)}
      />
      {/* Content */}
      <div className={`fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 p-4`}>
        <div
          className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg transition-all duration-200 ease-out ${
            open ? "opacity-100 scale-100" : "opacity-0 scale-95"
          }`}
        >
          {children}
        </div>
      </div>
    </div>
  )
}


// --- Main Dialog Component ---
export default function EditProfileDialog({ isOpen, onClose, user, onProfileUpdate }) {
  const [formData, setFormData] = useState({})
  const [selectedImage, setSelectedImage] = useState(null)
  const [imagePreview, setImagePreview] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (user && isOpen) {
      setFormData({
        name: user.name || "",
        phone: user.phone || "",
        area: user.area || "",
        city: user.city || "",
        country: user.country || "",
        age: user.age ? user.age.toString() : "",
        preferred_crops: user.preferred_crops ? user.preferred_crops.join(", ") : "",
      })
      setImagePreview(user.profile_pic || "")
      setSelectedImage(null)
    }
  }, [user, isOpen])

  const handleInputChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleImageSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedImage(file)
      const reader = new FileReader()
      reader.onload = (e) => setImagePreview(e.target.result)
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    try {
      if (selectedImage) {
        const imageFormData = new FormData()
        imageFormData.append("image", selectedImage)
        const imageResponse = await fetch("/api/user/upload-image", { method: "POST", body: imageFormData, credentials: "include" })
        if (!imageResponse.ok) throw new Error("Failed to upload image")
      }

      const profileData = {
        ...formData,
        age: formData.age ? Number.parseInt(formData.age) : null,
        preferred_crops: formData.preferred_crops ? formData.preferred_crops.split(",").map(c => c.trim()).filter(Boolean) : [],
      }

      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileData),
        credentials: "include",
      })

      if (!response.ok) throw new Error("Failed to update profile")

      const result = await response.json()
      if (result.success) {
        onProfileUpdate(result.user)
        onClose()
      } else {
        throw new Error(result.message || "An unknown error occurred")
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      alert(`Failed to update profile: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <div className="max-h-[90vh] overflow-y-auto">
        <div className="p-6 pb-4 text-center sm:text-left">
          <h2 className="text-lg font-semibold leading-none tracking-tight">Edit Profile</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Update your profile information and profile picture.</p>
        </div>

        <div className="space-y-4 p-6 pt-0">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <div className="relative flex h-24 w-24 shrink-0 overflow-hidden rounded-full">
                {imagePreview ? (
                  <img className="aspect-square h-full w-full object-cover" src={imagePreview} alt="Profile Preview" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 text-lg">
                    {formData.name?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                )}
              </div>
              <button
                type="button"
                className="absolute -bottom-2 -right-2 h-10 w-10 inline-flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600"
                onClick={() => fileInputRef.current?.click()}
                aria-label="Change profile picture"
              >
                <FiCamera className="h-4 w-4" />
              </button>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
          </div>

          <div className="grid grid-cols-1 gap-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium leading-none mb-1">Name *</label>
              <input id="name" name="name" type="text" value={formData.name} onChange={handleInputChange} required className="flex h-10 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50" />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium leading-none mb-1">Phone</label>
              <input id="phone" name="phone" type="text" value={formData.phone} onChange={handleInputChange} className="flex h-10 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50" />
            </div>
            <div>
              <label htmlFor="age" className="block text-sm font-medium leading-none mb-1">Age</label>
              <input id="age" name="age" type="number" value={formData.age} onChange={handleInputChange} className="flex h-10 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50" />
            </div>
            <div>
              <label htmlFor="area" className="block text-sm font-medium leading-none mb-1">area</label>
              <textarea id="area" name="area" value={formData.area} onChange={handleInputChange} rows={2} className="flex min-h-[60px] w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="city" className="block text-sm font-medium leading-none mb-1">City</label>
                <input id="city" name="city" type="text" value={formData.city} onChange={handleInputChange} className="flex h-10 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50" />
              </div>
              <div>
                <label htmlFor="country" className="block text-sm font-medium leading-none mb-1">Country</label>
                <input id="country" name="country" type="text" value={formData.country} onChange={handleInputChange} className="flex h-10 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50" />
              </div>
            </div>
            <div>
              <label htmlFor="preferred_crops" className="block text-sm font-medium leading-none mb-1">Preferred Crops (comma-separated)</label>
              <input id="preferred_crops" name="preferred_crops" type="text" value={formData.preferred_crops} onChange={handleInputChange} className="flex h-10 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50" />
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 p-6 pt-0">
          <button type="button" onClick={onClose} className="inline-flex items-center justify-center rounded-full text-sm font-medium h-10 px-4 py-2 border border-gray-300 bg-white hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700">Cancel</button>
          <button onClick={handleSubmit} disabled={isLoading} className="inline-flex items-center justify-center rounded-full text-sm font-medium h-10 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50">
            {isLoading ? <><FiLoader className="mr-2 h-4 w-4 animate-spin" /> Updating...</> : "Update Profile"}
          </button>
        </div>
      </div>
    </Dialog>
  )
}