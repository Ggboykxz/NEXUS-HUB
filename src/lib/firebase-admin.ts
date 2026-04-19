
import * as admin from 'firebase-admin';
import serviceAccount from './serviceAccountKey.json';

/**
 * Initialisation sécurisée du SDK Admin pour les environnements serveurs (Sitemap, Metadata).
 * Si les clés secrètes manquent, le module exporte des services vides pour éviter de bloquer le build.
 */
export function getAdminServices() {

  // Vérifie que la clé de service est chargée pour éviter les erreurs de build cryptiques
  if (!(serviceAccount as admin.ServiceAccount)?.project_id) {
    console.error("Firebase Admin Error: Le fichier serviceAccountKey.json est manquant ou invalide.");
    // Retourne des services "vides" pour ne pas planter le build, 
    // mais les opérations échoueront au runtime.
    return {
      adminAuth: {} as admin.auth.Auth,
      adminDb: {} as admin.firestore.Firestore,
      adminStorage: {} as admin.storage.Storage,
    };
  }

  if (!admin.apps.length) {
    try {
      // Initialisation uniquement avec les credentials.
      // Le SDK Admin déduit le projectId et autres infos depuis la clé.
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount as admin.ServiceAccount)
      });
    } catch (e) {
      console.error("Firebase Admin initialization error:", e);
      throw new Error("L'initialisation de Firebase Admin a échoué. Vérifiez vos identifiants de compte de service.");
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
