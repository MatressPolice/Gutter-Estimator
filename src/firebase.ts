import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  enableIndexedDbPersistence
} from 'firebase/firestore';
import { Estimate } from './types';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase App singleton
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);

const ESTIMATES_COLLECTION = 'estimates';

/**
 * Saves or updates an estimate in Cloud Firestore.
 */
export async function saveEstimateToCloud(estimate: Estimate): Promise<void> {
  try {
    const docRef = doc(db, ESTIMATES_COLLECTION, estimate.id);
    await setDoc(docRef, {
      ...estimate,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (error) {
    console.error('Error saving estimate to cloud:', error);
    throw error;
  }
}

/**
 * Deletes an estimate from Cloud Firestore.
 */
export async function deleteEstimateFromCloud(id: string): Promise<void> {
  try {
    const docRef = doc(db, ESTIMATES_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting estimate from cloud:', error);
    throw error;
  }
}

/**
 * Fetches all estimates from Cloud Firestore once.
 */
export async function fetchEstimatesFromCloud(): Promise<Estimate[]> {
  try {
    const q = query(collection(db, ESTIMATES_COLLECTION), orderBy('updatedAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as Estimate);
  } catch (error) {
    console.error('Error fetching estimates from cloud:', error);
    return [];
  }
}

/**
 * Real-time listener for estimate changes across all connected devices.
 */
export function subscribeToEstimates(
  onUpdate: (estimates: Estimate[]) => void,
  onError?: (error: Error) => void
) {
  const q = query(collection(db, ESTIMATES_COLLECTION), orderBy('updatedAt', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const estimates = snapshot.docs.map(doc => doc.data() as Estimate);
      onUpdate(estimates);
    },
    (err) => {
      console.warn('Firestore subscription warning:', err);
      if (onError) onError(err);
    }
  );
}
