'use server';

import { adminDb } from '@/lib/firebase-admin';
import { revalidatePath } from 'next/cache';
import { FieldValue } from 'firebase-admin/firestore';

/**
 * Débloque un chapitre premium pour un utilisateur.
 */
export async function unlockChapter(chapterId: string, storyId: string, userId: string) {
  try {
    const userRef = adminDb.collection('users').doc(userId);
    const chapterRef = adminDb.collection('stories').doc(storyId).collection('chapters').doc(chapterId);
    
    const [userDoc, chapterDoc] = await Promise.all([userRef.get(), chapterRef.get()]);
    
    if (!userDoc.exists || !chapterDoc.exists) throw new Error("Données introuvables.");
    
    const userData = userDoc.data();
    const chapterData = chapterDoc.data();
    const price = chapterData?.afriCoinsPrice || 0;

    if ((userData?.afriCoins || 0) < price) {
      throw new Error("Solde d'AfriCoins insuffisant.");
    }

    const batch = adminDb.batch();
    
    // Débiter les coins
    batch.update(userRef, { afriCoins: FieldValue.increment(-price) });
    
    // Créer l'accès
    const unlockRef = userRef.collection('unlockedChapters').doc(chapterId);
    batch.set(unlockRef, {
      chapterId,
      storyId,
      unlockedAt: new Date().toISOString(),
      pricePaid: price
    });

    await batch.commit();
    revalidatePath(`/read/${storyId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Met à jour le statut d'un chapitre.
 */
export async function updateChapterStatus(storyId: string, chapterId: string, status: 'Publié' | 'Brouillon' | 'Programmé') {
  try {
    await adminDb.collection('stories').doc(storyId).collection('chapters').doc(chapterId).update({
      status,
      updatedAt: new Date().toISOString()
    });
    revalidatePath(`/dashboard/creations/${storyId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
