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

// Initialisation sécurisée de l'application (Singleton)
let app: FirebaseApp;
try {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }
} catch (error) {
  console.error("Firebase initialization error:", error);
  // Fallback for build time
  app = getApps().length ? getApp() : initializeApp({
    apiKey: "placeholder",
    authDomain: "placeholder",
    projectId: "placeholder"
  });
}

// Initialisation de Auth sans App Check
export const auth: Auth = getAuth(app);

// Désactive les vérifications d'application pour l'auth en environnement de test si nécessaire
// Note: App Check est désactivé côté code en ne l'initialisant pas du tout.

// Initialisation de Firestore avec gestion du cache persistant
let db: Firestore;
try {
  db = getFirestore(app);
} catch (error) {
  db = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager()
    })
  });
}

export { db };
export const storage: FirebaseStorage = getStorage(app);
export const functions: Functions = getFunctions(app, 'europe-west1');

/**
 * Initialisation asynchrone des Analytics
 */
export const initAnalytics = async (): Promise<Analytics | null> => {
  if (typeof window !== "undefined" && await isSupported()) {
    return getAnalytics(app);
  }
  return null;
};

export default app;