// src/firebaseConfig.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// 🔐 Your Firebase project config
const firebaseConfig = {
  
};

// ✅ Initialize app only once
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// ✅ Export auth and db
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
