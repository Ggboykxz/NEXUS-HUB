
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { 
  getFirestore, 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager 
} from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";
import { getAnalytics, isSupported } from "firebase/analytics";
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from "firebase/app-check";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase with protection against multiple initializations
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firestore with multi-tab persistence
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});

// Initialize App Check for CSRF/Abuse protection (only on client)
if (typeof window !== "undefined") {
  const recaptchaKey = process.env.NEXT_PUBLIC_RECAPTCHA_KEY;
  const isDebug = process.env.NEXT_PUBLIC_APP_CHECK_DEBUG_TOKEN === 'true';

  // Si on est en mode debug ou qu'on a une clé valide, on initialise
  if (isDebug || (recaptchaKey && recaptchaKey !== '6Lc_placeholder_key')) {
    try {
      // Pour le debug local
      if (isDebug) {
        (window as any).FIREBASE_APPCHECK_DEBUG_TOKEN = true;
      }

      initializeAppCheck(app, {
        provider: new ReCaptchaEnterpriseProvider(recaptchaKey || '6Lc_placeholder_key'),
        isTokenAutoRefreshEnabled: true
      });
      console.log("Nexus App Check: Initialisé " + (isDebug ? "(Mode Debug)" : ""));
    } catch (e) {
      console.warn("App Check initialization failed:", e);
    }
  } else {
    console.warn("Nexus App Check: Sauté (Clé manquante ou invalide).");
  }
}

export const auth = getAuth(app);
export { db };
export const storage = getStorage(app);
export const functions = getFunctions(app, 'europe-west1');

export const initAnalytics = async () => {
  if (typeof window !== "undefined" && await isSupported()) {
    return getAnalytics(app);
  }
  return null;
};

export default app;
