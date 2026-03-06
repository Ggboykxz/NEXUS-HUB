'use server';

import { getAdminServices } from '@/lib/firebase-admin';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { FieldValue } from 'firebase-admin/firestore';

async function getAuthenticatedUser() {
  const { adminAuth, adminDb } = getAdminServices();
  const session = (await cookies()).get('__session')?.value;
  if (!session) throw new Error('Non authentifié');
  
  const decoded = await adminAuth.verifySessionCookie(session);
  return { uid: decoded.uid, adminDb };
}

/**
 * Met à jour le profil utilisateur (Bio, Nom).
 */
export async function updateProfile(data: { displayName?: string; bio?: string; photoURL?: string }) {
  try {
    const { uid, adminDb } = await getAuthenticatedUser();
    await adminDb.collection('users').doc(uid).update({
      ...data,
      updatedAt: new Date().toISOString()
    });
    revalidatePath(`/profile/${uid}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Gère l'achat fictif ou réel d'AfriCoins.
 */
export async function addAfriCoins(amount: number) {
  try {
    const { uid, adminDb } = await getAuthenticatedUser();
    await adminDb.collection('users').doc(uid).update({
      afriCoins: FieldValue.increment(amount),
      updatedAt: new Date().toISOString()
    });
    
    // Log de transaction
    await adminDb.collection('transactions').add({
      userId: uid,
      amount,
      type: 'purchase',
      status: 'completed',
      createdAt: new Date().toISOString()
    });

    revalidatePath('/settings');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Sauvegarde la progression de lecture.
 */
export async function trackProgress(storyId: string, chapterId: string, progress: number) {
  try {
    const { uid, adminDb } = await getAuthenticatedUser();
    const storySnap = await adminDb.collection('stories').doc(storyId).get();
    const storyData = storySnap.data();

    await adminDb.collection('users').doc(uid).collection('library').doc(storyId).set({
      storyId,
      storyTitle: storyData?.title,
      storyCover: storyData?.coverImage?.imageUrl,
      lastReadChapterId: chapterId,
      progress,
      lastReadAt: new Date().toISOString()
    }, { merge: true });

    return { success: true };
  } catch (error) {
    return { success: false };
  }
}
