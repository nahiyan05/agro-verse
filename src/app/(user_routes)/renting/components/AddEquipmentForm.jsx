import React from 'react';

const AddEquipmentForm = ({ 
  equipmentForm, 
  setEquipmentForm, 
  onSubmit, 
  user,
  loading 
}) => {
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEquipmentForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label htmlFor="equipment_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Equipment Name *
        </label>
        <input
          type="text"
          id="equipment_name"
          name="equipment_name"
          value={equipmentForm.equipment_name}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          required
        />
      </div>
      
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={equipmentForm.description}
          onChange={handleInputChange}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="price_per_day" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Price per Day ($) *
          </label>
          <input
            type="number"
            step="0.01"
            id="price_per_day"
            name="price_per_day"
            value={equipmentForm.price_per_day}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            required
          />
        </div>
        
        <div>
          <label htmlFor="max_duration_days" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Max Duration (days) *
          </label>
          <input
            type="number"
            id="max_duration_days"
            name="max_duration_days"
            value={equipmentForm.max_duration_days}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            required
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Your Phone
          </label>
          <input
            type="text"
            value={user?.phone || ''}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white"
            disabled
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Your Email
          </label>
          <input
            type="email"
            value={user?.email || ''}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white"
            disabled
          />
        </div>
      </div>
      
      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="submit"
          disabled={loading}
          className={`px-6 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
            loading 
              ? 'bg-gray-400 text-white cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {loading ? 'Adding...' : 'Add Equipment'}
        </button>
      </div>
    </form>
  );
};

export default AddEquipmentForm;
