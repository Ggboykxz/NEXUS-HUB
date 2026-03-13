
import * as admin from 'firebase-admin';
import serviceAccount from '../../serviceAccountKey.json';

/**
 * Initialisation sécurisée du SDK Admin pour les environnements serveurs (Sitemap, Metadata).
 * Si les clés secrètes manquent, le module exporte des services vides pour éviter de bloquer le build.
 */
export function getAdminServices() {
  if (!admin.apps.length) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
      });
    } catch (e) {
      console.error("Firebase Admin initialization error:", e);
      throw new Error("Firebase Admin initialization failed. Check your service account credentials.");
    }
  }

  return {
    adminAuth: admin.auth(),
    adminDb: admin.firestore(),
    adminStorage: admin.storage(),
  };
}

const services = getAdminServices();
export const adminDb = services.adminDb;
export const adminAuth = services.adminAuth;
export const db = adminDb;
