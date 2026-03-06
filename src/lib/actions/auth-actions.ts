
'use server';

import { getAdminServices } from '@/lib/firebase-admin';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

/**
 * Action de déconnexion globale.
 * Révoque les jetons de session et nettoie les cookies.
 */
export async function logout() {
  const { adminAuth } = getAdminServices();
  const sessionCookie = (await cookies()).get('__session')?.value;

  if (sessionCookie) {
    try {
      const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie);
      await adminAuth.revokeRefreshTokens(decodedClaims.sub);
    } catch (e) {
      // Ignorer si le cookie est déjà expiré
    }
  }

  (await cookies()).set('__session', '', { maxAge: 0, path: '/' });
  (await cookies()).set('nexushub-role', '', { maxAge: 0, path: '/' });
  
  revalidatePath('/');
}

/**
 * Initialise un profil utilisateur en cas d'échec du flux client.
 * Appelé si l'utilisateur est authentifié mais sans document Firestore.
 */
export async function repairProfile(uid: string, email: string, name: string) {
  const { adminDb } = getAdminServices();
  const userRef = adminDb.collection('users').doc(uid);
  const doc = await userRef.get();

  if (!doc.exists) {
    const slug = name.toLowerCase().replace(/ /g, '-') + '-' + Math.floor(1000 + Math.random() * 9000);
    await userRef.set({
      uid,
      email,
      displayName: name,
      slug,
      role: 'reader',
      afriCoins: 0,
      level: 1,
      subscribersCount: 0,
      followedCount: 0,
      isCertified: false,
      isBanned: false,
      onboardingCompleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      readingStats: { chaptersRead: 0, totalReadTime: 0 },
      preferences: { language: 'fr', theme: 'dark', privacy: { showCurrentReading: true, showHistory: true } }
    });
  }
}
