import 'dotenv/config';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, deleteDoc, getDocs, collection } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: "gutter-estimator-pro.firebaseapp.com",
  projectId: "gutter-estimator-pro",
  storageBucket: "gutter-estimator-pro.firebasestorage.app",
  messagingSenderId: "609574677931",
  appId: "1:609574677931:web:46801bca7d6dd2e7a676ee"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function cleanup() {
  console.log('Cleaning up seed estimate from Firestore...');
  try {
    const snap = await getDocs(collection(db, 'estimates'));
    for (const d of snap.docs) {
      const data = d.data();
      if (d.id === 'seed-estimate-id-1' || data.name === 'Custom Base Plate & Bracket Assembly') {
        console.log(`Deleting seed estimate document ID: ${d.id}`);
        await deleteDoc(doc(db, 'estimates', d.id));
      }
    }
    console.log('Cleanup finished successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Error during cleanup:', err);
    process.exit(1);
  }
}

cleanup();
