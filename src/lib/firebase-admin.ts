import * as admin from 'firebase-admin';

/**
 * Initialisation sécurisée du Firebase Admin SDK.
 * Utilise les variables d'environnement pour pointer vers le bon projet.
 */
if (!admin.apps.length) {
  try {
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'studio-6915614597-eca66';
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (privateKey && clientEmail) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || `${projectId}.firebasestorage.app`
      });
      console.log('Firebase Admin: Initialisé avec certificat.');
    } else {
      // Fallback sécurisé pour éviter le plantage 500 si les secrets sont absents au début
      admin.initializeApp({
        projectId: projectId,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || `${projectId}.firebasestorage.app`
      });
      console.warn('Firebase Admin: Initialisé sans certificat (Secrets manquants dans .env).');
    }
  } catch (error) {
    console.error('Firebase Admin init error:', error);
  }
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
export const adminStorage = admin.storage();