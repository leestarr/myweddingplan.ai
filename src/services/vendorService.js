import { db } from '../config/firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy
} from 'firebase/firestore';

const VENDORS_COLLECTION = 'vendors';
const VENDOR_REVIEWS_COLLECTION = 'vendorReviews';
const VENDOR_BOOKINGS_COLLECTION = 'vendorBookings';

export const vendorService = {
  // Add a new vendor
  addVendor: async (userId, vendorData) => {
    try {
      const docRef = await addDoc(collection(db, VENDORS_COLLECTION), {
        ...vendorData,
        userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      return {
        id: docRef.id,
        ...vendorData
      };
    } catch (error) {
      console.error('Error adding vendor:', error);
      throw error;
    }
  },

  // Get all vendors
  getVendors: async () => {
    try {
      const querySnapshot = await getDocs(collection(db, VENDORS_COLLECTION));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting vendors:', error);
      throw error;
    }
  },

  // Get vendors by category
  getVendorsByCategory: async (category) => {
    try {
      const q = query(
        collection(db, VENDORS_COLLECTION),
        where('category', '==', category)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting vendors by category:', error);
      throw error;
    }
  },

  // Update a vendor
  updateVendor: async (vendorId, vendorData) => {
    try {
      const vendorRef = doc(db, VENDORS_COLLECTION, vendorId);
      await updateDoc(vendorRef, {
        ...vendorData,
        updatedAt: new Date().toISOString()
      });
      return {
        id: vendorId,
        ...vendorData
      };
    } catch (error) {
      console.error('Error updating vendor:', error);
      throw error;
    }
  },

  // Delete a vendor
  deleteVendor: async (vendorId) => {
    try {
      await deleteDoc(doc(db, VENDORS_COLLECTION, vendorId));
      return true;
    } catch (error) {
      console.error('Error deleting vendor:', error);
      throw error;
    }
  },

  // Add a review for a vendor
  addVendorReview: async (userId, vendorId, reviewData) => {
    try {
      const docRef = await addDoc(collection(db, VENDOR_REVIEWS_COLLECTION), {
        userId,
        vendorId,
        ...reviewData,
        createdAt: new Date().toISOString()
      });
      return {
        id: docRef.id,
        ...reviewData
      };
    } catch (error) {
      console.error('Error adding vendor review:', error);
      throw error;
    }
  },

  // Get reviews for a vendor
  getVendorReviews: async (vendorId) => {
    try {
      const q = query(
        collection(db, VENDOR_REVIEWS_COLLECTION),
        where('vendorId', '==', vendorId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting vendor reviews:', error);
      throw error;
    }
  },

  // Add a booking for a vendor
  addVendorBooking: async (userId, vendorId, bookingData) => {
    try {
      const docRef = await addDoc(collection(db, VENDOR_BOOKINGS_COLLECTION), {
        userId,
        vendorId,
        ...bookingData,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      return {
        id: docRef.id,
        ...bookingData
      };
    } catch (error) {
      console.error('Error adding vendor booking:', error);
      throw error;
    }
  },

  // Get bookings for a vendor
  getVendorBookings: async (vendorId) => {
    try {
      const q = query(
        collection(db, VENDOR_BOOKINGS_COLLECTION),
        where('vendorId', '==', vendorId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting vendor bookings:', error);
      throw error;
    }
  },

  // Get user's bookings
  getUserBookings: async (userId) => {
    try {
      const q = query(
        collection(db, VENDOR_BOOKINGS_COLLECTION),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting user bookings:', error);
      throw error;
    }
  }
};

// Function to seed initial vendors if none exist
export const seedInitialVendors = async () => {
  try {
    const snapshot = await getDocs(collection(db, VENDORS_COLLECTION));
    if (snapshot.empty) {
      const initialVendors = [
        {
          name: 'Elegant Events Venue',
          category: 'Venue',
          description: 'Beautiful waterfront venue perfect for your special day',
          priceRange: '$$$',
          image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3',
          contact: {
            phone: '(555) 123-4567',
            email: 'contact@elegantevents.com',
            website: 'www.elegantevents.com',
          },
          location: 'Sydney, NSW',
          services: ['Indoor Ceremony', 'Outdoor Reception', 'Catering Available'],
          availability: true,
        },
        {
          name: 'Perfect Pictures Photography',
          category: 'Photography',
          description: 'Capturing your precious moments with style',
          priceRange: '$$',
          image: 'https://images.unsplash.com/photo-1554080353-321e452ccf19',
          contact: {
            phone: '(555) 234-5678',
            email: 'info@perfectpictures.com',
            website: 'www.perfectpictures.com',
          },
          location: 'Melbourne, VIC',
          services: ['Wedding Photography', 'Engagement Shoots', 'Photo Albums'],
          availability: true,
        },
      ];

      for (const vendor of initialVendors) {
        await addDoc(collection(db, VENDORS_COLLECTION), {
          ...vendor,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
      console.log('Initial vendors seeded successfully');
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error seeding initial vendors:', error);
    throw error;
  }
};
