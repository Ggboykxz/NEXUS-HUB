
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";
import { getFunctions, Functions } from "firebase/functions";
import { getAnalytics, isSupported, Analytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Vérification de la validité de la configuration
const isConfigValid = !!firebaseConfig.apiKey && !!firebaseConfig.projectId;

// Initialisation sécurisée de Firebase
let app: FirebaseApp;

if (getApps().length > 0) {
  app = getApp();
} else {
  // On n'initialise QUE si la config est valide. 
  // Sinon on crée une application "fantôme" pour éviter les erreurs d'importation,
  // mais les services ne seront pas fonctionnels.
  if (isConfigValid) {
    app = initializeApp(firebaseConfig);
  } else {
    // Fallback minimal pour éviter le crash au build/import
    // @ts-ignore
    app = { name: '[DEFAULT]', options: {}, automaticDataCollectionEnabled: false };
    console.warn("⚠️ Firebase: Configuration manquante (apiKey ou projectId). Vérifiez votre fichier .env");
  }
}

// Initialisation des services avec protection contre l'absence d'initialisation réelle
const auth: Auth = isConfigValid ? getAuth(app) : ({} as Auth);
const db: Firestore = isConfigValid ? getFirestore(app) : ({} as Firestore);
const storage: FirebaseStorage = isConfigValid ? getStorage(app) : ({} as FirebaseStorage);
const functions: Functions = isConfigValid ? getFunctions(app) : ({} as Functions);

// Configuration de la persistance Auth (uniquement côté client)
if (typeof window !== 'undefined' && isConfigValid) {
  setPersistence(auth, browserLocalPersistence).catch(console.error);
}

let analytics: Analytics | null = null;

// Initialisation des Analytics (uniquement côté client)
if (typeof window !== 'undefined' && isConfigValid) {
  isSupported().then((supported) => {
    if (supported && firebaseConfig.appId) {
      try {
        analytics = getAnalytics(app);
      } catch (e) {
        console.warn("Firebase Analytics failed to initialize:", e);
      }
    }
  }).catch(e => console.warn("Firebase Analytics isSupported check failed:", e));
}

export { app, auth, db, storage, functions, analytics, isConfigValid };
