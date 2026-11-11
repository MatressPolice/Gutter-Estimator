import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, User } from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  onSnapshot,
  query,
  where
} from 'firebase/firestore';
import { Estimate } from './types';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
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

// Authenticate anonymously in background
signInAnonymously(auth).catch((error) => {
  console.error("Anonymous auth failed:", error);
});

let authInitPromise: Promise<User> | null = null;

/**
 * Ensures a valid authenticated user exists, awaiting anonymous sign-in if necessary.
 */
export async function ensureAuth(): Promise<User> {
  if (auth.currentUser) {
    return auth.currentUser;
  }

  if (!authInitPromise) {
    authInitPromise = new Promise((resolve, reject) => {
      let resolved = false;
      const unsubscribe = onAuthStateChanged(
        auth,
        (user) => {
          if (user) {
            resolved = true;
            unsubscribe();
            authInitPromise = null;
            resolve(user);
          }
        },
        (error) => {
          unsubscribe();
          authInitPromise = null;
          reject(error);
        }
      );

      signInAnonymously(auth).catch((err) => {
        if (!resolved) {
          unsubscribe();
          authInitPromise = null;
          reject(err);
        }
      });
    });
  }

  return authInitPromise;
}

const ESTIMATES_COLLECTION = 'estimates';

/**
 * Sanitizes and shapes an estimate payload before cloud persistence.
 */
function sanitizeEstimatePayload(estimate: Estimate, uid: string): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    ...estimate,
    id: String(estimate.id || '').trim(),
    name: String(estimate.name || 'Custom Parts Quote').slice(0, 200),
    clientName: String(estimate.clientName || '').slice(0, 200),
    quoteNumber: String(estimate.quoteNumber || '').slice(0, 100),
    date: String(estimate.date || new Date().toISOString().split('T')[0]).slice(0, 30),
    hourlyRate: Number(estimate.hourlyRate) || 0,
    overheadPercent: Number(estimate.overheadPercent) || 0,
    profitPercent: Number(estimate.profitPercent) || 0,
    parts: Array.isArray(estimate.parts) ? estimate.parts.slice(0, 200) : [],
    shells: Array.isArray(estimate.shells) ? estimate.shells.slice(0, 200) : [],
    createdAt: String(estimate.createdAt || new Date().toISOString()).slice(0, 40),
    updatedAt: new Date().toISOString(),
    userId: uid,
  };

  if (typeof estimate.notes === 'string') {
    payload.notes = estimate.notes.slice(0, 2000);
  }

  return payload;
}

/**
 * Saves or updates an estimate in Cloud Firestore with verified authentication and sanitized payload.
 */
export async function saveEstimateToCloud(estimate: Estimate): Promise<void> {
  try {
    const user = await ensureAuth();
    if (!estimate.id || typeof estimate.id !== 'string') {
      throw new Error('Invalid estimate ID');
    }

    const docRef = doc(db, ESTIMATES_COLLECTION, estimate.id);
    const cleanPayload = sanitizeEstimatePayload(estimate, user.uid);
    await setDoc(docRef, cleanPayload, { merge: true });
  } catch (error) {
    console.error('Error saving estimate to cloud:', error);
    throw error;
  }
}

/**
 * Deletes an estimate from Cloud Firestore with verified authentication.
 */
export async function deleteEstimateFromCloud(id: string): Promise<void> {
  try {
    await ensureAuth();
    if (!id || typeof id !== 'string') {
      throw new Error('Invalid estimate ID');
    }
    const docRef = doc(db, ESTIMATES_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting estimate from cloud:', error);
    throw error;
  }
}

/**
 * Fetches all estimates for the current authenticated user from Cloud Firestore once.
 */
export async function fetchEstimatesFromCloud(): Promise<Estimate[]> {
  try {
    const user = await ensureAuth();
    if (!user) return [];

    const q = query(
      collection(db, ESTIMATES_COLLECTION),
      where('userId', '==', user.uid)
    );
    const snapshot = await getDocs(q);
    const results = snapshot.docs.map(doc => doc.data() as Estimate);

    // Sort client-side to avoid composite index requirements
    results.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    return results;
  } catch (error) {
    console.error('Error fetching estimates from cloud:', error);
    return [];
  }
}

/**
 * Real-time listener for estimate changes with leak-free teardown semantics.
 */
export function subscribeToEstimates(
  onUpdate: (estimates: Estimate[]) => void,
  onError?: (error: Error) => void
) {
  let isDisposed = false;
  let unsubscribeSnapshot: (() => void) | undefined;

  // Ensure initial auth kickoff
  ensureAuth().catch((err) => {
    console.warn('Initial anonymous authentication warning:', err);
  });

  const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
    if (unsubscribeSnapshot) {
      unsubscribeSnapshot();
      unsubscribeSnapshot = undefined;
    }

    if (isDisposed) return;

    if (user) {
      const q = query(
        collection(db, ESTIMATES_COLLECTION),
        where('userId', '==', user.uid)
      );

      unsubscribeSnapshot = onSnapshot(
        q,
        (snapshot) => {
          if (isDisposed) return;
          const estimates = snapshot.docs.map(doc => doc.data() as Estimate);
          // Sort client-side to avoid composite index requirements
          estimates.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
          onUpdate(estimates);
        },
        (err) => {
          console.warn('Firestore subscription warning:', err);
          if (onError) onError(err);
        }
      );
    } else {
      onUpdate([]);
    }
  });

  return () => {
    isDisposed = true;
    unsubscribeAuth();
    if (unsubscribeSnapshot) {
      unsubscribeSnapshot();
      unsubscribeSnapshot = undefined;
    }
  };
}
