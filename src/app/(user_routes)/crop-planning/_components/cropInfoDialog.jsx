"use client"
import {  FiLoader } from "react-icons/fi"
export default function CropInfoDialog({
  editingPlan,
  formData,
  setFormData,
  handleSubmit,
  isSubmitting,
  userLands,
  seasons,
  yieldUnits,
  cropEmojis
}) {


  const handleCropSelectChange = (e) => {
    setFormData({ 
      ...formData, 
      crop_name_select: e.target.value, 
      crop_name_other: '' 
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
      {/* Land Selection */}
      <div>
        <label className="block text-sm font-medium mb-2">Land </label>
        <select
          value={formData.land_id}
          onChange={(e) => setFormData({ ...formData, land_id: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600"
        >
          <option value="">Select a land</option>
          {userLands.map(land => (
            <option key={land.id} value={land.id}>
              {land.land_type} - {land.area} acres
            </option>
          ))}
        </select>
      </div>
      
      {/* Crop Name Selection */}
      <div>
        <label className="block text-sm font-medium mb-2">Crop Name *</label>
        <select
          value={formData.crop_name_select}
          onChange={handleCropSelectChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600"
          required
        >
          <option value="">Select a crop</option>
          {Object.entries(cropEmojis).map(([name, emoji]) => (
            <option key={name} value={name}>
              {emoji} {name.charAt(0).toUpperCase() + name.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Conditional Input for "Other" Crop */}
      {formData.crop_name_select === 'other' && (
        <div>
          <label className="block text-sm font-medium mb-2">Please Specify Crop *</label>
          <input
            type="text"
            value={formData.crop_name_other}
            onChange={(e) => setFormData({ ...formData, crop_name_other: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600"
            placeholder="e.g., Sunflower"
            required
          />
        </div>
      )}
      
      {/* Season Selection */}
      <div>
        <label className="block text-sm font-medium mb-2">Season *</label>
        <select
          value={formData.season}
          onChange={(e) => setFormData({ ...formData, season: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600"
          required
        >
          <option value="">Select season</option>
          {seasons.map(season => (
            <option key={season} value={season}>{season}</option>
          ))}
        </select>
      </div>
      
      {/* Dates */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Planting Date</label>
          <input
            type="date"
            value={formData.planting_date}
            onChange={(e) => setFormData({ ...formData, planting_date: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Expected Harvest</label>
          <input
            type="date"
            value={formData.expected_harvest_date}
            onChange={(e) => setFormData({ ...formData, expected_harvest_date: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600"
          />
        </div>
      </div>
      
      {/* Yield */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Estimated Yield</label>
          <input
            type="number"
            step="0.01"
            value={formData.estimated_yield}
            onChange={(e) => setFormData({ ...formData, estimated_yield: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Unit</label>
          <select
            value={formData.yield_unit}
            onChange={(e) => setFormData({ ...formData, yield_unit: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600"
          >
            {yieldUnits.map(unit => (
              <option key={unit} value={unit}>{unit}</option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Notes */}
      <div>
        <label className="block text-sm font-medium mb-2">Notes (optional) </label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600"
          rows={3}
        />
      </div>
      
      <div className="w-full flex justify-center items-center">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full px-4 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 disabled:opacity-50 transition-colors flex justify-center items-center"
        >
          {isSubmitting ? (
            <span className="flex flex-row items-center w-full justify-center">
              <FiLoader className="animate-spin h-5 w-5 mr-2" />
              {`Submitting...`}
            </span>
          ) : editingPlan ? "Update Plan" : "Create Plan"}
        </button>
      </div>
    </form>
  )
}