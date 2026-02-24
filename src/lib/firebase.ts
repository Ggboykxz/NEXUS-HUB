import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBrvk6VF3uPdyn43PI-eXjeQQufh7swTwY",
  authDomain: "studio-6915614597-eca66.firebaseapp.com",
  databaseURL: "https://studio-6915614597-eca66-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "studio-6915614597-eca66",
  storageBucket: "studio-6915614597-eca66.firebasestorage.app",
  messagingSenderId: "656691616636",
  appId: "1:656691616636:web:b7cdfb56d387c6666262f9",
  measurementId: "G-T08MQ98DHE"
};

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Analytics is only supported in the browser
export const initAnalytics = async () => {
  if (typeof window !== "undefined" && await isSupported()) {
    return getAnalytics(app);
  }
  return null;
};

export default app;
