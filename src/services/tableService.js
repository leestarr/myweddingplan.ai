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

const TABLES_COLLECTION = 'tables';

export const tableService = {
  // Create a new table
  createTable: async (tableData) => {
    try {
      const docRef = await addDoc(collection(db, TABLES_COLLECTION), {
        ...tableData,
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

  // Get all tables
  getTables: async () => {
    try {
      const querySnapshot = await getDocs(collection(db, TABLES_COLLECTION));
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
  updateTable: async (tableId, tableData) => {
    try {
      const tableRef = doc(db, TABLES_COLLECTION, tableId);
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
  deleteTable: async (tableId) => {
    try {
      await deleteDoc(doc(db, TABLES_COLLECTION, tableId));
      return true;
    } catch (error) {
      console.error('Error deleting table:', error);
      throw error;
    }
  },

  // Get tables for a specific event
  getTablesByEvent: async (eventId) => {
    try {
      const q = query(
        collection(db, TABLES_COLLECTION),
        where('eventId', '==', eventId)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting tables by event:', error);
      throw error;
    }
  }
};
