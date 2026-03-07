import { auth, db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';
import type { UserProfile } from './types';

/**
 * Utilitaires d'authentification client.
 * Note: Dans les composants serveurs, utilisez useAuth() ou vérifiez l'état côté client.
 */
export async function getClientUserProfile(uid: string): Promise<UserProfile | null> {
  if (!uid) return null;
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (!userDoc.exists()) return null;
    return userDoc.data() as UserProfile;
  } catch (e) {
    console.error("Error fetching client profile:", e);
    return null;
  }
}
