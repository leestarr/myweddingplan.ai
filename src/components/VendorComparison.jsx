import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

const VendorComparison = ({ vendors, onClose, onRemoveVendor }) => {
  if (vendors.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Compare Vendors ({vendors.length})</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vendors.map((vendor) => (
            <div key={vendor.id} className="border rounded-lg p-4 relative">
              <button
                onClick={() => onRemoveVendor(vendor.id)}
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
              
              <img
                src={vendor.image}
                alt={vendor.name}
                className="w-full h-40 object-cover rounded-lg mb-3"
              />
              <h4 className="font-semibold mb-2">{vendor.name}</h4>
              
              <div className="space-y-2">
                <div>
                  <span className="text-gray-600">Price Range:</span>
                  <span className="ml-2">{vendor.priceRange}</span>
                </div>
                <div>
                  <span className="text-gray-600">Services:</span>
                  <span className="ml-2">{vendor.services.join(', ')}</span>
                </div>
                <div>
                  <span className="text-gray-600">Availability:</span>
                  <span className="ml-2">
                    {vendor.isAvailable ? 'Available' : 'Not available'} on your date
                  </span>
                </div>
                {vendor.packages && (
                  <div>
                    <span className="text-gray-600">Packages:</span>
                    <ul className="ml-4 list-disc">
                      {vendor.packages.map((pkg, index) => (
                        <li key={index}>{pkg}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VendorComparison;
