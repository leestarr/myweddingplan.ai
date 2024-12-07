import { db } from '../config/firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc,
  query,
  where 
} from 'firebase/firestore';

const GUESTS_COLLECTION = 'guests';

export const guestService = {
  // Add a new guest
  addGuest: async (guestData) => {
    try {
      const docRef = await addDoc(collection(db, GUESTS_COLLECTION), {
        ...guestData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      return {
        id: docRef.id,
        ...guestData
      };
    } catch (error) {
      console.error('Error adding guest:', error);
      throw error;
    }
  },

  // Get all guests
  getGuests: async () => {
    try {
      const querySnapshot = await getDocs(collection(db, GUESTS_COLLECTION));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting guests:', error);
      throw error;
    }
  },

  // Update a guest
  updateGuest: async (guestId, guestData) => {
    try {
      const guestRef = doc(db, GUESTS_COLLECTION, guestId);
      await updateDoc(guestRef, {
        ...guestData,
        updatedAt: new Date().toISOString()
      });
      return {
        id: guestId,
        ...guestData
      };
    } catch (error) {
      console.error('Error updating guest:', error);
      throw error;
    }
  },

  // Delete a guest
  deleteGuest: async (guestId) => {
    try {
      await deleteDoc(doc(db, GUESTS_COLLECTION, guestId));
      return true;
    } catch (error) {
      console.error('Error deleting guest:', error);
      throw error;
    }
  },

  // Get guests by event
  getGuestsByEvent: async (eventId) => {
    try {
      const q = query(
        collection(db, GUESTS_COLLECTION),
        where('eventId', '==', eventId)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting guests by event:', error);
      throw error;
    }
  },

  // Get guests by table
  getGuestsByTable: async (tableId) => {
    try {
      const q = query(
        collection(db, GUESTS_COLLECTION),
        where('tableId', '==', tableId)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting guests by table:', error);
      throw error;
    }
  }
};
