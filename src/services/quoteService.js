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
  orderBy,
  serverTimestamp
} from 'firebase/firestore';

const QUOTES_COLLECTION = 'quotes';

export const quoteService = {
  // Add a new quote
  addQuote: async (userId, quoteData) => {
    try {
      const docRef = await addDoc(collection(db, `${QUOTES_COLLECTION}/${userId}/quotes`), {
        ...quoteData,
        userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return {
        id: docRef.id,
        ...quoteData
      };
    } catch (error) {
      console.error('Error adding quote:', error);
      throw error;
    }
  },

  // Get all quotes for a user
  getQuotes: async (userId) => {
    try {
      const quotesRef = collection(db, `${QUOTES_COLLECTION}/${userId}/quotes`);
      const q = query(quotesRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting quotes:', error);
      throw error;
    }
  },

  // Update a quote
  updateQuote: async (userId, quoteId, quoteData) => {
    try {
      const quoteRef = doc(db, `${QUOTES_COLLECTION}/${userId}/quotes`, quoteId);
      await updateDoc(quoteRef, {
        ...quoteData,
        updatedAt: serverTimestamp()
      });
      return {
        id: quoteId,
        ...quoteData
      };
    } catch (error) {
      console.error('Error updating quote:', error);
      throw error;
    }
  },

  // Delete a quote
  deleteQuote: async (userId, quoteId) => {
    try {
      const quoteRef = doc(db, `${QUOTES_COLLECTION}/${userId}/quotes`, quoteId);
      await deleteDoc(quoteRef);
      return true;
    } catch (error) {
      console.error('Error deleting quote:', error);
      throw error;
    }
  }
};

export default quoteService;
