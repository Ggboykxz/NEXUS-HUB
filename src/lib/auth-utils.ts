import { getAdminServices } from './firebase-admin';
import { cookies } from 'next/headers';
import type { UserProfile } from './types';

/**
 * Retrieves the currently authenticated user's profile from Firestore.
 * This is a server-side utility.
 * @returns {Promise<UserProfile | null>} The user profile object or null if not authenticated.
 */
export async function getCurrentUser(): Promise<UserProfile | null> {
  const { adminAuth, adminDb } = getAdminServices();
  const sessionCookie = cookies().get("__session")?.value;

  if (!sessionCookie) {
    return null;
  }

  try {
    const decodedToken = await adminAuth.verifySessionCookie(sessionCookie, true);
    const userDoc = await adminDb.collection('users').doc(decodedToken.uid).get();

    if (!userDoc.exists) {
      return null;
    }

    return userDoc.data() as UserProfile;
  } catch (error) {
    // Session cookie is invalid or expired. The user is effectively logged out.
    return null;
  }
}
