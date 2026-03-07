import * as admin from 'firebase-admin';

/**
 * Fournit l'accès aux services Firebase Admin avec initialisation paresseuse.
 * Doit être appelé uniquement dans du code exécuté côté serveur (Route Handlers, Server Actions).
 */
export function getAdminServices() {
  // Vérifie si une application est déjà initialisée pour éviter les erreurs de doublons
  if (!admin.apps.length) {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    try {
      if (projectId && clientEmail && privateKey) {
        // Configuration manuelle via variables d'environnement (Développement / Production externe)
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId,
            clientEmail,
            privateKey,
          }),
          storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || `${projectId}.firebasestorage.app`,
        });
      } else {
        // Tentative d'initialisation via Identifiants Par Défaut (Application Default Credentials)
        // Idéal pour Firebase App Hosting, Cloud Run ou Cloud Functions.
        admin.initializeApp({
          storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        });
      }
    } catch (error: any) {
      console.error('Firebase Admin initialization error:', error);
      throw new Error('Le SDK Admin Firebase n\'a pas pu être initialisé. Vérifiez vos variables d\'environnement ou les permissions du compte de service.');
    }
  }

  // Utilise l'application par défaut
  const app = admin.app();

  return {
    adminDb: admin.firestore(app),
    adminAuth: admin.auth(app),
    adminStorage: admin.storage(app),
    adminApp: app,
  };
}

// Variables pour compatibilité descendante (peuvent être null au chargement du module)
export const adminDb = typeof window === 'undefined' ? admin.firestore : null as any;
export const adminAuth = typeof window === 'undefined' ? admin.auth : null as any;
export const adminStorage = typeof window === 'undefined' ? admin.storage : null as any;
