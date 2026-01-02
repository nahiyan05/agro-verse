import React from 'react';

const RentRequestForm = ({ 
  rentRequestForm, 
  setRentRequestForm, 
  onSubmit, 
  selectedEquipment, 
  user,
  loading 
}) => {
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRentRequestForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Request to Rent: {selectedEquipment?.equipment_name}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Submit your rental request with your offer and duration.
        </p>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="price_per_day_requested" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Your Offer per Day ($) *
          </label>
          <input
            type="number"
            step="0.01"
            id="price_per_day_requested"
            name="price_per_day_requested"
            value={rentRequestForm.price_per_day_requested}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            required
          />
        </div>
        
        <div>
          <label htmlFor="requested_duration_days" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Duration (days) *
          </label>
          <input
            type="number"
            id="requested_duration_days"
            name="requested_duration_days"
            max={selectedEquipment?.max_duration_days}
            value={rentRequestForm.requested_duration_days}
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
          className={`px-6 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors ${
            loading 
              ? 'bg-gray-400 text-white cursor-not-allowed'
              : 'bg-green-600 text-white hover:bg-green-700'
          }`}
        >
          {loading ? 'Submitting...' : 'Submit Request'}
        </button>
      </div>
    </form>
  );
};

export default RentRequestForm;
