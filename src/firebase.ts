import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  onSnapshot,
  query,
  where,
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
export const auth = getAuth(app);

// Sign in anonymously
signInAnonymously(auth).catch((error) => {
  console.error('Error signing in anonymously:', error);
});

const ESTIMATES_COLLECTION = 'estimates';

/**
 * Saves or updates an estimate in Cloud Firestore.
 */
export async function saveEstimateToCloud(estimate: Estimate): Promise<void> {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    const docRef = doc(db, ESTIMATES_COLLECTION, estimate.id);
    await setDoc(docRef, {
      ...estimate,
      userId: user.uid,
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
    const user = auth.currentUser;
    if (!user) return [];

    const q = query(
      collection(db, ESTIMATES_COLLECTION),
      where('userId', '==', user.uid)
    );
    const snapshot = await getDocs(q);
    const estimates = snapshot.docs.map(doc => doc.data() as Estimate);

    // Sort client-side to bypass composite index requirements
    return estimates.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
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
  let unsubscribeSnapshot: () => void = () => {};

  const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
    // Clean up previous snapshot listener if it exists
    unsubscribeSnapshot();

    if (user) {
      const q = query(
        collection(db, ESTIMATES_COLLECTION),
        where('userId', '==', user.uid)
      );

      unsubscribeSnapshot = onSnapshot(
        q,
        (snapshot) => {
          const estimates = snapshot.docs.map(doc => doc.data() as Estimate);
          // Sort client-side to bypass composite index requirements
          estimates.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
          onUpdate(estimates);
        },
        (err) => {
          console.warn('Firestore subscription warning:', err);
          if (onError) onError(err);
        }
      );
    } else {
      // Not logged in (or checking), send empty updates for now
      onUpdate([]);
    }
  });

  return () => {
    unsubscribeAuth();
    unsubscribeSnapshot();
  };
}
