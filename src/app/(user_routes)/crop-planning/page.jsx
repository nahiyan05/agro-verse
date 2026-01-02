"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { FaSeedling } from "react-icons/fa";
import {
  FiCalendar,
  FiChevronDown,
  FiEdit,
  FiMapPin,
  FiPlus,
  FiSearch,
  FiTrash2,
  FiTrendingUp,
  FiUsers,
} from "react-icons/fi";
import CropInfoDialog from "./_components/cropInfoDialog";

const cropEmojis = {
  Rice: "🍚",
  Wheat: "🌾",
  Maize: "🌽",
  Potato: "🥔",
  Onion: "🧅",
  Garlic: "🧄",
  Chili: "🌶️",
  Tomato: "🍅",
  Vegetables: "🥬",
  Fruits: "🍎",
  Spices: "🌿",
  Jute: "🌾",
  Mustard: "🟡",
  other: "🌱",
};

const getCropEmoji = (cropName) => {
  return cropEmojis[cropName] || cropEmojis.other;
};

const seasons = ["Winter", "Spring", "Summer", "Monsoon"];
const yieldUnits = ["kg", "ton", "quintal", "maund"];

const tabs = [
  { id: "my-plans", label: "My Plans" },
  { id: "public-plans", label: "Community Plans" },
];

export default function CropPlanningPage() {
  const [cropPlans, setCropPlans] = useState([]);
  const [publicPlans, setPublicPlans] = useState([]);
  const [userLands, setUserLands] = useState([]);
  const [recommendations, setRecommendations] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false); // State for community search
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("my-plans");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State for filters
  const [seasonFilter, setSeasonFilter] = useState("");
  const [searchType, setSearchType] = useState("crop_name");
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    land_id: "",
    crop_name_select: "",
    crop_name_other: "",
    season: "",
    planting_date: "",
    expected_harvest_date: "",
    estimated_yield: "",
    yield_unit: "kg",
    notes: "",
  });

  const isInitialMount = useRef(true);

  useEffect(() => {
    fetchData();
    fetchRecommendations();
    fetchUserLands();
  }, []);

  useEffect(() => {
    // Prevent this from running on the initial render because fetchData() already covers it.
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (activeTab === "my-plans") {
      fetchCropPlans();
    } else {
      handlePublicPlansFetch(); // Use the wrapper to show search skeleton
    }
  }, [activeTab, seasonFilter]);

  const fetchData = async () => {
    await Promise.all([fetchCropPlans(), fetchPublicPlans()]);
  };

  const fetchCropPlans = async () => {
    try {
      setError(null);
      const params = new URLSearchParams();
      if (seasonFilter) params.append("season", seasonFilter);

      const response = await fetch(`/api/crop-plans?${params}`, {
        credentials: "include",
      });
      const result = await response.json();

      if (response.ok && result.success) {
        setCropPlans(result.cropPlans || []);
      } else {
        setError(result.message || "Failed to fetch crop plans");
      }
    } catch (error) {
      console.error("Error fetching crop plans:", error);
      setError("Network error occurred while fetching crop plans");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPublicPlans = async () => {
    try {
      const params = new URLSearchParams({ public: "true" });
      if (seasonFilter) params.append("season", seasonFilter);
      if (searchTerm) params.append(searchType, searchTerm);

      const response = await fetch(`/api/crop-plans?${params}`, {
        credentials: "include",
      });
      const result = await response.json();

      if (response.ok && result.success) {
        setPublicPlans(result.cropPlans || []);
      }
    } catch (error) {
      console.error("Error fetching public plans:", error);
    }
  };

  const handlePublicPlansFetch = async () => {
    setIsSearching(true);
    try {
      await fetchPublicPlans();
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = () => {
    handlePublicPlansFetch();
  };

  const handleSearchTypeChange = (newType) => {
    setSearchType(newType);
    setSearchTerm("");
  };

  const fetchRecommendations = async () => {
    try {
      const response = await fetch("/api/crop-plans/recommendations", {
        credentials: "include",
      });
      const result = await response.json();
      if (response.ok && result.success) {
        setRecommendations(result);
      }
    } catch (error) {
      console.error("Error fetching recommendations:", error);
    }
  };

  const fetchUserLands = async () => {
    try {
      const response = await fetch("/api/lands", {
        credentials: "include",
      });
      const result = await response.json();
      if (response.ok && result.success) {
        setUserLands(result.lands || []);
      }
    } catch (error) {
      console.error("Error fetching user lands:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    const { crop_name_select, crop_name_other, ...restOfData } = formData;
    const finalCropName =
      crop_name_select === "other" ? crop_name_other : crop_name_select;

    const payload = {
      ...restOfData,
      crop_name: finalCropName,
    };

    try {
      const url = editingPlan
        ? `/api/crop-plans/${editingPlan.id}`
        : "/api/crop-plans";
      const method = editingPlan ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });
      const result = await response.json();

      if (response.ok && result.success) {
        resetForm();
        setIsCreateDialogOpen(false);
        setEditingPlan(null);
        fetchCropPlans();
      } else {
        console.error("Failed to save crop plan:", result.message);
      }
    } catch (error) {
      console.error("Error saving crop plan:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      land_id: "",
      crop_name_select: "",
      crop_name_other: "",
      season: "",
      planting_date: "",
      expected_harvest_date: "",
      estimated_yield: "",
      yield_unit: "kg",
      notes: "",
    });
  };

  const handleEdit = (plan) => {
    setEditingPlan(plan);
    const isKnownCrop = Object.keys(cropEmojis).includes(plan.crop_name);

    setFormData({
      land_id: plan.land_id || "",
      crop_name_select: isKnownCrop ? plan.crop_name : "other",
      crop_name_other: isKnownCrop ? "" : plan.crop_name,
      season: plan.season,
      planting_date: plan.planting_date?.split("T")[0] || "",
      expected_harvest_date: plan.expected_harvest_date?.split("T")[0] || "",
      estimated_yield: plan.estimated_yield || "",
      yield_unit: plan.yield_unit || "kg",
      notes: plan.notes || "",
    });
    setIsCreateDialogOpen(true);
  };

  const handleDelete = async (planId) => {
    if (!confirm("Are you sure you want to delete this crop plan?")) return;
    try {
      const response = await fetch(`/api/crop-plans/${planId}`, {
        method: "DELETE",
        credentials: "include",
      });
      const result = await response.json();
      if (response.ok && result.success) {
        fetchCropPlans();
      } else {
        console.error("Failed to delete crop plan:", result.message);
      }
    } catch (error) {
      console.error("Error deleting crop plan:", error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (isLoading) {
    return <CropPlanningPageSkeleton />;
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Crop Planning
          </h1>
        </div>
        <Dialog
          open={isCreateDialogOpen}
          onOpenChange={(open) => {
            setIsCreateDialogOpen(open);
            if (!open) {
              setEditingPlan(null);
              resetForm();
            }
          }}
        >
          <DialogTrigger asChild>
            <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors">
              <FiPlus className="h-4 w-4" />
              Plan Crop
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingPlan ? "Edit Crop Plan" : "Create New Crop Plan"}
              </DialogTitle>
            </DialogHeader>
            <CropInfoDialog
              editingPlan={editingPlan}
              formData={formData}
              setFormData={setFormData}
              handleSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              userLands={userLands}
              seasons={seasons}
              yieldUnits={yieldUnits}
              cropEmojis={cropEmojis}
            />
          </DialogContent>
        </Dialog>
      </div>

      {recommendations && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
          <div className="flex items-center gap-3 mb-4">
            <FaSeedling className="h-6 w-6 text-green-600" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              {recommendations.currentSeason} Season Recommendations
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {recommendations.recommendedCrops.map((crop, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 px-3 py-1 bg-white dark:bg-gray-800 rounded-full text-sm font-medium text-green-700 dark:text-green-400 border border-green-200 dark:border-green-700"
              >
                {getCropEmoji(crop)}
                {crop}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="relative w-full sm:w-[60%] lg:w-[40%] flex space-x-1 bg-gray-200 dark:bg-gray-800 rounded-full p-1">
        <motion.div
          className="absolute top-1 bottom-1 bg-white dark:bg-gray-700 rounded-full shadow-sm"
          initial={false}
          animate={{
            x: `${tabs.findIndex((tab) => tab.id === activeTab) * 96}%`,
          }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30,
          }}
          style={{ width: `calc(100% / ${tabs.length})` }}
        />
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative z-10 flex-1 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "text-gray-900 dark:text-white"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="flex-shrink-0 relative">
          <select
            value={seasonFilter}
            onChange={(e) => setSeasonFilter(e.target.value)}
            className="px-4 py-2 pr-3 border border-gray-300 dark:border-gray-600 rounded-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">All Seasons</option>
            {seasons.map((season) => (
              <option key={season} value={season}>
                {season}
              </option>
            ))}
          </select>
        </div>

        <AnimatePresence>
          {activeTab === "public-plans" && (
            <motion.div
              className="flex items-center gap-3 w-full max-w-2xl flex-grow"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex w-full items-center border border-gray-300 dark:border-gray-600 rounded-full overflow-hidden bg-white dark:bg-gray-800 shadow-sm focus-within:ring-2 focus-within:ring-green-500 transition-all flex-grow">
                <div className="relative">
                  <select
                    value={searchType}
                    onChange={(e) => handleSearchTypeChange(e.target.value)}
                    className="h-full pl-4 pr-8 py-2 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-r border-gray-300 dark:border-gray-600 text-sm font-medium appearance-none focus:outline-none cursor-pointer"
                  >
                    <option value="crop_name">Crop</option>
                    <option value="location">Location</option>
                  </select>
                  <FiChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    {searchType === "crop_name" ? (
                      <FiSearch className="h-4 w-4" />
                    ) : (
                      <FiMapPin className="h-4 w-4" />
                    )}
                  </span>
                  <input
                    type="text"
                    placeholder={
                      searchType === "crop_name"
                        ? "e.g., Rice, Potato..."
                        : "e.g., Dhaka..."
                    }
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                    className="w-full pl-10 pr-4 py-2 bg-transparent focus:outline-none text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              <button
                onClick={handleSearch}
                className="px-6 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors flex-shrink-0 font-medium shadow-sm"
              >
                Search
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div>
        {activeTab === "public-plans" && isSearching ? (
          <div>
            <div className="text-center py-4">
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">
                Searching...
              </h3>
            </div>
            <CardGridSkeleton />
          </div>
        ) : (activeTab === "my-plans" ? cropPlans : publicPlans).length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {(activeTab === "my-plans" ? cropPlans : publicPlans).map(
                (plan, index) => (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="text-3xl">
                          {getCropEmoji(plan.crop_name)}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {plan.crop_name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {plan.season}
                          </p>
                        </div>
                      </div>

                      {activeTab === "my-plans" && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(plan)}
                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          >
                            <FiEdit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(plan.id)}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          >
                            <FiTrash2 className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>

                    {activeTab === "public-plans" && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
                        <Link
                          href={`/profile/${plan.user_id}`}
                          className="flex items-center gap-2 hover:text-green-600 transition-colors"
                        >
                          {plan.farmer_profile_pic ? (
                            <Image
                              src={plan.farmer_profile_pic}
                              alt={plan.farmer_name}
                              width={20}
                              height={20}
                              className="rounded-full"
                            />
                          ) : (
                            <FiUsers className="h-5 w-5" />
                          )}
                          <span>{plan.farmer_name}</span>
                        </Link>
                        {plan.farmer_area && (
                          <span>• {plan.farmer_area}</span>
                        )}
                      </div>
                    )}

                    <div className="space-y-2 mb-4">
                      {plan.planting_date && (
                        <div className="flex items-center gap-2 text-sm">
                          <FiCalendar className="h-4 w-4 text-green-600" />
                          <span className="text-gray-600 dark:text-gray-400">
                            Planting:
                          </span>
                          <span>{formatDate(plan.planting_date)}</span>
                        </div>
                      )}
                      {plan.expected_harvest_date && (
                        <div className="flex items-center gap-2 text-sm">
                          <FiCalendar className="h-4 w-4 text-orange-600" />
                          <span className="text-gray-600 dark:text-gray-400">
                            Harvest:
                          </span>
                          <span>
                            {formatDate(plan.expected_harvest_date)}
                          </span>
                        </div>
                      )}
                    </div>

                    {plan.estimated_yield && (
                      <div className="flex items-center gap-2 text-sm mb-4">
                        <FiTrendingUp className="h-4 w-4 text-purple-600" />
                        <span className="text-gray-600 dark:text-gray-400">
                          Expected Yield:
                        </span>
                        <span className="font-medium">
                          {plan.estimated_yield} {plan.yield_unit}
                        </span>
                      </div>
                    )}

                    {plan.land_type && (
                      <div className="flex items-center gap-2 text-sm mb-4">
                        <FiMapPin className="h-4 w-4 text-blue-600" />
                        <span className="text-gray-600 dark:text-gray-400">
                          Land:
                        </span>
                        <span>
                          {plan.land_type} ({plan.land_area} acres)
                        </span>
                      </div>
                    )}

                    {activeTab === "my-plans" && plan.notes && (
                      <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {plan.notes}
                        </p>
                      </div>
                    )}
                  </motion.div>
                )
              )}
            </AnimatePresence>
          </div>
        ) : (
          !error && (
            <div className="text-center py-12">
              <FaSeedling className="h-16 w-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                {activeTab === "my-plans"
                  ? "No crop plans yet"
                  : "No community plans found"}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {activeTab === "my-plans"
                  ? "Start planning your seasonal crops"
                  : "Try adjusting your search or filters"}
              </p>
              {activeTab === "my-plans" && (
                <button
                  onClick={() => setIsCreateDialogOpen(true)}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Create First Plan
                </button>
              )}
            </div>
          )
        )}
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}
    </div>
  );
}

// Skeleton Components

const CardGridSkeleton = ({ count = 6 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {[...Array(count)].map((_, index) => (
      <div
        key={index}
        className="bg-white dark:bg-gray-800/50 rounded-xl p-6 border"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div>
              <Skeleton className="h-6 w-28 mb-2" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
        </div>
        <div className="space-y-3">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    ))}
  </div>
);

const CropPlanningPageSkeleton = () => (
  <div className="max-w-7xl mx-auto p-6 space-y-6 animate-pulse">
    {/* Header */}
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <Skeleton className="h-9 w-48" />
      <Skeleton className="h-10 w-32 rounded-full" />
    </div>

    {/* Recommendations block */}
    <div className="p-6 border rounded-xl">
      <Skeleton className="h-6 w-1/3 mb-4" />
      <div className="flex flex-wrap gap-2">
        <Skeleton className="h-7 w-20 rounded-full" />
        <Skeleton className="h-7 w-24 rounded-full" />
        <Skeleton className="h-7 w-16 rounded-full" />
      </div>
    </div>

    {/* Tabs */}
    <Skeleton className="h-12 w-full sm:w-[60%] lg:w-[40%] rounded-full" />

    {/* Filters */}
    <div className="flex items-center gap-3">
      <Skeleton className="h-10 w-36 rounded-full" />
    </div>

    {/* Grid of cards */}
    <CardGridSkeleton />
  </div>
);