// @ts-nocheck
"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { FiX, FiCamera, FiLoader } from "react-icons/fi"

export default function AddEditLandDialog({
  isOpen,
  onClose,
  onSave,
  isSubmitting,
  editingLand,
  landTypes,
  soilQualities,
}) {
  const [formData, setFormData] = useState({
    land_type: "",
    area: "",
    soil_quality: "",
    location_link: "",
    description: "",
    tags: "",
  })
  const [selectedImage, setSelectedImage] = useState(null)
  const [imagePreview, setImagePreview] = useState("")

  const dialogRef = useRef(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    // Synchronize dialog state with isOpen prop
    const dialogNode = dialogRef.current
    if (isOpen) {
      dialogNode?.showModal()
    } else {
      dialogNode?.close()
    }
  }, [isOpen])

  useEffect(() => {
    // Populate form when editingLand prop changes
    if (editingLand) {
      setFormData({
        land_type: editingLand.land_type,
        area: editingLand.area.toString(),
        soil_quality: editingLand.soil_quality || "",
        location_link: editingLand.location_link || "",
        description: editingLand.description || "",
        tags: editingLand.tags ? editingLand.tags.join(", ") : "",
      })
      setImagePreview(editingLand.land_image || "")
    } else {
      // Reset form for adding a new land
      setFormData({
        land_type: "",
        area: "",
        soil_quality: "",
        location_link: "",
        description: "",
        tags: "",
      })
      setImagePreview("")
    }
    setSelectedImage(null) // Reset image selection on open
  }, [editingLand, isOpen]) // Rerun when dialog opens

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formData, selectedImage)
  }

  const handleDialogClose = () => {
    if (onClose) {
      onClose()
    }
  }

  return (
    <dialog
      ref={dialogRef}
      onClose={handleDialogClose}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] p-0 m-auto backdrop:bg-black/50"
    >
      <div className="p-6 overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {editingLand ? "Edit Land" : "Add New Land"}
          </h2>
          <button
            onClick={handleDialogClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Land Image</label>
            <div className="flex items-center gap-4">
              <div className="relative w-32 h-24 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                {imagePreview ? (
                  <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FiCamera className="h-6 w-6 text-gray-400" />
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Choose Image
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Land Type *</label>
              <select
                name="land_type"
                value={formData.land_type}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              >
                <option value="">Select land type</option>
                {landTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Area (acres) *
              </label>
              <input
                type="number"
                name="area"
                step="0.01"
                min="0"
                value={formData.area}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Soil Quality</label>
              <select
                name="soil_quality"
                value={formData.soil_quality}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Select soil quality</option>
                {soilQualities.map((quality) => (
                  <option key={quality} value={quality}>
                    {quality}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Location Link
              </label>
              <input
                type="url"
                name="location_link"
                value={formData.location_link}
                onChange={handleInputChange}
                placeholder="https://maps.google.com/..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              placeholder="Brief description of the land..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tags</label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleInputChange}
              placeholder="e.g., fertile, irrigated, organic (comma separated)"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleDialogClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <FiLoader className="h-4 w-4 animate-spin" />
                  {editingLand ? "Updating..." : "Adding..."}
                </>
              ) : editingLand ? (
                "Update Land"
              ) : (
                "Add Land"
              )}
            </button>
          </div>
        </form>
      </div>
    </dialog>
  )
}