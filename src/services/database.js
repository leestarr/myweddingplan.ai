import { collection, doc, setDoc, getDoc, getDocs, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';

// Collection names
const COLLECTIONS = {
  GUESTS: 'guests',
  TABLES: 'tables',
  SETTINGS: 'settings',
  BUDGETS: 'budgets',
  EXPENSES: 'expenses',
  TASKS: 'tasks'
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
    const tasksRef = doc(db, COLLECTIONS.TASKS, 'init');

    await Promise.all([
      setDoc(guestsRef, { initialized: true }, { merge: true }),
      setDoc(tablesRef, { initialized: true }, { merge: true }),
      setDoc(settingsRef, { initialized: true }, { merge: true }),
      setDoc(budgetsRef, { initialized: true }, { merge: true }),
      setDoc(expensesRef, { initialized: true }, { merge: true }),
      setDoc(tasksRef, { initialized: true }, { merge: true })
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
      const guestsRef = collection(db, COLLECTIONS.GUESTS);
      const docRef = guestData.id ? doc(guestsRef, guestData.id) : doc(guestsRef);
      await setDoc(docRef, {
        ...guestData,
        id: docRef.id,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      return docRef.id;
    } catch (error) {
      console.error('Error upserting guest:', error);
      throw error;
    }
  },

  // Get a single guest by ID
  async getGuest(guestId) {
    try {
      const docRef = doc(db, COLLECTIONS.GUESTS, guestId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
      return null;
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
      return querySnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(guest => guest.id !== 'init'); // Filter out the initialization document
    } catch (error) {
      console.error('Error getting all guests:', error);
      throw error;
    }
  },

  // Delete a guest
  async deleteGuest(guestId) {
    try {
      await deleteDoc(doc(db, COLLECTIONS.GUESTS, guestId));
      return true;
    } catch (error) {
      console.error('Error deleting guest:', error);
      throw error;
    }
  },

  // Get guests by table number
  async getGuestsByTable(tableNumber) {
    try {
      const guestsRef = collection(db, COLLECTIONS.GUESTS);
      const q = query(guestsRef, where('tableNumber', '==', tableNumber));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting guests by table:', error);
      throw error;
    }
  },

  // Update table assignments for multiple guests
  async updateTableAssignments(guestUpdates) {
    try {
      const batch = db.batch();
      guestUpdates.forEach(({ guestId, tableNumber }) => {
        const guestRef = doc(db, COLLECTIONS.GUESTS, guestId);
        batch.update(guestRef, { tableNumber });
      });
      await batch.commit();
      return true;
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
      const tablesRef = collection(db, COLLECTIONS.TABLES);
      const docRef = tableData.id ? doc(tablesRef, tableData.id) : doc(tablesRef);
      await setDoc(docRef, {
        ...tableData,
        id: docRef.id,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      return docRef.id;
    } catch (error) {
      console.error('Error upserting table:', error);
      throw error;
    }
  },

  // Get a single table by ID
  async getTable(tableId) {
    try {
      const docRef = doc(db, COLLECTIONS.TABLES, tableId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
      return null;
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
      return querySnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(table => table.id !== 'init'); // Filter out the initialization document
    } catch (error) {
      console.error('Error getting all tables:', error);
      throw error;
    }
  },

  // Delete a table
  async deleteTable(tableId) {
    try {
      await deleteDoc(doc(db, COLLECTIONS.TABLES, tableId));
      return true;
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
      const docRef = doc(db, COLLECTIONS.SETTINGS, userId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data();
      }
      return null;
    } catch (error) {
      console.error('Error getting wedding settings:', error);
      throw error;
    }
  },

  // Update wedding settings
  async updateWeddingSettings(userId, settings) {
    try {
      const docRef = doc(db, COLLECTIONS.SETTINGS, userId);
      await setDoc(docRef, {
        ...settings,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      return true;
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
      const docRef = doc(db, COLLECTIONS.BUDGETS, userId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return docSnap.data();
      } else {
        // Return default settings if none exist
        return {
          totalBudget: 0,
          categories: [],
          expenses: []
        };
      }
    } catch (error) {
      console.error('Error getting budget settings:', error);
      throw error;
    }
  },

  async updateBudgetSettings(userId, settings) {
    try {
      const docRef = doc(db, COLLECTIONS.BUDGETS, userId);
      await setDoc(docRef, settings, { merge: true });
      return true;
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
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting expenses:', error);
      throw error;
    }
  },

  async addExpense(userId, expense) {
    try {
      const expensesRef = collection(db, COLLECTIONS.EXPENSES);
      const docRef = doc(expensesRef);
      await setDoc(docRef, {
        ...expense,
        userId,
        createdAt: new Date().toISOString()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding expense:', error);
      throw error;
    }
  },

  async updateExpense(expenseId, expense) {
    try {
      const docRef = doc(db, COLLECTIONS.EXPENSES, expenseId);
      await updateDoc(docRef, {
        ...expense,
        updatedAt: new Date().toISOString()
      });
      return true;
    } catch (error) {
      console.error('Error updating expense:', error);
      throw error;
    }
  },

  async deleteExpense(expenseId) {
    try {
      await deleteDoc(doc(db, COLLECTIONS.EXPENSES, expenseId));
      return true;
    } catch (error) {
      console.error('Error deleting expense:', error);
      throw error;
    }
  }
};

// Task Collection Operations
export const taskService = {
  // Create or update a task
  async upsertTask(userId, taskData) {
    try {
      const tasksRef = collection(db, COLLECTIONS.TASKS);
      const docRef = taskData.id ? doc(tasksRef, taskData.id) : doc(tasksRef);
      await setDoc(docRef, {
        ...taskData,
        userId,
        id: docRef.id,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      return docRef.id;
    } catch (error) {
      console.error('Error upserting task:', error);
      throw error;
    }
  },

  // Get all tasks for a user
  async getAllTasks(userId) {
    try {
      const tasksRef = collection(db, COLLECTIONS.TASKS);
      const q = query(tasksRef, where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => doc.data());
    } catch (error) {
      console.error('Error getting tasks:', error);
      throw error;
    }
  },

  // Delete a task
  async deleteTask(taskId) {
    try {
      const taskRef = doc(db, COLLECTIONS.TASKS, taskId);
      await deleteDoc(taskRef);
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  },

  // Update task status
  async updateTaskStatus(taskId, status) {
    try {
      const taskRef = doc(db, COLLECTIONS.TASKS, taskId);
      await updateDoc(taskRef, {
        status,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating task status:', error);
      throw error;
    }
  }
};
