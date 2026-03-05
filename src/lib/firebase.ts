import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager,
  getFirestore,
  Firestore
} from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";
import { getFunctions, Functions } from "firebase/functions";
import { getAnalytics, isSupported, Analytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Singleton pattern for Firebase App
function getFirebaseApp(): FirebaseApp {
  const apps = getApps();
  if (apps.length > 0) {
    return apps[0];
  }
  
  // Minimal config check to prevent crash during Next.js build
  if (!firebaseConfig.apiKey || firebaseConfig.apiKey === 'undefined') {
    console.warn("Firebase configuration is missing or incomplete. Authentication features may fail.");
  }

  return initializeApp(firebaseConfig);
}

const app = getFirebaseApp();

// Export services as singletons
export const auth: Auth = getAuth(app);

// Use a separate variable for db to handle initialization options correctly
let firestoreDb: Firestore;
try {
  firestoreDb = getFirestore(app);
} catch (e) {
  // If getFirestore fails (e.g. already initialized with different settings), 
  // we try to initialize it correctly or just get the instance.
  firestoreDb = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager()
    })
  });
}

export const db = firestoreDb;
export const storage: FirebaseStorage = getStorage(app);
export const functions: Functions = getFunctions(app, 'europe-west1');

/**
 * Initialisation asynchrone des Analytics (Client-side uniquement)
 */
export const initAnalytics = async (): Promise<Analytics | null> => {
  if (typeof window !== "undefined" && await isSupported()) {
    return getAnalytics(app);
  }
  return null;
};

export default app;