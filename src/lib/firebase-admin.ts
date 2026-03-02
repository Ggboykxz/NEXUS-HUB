import * as admin from 'firebase-admin';

/**
 * Initialisation sécurisée du Firebase Admin SDK.
 * Évite les crashs si les variables d'environnement privées sont manquantes en développement.
 */
if (!admin.apps.length) {
  try {
    if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
      });
      console.log('Firebase Admin: Initialisé avec succès.');
    } else {
      // Fallback pour le développement local sans service account
      admin.initializeApp({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
      });
      console.warn('Firebase Admin: Initialisé sans certificat (certaines fonctions serveurs seront limitées).');
    }
  } catch (error) {
    console.error('Firebase Admin init error:', error);
  }
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
export const adminStorage = admin.storage();
