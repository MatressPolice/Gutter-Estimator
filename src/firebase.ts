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
  apiKey: "AIzaSyCvzo5EelYJtwx05L-K0m9_-duZvUuUfuY",
  authDomain: "gutter-estimator-pro.firebaseapp.com",
  projectId: "gutter-estimator-pro",
  storageBucket: "gutter-estimator-pro.firebasestorage.app",
  messagingSenderId: "609574677931",
  appId: "1:609574677931:web:46801bca7d6dd2e7a676ee"
};

// Initialize Firebase App singleton
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);

const ESTIMATES_COLLECTION = 'estimates';

/**
 * Saves or updates an estimate in Cloud Firestore.
 */
export async function saveEstimateToCloud(estimate: Estimate): Promise<void> {
  const docRef = doc(db, ESTIMATES_COLLECTION, estimate.id);
  await setDoc(docRef, {
    ...estimate,
    updatedAt: new Date().toISOString(),
  }, { merge: true });
}

/**
 * Deletes an estimate from Cloud Firestore.
 */
export async function deleteEstimateFromCloud(id: string): Promise<void> {
  const docRef = doc(db, ESTIMATES_COLLECTION, id);
  await deleteDoc(docRef);
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
