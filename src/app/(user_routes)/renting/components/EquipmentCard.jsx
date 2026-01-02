import React from 'react';

const EquipmentCard = ({ equipment, user, onRequestRent, userRequests = [] }) => {
  const isOwner = equipment.owner_id === user?.id;
  const hasExistingRequest = userRequests.some(
    request => request.equipment_id === equipment.id && 
    (request.status === 'pending' || request.status === 'accepted')
  );
  
  const getButtonText = () => {
    if (isOwner) return 'Your Equipment';
    if (hasExistingRequest) return 'Request Already Sent';
    return 'Request to Rent';
  };
  
  const isButtonDisabled = isOwner || equipment.status !== 'available' || hasExistingRequest;
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
      <div className="p-6">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {equipment.equipment_name}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            {equipment.description}
          </p>
        </div>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-green-600 font-medium">💰 ${equipment.price_per_day}/day</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
            <span>📅 Max {equipment.max_duration_days} days</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
            <span>📞 {equipment.owner_phone}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
            <span>✉️ {equipment.owner_email}</span>
          </div>
          <div className="mt-2">
            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
              equipment.status === 'available' 
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                : equipment.status === 'rented'
                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
            }`}>
              {equipment.status}
            </span>
          </div>
        </div>
        
        <button 
          className={`w-full py-2 px-4 rounded-full font-medium transition-colors ${
            isButtonDisabled
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-600 dark:text-gray-400'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
          onClick={() => onRequestRent(equipment)}
          disabled={isButtonDisabled}
        >
          {getButtonText()}
        </button>
      </div>
    </div>
  );
};

export default EquipmentCard;
