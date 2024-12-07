import { db } from '../config/firebase';
import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  writeBatch,
} from 'firebase/firestore';

const COLLECTIONS_TO_MIGRATE = [
  'wedding_dates',
  'budgets',
  'expenses',
  'guests',
  'tables',
  'tasks',
  'vendorBookings',
  'settings'
];

async function migrateUserData(userId) {
  try {
    console.log(`Starting migration for user ${userId}`);
    const batches = [];
    let currentBatch = writeBatch(db);
    let operationCount = 0;

    for (const collectionName of COLLECTIONS_TO_MIGRATE) {
      console.log(`Migrating collection: ${collectionName}`);
      const querySnapshot = await getDocs(collection(db, collectionName));

      for (const doc of querySnapshot.docs) {
        const data = doc.data();
        
        // Skip if the document doesn't belong to the current user
        if (data.userId && data.userId !== userId) continue;

        // Create new document path with userId
        const newDocRef = doc(db, `${collectionName}/${userId}/${doc.id}`);
        
        // Add operation to batch
        currentBatch.set(newDocRef, {
          ...data,
          migratedAt: new Date().toISOString(),
          originalId: doc.id
        });
        
        // Mark original document for deletion
        currentBatch.delete(doc.ref);

        operationCount++;

        // Firebase has a limit of 500 operations per batch
        if (operationCount >= 499) {
          batches.push(currentBatch);
          currentBatch = writeBatch(db);
          operationCount = 0;
        }
      }
    }

    // Add the last batch if it has any operations
    if (operationCount > 0) {
      batches.push(currentBatch);
    }

    // Commit all batches
    console.log(`Committing ${batches.length} batches`);
    for (const batch of batches) {
      await batch.commit();
    }

    console.log('Migration completed successfully');
    return { success: true };
  } catch (error) {
    console.error('Migration failed:', error);
    return { success: false, error: error.message };
  }
}

// Function to migrate vendor data (which has a different structure)
async function migrateVendorData() {
  try {
    console.log('Starting vendor data migration');
    const batches = [];
    let currentBatch = writeBatch(db);
    let operationCount = 0;

    // Migrate vendors collection
    const vendorsSnapshot = await getDocs(collection(db, 'vendors'));
    for (const doc of vendorsSnapshot.docs) {
      const data = doc.data();
      if (!data.createdBy) {
        // Add createdBy field if it doesn't exist
        currentBatch.update(doc.ref, {
          createdBy: data.userId || 'system', // fallback to 'system' if no userId
          updatedAt: new Date().toISOString()
        });

        operationCount++;
        if (operationCount >= 499) {
          batches.push(currentBatch);
          currentBatch = writeBatch(db);
          operationCount = 0;
        }
      }
    }

    // Migrate vendor reviews
    const reviewsSnapshot = await getDocs(collection(db, 'vendorReviews'));
    for (const doc of reviewsSnapshot.docs) {
      const data = doc.data();
      if (!data.authorId) {
        // Add authorId field if it doesn't exist
        currentBatch.update(doc.ref, {
          authorId: data.userId || 'system',
          updatedAt: new Date().toISOString()
        });

        operationCount++;
        if (operationCount >= 499) {
          batches.push(currentBatch);
          currentBatch = writeBatch(db);
          operationCount = 0;
        }
      }
    }

    // Add the last batch if it has any operations
    if (operationCount > 0) {
      batches.push(currentBatch);
    }

    // Commit all batches
    console.log(`Committing ${batches.length} batches`);
    for (const batch of batches) {
      await batch.commit();
    }

    console.log('Vendor data migration completed successfully');
    return { success: true };
  } catch (error) {
    console.error('Vendor data migration failed:', error);
    return { success: false, error: error.message };
  }
}

export async function runMigration(userId) {
  console.log('Starting data migration...');
  
  // First migrate user-specific data
  const userMigrationResult = await migrateUserData(userId);
  if (!userMigrationResult.success) {
    return userMigrationResult;
  }

  // Then migrate vendor data
  const vendorMigrationResult = await migrateVendorData();
  if (!vendorMigrationResult.success) {
    return vendorMigrationResult;
  }

  return { success: true, message: 'All migrations completed successfully' };
}
