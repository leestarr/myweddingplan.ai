import { collection, doc, setDoc, getDoc, getDocs, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';

// Collection names
const COLLECTIONS = {
  GUESTS: 'guests',
  TABLES: 'tables',
  SETTINGS: 'settings',
  BUDGETS: 'budgets',
  EXPENSES: 'expenses'
};

// Initialize collections if they don't exist
const initializeCollections = async () => {
  try {
    // Create an empty document in each collection to ensure they exist
    const guestsRef = doc(db, COLLECTIONS.GUESTS, 'init');
    const tablesRef = doc(db, COLLECTIONS.TABLES, 'init');
    const settingsRef = doc(db, COLLECTIONS.SETTINGS, 'init');
    const budgetsRef = doc(db, COLLECTIONS.BUDGETS, 'init');
    const expensesRef = doc(db, COLLECTIONS.EXPENSES, 'init');

    await Promise.all([
      setDoc(guestsRef, { initialized: true }, { merge: true }),
      setDoc(tablesRef, { initialized: true }, { merge: true }),
      setDoc(settingsRef, { initialized: true }, { merge: true }),
      setDoc(budgetsRef, { initialized: true }, { merge: true }),
      setDoc(expensesRef, { initialized: true }, { merge: true })
    ]);

    // Delete the initialization documents
    await Promise.all([
      deleteDoc(guestsRef),
      deleteDoc(tablesRef),
      deleteDoc(settingsRef),
      deleteDoc(budgetsRef),
      deleteDoc(expensesRef)
    ]);
  } catch (error) {
    console.error('Error initializing collections:', error);
  }
};

// Initialize collections when the app starts
initializeCollections();

// Guest Collection Operations
export const guestService = {
  // Create or update a guest
  async upsertGuest(guestData) {
    try {
      const guestId = guestData.id || Date.now().toString();
      const guestRef = doc(db, COLLECTIONS.GUESTS, guestId);
      const dataToSave = {
        ...guestData,
        id: guestId,
        updatedAt: new Date().toISOString(),
        createdAt: guestData.createdAt || new Date().toISOString()
      };
      await setDoc(guestRef, dataToSave, { merge: true });
      return dataToSave;
    } catch (error) {
      console.error('Error upserting guest:', error);
      throw error;
    }
  },

  // Get a single guest by ID
  async getGuest(guestId) {
    try {
      const guestRef = doc(db, COLLECTIONS.GUESTS, guestId.toString());
      const guestSnap = await getDoc(guestRef);
      return guestSnap.exists() ? guestSnap.data() : null;
    } catch (error) {
      console.error('Error getting guest:', error);
      throw error;
    }
  },

  // Get all guests
  async getAllGuests() {
    try {
      const guestsRef = collection(db, COLLECTIONS.GUESTS);
      const querySnapshot = await getDocs(guestsRef);
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          email: data.email || '',
          group: data.group || '',
          category: data.category || '',
          status: data.status || 'Pending',
          plusOne: data.plusOne || false,
          table: data.table || null,
          dietary: data.dietary || '',
          mealPreference: data.mealPreference || '',
          specialRequirements: data.specialRequirements || '',
          invitationSent: data.invitationSent || false,
          rsvpDate: data.rsvpDate || null,
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString()
        };
      });
    } catch (error) {
      console.error('Error getting all guests:', error);
      throw error;
    }
  },

  // Delete a guest
  async deleteGuest(guestId) {
    try {
      const guestRef = doc(db, COLLECTIONS.GUESTS, guestId.toString());
      await deleteDoc(guestRef);
    } catch (error) {
      console.error('Error deleting guest:', error);
      throw error;
    }
  },

  // Get guests by table number
  async getGuestsByTable(tableNumber) {
    try {
      const guestsRef = collection(db, COLLECTIONS.GUESTS);
      const q = query(guestsRef, where('table', '==', tableNumber));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => doc.data());
    } catch (error) {
      console.error('Error getting guests by table:', error);
      throw error;
    }
  },

  // Update table assignments for multiple guests
  async updateTableAssignments(guestUpdates) {
    try {
      const batch = db.batch();
      guestUpdates.forEach(update => {
        const guestRef = doc(db, COLLECTIONS.GUESTS, update.id.toString());
        batch.update(guestRef, { 
          table: update.table,
          updatedAt: new Date().toISOString()
        });
      });
      await batch.commit();
    } catch (error) {
      console.error('Error updating table assignments:', error);
      throw error;
    }
  }
};

// Table Collection Operations
export const tableService = {
  // Create or update a table
  async upsertTable(tableData) {
    try {
      const tableRef = doc(db, COLLECTIONS.TABLES, tableData.id.toString());
      await setDoc(tableRef, {
        ...tableData,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      return tableData;
    } catch (error) {
      console.error('Error upserting table:', error);
      throw error;
    }
  },

  // Get a single table by ID
  async getTable(tableId) {
    try {
      const tableRef = doc(db, COLLECTIONS.TABLES, tableId.toString());
      const tableSnap = await getDoc(tableRef);
      return tableSnap.exists() ? tableSnap.data() : null;
    } catch (error) {
      console.error('Error getting table:', error);
      throw error;
    }
  },

  // Get all tables
  async getAllTables() {
    try {
      const tablesRef = collection(db, COLLECTIONS.TABLES);
      const querySnapshot = await getDocs(tablesRef);
      return querySnapshot.docs.map(doc => doc.data());
    } catch (error) {
      console.error('Error getting all tables:', error);
      throw error;
    }
  },

  // Delete a table
  async deleteTable(tableId) {
    try {
      const tableRef = doc(db, COLLECTIONS.TABLES, tableId.toString());
      await deleteDoc(tableRef);
    } catch (error) {
      console.error('Error deleting table:', error);
      throw error;
    }
  }
};

// Settings Collection Operations
export const settingsService = {
  // Get wedding settings
  async getWeddingSettings(userId) {
    try {
      const settingsRef = doc(db, COLLECTIONS.SETTINGS, userId);
      const settingsSnap = await getDoc(settingsRef);
      return settingsSnap.exists() ? settingsSnap.data() : null;
    } catch (error) {
      console.error('Error getting wedding settings:', error);
      throw error;
    }
  },

  // Update wedding settings
  async updateWeddingSettings(userId, settings) {
    try {
      const settingsRef = doc(db, COLLECTIONS.SETTINGS, userId);
      await setDoc(settingsRef, {
        ...settings,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      return settings;
    } catch (error) {
      console.error('Error updating wedding settings:', error);
      throw error;
    }
  }
};

// Budget Collection Operations
export const budgetService = {
  // Budget Settings Operations
  async getBudgetSettings(userId) {
    try {
      const budgetRef = doc(db, COLLECTIONS.BUDGETS, userId);
      const budgetSnap = await getDoc(budgetRef);
      if (!budgetSnap.exists()) {
        return {
          masterBudget: 0,
          budgetLocked: false,
          categories: [
            'Venue & Ceremony',
            'Catering & Drinks',
            'Decor',
            'Photography',
            'Entertainment',
            'Attire',
            'Transportation',
            'Other'
          ]
        };
      }
      const data = budgetSnap.data();
      return {
        ...data,
        masterBudget: Math.round(data.masterBudget || 0)
      };
    } catch (error) {
      console.error('Error getting budget settings:', error);
      throw error;
    }
  },

  async updateBudgetSettings(userId, settings) {
    try {
      const budgetRef = doc(db, COLLECTIONS.BUDGETS, userId);
      const dataToSave = {
        ...settings,
        masterBudget: Math.round(settings.masterBudget || 0),
        updatedAt: new Date().toISOString()
      };
      await setDoc(budgetRef, dataToSave, { merge: true });
      return dataToSave;
    } catch (error) {
      console.error('Error updating budget settings:', error);
      throw error;
    }
  },

  // Expenses Operations
  async getAllExpenses(userId) {
    try {
      const expensesRef = collection(db, COLLECTIONS.EXPENSES);
      const q = query(expensesRef, where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          amount: Math.round(data.amount || 0)
        };
      });
    } catch (error) {
      console.error('Error getting expenses:', error);
      throw error;
    }
  },

  async addExpense(userId, expense) {
    try {
      const expenseRef = doc(collection(db, COLLECTIONS.EXPENSES));
      const expenseData = {
        ...expense,
        id: expenseRef.id,
        userId,
        amount: Math.round(expense.amount || 0),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await setDoc(expenseRef, expenseData);
      return expenseData;
    } catch (error) {
      console.error('Error adding expense:', error);
      throw error;
    }
  },

  async updateExpense(expenseId, expense) {
    try {
      const expenseRef = doc(db, COLLECTIONS.EXPENSES, expenseId);
      const expenseData = {
        ...expense,
        amount: Math.round(expense.amount || 0),
        updatedAt: new Date().toISOString()
      };
      await updateDoc(expenseRef, expenseData);
      return expenseData;
    } catch (error) {
      console.error('Error updating expense:', error);
      throw error;
    }
  },

  async deleteExpense(expenseId) {
    try {
      const expenseRef = doc(db, COLLECTIONS.EXPENSES, expenseId);
      await deleteDoc(expenseRef);
    } catch (error) {
      console.error('Error deleting expense:', error);
      throw error;
    }
  }
};
