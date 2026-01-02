"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useEffect, useState } from "react"
import Image from "next/image"
import { FiUpload, FiX, FiLoader } from "react-icons/fi"

const units = ["kg", "ton", "quintal", "piece", "box", "bag"]
const statusOptions = ["active", "sold", "inactive"]

export default function CreateListingDialog({ open, onOpenChange, editingListing, onSave, cropEmojis }) {
  const cropOptions = Object.keys(cropEmojis).filter(crop => crop !== 'Other')

  const initialFormData = {
    crop_name: cropOptions[0], description: "", price_per_unit: "", unit: "kg",
    quantity_available: "", location: "", contact_phone: "", contact_email: "", 
    images: [], status: "active"
  }

  const [formData, setFormData] = useState(initialFormData)
  const [customCropName, setCustomCropName] = useState("")
  const [isOtherCrop, setIsOtherCrop] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    if (!open) return

    if (editingListing) {
      const isKnownCrop = cropOptions.includes(editingListing.crop_name)
      setIsOtherCrop(!isKnownCrop)
      setFormData({
        crop_name: isKnownCrop ? editingListing.crop_name : "Other",
        description: editingListing.description || "",
        price_per_unit: editingListing.price_per_unit.toString(),
        unit: editingListing.unit,
        quantity_available: editingListing.quantity_available.toString(),
        location: editingListing.location || "",
        contact_phone: editingListing.contact_phone || "",
        contact_email: editingListing.contact_email || "",
        images: editingListing.images || [],
        status: editingListing.status || "active"
      })
      if (!isKnownCrop) setCustomCropName(editingListing.crop_name)
      // Set image preview if editing and image exists
      if (editingListing.images && editingListing.images.length > 0) {
        setImagePreview(editingListing.images[0])
      } else {
        setImagePreview(null)
      }
      setImageFile(null) // Clear any previously selected file
    } else {
      try {
        const userString = localStorage.getItem("user")
        const user = userString ? JSON.parse(userString) : null
        setFormData(prev => ({
          ...initialFormData,
          location: user?.area || "",
          contact_phone: user?.phone || "",
          contact_email: user?.email || ""
        }))
      } catch (error) {
        console.error("Failed to parse user from localStorage", error)
        setFormData(initialFormData)
      }
      setImagePreview(null)
      setImageFile(null)
    }
  }, [editingListing, open])

  const handleCropChange = (e) => {
    const value = e.target.value
    setIsOtherCrop(value === "Other")
    if (value !== "Other") setCustomCropName("")
    setFormData({ ...formData, crop_name: value })
  }

  const handleImageSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert("Please select a valid image file.")
        return
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size should be less than 5MB.")
        return
      }

      setImageFile(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setImageFile(null)
    setImagePreview(null)
    // Clear the existing image from formData when removing
    setFormData({ ...formData, images: [] })
  }

  const uploadImage = async () => {
    if (!imageFile) return null

    setIsUploading(true)
    try {
      const uploadFormData = new FormData()
      uploadFormData.append('image', imageFile)

      // If editing and there's an existing image, send the old image data for deletion
      if (editingListing && formData.images && formData.images.length > 0) {
        // Check if we have image data with public_id, or extract from URL
        const existingImage = formData.images[0]
        let oldImageData = null
        
        if (typeof existingImage === 'string') {
          // It's a URL, extract public_id
          const publicId = extractPublicIdFromCloudinaryUrl(existingImage)
          if (publicId) {
            oldImageData = { url: existingImage, public_id: publicId }
          }
        } else if (existingImage && existingImage.public_id) {
          // It's already an object with public_id
          oldImageData = existingImage
        }

        if (oldImageData) {
          uploadFormData.append('oldImageData', JSON.stringify(oldImageData))
        }

        // Use the specific listing endpoint for editing with deletion
        const response = await fetch(`/api/marketplace/${editingListing.id}`, {
          method: 'PUT',
          body: uploadFormData,
          credentials: 'include'
        })

        const result = await response.json()
        
        if (!response.ok || !result.success) {
          throw new Error(result.message || 'Failed to upload image')
        }

        return result.imageData || { url: result.url, public_id: result.public_id }
      } else {
        // Creating new listing, use general endpoint
        const response = await fetch('/api/marketplace', {
          method: 'PUT',
          body: uploadFormData,
          credentials: 'include'
        })

        const result = await response.json()
        
        if (!response.ok || !result.success) {
          throw new Error(result.message || 'Failed to upload image')
        }

        return result.imageData || { url: result.url, public_id: result.public_id }
      }
    } catch (error) {
      console.error('Image upload error:', error)
      alert('Failed to upload image: ' + error.message)
      return null
    } finally {
      setIsUploading(false)
    }
  }

  // Helper function to extract public_id from Cloudinary URL
  const extractPublicIdFromCloudinaryUrl = (url) => {
    try {
      if (!url || typeof url !== 'string') return null
      
      // Match Cloudinary URL pattern for agroverse/marketplace folder
      const match = url.match(/\/agroverse\/marketplace\/([^\/\.]+)(?:\.[^\.]+)?$/)
      
      if (match) {
        return `agroverse/marketplace/${match[1]}`
      }
      
      // Fallback for other patterns
      const generalMatch = url.match(/\/(?:v\d+\/)?(?:([^\/]+\/)*)?([^\/\.]+)(?:\.[^\.]+)?$/)
      if (generalMatch && generalMatch[2]) {
        const folder = generalMatch[1] ? generalMatch[1] : ''
        return folder + generalMatch[2]
      }
      
      return null
    } catch (error) {
      console.error("Error extracting public_id from URL:", error)
      return null
    }
  }

  const handleOpenChange = (isOpen) => {
    if (!isOpen) {
      setFormData(initialFormData)
      setIsOtherCrop(false)
      setCustomCropName("")
      setImageFile(null)
      setImagePreview(null)
      setIsSubmitting(false)
      setIsUploading(false)
    }
    onOpenChange(isOpen)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (isSubmitting) return
    if (isOtherCrop && !customCropName.trim()) {
      alert("Please specify the crop name.")
      return
    }

    setIsSubmitting(true)
    
    try {
      let imageData = null
      
      // Upload new image if selected
      if (imageFile) {
        imageData = await uploadImage()
        if (!imageData) {
          setIsSubmitting(false)
          return // Upload failed, stop submission
        }
      }
      
      // Determine the final image array
      let finalImages = []
      if (imageData) {
        // New image uploaded, use it (this replaces any existing image)
        // For backward compatibility, we'll store the URL in the images array
        // but we could also store the full imageData object
        finalImages = [imageData.url || imageData]
      } else if (formData.images.length > 0 && !imageFile) {
        // No new image selected and we have existing images, keep them
        finalImages = formData.images
      }
      // If imageFile was null and formData.images is empty, finalImages remains empty array
      
      const finalData = { 
        ...formData, 
        crop_name: isOtherCrop ? customCropName : formData.crop_name,
        images: finalImages
      }
      
      await onSave(finalData)
    } catch (error) {
      console.error('Form submission error:', error)
      alert('Failed to save listing')
    }
    
    setIsSubmitting(false)
  }

return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto mx-4 sm:mx-0">
            <DialogHeader className="sticky top-0 bg-background pb-4 border-b">
                <DialogTitle>{editingListing ? "Edit Listing" : "Create New Listing"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="pt-4 pb-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Crop Name *</label>
                            <select value={formData.crop_name} onChange={handleCropChange} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-transparent" required>
                                {cropOptions.map(crop => (
                                    <option key={crop} value={crop}>
                                        {cropEmojis[crop]} {crop}
                                    </option>
                                ))}
                                <option value="Other">{cropEmojis["Other"]} Other</option>
                            </select>
                        </div>
                        
                        {isOtherCrop && (
                            <div>
                                <label className="block text-sm font-medium mb-1">Specify Crop Name *</label>
                                <input type="text" value={customCropName} onChange={(e) => setCustomCropName(e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-transparent" required />
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium mb-1">Description</label>
                            <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-transparent" rows={3} />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Price per Unit *</label>
                                <input type="number" step="0.01" value={formData.price_per_unit} onChange={(e) => setFormData({ ...formData, price_per_unit: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-transparent" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Unit *</label>
                                <select value={formData.unit} onChange={(e) => setFormData({ ...formData, unit: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-transparent" required>
                                    {units.map(unit => <option key={unit} value={unit}>{unit}</option>)}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Quantity Available *</label>
                            <input type="number" step="0.01" value={formData.quantity_available} onChange={(e) => setFormData({ ...formData, quantity_available: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-transparent" required />
                        </div>

                        {editingListing && (
                            <div>
                                <label className="block text-sm font-medium mb-1">Status *</label>
                                <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-transparent" required>
                                    {statusOptions.map(status => (
                                        <option key={status} value={status}>
                                            {status === 'active' && '🟢 '}
                                            {status === 'sold' && '🔴 '}
                                            {status === 'inactive' && '⚪ '}
                                            {status.charAt(0).toUpperCase() + status.slice(1)}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-xs text-gray-500 mt-1">
                                    🟢 Active: Available for purchase • 🔴 Sold: No longer available • ⚪ Inactive: Temporarily unavailable
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Right Column */}
                    <div className="space-y-4">
                        {/* Image Upload Section */}
                        <div>
                            <label className="block text-sm font-medium mb-2">Product Image (Optional)</label>
                            
                            {!imagePreview ? (
                                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-green-500 transition-colors">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageSelect}
                                        className="hidden"
                                        id="image-upload"
                                    />
                                    <label
                                        htmlFor="image-upload"
                                        className="cursor-pointer flex flex-col items-center space-y-2"
                                    >
                                        <FiUpload className="h-8 w-8 text-gray-400" />
                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                            Click to upload image
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            Max size: 5MB. Formats: JPG, PNG, WebP
                                        </span>
                                    </label>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <div className="relative">
                                        <div className="relative w-full h-48 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
                                            <Image
                                                src={imagePreview}
                                                alt="Preview"
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleRemoveImage}
                                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                        >
                                            <FiX className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Location</label>
                            <input type="text" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-transparent" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Contact Phone</label>
                            <input type="tel" value={formData.contact_phone} onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-transparent" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Contact Email</label>
                            <input type="email" value={formData.contact_email} onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-transparent" />
                        </div>
                    </div>
                </div>

                {/* Submit Button */}
                <div className="sticky bottom-0 bg-background pt-6 border-t mt-6">
                    <button type="submit" disabled={isSubmitting || isUploading} className="w-[50%] mx-auto px-4 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center justify-center space-x-2">
                        {(isSubmitting || isUploading) && <FiLoader className="h-4 w-4 animate-spin" />}
                        <span>
                            {isUploading ? "Uploading Image..." : isSubmitting ? "Saving..." : editingListing ? "Update Listing" : "Create Listing"}
                        </span>
                    </button>
                </div>
            </form>
        </DialogContent>
    </Dialog>
)
}