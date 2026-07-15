import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

let app;
let auth = null;
let db = null;
let storage = null;
let isSimulationMode = false;

// Check if credentials are valid and complete
const isConfigValid = 
  firebaseConfig.apiKey && 
  firebaseConfig.apiKey !== 'YOUR_API_KEY' &&
  firebaseConfig.projectId;

if (isConfigValid) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    console.log('%c🔥 SaveBite: Connected to Firebase Live Services!', 'color: #2E7D32; font-weight: bold; font-size: 12px;');
  } catch (error) {
    console.error('Firebase initialization failed, falling back to simulation mode:', error);
    isSimulationMode = true;
  }
} else {
  isSimulationMode = true;
  console.log(
    '%c🌿 SaveBite: Running in LOCAL SIMULATION MODE (No Firebase keys found).\nYour data will be persisted in LocalStorage for testing. Create a .env file to hook up Cloud Firestore & Auth.', 
    'color: #FFA726; font-weight: bold; padding: 4px; border: 1px solid #FFA726; border-radius: 4px; font-size: 11px;'
  );
}

export { auth, db, storage, isSimulationMode };
export default app;
