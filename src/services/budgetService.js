import { db } from '../config/firebase';
import { 
    collection, 
    doc,
    setDoc,
    getDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    getDocs,
    serverTimestamp,
    addDoc
} from 'firebase/firestore';

const BUDGET_COLLECTION = 'budgets';
const EXPENSES_COLLECTION = 'expenses';

export const budgetService = {
    // Save or update master budget
    async saveMasterBudget(userId, amount, isLocked = false) {
        try {
            const budgetRef = doc(db, `${BUDGET_COLLECTION}/${userId}/master`, 'budget');
            await setDoc(budgetRef, {
                amount: parseFloat(amount),
                isLocked,
                updatedAt: serverTimestamp()
            }, { merge: true });
        } catch (error) {
            console.error('Error saving master budget:', error);
            throw error;
        }
    },

    // Get master budget
    async getMasterBudget(userId) {
        try {
            const budgetRef = doc(db, `${BUDGET_COLLECTION}/${userId}/master`, 'budget');
            const docSnap = await getDoc(budgetRef);
            return docSnap.exists() ? docSnap.data() : { amount: 0, isLocked: false };
        } catch (error) {
            console.error('Error getting master budget:', error);
            throw error;
        }
    },

    // Save categories
    async saveCategories(userId, categories) {
        try {
            const budgetRef = doc(db, `${BUDGET_COLLECTION}/${userId}/master`, 'categories');
            await setDoc(budgetRef, { categories }, { merge: true });
        } catch (error) {
            console.error('Error saving categories:', error);
            throw error;
        }
    },

    // Get categories
    async getCategories(userId) {
        try {
            const budgetRef = doc(db, `${BUDGET_COLLECTION}/${userId}/master`, 'categories');
            const docSnap = await getDoc(budgetRef);
            return docSnap.exists() ? docSnap.data().categories : [];
        } catch (error) {
            console.error('Error getting categories:', error);
            throw error;
        }
    },

    // Add expense
    async addExpense(userId, expense) {
        try {
            const expensesRef = collection(db, `${BUDGET_COLLECTION}/${userId}/${EXPENSES_COLLECTION}`);
            const docRef = await addDoc(expensesRef, {
                ...expense,
                userId,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });
            return docRef.id;
        } catch (error) {
            console.error('Error adding expense:', error);
            throw error;
        }
    },

    // Update expense
    async updateExpense(userId, expenseId, expense) {
        try {
            const expenseRef = doc(db, `${BUDGET_COLLECTION}/${userId}/${EXPENSES_COLLECTION}`, expenseId);
            await updateDoc(expenseRef, {
                ...expense,
                updatedAt: serverTimestamp()
            });
        } catch (error) {
            console.error('Error updating expense:', error);
            throw error;
        }
    },

    // Delete expense
    async deleteExpense(userId, expenseId) {
        try {
            const expenseRef = doc(db, `${BUDGET_COLLECTION}/${userId}/${EXPENSES_COLLECTION}`, expenseId);
            await deleteDoc(expenseRef);
        } catch (error) {
            console.error('Error deleting expense:', error);
            throw error;
        }
    },

    // Get all expenses for a user
    async getExpenses(userId) {
        try {
            const expensesRef = collection(db, `${BUDGET_COLLECTION}/${userId}/${EXPENSES_COLLECTION}`);
            const querySnapshot = await getDocs(expensesRef);
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Error getting expenses:', error);
            throw error;
        }
    }
};
