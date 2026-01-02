"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { FiArrowLeft, FiMapPin, FiMap, FiInfo, FiTag, FiPlus } from "react-icons/fi"
import { FaSeedling, FaChartLine } from "react-icons/fa"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"
import { AddCropRecordDialog } from "./_components/AddCropRecordDialog"
import { CropRecordsSection } from "./_components/CropRecordsSection"

// Skeleton loader 
const PageSkeleton = () => (
  <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
    {/* Header Skeleton */}
    <div className="flex items-center gap-4">
      <Skeleton className="h-9 w-9 rounded-lg" />
      <div>
        <Skeleton className="h-7 w-48 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>
    </div>

    {/* Top Grid Skeleton */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Left Column Skeleton */}
      <div className="md:col-span-1 space-y-6">
        <Skeleton className="aspect-square w-full rounded-lg" />
        <Skeleton className="h-11 w-full rounded-lg" />
      </div>
      {/* Right Column Skeleton */}
      <div className="md:col-span-2">
        <div className="p-6 border rounded-lg space-y-6 h-full">
            <Skeleton className="h-6 w-40 mb-2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-full mb-4" />
            <div className="flex flex-wrap gap-2">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-24 rounded-full" />
            </div>
        </div>
      </div>
    </div>

    {/* Bottom Full-Width Skeletons */}
    <div className="p-6 border rounded-lg">
      <Skeleton className="h-6 w-40 mb-4" />
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    </div>
    <div className="p-6 border rounded-lg">
        <Skeleton className="h-7 w-1/2" />
    </div>
  </div>
);

// Crop emoji mapping
const cropEmojis = {
  // Grains and Cereals
  "Rice": "🍚",
  "Boro Rice": "🍚",
  "Aman Rice": "🍚",
  "Deepwater Aman": "🍚",
  "Floating Rice": "🍚",
  "BRRI dhan47": "🍚",
  "BRRI dhan73": "🍚",
  "Salt-tolerant Rice": "🍚",
  "Wheat": "🌾",
  "Maize": "🌽",
  "Fodder Maize": "🌽",
  "Barley": "🌾",
  
  // Vegetables
  "Potato": "🥔",
  "Sweet Potato": "🍠",
  "Onion": "🧅",
  "Garlic": "🧄",
  "Chili": "🌶️",
  "Spinach": "🥬",
  "Vegetables": "🥬",
  "Seasonal Vegetables": "🥬",
  "Floating Vegetables": "🥬",
  "Aqua Vegetables": "🥬",
  "Kachu": "🥔",
  "Pani Shak": "🥬",
  
  // Fruits
  "Watermelon": "🍉",
  "Pumpkin": "🎃",
  
  // Legumes and Pulses
  "Groundnut": "🥜",
  "Pulses": "🫘",
  "Khesari": "🫘",
  
  // Spices and Herbs
  "Turmeric": "🟡",
  "Mustard": "🟡",
  
  // Industrial Crops
  "Jute": "🌾",
  "Sunflower": "🌻",
  "Sesame": "🌰",
  
  // Aquatic Plants
  "Lotus": "🪷",
  "Water Chestnut": "🌰",
  
  // Fodder Crops
  "Napier Grass": "🌱",
  "Lucerne": "🌱",
  
  // Others
  "Fish": "🐟",
  "Shrimp": "🦐",
  "Duck Farming": "🦆",
  "Grazing": "🐄",
  "Consult local agriculture officer": "📋"
};

// Crop suggestions data (remains unchanged)
const cropSuggestions = {
  "Ucha Jomi": {
    "Doash Mati": ["Mustard", "Wheat", "Jute", "Vegetables"],
    "Balu Mati": ["Groundnut", "Sweet Potato", "Watermelon"],
    "Kalo Mati": ["Chili", "Potato", "Garlic", "Spinach"],
    others: ["Pulses", "Sunflower", "Seasonal Vegetables"],
  },
  "Moddhom Jomi": {
    "Doash Mati": ["Boro Rice", "Aman Rice", "Mustard", "Onion"],
    "Dona Mati": ["Aman Rice", "Vegetables", "Turmeric"],
    "Kalo Mati": ["Wheat", "Garlic", "Spinach"],
    others: ["Boro Rice", "Vegetables", "Jute"],
  },
  "Nicher Jomi": {
    "Dona Mati": ["Deepwater Aman", "Boro Rice", "Jute"],
    "Pank Mati": ["Aman Rice", "Floating Vegetables", "Lotus", "Fish"],
    others: ["Boro Rice", "Water Chestnut", "Fish"],
  },
  "Ati Nicher Jomi": {
    "Pank Mati": ["Floating Rice", "Kachu", "Fish", "Lotus"],
    "Teep Mati": ["Water Chestnut", "Fish", "Pani Shak"],
    others: ["Kachu", "Fish", "Aqua Vegetables"],
  },
  Char: {
    "Balu Mati": ["Pumpkin", "Maize", "Watermelon", "Sesame"],
    "Doash Mati": ["Mustard", "Vegetables", "Sunflower", "Groundnut"],
    others: ["Maize", "Sesame", "Khesari"],
  },
  Haor: {
    "Dona Mati": ["Boro Rice", "Fish"],
    "Pank Mati": ["Kachu", "Fish", "Duck Farming"],
    others: ["Boro Rice", "Onion", "Fish"],
  },
  "Upokulio Jomi": {
    "Lona Mati": ["BRRI dhan47", "BRRI dhan73", "Khesari", "Sunflower", "Shrimp"],
    others: ["Salt-tolerant Rice", "Barley", "Shrimp"],
  },
  Charonabhumi: {
    "Doash Mati": ["Napier Grass", "Lucerne", "Fodder Maize"],
    others: ["Grazing"],
  },
  Others: {
    others: ["Consult local agriculture officer"],
  },
}

export default function LandDetailsPage() {
  const params = useParams()
  const [land, setLand] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [refreshCropRecords, setRefreshCropRecords] = useState(0)
  const [existingCropRecords, setExistingCropRecords] = useState([])

  const fetchLandDetails = useCallback(async () => {
    if (!params.id) return;
    setIsLoading(true);
    try {
      const response = await fetch(`/api/lands/${params.id}`, {
        credentials: "include",
      })
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setLand(result.land)
        }
      }
    } catch (error) {
      console.error("Error fetching land details:", error)
    } finally {
      setIsLoading(false)
    }
  }, [params.id]);

  useEffect(() => {
    fetchLandDetails()
  }, [fetchLandDetails])

  const handleCropRecordAdded = () => {
    setIsDialogOpen(false)
    setRefreshCropRecords(prev => prev + 1)
  }

  const getSuggestedCrops = () => {
    if (!land?.land_type) return []
    const landTypeCrops = cropSuggestions[land.land_type]
    if (!landTypeCrops) return cropSuggestions["Others"]["others"];
    return landTypeCrops[land.soil_quality] || landTypeCrops["others"] || []
  }

  const getCropEmoji = (crop) => {
    return cropEmojis[crop] || "🌱"
  }

  if (isLoading) {
    return <PageSkeleton />;
  }

  if (!land) {
    return (
      <div className="max-w-6xl mx-auto text-center py-16 px-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Land Not Found</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          The land you're looking for doesn't exist or you don't have permission to view it.
        </p>
        <Link
          href="/lands"
          className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <FiArrowLeft className="h-4 w-4" />
          Back to Lands
        </Link>
      </div>
    )
  }

  const suggestedCrops = getSuggestedCrops()

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/lands" className="p-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors">
          <FiArrowLeft className="h-5 w-5 text-gray-700 dark:text-gray-300" />
        </Link>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">{land.land_type} Land</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Property ID: {land.id}
          </p>
        </div>
      </div>

      {/* Top Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Image */}
        <div className="md:col-span-1 space-y-6">
          <div className="relative aspect-square w-full bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
            {land.land_image ? (
              <Image
                src={land.land_image}
                alt={`${land.land_type} land`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <FiMap className="h-16 w-16 text-gray-400 dark:text-gray-500" />
              </div>
            )}
          </div>

          {land.location_link && (
            <a
              href={land.location_link}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors font-semibold"
            >
              <FiMapPin className="h-5 w-5" />
              View on Map
            </a>
          )}
        </div>
        
        {/* Right Column: Details */}
        <div className="md:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 h-full">
             <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Property Details</h2>
             
             <div className="mb-6">
                 <h3 className="text-md font-semibold text-gray-800 dark:text-gray-300 mb-3 border-b border-gray-200 dark:border-gray-700 pb-2">Overview</h3>
                 <ul className="space-y-3 text-sm pt-2">
                    <li className="flex justify-between items-center"><span className="text-gray-600 dark:text-gray-400">Area:</span> <span className="font-medium text-gray-900 dark:text-white">{land.area} acres</span></li>
                    <li className="flex justify-between items-center"><span className="text-gray-600 dark:text-gray-400">Soil Quality:</span> <span className="font-medium text-gray-900 dark:text-white">{land.soil_quality || 'N/A'}</span></li>
                 </ul>
             </div>

             {land.description && (
                <div className="mb-6">
                   <h3 className="text-md font-semibold text-gray-800 dark:text-gray-300 mb-3 border-b border-gray-200 dark:border-gray-700 pb-2 flex items-center gap-2"><FiInfo /> Description</h3>
                   <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed pt-2">{land.description}</p>
                </div>
             )}
             
             {land.tags && land.tags.length > 0 && (
                <div>
                   <h3 className="text-md font-semibold text-gray-800 dark:text-gray-300 mb-3 border-b border-gray-200 dark:border-gray-700 pb-2 flex items-center gap-2"><FiTag /> Tags</h3>
                   <div className="flex flex-wrap gap-2 pt-2">
                      {land.tags.map((tag, index) => (
                         <span key={index} className="px-3 py-1 bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200 text-xs font-medium rounded-full">
                            {tag}
                         </span>
                      ))}
                   </div>
                </div>
             )}
          </div>
        </div>
      </div>
      
      {/* Full-Width Bottom Sections */}
      {suggestedCrops.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><FaSeedling /> Recommended Crops</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
            {suggestedCrops.map((crop, index) => (
              <div key={index} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2 text-center hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700 h-12 flex items-center justify-center">
                <div className="flex items-center gap-1">
                  <span className="text-lg">{getCropEmoji(crop)}</span>
                  <p className="font-medium text-gray-800 dark:text-gray-200 text-xs">{crop}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
         <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <FaChartLine className="h-6 w-6 text-green-600" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Crop Management</h2>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <button className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:scale-105 text-white rounded-full transition-all duration-200 shadow-lg hover:shadow-xl font-medium">
                  <FiPlus className="h-4 w-4" />
                  Add Crop Record
                </button>
              </DialogTrigger>
              <AddCropRecordDialog 
                landId={land.id} 
                onSuccess={handleCropRecordAdded} 
                existingRecords={existingCropRecords}
              />
            </Dialog>
         </div>
         <CropRecordsSection 
           landId={land.id} 
           key={refreshCropRecords} 
           onRecordsChange={setExistingCropRecords}
         />
      </div>
    </div>
  )
}