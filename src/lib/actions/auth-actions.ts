'use server';

import { getAdminServices } from '@/lib/firebase-admin';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

const SignupSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  role: z.string()
});

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

  (await cookies()).set('__session', '', { maxAge: 0 });
  (await cookies()).set('nexushub-role', '', { maxAge: 0 });
  revalidatePath('/');
}

/**
 * Initialise un profil utilisateur en cas d'échec du flux client.
 */
export async function ensureUserProfile(uid: string, data: z.infer<typeof SignupSchema>) {
  const { adminDb } = getAdminServices();
  const userRef = adminDb.collection('users').doc(uid);
  const doc = await userRef.get();

  if (!doc.exists) {
    const slug = data.name.toLowerCase().replace(/ /g, '-') + '-' + Math.floor(1000 + Math.random() * 9000);
    await userRef.set({
      uid,
      email: data.email,
      displayName: data.name,
      slug,
      role: data.role,
      afriCoins: 0,
      level: 1,
      subscribersCount: 0,
      followedCount: 0,
      isCertified: false,
      isBanned: false,
      onboardingCompleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      readingStats: { chaptersRead: 0, totalReadTime: 0 }
    });
  }
}
