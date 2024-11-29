import React, { useState, useEffect } from 'react';
import {
  StarIcon,
  PlusIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  ChatBubbleLeftIcon,
  DocumentCheckIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import VendorModal from '../components/VendorModal';
import BookingModal from '../components/BookingModal';
import VendorReviewModal from '../components/VendorReviewModal';
import VendorFilters from '../components/VendorFilters';

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
  // Add more sample vendors as needed
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
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedVendorForReview, setSelectedVendorForReview] = useState(null);
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

  const handleRemoveFromComparison = (vendorId) => {
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
    setSelectedVendorForReview(vendor);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Wedding Vendors</h1>
          <p className="mt-1 text-sm text-gray-500">
            Find and manage your wedding vendors
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

      {/* Search and Filters */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Filters</h3>
            <VendorFilters
              filters={filters}
              onFilterChange={setFilters}
              selectedCategory={selectedCategory}
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Search Bar and View Controls */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
              <div className="flex-1 min-w-0">
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    placeholder="Search vendors..."
                  />
                </div>
              </div>

              <div className="flex space-x-4">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                >
                  <option value="All">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                >
                  <option value="rating">Sort by Rating</option>
                  <option value="reviews">Sort by Reviews</option>
                  <option value="price">Sort by Price</option>
                </select>

                <button
                  onClick={() => setView(view === 'grid' ? 'list' : 'grid')}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  {view === 'grid' ? 'List View' : 'Grid View'}
                </button>
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-4">
            <p className="text-sm text-gray-500">
              Showing {filteredVendors.length} {filteredVendors.length === 1 ? 'vendor' : 'vendors'}
            </p>
          </div>

          {/* Vendors Grid/List */}
          <div className={`grid ${view === 'grid' ? 'grid-cols-1 sm:grid-cols-2 gap-6' : 'grid-cols-1 gap-4'}`}>
            {filteredVendors.map(vendor => (
              <div
                key={vendor.id}
                className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200"
              >
                <div className="relative h-48">
                  <img
                    src={vendor.image}
                    alt={vendor.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 space-x-2">
                    <button
                      onClick={() => handleAddToComparison(vendor)}
                      disabled={comparisonList.length >= 3 || comparisonList.find(v => v.id === vendor.id)}
                      className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50"
                    >
                      Compare
                    </button>
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{vendor.name}</h3>
                      <p className="text-sm text-gray-500">{vendor.category}</p>
                    </div>
                    <div className="flex items-center">
                      <StarIconSolid className="h-5 w-5 text-yellow-400" />
                      <span className="ml-1 text-sm text-gray-600">{vendor.rating}</span>
                      <span className="ml-1 text-sm text-gray-500">({vendor.reviews})</span>
                    </div>
                  </div>

                  <p className="mt-2 text-sm text-gray-500 line-clamp-2">{vendor.description}</p>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <span className="text-sm font-medium text-gray-900">{vendor.priceRange}</span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        vendor.availability ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {vendor.availability ? 'Available' : 'Booked'}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 flex space-x-2">
                    <button
                      onClick={() => handleEditVendor(vendor)}
                      className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => handleBookAppointment(vendor)}
                      className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
                    >
                      Book Now
                    </button>
                    <button
                      onClick={() => handleOpenReview(vendor)}
                      className="inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <StarIcon className="h-5 w-5 mr-1 text-yellow-400" />
                      Review
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Vendor Modal */}
      <VendorModal
        isOpen={vendorModalOpen}
        onClose={() => setVendorModalOpen(false)}
        onSave={handleSaveVendor}
        vendor={selectedVendor}
        categories={categories}
      />

      {/* Booking Modal */}
      <BookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        onSave={handleSaveAppointment}
        vendor={selectedVendor}
      />

      {/* Review Modal */}
      <VendorReviewModal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        onSubmit={handleSubmitReview}
        vendor={selectedVendorForReview}
      />
    </div>
  );
}
