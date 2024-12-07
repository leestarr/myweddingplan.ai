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
import { vendorService, seedInitialVendors } from '../services/vendorService';
import { auth } from '../config/firebase';
import { useNavigate } from 'react-router-dom';

// Initial vendor categories
const categories = [
  'All',
  'Venue',
  'Catering',
  'Photography',
  'Videography',
  'Florist',
  'Music & Entertainment',
  'Wedding Planner',
  'Dress & Attire',
  'Hair & Makeup',
  'Transportation',
  'Invitations',
  'Jewelry',
  'Favors & Gifts',
  'Officiant',
  'Other'
];

export default function Vendors() {
  const navigate = useNavigate();
  const weddingDate = useWeddingDate();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // UI state
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [compareList, setCompareList] = useState([]);

  useEffect(() => {
    const loadVendors = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // First try to seed initial vendors if none exist
        await seedInitialVendors();
        
        // Then load all vendors
        const loadedVendors = await vendorService.getVendors();
        setVendors(loadedVendors);
      } catch (err) {
        console.error('Error loading vendors:', err);
        setError('Failed to load vendors. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadVendors();
  }, []);

  // Load vendors from Firebase
  const loadVendors = async () => {
    try {
      setLoading(true);
      let vendorData;
      if (selectedCategory === 'All') {
        vendorData = await vendorService.getVendors();
      } else {
        vendorData = await vendorService.getVendorsByCategory(selectedCategory);
      }
      setVendors(vendorData);
      setError(null);
    } catch (err) {
      console.error('Error loading vendors:', err);
      setError('Failed to load vendors. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Handle vendor booking
  const handleBookVendor = async (vendorId, bookingDetails) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        navigate('/login');
        return;
      }

      if (!weddingDate) {
        // Show error message or redirect to settings to set wedding date
        setError('Please set your wedding date in settings before booking a vendor.');
        return;
      }

      await vendorService.addVendorBooking(user.uid, vendorId, {
        ...bookingDetails,
        date: weddingDate.toISOString()
      });
      
      setIsBookingModalOpen(false);
      // Show success message
      setError(null);
    } catch (err) {
      console.error('Error booking vendor:', err);
      setError('Failed to book vendor. Please try again.');
    }
  };

  // Handle vendor review
  const handleAddReview = async (vendorId, reviewData) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        navigate('/login');
        return;
      }

      await vendorService.addVendorReview(user.uid, vendorId, reviewData);
      setIsReviewModalOpen(false);
      loadVendors(); // Reload vendors to update ratings
      setError(null);
    } catch (err) {
      console.error('Error adding review:', err);
      setError('Failed to add review. Please try again.');
    }
  };

  // Filter vendors based on search query
  const filteredVendors = vendors.filter(vendor => 
    vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vendor.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vendor.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Toggle vendor comparison
  const toggleVendorComparison = (vendor) => {
    if (compareList.find(v => v.id === vendor.id)) {
      setCompareList(compareList.filter(v => v.id !== vendor.id));
    } else if (compareList.length < 3) {
      setCompareList([...compareList, vendor]);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Wedding Vendors</h1>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="p-2 text-gray-500 hover:text-gray-700"
          >
            {viewMode === 'grid' ? (
              <ListBulletIcon className="h-6 w-6" />
            ) : (
              <Squares2X2Icon className="h-6 w-6" />
            )}
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="p-2 text-gray-500 hover:text-gray-700"
          >
            <AdjustmentsHorizontalIcon className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Search and Category Filter */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search vendors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
            />
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="py-2 px-4 border rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Loading and Error States */}
      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading vendors...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <p>{error}</p>
        </div>
      )}

      {/* Wedding Date Warning */}
      {!weddingDate && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded relative mb-6">
          <p>Please set your wedding date in settings to enable vendor booking.</p>
        </div>
      )}

      {/* Vendor Grid/List */}
      {!loading && !error && (
        <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'grid-cols-1 gap-4'}`}>
          {filteredVendors.map((vendor) => (
            <div key={vendor.id} className="bg-white rounded-lg shadow-md p-4">
              <h2 className="text-lg font-bold text-gray-900">{vendor.name}</h2>
              <p className="text-sm text-gray-500">{vendor.category}</p>
              <div className="flex items-center mt-2">
                <div className="flex items-center">
                  <StarIcon className="h-5 w-5 text-yellow-400" />
                  <span className="ml-1 text-base font-medium">{vendor.rating || 'No ratings'}</span>
                </div>
                <span className="ml-1 text-sm text-gray-500">({vendor.reviews || 0})</span>
              </div>
              <div className="mt-4">
                <button
                  onClick={() => {
                    setSelectedVendor(vendor);
                    setIsModalOpen(true);
                  }}
                  className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600"
                >
                  View Details
                </button>
                <button
                  onClick={() => {
                    if (!weddingDate) {
                      setError('Please set your wedding date in settings before booking a vendor.');
                      return;
                    }
                    setSelectedVendor(vendor);
                    setIsBookingModalOpen(true);
                  }}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 ml-4"
                  disabled={!weddingDate}
                >
                  Book Now
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      <VendorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        vendor={selectedVendor}
        categories={categories.filter(cat => cat !== 'All')}
      />
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        onSave={handleBookVendor}
        vendor={selectedVendor}
        weddingDate={weddingDate}
      />
      <VendorReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        onSubmit={handleAddReview}
        vendor={selectedVendor}
      />
    </div>
  );
}
