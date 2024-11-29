import React from 'react';
import { Disclosure } from '@headlessui/react';
import { ChevronUpIcon } from '@heroicons/react/24/outline';

const serviceOptions = {
  'Venue': ['Indoor Venue', 'Outdoor Venue', 'Beach Venue', 'Garden Venue', 'Historic Venue'],
  'Catering': ['Full Service', 'Buffet Style', 'Food Stations', 'Plated Service', 'Cocktail Service'],
  'Photography': ['Traditional', 'Photojournalistic', 'Fine Art', 'Aerial', 'Video Services'],
  'Music & Entertainment': ['DJ', 'Live Band', 'String Quartet', 'Solo Musician', 'MC Services'],
  'Florist': ['Bouquets', 'Centerpieces', 'Arch/Chuppah', 'Installation', 'Event Design'],
  'Wedding Planner': ['Full Planning', 'Month-of', 'Day-of', 'Design Services', 'Vendor Coordination'],
};

const priceRanges = [
  { label: 'Under $1,000', value: [0, 1000] },
  { label: '$1,000 - $3,000', value: [1000, 3000] },
  { label: '$3,000 - $5,000', value: [3000, 5000] },
  { label: '$5,000 - $10,000', value: [5000, 10000] },
  { label: '$10,000+', value: [10000, Infinity] },
];

export default function VendorFilters({
  filters,
  onFilterChange,
  selectedCategory,
}) {
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
        [e.target.name]: e.target.value
      }
    });
  };

  const handleDateChange = (e) => {
    onFilterChange({
      ...filters,
      date: e.target.value ? new Date(e.target.value) : null
    });
  };

  return (
    <div className="space-y-4">
      {/* Date Availability */}
      <Disclosure defaultOpen>
        {({ open }) => (
          <>
            <Disclosure.Button className="flex w-full justify-between rounded-lg bg-gray-50 px-4 py-2 text-left text-sm font-medium text-gray-900 hover:bg-gray-100 focus:outline-none">
              <span>Date Availability</span>
              <ChevronUpIcon
                className={`${open ? 'rotate-180 transform' : ''} h-5 w-5 text-gray-500`}
              />
            </Disclosure.Button>
            <Disclosure.Panel className="px-4 pt-4 pb-2 text-sm text-gray-500">
              <input
                type="date"
                value={filters.date ? filters.date.toISOString().split('T')[0] : ''}
                onChange={handleDateChange}
                min={new Date().toISOString().split('T')[0]}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>

      {/* Location */}
      <Disclosure defaultOpen>
        {({ open }) => (
          <>
            <Disclosure.Button className="flex w-full justify-between rounded-lg bg-gray-50 px-4 py-2 text-left text-sm font-medium text-gray-900 hover:bg-gray-100 focus:outline-none">
              <span>Location</span>
              <ChevronUpIcon
                className={`${open ? 'rotate-180 transform' : ''} h-5 w-5 text-gray-500`}
              />
            </Disclosure.Button>
            <Disclosure.Panel className="px-4 pt-4 pb-2 text-sm text-gray-500 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">City</label>
                <input
                  type="text"
                  name="city"
                  value={filters.location.city}
                  onChange={handleLocationChange}
                  className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Distance (miles)</label>
                <select
                  name="distance"
                  value={filters.location.distance}
                  onChange={handleLocationChange}
                  className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                >
                  <option value="5">Within 5 miles</option>
                  <option value="10">Within 10 miles</option>
                  <option value="25">Within 25 miles</option>
                  <option value="50">Within 50 miles</option>
                  <option value="100">Within 100 miles</option>
                </select>
              </div>
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>

      {/* Services */}
      <Disclosure defaultOpen>
        {({ open }) => (
          <>
            <Disclosure.Button className="flex w-full justify-between rounded-lg bg-gray-50 px-4 py-2 text-left text-sm font-medium text-gray-900 hover:bg-gray-100 focus:outline-none">
              <span>Services</span>
              <ChevronUpIcon
                className={`${open ? 'rotate-180 transform' : ''} h-5 w-5 text-gray-500`}
              />
            </Disclosure.Button>
            <Disclosure.Panel className="px-4 pt-4 pb-2 text-sm text-gray-500">
              <div className="space-y-4">
                {serviceOptions[selectedCategory]?.map((service) => (
                  <label key={service} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.services.includes(service)}
                      onChange={() => handleServiceChange(service)}
                      className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-2">{service}</span>
                  </label>
                ))}
              </div>
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>

      {/* Price Packages */}
      <Disclosure defaultOpen>
        {({ open }) => (
          <>
            <Disclosure.Button className="flex w-full justify-between rounded-lg bg-gray-50 px-4 py-2 text-left text-sm font-medium text-gray-900 hover:bg-gray-100 focus:outline-none">
              <span>Price Range</span>
              <ChevronUpIcon
                className={`${open ? 'rotate-180 transform' : ''} h-5 w-5 text-gray-500`}
              />
            </Disclosure.Button>
            <Disclosure.Panel className="px-4 pt-4 pb-2 text-sm text-gray-500">
              <div className="space-y-4">
                {priceRanges.map((range) => (
                  <label key={range.label} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.priceRanges.includes(range.label)}
                      onChange={() => handlePriceRangeChange(range.label)}
                      className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-2">{range.label}</span>
                  </label>
                ))}
              </div>
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>
    </div>
  );
}
