import React, { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import {
  MagnifyingGlassIcon,
  PlusIcon,
  StarIcon,
  XMarkIcon,
  Squares2X2Icon,
  ListBulletIcon,
  AdjustmentsHorizontalIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import VendorModal from '../components/VendorModal';
import BookingModal from '../components/BookingModal';
import VendorReviewModal from '../components/VendorReviewModal';
import VendorFilters from '../components/VendorFilters';
import VendorComparison from '../components/VendorComparison';
import useWeddingDate from '../hooks/useWeddingDate';

// Initial vendor categories
const initialCategories = [
  'Venue',
  'Catering',
  'Photography',
  'Videography',
  'Florist',
  'Music & Entertainment',
  'Wedding Planner',
  'Decor & Rentals',
  'Cake & Desserts',
  'Hair & Makeup',
  'Transportation',
  'Attire & Accessories',
];

// Sample initial vendors (in production, this would come from a database)
const initialVendors = [
  {
    id: 1,
    name: 'Elegant Events Venue',
    category: 'Venue',
    rating: 4.8,
    reviews: 45,
    priceRange: '$$$',
    description: 'Beautiful waterfront venue with indoor and outdoor spaces',
    image: 'https://source.unsplash.com/random/800x600/?wedding,venue',
    contact: {
      phone: '(555) 123-4567',
      email: 'info@elegantevents.com',
      website: 'www.elegantevents.com',
    },
    availability: true,
    location: 'Downtown Wedding City',
    services: ['Ceremony Space', 'Reception Hall', 'Bridal Suite', 'Parking'],
    appointments: [],
  },
  {
    id: 2,
    name: 'Floral Fantasy',
    category: 'Florist',
    rating: 4.9,
    reviews: 38,
    priceRange: '$$',
    description: 'Exquisite floral arrangements for your special day',
    image: 'https://source.unsplash.com/random/800x600/?wedding,flowers',
    contact: {
      phone: '(555) 234-5678',
      email: 'info@floralfantasy.com',
      website: 'www.floralfantasy.com',
    },
    availability: true,
    location: 'Downtown Wedding City',
    services: ['Bouquets', 'Centerpieces', 'Arch Decorations', 'Setup'],
    appointments: [],
  },
  {
    id: 3,
    name: 'Delightful Catering',
    category: 'Catering',
    rating: 4.7,
    reviews: 52,
    priceRange: '$$',
    description: 'Gourmet catering for weddings and special events',
    image: 'https://source.unsplash.com/random/800x600/?wedding,catering',
    contact: {
      phone: '(555) 345-6789',
      email: 'info@delightfulcatering.com',
      website: 'www.delightfulcatering.com',
    },
    availability: false,
    location: 'Downtown Wedding City',
    services: ['Full Service Catering', 'Buffet', 'Plated Service', 'Bar Service'],
    appointments: [],
  },
  {
    id: 4,
    name: 'Sweet Serenade',
    category: 'Music & Entertainment',
    rating: 4.8,
    reviews: 28,
    priceRange: '$$',
    description: 'Live music and entertainment for your wedding day',
    image: 'https://source.unsplash.com/random/800x600/?wedding,music',
    contact: {
      phone: '(555) 456-7890',
      email: 'info@sweetserenade.com',
      website: 'www.sweetserenade.com',
    },
    availability: true,
    location: 'Downtown Wedding City',
    services: ['Live Music', 'DJ Services', 'Emcee'],
    appointments: [],
  },
  {
    id: 5,
    name: 'Dreamy Decor',
    category: 'Decor & Rentals',
    rating: 4.9,
    reviews: 22,
    priceRange: '$$',
    description: 'Wedding decor and rental services for your special day',
    image: 'https://source.unsplash.com/random/800x600/?wedding,decor',
    contact: {
      phone: '(555) 567-8901',
      email: 'info@dreamydecor.com',
      website: 'www.dreamydecor.com',
    },
    availability: true,
    location: 'Downtown Wedding City',
    services: ['Decor Rentals', 'Lighting', 'Furniture'],
    appointments: [],
  },
];

export default function Vendors() {
  const [vendors, setVendors] = useState(() => {
    const saved = localStorage.getItem('weddingVendors');
    return saved ? JSON.parse(saved) : initialVendors;
  });

  const [categories] = useState(initialCategories);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [vendorModalOpen, setVendorModalOpen] = useState(false);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [view, setView] = useState('grid'); // 'grid' or 'list'
  const [sortBy, setSortBy] = useState('rating'); // 'rating', 'reviews', 'price'
  const [filterPrice, setFilterPrice] = useState('All');
  const [comparisonList, setComparisonList] = useState([]);
  const [filters, setFilters] = useState({
    date: null,
    location: {
      city: '',
      distance: '25',
    },
    services: [],
    priceRanges: [],
  });

  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const [selectedVendorsForComparison, setSelectedVendorsForComparison] = useState([]);
  const [isComparisonViewOpen, setIsComparisonViewOpen] = useState(false);

  const weddingDate = useWeddingDate(); // You'll need to implement this hook

  // Save vendors to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('weddingVendors', JSON.stringify(vendors));
  }, [vendors]);

  // Filter and sort vendors
  const filteredVendors = vendors.filter(vendor => {
    // Search text filter
    const matchesSearch = vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vendor.description.toLowerCase().includes(searchQuery.toLowerCase());

    // Category filter
    const matchesCategory = selectedCategory === 'All' || vendor.category === selectedCategory;

    // Date filter
    const matchesDate = !filters.date || vendor.availability;

    // Location filter
    const matchesLocation = !filters.location.city || 
      vendor.location.toLowerCase().includes(filters.location.city.toLowerCase());

    // Services filter
    const matchesServices = filters.services.length === 0 || 
      filters.services.every(service => vendor.services.includes(service));

    // Price range filter
    const matchesPriceRange = filters.priceRanges.length === 0 ||
      filters.priceRanges.some(range => {
        const [min, max] = getPriceRangeValues(range);
        const vendorPrice = estimateVendorPrice(vendor.priceRange);
        return vendorPrice >= min && vendorPrice <= max;
      });

    return matchesSearch && matchesCategory && matchesDate && 
           matchesLocation && matchesServices && matchesPriceRange;
  }).sort((a, b) => {
    if (sortBy === 'rating') return b.rating - a.rating;
    if (sortBy === 'reviews') return b.reviews - a.reviews;
    if (sortBy === 'price') return estimateVendorPrice(a.priceRange) - estimateVendorPrice(b.priceRange);
    return 0;
  });

  const getPriceRangeValues = (rangeLabel) => {
    switch (rangeLabel) {
      case 'Under $1,000': return [0, 1000];
      case '$1,000 - $3,000': return [1000, 3000];
      case '$3,000 - $5,000': return [3000, 5000];
      case '$5,000 - $10,000': return [5000, 10000];
      case '$10,000+': return [10000, Infinity];
      default: return [0, Infinity];
    }
  };

  const estimateVendorPrice = (priceRange) => {
    switch (priceRange) {
      case '$': return 500;
      case '$$': return 2000;
      case '$$$': return 5000;
      case '$$$$': return 10000;
      default: return 0;
    }
  };

  const handleAddVendor = () => {
    setSelectedVendor(null);
    setVendorModalOpen(true);
  };

  const handleEditVendor = (vendor) => {
    setSelectedVendor(vendor);
    setVendorModalOpen(true);
  };

  const handleSaveVendor = (vendorData) => {
    if (selectedVendor) {
      setVendors(prevVendors =>
        prevVendors.map(v =>
          v.id === selectedVendor.id ? { ...vendorData, id: selectedVendor.id } : v
        )
      );
    } else {
      const newVendor = {
        ...vendorData,
        id: Math.max(0, ...vendors.map(v => v.id)) + 1,
        rating: 0,
        reviews: 0,
        appointments: [],
      };
      setVendors(prevVendors => [...prevVendors, newVendor]);
    }
    setVendorModalOpen(false);
  };

  const handleAddToComparison = (vendor) => {
    if (comparisonList.length < 3 && !comparisonList.find(v => v.id === vendor.id)) {
      setComparisonList([...comparisonList, vendor]);
    }
  };

  const handleRemoveFromComparisonList = (vendorId) => {
    setComparisonList(comparisonList.filter(v => v.id !== vendorId));
  };

  const handleBookAppointment = (vendor) => {
    setSelectedVendor(vendor);
    setBookingModalOpen(true);
  };

  const handleSaveAppointment = (appointmentData) => {
    setVendors(prevVendors =>
      prevVendors.map(vendor =>
        vendor.id === selectedVendor.id
          ? { ...vendor, appointments: [...vendor.appointments, appointmentData] }
          : vendor
      )
    );
    setBookingModalOpen(false);
  };

  const handleOpenReview = (vendor) => {
    setSelectedVendor(vendor);
    setReviewModalOpen(true);
  };

  const handleSubmitReview = (reviewData) => {
    setVendors(prevVendors =>
      prevVendors.map(vendor =>
        vendor.id === reviewData.vendorId
          ? {
              ...vendor,
              reviews: [...(vendor.reviews || []), reviewData],
              rating: calculateNewRating(vendor.rating, vendor.reviews?.length || 0, reviewData.rating)
            }
          : vendor
      )
    );
  };

  const calculateNewRating = (currentRating, numReviews, newRating) => {
    const totalRating = currentRating * numReviews + newRating;
    return totalRating / (numReviews + 1);
  };

  const handleVendorClick = (vendor) => {
    handleEditVendor(vendor);
  };

  const handleCompareVendor = (vendor) => {
    if (selectedVendorsForComparison.find(v => v.id === vendor.id)) {
      setSelectedVendorsForComparison(selectedVendorsForComparison.filter(v => v.id !== vendor.id));
    } else if (selectedVendorsForComparison.length < 3) {
      setSelectedVendorsForComparison([...selectedVendorsForComparison, vendor]);
    }
  };

  const handleCloseComparison = () => {
    setIsComparisonViewOpen(false);
    setSelectedVendorsForComparison([]);
  };

  const handleRemoveFromComparison = (vendorId) => {
    setSelectedVendorsForComparison(selectedVendorsForComparison.filter(v => v.id !== vendorId));
    if (selectedVendorsForComparison.length <= 1) {
      setIsComparisonViewOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Wedding Vendors</h1>
              <p className="mt-1 text-sm text-gray-500">
                Find and manage your perfect wedding vendors
              </p>
            </div>
            <button
              onClick={handleAddVendor}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Add Vendor
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters */}
          <div className="hidden lg:block">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Filters</h2>
              <VendorFilters
                filters={filters}
                onFilterChange={setFilters}
                selectedCategory={selectedCategory}
                weddingDate={weddingDate}
              />
            </div>
          </div>

          {/* Main content */}
          <div className="lg:col-span-3 space-y-4">
            {/* Search and Controls */}
            <div className="flex flex-col lg:flex-row lg:items-center gap-3">
              {/* Mobile filter button */}
              <button
                type="button"
                className="lg:hidden inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                onClick={() => setIsMobileFiltersOpen(true)}
              >
                <AdjustmentsHorizontalIcon className="h-5 w-5 mr-2" />
                Filters
              </button>

              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 text-base"
                    placeholder="Search vendors..."
                  />
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-3">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="All">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="rating">Sort by Rating</option>
                  <option value="reviews">Sort by Reviews</option>
                  <option value="price">Sort by Price</option>
                </select>

                <button
                  onClick={() => setView(view === 'grid' ? 'list' : 'grid')}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-base font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  {view === 'grid' ? (
                    <>
                      <ListBulletIcon className="h-5 w-5 mr-2" />
                      List
                    </>
                  ) : (
                    <>
                      <Squares2X2Icon className="h-5 w-5 mr-2" />
                      Grid
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Results count */}
            <div className="text-base text-gray-500">
              Showing <span className="font-medium text-gray-900">{filteredVendors.length}</span>{' '}
              {filteredVendors.length === 1 ? 'vendor' : 'vendors'}
            </div>

            {/* Grid container */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 px-4">
              {/* First Card */}
              <div className="w-full h-[260px] bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 p-4 relative flex flex-col justify-between">
                {/* Checkbox */}
                <div className="absolute top-2 right-2 z-10">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </div>

                {/* Vendor Info */}
                <div className="space-y-2">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Elegant Events</h3>
                    <p className="text-sm text-gray-500">Venue</p>
                  </div>

                  <div className="flex items-center">
                    <div className="flex items-center">
                      <StarIcon className="h-5 w-5 text-yellow-400" />
                      <span className="ml-1 text-base font-medium">4.8</span>
                    </div>
                    <span className="ml-1 text-sm text-gray-500">(45)</span>
                  </div>

                  <div>
                    <span className="text-base font-medium">$$$</span>
                  </div>

                  <div>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      Available
                    </span>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex flex-col gap-2 mt-auto">
                  <button className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 text-sm font-medium">
                    View Details
                  </button>
                  <button className="w-full px-3 py-1.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 text-sm font-medium">
                    Book Now
                  </button>
                </div>
              </div>

              {/* Second Card */}
              <div className="w-full h-[260px] bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 p-4 relative flex flex-col justify-between">
                {/* Checkbox */}
                <div className="absolute top-2 right-2 z-10">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </div>

                {/* Vendor Info */}
                <div className="space-y-2">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Floral Fantasy</h3>
                    <p className="text-sm text-gray-500">Florist</p>
                  </div>

                  <div className="flex items-center">
                    <div className="flex items-center">
                      <StarIcon className="h-5 w-5 text-yellow-400" />
                      <span className="ml-1 text-base font-medium">4.9</span>
                    </div>
                    <span className="ml-1 text-sm text-gray-500">(38)</span>
                  </div>

                  <div>
                    <span className="text-base font-medium">$$</span>
                  </div>

                  <div>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      Available
                    </span>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex flex-col gap-2 mt-auto">
                  <button className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 text-sm font-medium">
                    View Details
                  </button>
                  <button className="w-full px-3 py-1.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 text-sm font-medium">
                    Book Now
                  </button>
                </div>
              </div>

              {/* Third Card */}
              <div className="w-full h-[260px] bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 p-4 relative flex flex-col justify-between">
                {/* Checkbox */}
                <div className="absolute top-2 right-2 z-10">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </div>

                {/* Vendor Info */}
                <div className="space-y-2">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Delightful Catering</h3>
                    <p className="text-sm text-gray-500">Catering</p>
                  </div>

                  <div className="flex items-center">
                    <div className="flex items-center">
                      <StarIcon className="h-5 w-5 text-yellow-400" />
                      <span className="ml-1 text-base font-medium">4.7</span>
                    </div>
                    <span className="ml-1 text-sm text-gray-500">(52)</span>
                  </div>

                  <div>
                    <span className="text-base font-medium">$$</span>
                  </div>

                  <div>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                      Unavailable
                    </span>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex flex-col gap-2 mt-auto">
                  <button className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 text-sm font-medium">
                    View Details
                  </button>
                  <button className="w-full px-3 py-1.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 text-sm font-medium">
                    Book Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison floating button */}
      {selectedVendorsForComparison.length > 0 && !isComparisonViewOpen && (
        <div className="fixed bottom-4 right-4">
          <button
            onClick={() => setIsComparisonViewOpen(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-indigo-700"
          >
            Compare {selectedVendorsForComparison.length} Vendors
          </button>
        </div>
      )}

      {/* Vendor comparison component */}
      {isComparisonViewOpen && (
        <VendorComparison
          vendors={selectedVendorsForComparison}
          onClose={handleCloseComparison}
          onRemoveVendor={handleRemoveFromComparison}
        />
      )}

      {/* Modals */}
      <VendorModal
        isOpen={vendorModalOpen}
        onClose={() => setVendorModalOpen(false)}
        onSave={handleSaveVendor}
        vendor={selectedVendor}
        categories={categories}
      />
      <BookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        onSave={handleSaveAppointment}
        vendor={selectedVendor}
      />
      <VendorReviewModal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        onSubmit={handleSubmitReview}
        vendor={selectedVendor}
      />
    </div>
  );
}
