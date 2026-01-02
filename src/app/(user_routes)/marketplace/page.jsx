"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { AnimatePresence, motion } from "motion/react"
import { useEffect, useState } from "react"
import {
  FiAlertTriangle, FiChevronDown, FiClock, FiFlag, FiMail, FiMapPin,
  FiMessageSquare, FiPhone, FiPlus, FiSearch, FiShoppingCart, FiUser
} from "react-icons/fi"
import CreateListingDialog from "./_components/create-listing-dialog"
import MyListingsDialog from "./_components/my-listing-dialog"
import ReportListingDialog from "./_components/report-listing-dialog"
import Image from "next/image"
import Link from "next/link"

const cropEmojis = {
  "Rice": "🍚", "Wheat": "🌾", "Maize": "🌽", "Potato": "🥔", "Onion": "🧅",
  "Garlic": "🧄", "Chili": "🌶️", "Tomato": "🍅", "Vegetables": "🥬",
  "Fruits": "🍎", "Spices": "🌿", "Other": "🌱"
}
const getCropEmoji = (cropName) => cropEmojis[cropName] || cropEmojis.Other

const ListingCardSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-4">
    <Skeleton className="h-40 w-full rounded-lg" />
    <div className="space-y-2">
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
    <div className="flex items-center justify-between">
      <Skeleton className="h-6 w-1/4" />
      <Skeleton className="h-4 w-1/4" />
    </div>
    <div className="flex items-center space-x-2 pt-4 border-t border-gray-200 dark:border-gray-700">
      <Skeleton className="h-9 w-2/3 rounded-lg" />
      <Skeleton className="h-9 w-10 rounded-lg" />
    </div>
  </div>
)

const PageSkeleton = () => (
  <div className="max-w-7xl mx-auto p-6 space-y-8 animate-pulse">
    <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <Skeleton className="h-9 w-48" />
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-32 rounded-full" />
        <Skeleton className="h-10 w-40 rounded-full" />
      </div>
    </header>
    <div className="flex justify-center my-8">
      <Skeleton className="h-12 w-full sm:w-[65%] rounded-full" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, index) => <ListingCardSkeleton key={index} />)}
    </div>
  </div>
)

export default function MarketplacePage() {
  const [listings, setListings] = useState([])
  const [myListings, setMyListings] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState(null)
  
  const [searchTerm, setSearchTerm] = useState("")
  const [locationFilter, setLocationFilter] = useState("")
  const [searchType, setSearchType] = useState("crop_name") 

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isMyListingsDialogOpen, setIsMyListingsDialogOpen] = useState(false)
  const [editingListing, setEditingListing] = useState(null)

  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false)
  const [reportingListing, setReportingListing] = useState(null)

  useEffect(() => {
    fetchListings(true)
  }, [])

  const fetchListings = async (isInitialLoad = false) => {
    if (!isInitialLoad) setIsSearching(true)
    
    try {
      setError(null)
      const params = new URLSearchParams()
      if (searchTerm) params.append("crop_name", searchTerm)
      if (locationFilter) params.append("location", locationFilter)
      
      const response = await fetch(`/api/marketplace?${params}`, { credentials: "include" })
      const result = await response.json()

      if (response.ok && result.success) setListings(result.listings || [])
      else setError(result.message || "Failed to fetch marketplace listings")
    } catch (error) {
      console.error("Error fetching listings:", error)
      setError("Network error occurred while fetching listings")
    } finally {
      if (isInitialLoad) setIsLoading(false)
      setIsSearching(false)
    }
  }

  const fetchMyListings = async () => {
    try {
      const response = await fetch("/api/marketplace/my-listings", { credentials: "include" })
      const result = await response.json()
      if (response.ok && result.success) setMyListings(result.listings || [])
      else console.error("Failed to fetch my listings:", result.message)
    } catch (error) {
      console.error("Error fetching my listings:", error)
    }
  }

  const handleSearch = () => fetchListings()
  
  const handleSearchTypeChange = (newType) => {
    setSearchType(newType)
    setSearchTerm("")
    setLocationFilter("")
  }

  const handleSearchInputChange = (value) => {
    if (searchType === "crop_name") setSearchTerm(value)
    else setLocationFilter(value)
  }

  const handleSaveListing = async (formData) => {
    try {
      const url = editingListing ? `/api/marketplace/${editingListing.id}` : "/api/marketplace"
      const method = editingListing ? "PUT" : "POST"

      const response = await fetch(url, {
        method, headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData), credentials: "include"
      })
      const result = await response.json()

      if (response.ok && result.success) {
        setIsCreateDialogOpen(false)
        setEditingListing(null)
        await fetchListings()
        await fetchMyListings()
      } else {
        alert(`Error: ${result.message || "Could not save listing."}`)
      }
    } catch (error) {
      alert("An error occurred while saving the listing.")
    }
  }

  const handleEdit = (listing) => {
    setEditingListing(listing)
    setIsMyListingsDialogOpen(false)
    setIsCreateDialogOpen(true)
  }

  const handleDelete = async (listingId) => {
    if (!confirm("Are you sure you want to delete this listing?")) return
    try {
      const response = await fetch(`/api/marketplace/${listingId}`, { method: "DELETE", credentials: "include" })
      const result = await response.json()
      if (response.ok && result.success) {
        await fetchListings()
        await fetchMyListings()
      } else {
        alert(`Error: ${result.message || "Could not delete listing."}`)
      }
    } catch (error) {
      alert("An error occurred while deleting the listing.")
    }
  }
  
  const handleOpenMyListings = (open) => {
    if (open) fetchMyListings()
    setIsMyListingsDialogOpen(open)
  }
  
  const handleOpenCreateDialog = (open) => {
    if (!open) setEditingListing(null)
    setIsCreateDialogOpen(open)
  }

  const handleOpenReportDialog = (listing) => {
    setReportingListing(listing)
    setIsReportDialogOpen(true)
  }

  const handleCloseReportDialog = () => {
    setReportingListing(null)
    setIsReportDialogOpen(false)
  }

  const handleReportSubmit = () => {
    // Report submitted successfully, maybe refresh data or show notification
    console.log("Report submitted successfully")
  }

  const formatTimeAgo = (dateString) => {
    const diffInSeconds = Math.floor((new Date().getTime() - new Date(dateString).getTime()) / 1000)
    if (diffInSeconds < 60) return "Just now"
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    return `${Math.floor(diffInSeconds / 86400)}d ago`
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <PageSkeleton />
      </div>
    )
  }

  return (
    <div className="min-h-screen ">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Marketplace</h1>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => handleOpenMyListings(true)} className="flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-white rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-medium shadow-sm">
              <FiShoppingCart className="h-4 w-4" /> My Listings
            </button>
            <button onClick={() => handleOpenCreateDialog(true)} className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors font-medium shadow-sm">
              <FiPlus className="h-4 w-4" /> Create Listing
            </button>
          </div>
        </header>

        <MyListingsDialog open={isMyListingsDialogOpen} onOpenChange={handleOpenMyListings} myListings={myListings} onEdit={handleEdit} onDelete={handleDelete} />
        <CreateListingDialog open={isCreateDialogOpen} onOpenChange={handleOpenCreateDialog} editingListing={editingListing} onSave={handleSaveListing} cropEmojis={cropEmojis} />
        <ReportListingDialog 
          open={isReportDialogOpen} 
          onOpenChange={handleCloseReportDialog} 
          listing={reportingListing} 
          onReportSubmit={handleReportSubmit}
        />

        <div className="flex justify-center my-8">
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-[65%]">
            <div className="flex w-full items-center border border-gray-300 dark:border-gray-600 rounded-full overflow-hidden bg-white dark:bg-gray-800 shadow-sm focus-within:ring-2 focus-within:ring-green-500 transition-all">
              <div className="relative">
                <select value={searchType} onChange={(e) => handleSearchTypeChange(e.target.value)} className="h-full pl-4 pr-8 py-2 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-r border-gray-300 dark:border-gray-600 text-sm font-medium appearance-none focus:outline-none cursor-pointer">
                  <option value="crop_name">Crop</option>
                  <option value="location">Location</option>
                </select>
                <FiChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  {searchType === 'crop_name' ? <FiSearch className="h-4 w-4" /> : <FiMapPin className="h-4 w-4" />}
                </span>
                <input
                  type="text"
                  placeholder={searchType === 'crop_name' ? "e.g., Rice, Potato..." : "e.g., Dhaka, Chittagong..."}
                  value={searchType === 'crop_name' ? searchTerm : locationFilter}
                  onChange={(e) => handleSearchInputChange(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-10 pr-4 py-2 bg-transparent focus:outline-none text-gray-900 dark:text-white"
                />
              </div>
            </div>
            <button onClick={handleSearch} className="w-full sm:w-auto px-6 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors flex-shrink-0 font-medium shadow-sm">
              Search
            </button>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <FiAlertTriangle className="h-5 w-5 text-red-500" />
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}
        
        {isSearching && (
            <div className="text-center py-10">
                <p className="text-gray-500 dark:text-gray-400 font-medium mb-6">Searching for listings...</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, index) => <ListingCardSkeleton key={index} />)}
                </div>
            </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {!isSearching && listings.map((listing, index) => (
              <motion.div
                key={listing.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden"
              >
                {listing.images && listing.images.length > 0 ? (
                  <div className="relative w-full h-48 bg-gray-100 dark:bg-gray-700">
                    <Image src={listing.images[0]} alt={listing.crop_name} fill className="object-cover" />
                  </div>
                ) : (
                  <div className="h-48 flex items-center justify-center bg-gray-100 dark:bg-gray-700 text-5xl">
                    {getCropEmoji(listing.crop_name)}
                  </div>
                )}

                <div className="p-4 flex flex-col flex-grow">
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      <span className="mr-2">{getCropEmoji(listing.crop_name)}</span>
                      {listing.crop_name}
                    </h3>
                    <div className="text-right flex-shrink-0">
                      <div className="text-lg font-bold text-green-600 dark:text-green-400">৳{listing.price_per_unit}</div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 -mt-1">per {listing.unit}</p>
                    </div>
                  </div>
                  
                  {listing.description && <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">{listing.description}</p>}

                  <div className="flex-grow space-y-3 text-sm text-gray-700 dark:text-gray-300 mt-4">
                    <p><strong className="font-medium text-gray-500 dark:text-gray-400">Available:</strong> {listing.quantity_available} {listing.unit}</p>
                    {listing.location && <div className="flex items-center gap-2"><FiMapPin className="text-gray-400" /><span>{listing.location}</span></div>}
                    {listing.contact_phone && <div className="flex items-center gap-2"><FiPhone className="text-gray-400" /><a href={`tel:${listing.contact_phone}`} className="text-green-600 hover:underline">{listing.contact_phone}</a></div>}
                    {listing.contact_email && <div className="flex items-center gap-2"><FiMail className="text-gray-400" /><a href={`mailto:${listing.contact_email}`} className="text-blue-600 hover:underline truncate">{listing.contact_email}</a></div>}
                  </div>
                  
                  <div className="mt-auto pt-4">
                    <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-3">
                      <Link href={`/profile/${listing.user_id}`} className="flex items-center gap-2 min-w-0">
                        {listing.seller_profile_pic ? (
                          <Image src={listing.seller_profile_pic} alt={listing.seller_name} width={24} height={24} className="w-6 h-6 rounded-full object-cover flex-shrink-0" />
                        ) : (
                          <FiUser className="h-5 w-5 flex-shrink-0 text-gray-400" />
                        )}
                        <span className="truncate text-green-700 dark:text-green-400 hover:underline">{listing.seller_name}</span>
                      </Link>
                      <div className="flex items-center gap-1.5 flex-shrink-0"><FiClock /><span>{formatTimeAgo(listing.created_at)}</span></div>
                    </div>
                    <div className="flex justify-end gap-2 mt-4 ">
                      <button 
                        onClick={() => handleOpenReportDialog(listing)}
                        className="cursor-pointer flex-shrink-0 flex items-center justify-center px-3 py-2 text-sm text-gray-600 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      >
                        <FiFlag className="h-4 w-4 mr-1" /> Report
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {!isLoading && !isSearching && listings.length === 0 && !error && (
          <div className="text-center py-16 px-6 bg-white dark:bg-gray-800 rounded-lg border border-dashed border-gray-300 dark:border-gray-700 col-span-full">
            <FiShoppingCart className="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">No listings found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-sm mx-auto">{searchTerm || locationFilter ? "Try adjusting your search or filter to find what you're looking for." : "There are currently no listings. Why not be the first to sell your crops?"}</p>
            <button onClick={() => setIsCreateDialogOpen(true)} className="flex items-center justify-center gap-2 mx-auto px-6 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors font-medium shadow-sm">
              <FiPlus /> Create First Listing
            </button>
          </div>
        )}
      </div>
    </div>
  )
}