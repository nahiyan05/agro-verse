"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import { FiPlus, FiEdit, FiTrash2, FiArrowRight } from "react-icons/fi"
import { SiGooglemaps } from "react-icons/si"
import { FaMapMarked } from "react-icons/fa"
import { Skeleton } from "@/components/ui/skeleton"
import AddEditLandDialog from "./_components/AddEditLandDialog"

// Land types (updated to Bengali terms)
const landTypes = [
  "Ucha Jomi",
  "Moddhom Jomi",
  "Nicher Jomi",
  "Ati Nicher Jomi",
  "Char",
  "Haor",
  "Upokulio Jomi",
  "Charonabhumi",
  "Others",
]

// Soil quality options (updated to Bengali terms)
const soilQualities = [
  "Dona Mati",
  "Balu Mati",
  "Doash Mati",
  "Kalo Mati",
  "Lal Mati",
  "Pank Mati",
  "Lona Mati",
  "Teep Mati",
  "others",
]

// Updated Skeleton component to match the new card layout
const LandCardSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden flex">
    {/* Image skeleton */}
    <div className="w-80 flex-shrink-0">
      <Skeleton className="w-full h-full" />
    </div>

    {/* Content skeleton */}
    <div className="flex-1 p-6 flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between mb-2">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-5 w-20" />
        </div>
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-3/4 mb-4" />
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-28" />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-20" />
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div className="flex gap-2">
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-24" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  </div>
)

export default function LandsPage() {
  const [lands, setLands] = useState([])
  const [stats, setStats] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingLand, setEditingLand] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchLands = useCallback(async () => {
    try {
      const response = await fetch("/api/lands", {
        credentials: "include",
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setLands(result.lands)
          setStats(result.stats)
        }
      }
    } catch (error) {
      console.error("Error fetching lands:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchLands()
  }, [fetchLands])

  const uploadImage = async (landId, selectedImage) => {
    if (!selectedImage) return

    const imageFormData = new FormData()
    imageFormData.append("image", selectedImage)
    imageFormData.append("landId", landId)

    try {
      await fetch("/api/lands/upload-image", {
        method: "POST",
        body: imageFormData,
        credentials: "include",
      })
    } catch (error) {
      console.error("Error uploading image:", error)
    }
  }

  const handleSaveLand = async (formData, selectedImage) => {
    setIsSubmitting(true)
    try {
      const url = editingLand ? `/api/lands/${editingLand.id}` : "/api/lands"
      const method = editingLand ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
        credentials: "include",
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success && result.land) {
          if (selectedImage) {
            await uploadImage(result.land.id, selectedImage)
          }
          setIsDialogOpen(false)
          setEditingLand(null)
          fetchLands() // Refresh the list
        }
      }
    } catch (error) {
      console.error("Error saving land:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (land) => {
    setEditingLand(land)
    setIsDialogOpen(true)
  }

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this land?")) return

    try {
      const response = await fetch(`/api/lands/${id}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (response.ok) {
        fetchLands()
      }
    } catch (error) {
      console.error("Error deleting land:", error)
    }
  }

  const handleOpenAddDialog = () => {
    setEditingLand(null)
    setIsDialogOpen(true)
  }

  const totalArea = stats.reduce((sum, stat) => sum + Number.parseFloat(stat.total_area || 0), 0)
  const totalLands = lands.length

  return (
    <div className="max-w-[75vw] mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">My Lands</h1>
        </div>
        <button
          onClick={handleOpenAddDialog}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-full hover:-translate-y-1 transition-all duration-300 cursor-pointer"
        >
          <FiPlus className="h-4 w-4" />
          Add Land
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
              <SiGooglemaps className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              {isLoading ? (
                <>
                  <Skeleton className="h-8 w-12 mb-1" />
                  <Skeleton className="h-4 w-24" />
                </>
              ) : (
                <>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalLands}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Properties</p>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <FaMapMarked className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              {isLoading ? (
                <>
                  <Skeleton className="h-8 w-16 mb-1" />
                  <Skeleton className="h-4 w-28" />
                </>
              ) : (
                <>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalArea.toFixed(1)}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Area (acres)</p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Lands List */}
      <div className="space-y-4">
        {isLoading ? (
          // Loading skeleton
          Array.from({ length: 3 }).map((_, index) => <LandCardSkeleton key={index} />)
        ) : lands.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <SiGooglemaps className="h-10 w-10 text-gray-400" />
            </div>
            <p className="text-lg text-gray-500 dark:text-gray-400 mb-2">No lands added yet</p>
            <p className="text-sm text-gray-400 dark:text-gray-500">Start by adding your first property.</p>
          </div>
        ) : (
          lands.map((land) => (
            <div
              key={land.id}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow flex"
            >
              {/* Left side - Image */}
              <div className="relative w-80 flex-shrink-0 bg-gray-100 dark:bg-gray-700">
                {land.land_image ? (
                  <Image src={land.land_image} alt={`${land.land_type} land`} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <SiGooglemaps className="h-12 w-12 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Right side - Information and Actions */}
              <div className="flex flex-1 flex-col justify-between p-6">
                {/* Top Content */}
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{land.land_type}</h3>
                    <span className="text-lg font-medium text-green-600 dark:text-green-400 whitespace-nowrap ml-4">
                      {land.area} acres
                    </span>
                  </div>

                  {land.description && (
                    <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">{land.description}</p>
                  )}

                  <div className="space-y-2 mb-4">
                    {land.soil_quality && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium text-gray-500 dark:text-gray-400">Soil:</span>
                        <span className="text-gray-900 dark:text-white">{land.soil_quality}</span>
                      </div>
                    )}
                    {land.location_link && (
                      <div className="flex items-center gap-2 text-sm">
                        <SiGooglemaps className="h-4 w-4 text-gray-400" />
                        <a
                          href={land.location_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:underline"
                        >
                          View on Map
                        </a>
                      </div>
                    )}
                  </div>

                  {land.tags && land.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {land.tags.slice(0, 4).map((tag, tagIndex) => (
                        <span
                          key={tagIndex}
                          className="px-2.5 py-1 bg-gray-100 dark:bg-gray-700 text-xs font-medium text-gray-600 dark:text-gray-300 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                      {land.tags.length > 4 && (
                        <span className="px-2.5 py-1 bg-gray-100 dark:bg-gray-700 text-xs font-medium text-gray-600 dark:text-gray-300 rounded-full">
                          +{land.tags.length - 4}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Bottom Actions */}
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(land)}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-gray-700 rounded-full hover:bg-blue-100 dark:hover:bg-gray-600 transition-colors"
                      title="Edit land"
                    >
                      <FiEdit className="h-4 w-4" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(land.id)}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm text-red-600 bg-red-50 dark:bg-gray-700 rounded-full hover:bg-red-100 dark:hover:bg-gray-600 transition-colors"
                      title="Delete land"
                    >
                      <FiTrash2 className="h-4 w-4" />
                      <span>Delete</span>
                    </button>
                  </div>
                  <Link
                    href={`/lands/${land.id}`}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-full hover:bg-green-700 transition-colors"
                    title="View Details"
                  >
                    <span>View Details</span>
                    <FiArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <AddEditLandDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleSaveLand}
        isSubmitting={isSubmitting}
        editingLand={editingLand}
        landTypes={landTypes}
        soilQualities={soilQualities}
      />
    </div>
  )
}