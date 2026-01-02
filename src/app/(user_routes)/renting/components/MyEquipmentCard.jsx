import React from 'react';

const MyEquipmentCard = ({ equipment, requests, onAcceptRequest, acceptingRequest }) => {
  const pendingRequests = requests.filter(req => req.equipment_id === equipment.id && req.status === 'pending');

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
        
        <div className="mt-4">
          <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">Rental Requests:</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {pendingRequests.length > 0 ? (
              pendingRequests.map((request) => (
                <div key={request.id} className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700">
                  <div className="flex justify-between items-start">
                    <div className="text-sm flex-1">
                      <div className="flex items-center gap-1 mb-1">
                        <span className="font-medium text-gray-900 dark:text-white">👤 {request.name || request.requester_id}</span>
                      </div>
                      <div className="flex items-center gap-1 mb-1">
                        <span className="text-green-600">💰 ${request.price_per_day_requested}/day</span>
                      </div>
                      <div className="flex items-center gap-1 mb-1">
                        <span className="text-gray-600 dark:text-gray-300">📅 {request.requested_duration_days} days</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-500 dark:text-gray-400">📞 {request.requester_phone}</span>
                      </div>
                    </div>
                    <button 
                      className={`ml-2 px-3 py-1 rounded-full text-sm transition-colors ${
                        acceptingRequest === request.id
                          ? 'bg-gray-400 text-white cursor-not-allowed'
                          : 'bg-green-600 text-white hover:bg-green-700'
                      }`}
                      onClick={() => onAcceptRequest(request.id, equipment.id)}
                      disabled={acceptingRequest === request.id}
                    >
                      {acceptingRequest === request.id ? 'Accepting...' : 'Accept'}
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">No pending requests</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyEquipmentCard;
