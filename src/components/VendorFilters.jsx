import React from 'react';
import { Disclosure } from '@headlessui/react';
import { ChevronUpIcon } from '@heroicons/react/24/outline';

const serviceOptions = {
  'Venue': ['Indoor Venue', 'Outdoor Venue', 'Beach Venue', 'Garden Venue', 'Historic Venue'],
  'Photography': ['Wedding Photos', 'Engagement Photos', 'Bridal Portraits', 'Videography'],
  'Catering': ['Full Service', 'Buffet Style', 'Plated Service', 'Food Truck', 'Dessert Only'],
  'Music': ['DJ Services', 'Live Band', 'String Quartet', 'Solo Musician'],
  'Florist': ['Bouquets', 'Centerpieces', 'Ceremony Flowers', 'Full Decoration'],
};

const priceRangeOptions = [
  { label: 'Under $1,000', value: [0, 1000] },
  { label: '$1,000 - $3,000', value: [1000, 3000] },
  { label: '$3,000 - $5,000', value: [3000, 5000] },
  { label: '$5,000 - $10,000', value: [5000, 10000] },
  { label: '$10,000+', value: [10000, Infinity] },
];

const VendorFilters = ({ filters, onFilterChange, selectedCategory, weddingDate = null }) => {
  const handleServiceChange = (service) => {
    const updatedServices = filters.services.includes(service)
      ? filters.services.filter(s => s !== service)
      : [...filters.services, service];
    onFilterChange({ ...filters, services: updatedServices });
  };

  const handlePriceRangeChange = (range) => {
    const updatedPriceRanges = filters.priceRanges.includes(range)
      ? filters.priceRanges.filter(r => r !== range)
      : [...filters.priceRanges, range];
    onFilterChange({ ...filters, priceRanges: updatedPriceRanges });
  };

  const handleLocationChange = (e) => {
    onFilterChange({
      ...filters,
      location: {
        ...filters.location,
        [e.target.name]: e.target.value,
      },
    });
  };

  return (
    <div className="space-y-4">
      {weddingDate && (
        <div className="pb-4 border-b border-gray-200">
          <label className="flex items-center">
            <input
              type="checkbox"
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 h-4 w-4"
              checked={filters.availableOnWeddingDate}
              onChange={(e) => onFilterChange({ ...filters, availableOnWeddingDate: e.target.checked })}
            />
            <span className="ml-2 text-sm text-gray-600">
              Available on {new Date(weddingDate).toLocaleDateString()}
            </span>
          </label>
        </div>
      )}

      {/* Services */}
      <Disclosure defaultOpen>
        {({ open }) => (
          <>
            <Disclosure.Button className="flex w-full justify-between items-center text-left">
              <span className="text-sm font-medium text-gray-900">Services</span>
              <ChevronUpIcon
                className={`${open ? 'rotate-180 transform' : ''} h-5 w-5 text-gray-500`}
              />
            </Disclosure.Button>
            <Disclosure.Panel className="pt-4 pb-2">
              <div className="space-y-4">
                {Object.entries(serviceOptions).map(([category, services]) => (
                  <div key={category} className="space-y-2">
                    <h3 className="text-sm font-medium text-gray-500">{category}</h3>
                    <div className="space-y-2">
                      {services.map(service => (
                        <label key={service} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={filters.services.includes(service)}
                            onChange={() => handleServiceChange(service)}
                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 h-4 w-4"
                          />
                          <span className="ml-2 text-sm text-gray-600">{service}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>

      {/* Price Range */}
      <Disclosure defaultOpen>
        {({ open }) => (
          <>
            <Disclosure.Button className="flex w-full justify-between items-center text-left">
              <span className="text-sm font-medium text-gray-900">Price Range</span>
              <ChevronUpIcon
                className={`${open ? 'rotate-180 transform' : ''} h-5 w-5 text-gray-500`}
              />
            </Disclosure.Button>
            <Disclosure.Panel className="pt-4 pb-2">
              <div className="space-y-2">
                {priceRangeOptions.map((range) => (
                  <label key={range.label} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.priceRanges.includes(range.label)}
                      onChange={() => handlePriceRangeChange(range.label)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 h-4 w-4"
                    />
                    <span className="ml-2 text-sm text-gray-600">{range.label}</span>
                  </label>
                ))}
              </div>
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>

      {/* Location */}
      <Disclosure defaultOpen>
        {({ open }) => (
          <>
            <Disclosure.Button className="flex w-full justify-between items-center text-left">
              <span className="text-sm font-medium text-gray-900">Location</span>
              <ChevronUpIcon
                className={`${open ? 'rotate-180 transform' : ''} h-5 w-5 text-gray-500`}
              />
            </Disclosure.Button>
            <Disclosure.Panel className="pt-4 pb-2">
              <div className="space-y-4">
                <div>
                  <label htmlFor="city" className="block text-sm text-gray-600">City</label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={filters.location.city}
                    onChange={handleLocationChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="distance" className="block text-sm text-gray-600">Distance (miles)</label>
                  <select
                    id="distance"
                    name="distance"
                    value={filters.location.distance}
                    onChange={handleLocationChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  >
                    <option value="5">Within 5 miles</option>
                    <option value="10">Within 10 miles</option>
                    <option value="25">Within 25 miles</option>
                    <option value="50">Within 50 miles</option>
                    <option value="100">Within 100 miles</option>
                  </select>
                </div>
              </div>
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>
    </div>
  );
};

export default VendorFilters;
