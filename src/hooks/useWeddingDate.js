import { useState, useEffect } from 'react';
import { db, auth } from '../config/firebase';
import { doc, getDoc } from 'firebase/firestore';

export const useWeddingDate = () => {
  const [weddingDate, setWeddingDate] = useState(null);

  useEffect(() => {
    const loadWeddingDate = async () => {
      try {
        // First try to get from localStorage for quick load
        const savedDate = localStorage.getItem('weddingDate');
        if (savedDate) {
          setWeddingDate(new Date(savedDate));
        }

        // Then try to get from Firestore for up-to-date data
        const user = auth.currentUser;
        if (user) {
          const settingsDoc = await getDoc(doc(db, 'settings', user.uid));
          if (settingsDoc.exists() && settingsDoc.data().weddingDate) {
            const firestoreDate = new Date(settingsDoc.data().weddingDate);
            setWeddingDate(firestoreDate);
            // Update localStorage
            localStorage.setItem('weddingDate', firestoreDate.toISOString());
          }
        }
      } catch (error) {
        console.error('Error loading wedding date:', error);
      }
    };

    loadWeddingDate();

    // Clean up
    return () => {
      // Any cleanup if needed
    };
  }, []);

  return weddingDate;
};

export default useWeddingDate;
