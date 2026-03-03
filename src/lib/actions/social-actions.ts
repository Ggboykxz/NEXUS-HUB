'use server';

import { adminDb } from '@/lib/firebase-admin';
import { revalidatePath } from 'next/cache';

/**
 * Poste un nouveau commentaire sur un chapitre.
 */
export async function postComment(storyId: string, chapterId: string, userId: string, content: string) {
  try {
    const userDoc = await adminDb.collection('users').doc(userId).get();
    const userData = userDoc.data();

    const commentRef = adminDb
      .collection('stories').doc(storyId)
      .collection('chapters').doc(chapterId)
      .collection('comments').doc();

    await commentRef.set({
      id: commentRef.id,
      authorId: userId,
      authorName: userData?.displayName || 'Anonyme',
      authorAvatar: userData?.photoURL || '',
      content: content.slice(0, 500),
      likes: 0,
      createdAt: new Date().toISOString()
    });

    revalidatePath(`/read/${storyId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Crée un signalement pour modération.
 */
export async function submitReport(data: { type: string, targetId: string, reporterId: string, reason: string }) {
  try {
    await adminDb.collection('reports').add({
      ...data,
      status: 'pending',
      createdAt: new Date().toISOString()
    });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
