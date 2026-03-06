import * as admin from 'firebase-admin';

let app: admin.app.App;

// On récupère les variables d'environnement pour le SDK Admin
const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

if (!admin.apps.length) {
  if (!projectId || !clientEmail || !privateKey) {
    console.warn(
      'Firebase Admin credentials are not fully set. Server-side features like session cookies or direct Firestore access may fail.'
    );
    // On ne crash pas l'app ici pour permettre au client de fonctionner, mais on prévient
  } else {
    try {
      app = admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || `${projectId}.appspot.com`,
      });
    } catch (error: any) {
      console.error('Firebase Admin initialization error:', error.message);
    }
  }
} else {
  app = admin.apps[0]!;
}

/**
 * Fournit l'accès aux services Firebase Admin.
 * Doit être appelé dans des Server Components, Server Actions ou API Routes uniquement.
 */
function getAdminServices() {
  // @ts-ignore - app est initialisé si les variables sont présentes
  if (!admin.apps.length && !app) {
    throw new Error('Firebase Admin SDK has not been initialized. Check your environment variables.');
  }
  
  return {
    adminDb: admin.firestore(),
    adminAuth: admin.auth(),
    adminStorage: admin.storage(),
    adminApp: app!,
  };
}

export { getAdminServices };
export const adminDb = admin.apps.length ? admin.firestore() : null as any;
export const adminAuth = admin.apps.length ? admin.auth() : null as any;
export const adminStorage = admin.apps.length ? admin.storage() : null as any;
