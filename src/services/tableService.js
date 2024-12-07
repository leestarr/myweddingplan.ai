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
  setDoc 
} from 'firebase/firestore';

const TABLES_COLLECTION = 'tables';

export const tableService = {
  // Create a new table
  createTable: async (userId, tableData) => {
    try {
      const docRef = await addDoc(collection(db, `${TABLES_COLLECTION}/${userId}/tables`), {
        ...tableData,
        userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      return {
        id: docRef.id,
        ...tableData
      };
    } catch (error) {
      console.error('Error creating table:', error);
      throw error;
    }
  },

  // Save table (create or update)
  saveTable: async (userId, tableId, tableData) => {
    try {
      const tableRef = doc(db, `${TABLES_COLLECTION}/${userId}/tables`, tableId);
      await setDoc(tableRef, {
        ...tableData,
        userId,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      return {
        id: tableId,
        ...tableData
      };
    } catch (error) {
      console.error('Error saving table:', error);
      throw error;
    }
  },

  // Get all tables for a user
  getTables: async (userId) => {
    try {
      const tablesRef = collection(db, `${TABLES_COLLECTION}/${userId}/tables`);
      const querySnapshot = await getDocs(tablesRef);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting tables:', error);
      throw error;
    }
  },

  // Update a table
  updateTable: async (userId, tableId, tableData) => {
    try {
      const tableRef = doc(db, `${TABLES_COLLECTION}/${userId}/tables`, tableId);
      await updateDoc(tableRef, {
        ...tableData,
        updatedAt: new Date().toISOString()
      });
      return {
        id: tableId,
        ...tableData
      };
    } catch (error) {
      console.error('Error updating table:', error);
      throw error;
    }
  },

  // Delete a table
  deleteTable: async (userId, tableId) => {
    try {
      const tableRef = doc(db, `${TABLES_COLLECTION}/${userId}/tables`, tableId);
      await deleteDoc(tableRef);
    } catch (error) {
      console.error('Error deleting table:', error);
      throw error;
    }
  }
};
