
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
 * Met à jour le profil utilisateur (Bio, Nom, Avatar).
 */
export async function updateProfile(data: { displayName?: string; bio?: string; photoURL?: string }) {
  try {
    const { uid, adminDb } = await getAuthenticatedUser();
    await adminDb.collection('users').doc(uid).update({
      ...data,
      updatedAt: FieldValue.serverTimestamp()
    });
    revalidatePath(`/profile/${uid}`);
    revalidatePath('/settings');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Gère l'achat fictif ou réel d'AfriCoins.
 */
export async function purchaseAfriCoins(amount: number, packId: string) {
  try {
    const { uid, adminDb } = await getAuthenticatedUser();
    
    await adminDb.runTransaction(async (transaction) => {
      const userRef = adminDb.collection('users').doc(uid);
      const userDoc = await transaction.get(userRef);
      
      if (!userDoc.exists) throw new Error("Utilisateur introuvable");
      
      transaction.update(userRef, {
        afriCoins: FieldValue.increment(amount),
        updatedAt: FieldValue.serverTimestamp()
      });
      
      const transRef = adminDb.collection('transactions').doc();
      transaction.set(transRef, {
        userId: uid,
        amount,
        type: 'purchase',
        packId,
        status: 'completed',
        createdAt: FieldValue.serverTimestamp()
      });
    });

    revalidatePath('/settings');
    revalidatePath('/africoins');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Sauvegarde la progression de lecture de manière atomique.
 */
export async function trackReadingProgress(storyId: string, chapterId: string, progress: number) {
  try {
    const { uid, adminDb } = await getAuthenticatedUser();
    const libRef = adminDb.collection('users').doc(uid).collection('library').doc(storyId);
    
    await libRef.set({
      storyId,
      lastReadChapterId: chapterId,
      progress,
      lastReadAt: FieldValue.serverTimestamp()
    }, { merge: true });

    return { success: true };
  } catch (error) {
    return { success: false };
  }
}
