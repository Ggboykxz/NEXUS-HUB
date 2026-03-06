import * as admin from 'firebase-admin';

let app: admin.app.App;

if (!admin.apps.length) {
  const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  };

  if (!serviceAccount.projectId || !serviceAccount.clientEmail || !serviceAccount.privateKey) {
    console.warn(
      'Firebase Admin credentials are not fully set. Some functionalities might be disabled.'
    );
    // In a production environment, you should throw an error here.
    // throw new Error('Firebase Admin credentials are not set.');
  } else {
    try {
      app = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      });
    } catch (error: any) {
      console.error('Firebase Admin initialization error:', error.message);
      // throw new Error(`Firebase Admin initialization failed: ${error.message}`);
    }
  }
} else {
  app = admin.apps[0]!;
}

function getAdminServices() {
  if (!app) {
    // This will now be a more explicit error.
    throw new Error('Firebase Admin SDK has not been initialized. Check your environment variables.');
  }
  return {
    adminDb: admin.firestore(),
    adminAuth: admin.auth(),
    adminStorage: admin.storage(),
    adminApp: app,
  };
}

// We export a function that returns the services. This ensures the app is initialized before use.
export { getAdminServices };
