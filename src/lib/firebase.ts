
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";
import { getFunctions, Functions } from "firebase/functions";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Vérification stricte des clés essentielles
const isConfigValid = !!firebaseConfig.apiKey && !!firebaseConfig.projectId;

let app: FirebaseApp;

if (getApps().length > 0) {
  app = getApp();
} else {
  if (isConfigValid) {
    app = initializeApp(firebaseConfig);
  } else {
    // Fallback minimal pour éviter le crash au build, mais l'app affichera une erreur au runtime
    // @ts-ignore
    app = { name: '[DEFAULT]', options: {}, automaticDataCollectionEnabled: false };
    console.error("❌ Firebase: Configuration manquante. Vérifiez votre fichier .env");
  }
}

const auth: Auth = isConfigValid ? getAuth(app) : ({} as Auth);
const db: Firestore = isConfigValid ? getFirestore(app) : ({} as Firestore);
const storage: FirebaseStorage = isConfigValid ? getStorage(app) : ({} as FirebaseStorage);
const functions: Functions = isConfigValid ? getFunctions(app) : ({} as Functions);

if (typeof window !== 'undefined' && isConfigValid) {
  setPersistence(auth, browserLocalPersistence).catch(console.error);
}

export { app, auth, db, storage, functions, isConfigValid };
