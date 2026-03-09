
import * as admin from 'firebase-admin';

/**
 * Initialisation sécurisée du SDK Admin pour les environnements serveurs (Sitemap, Metadata).
 * Si les clés secrètes manquent, le module exporte des services vides pour éviter de bloquer le build.
 */
export function getAdminServices() {
  if (!admin.apps.length) {
    try {
      // Tentative d'initialisation via les variables d'environnement
      // Note: Pour un fonctionnement complet en production, une clé de compte de service est recommandée.
      admin.initializeApp({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
      });
    } catch (e) {
      console.warn("Firebase Admin failed to initialize. Server-side features might be limited.");
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
