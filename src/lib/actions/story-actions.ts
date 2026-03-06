'use server';

import { getAdminServices } from '@/lib/firebase-admin';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { FieldValue } from 'firebase-admin/firestore';

async function getAuthenticatedArtist() {
  const { adminAuth, adminDb } = getAdminServices();
  const session = (await cookies()).get('__session')?.value;
  if (!session) throw new Error('Non authentifié');
  
  const decoded = await adminAuth.verifySessionCookie(session);
  const userDoc = await adminDb.collection('users').doc(decoded.uid).get();
  const role = userDoc.data()?.role || '';
  
  if (!role.startsWith('artist') && role !== 'admin') {
    throw new Error('Permission artiste requise');
  }

  return { uid: decoded.uid, adminDb };
}

/**
 * Crée un nouveau chapitre pour une œuvre existante.
 */
export async function createChapter(storyId: string, data: { title: string; chapterNumber: number; pages: any[]; isPremium: boolean; afriCoinsPrice: number }) {
  try {
    const { adminDb } = await getAuthenticatedArtist();
    const chapterRef = adminDb.collection('stories').doc(storyId).collection('chapters').doc();
    
    const chapterData = {
      id: chapterRef.id,
      storyId,
      ...data,
      status: 'Publié',
      views: 0,
      likes: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      publishedAt: new Date().toISOString()
    };

    await chapterRef.set(chapterData);
    
    // Incrémentation du compteur de chapitres
    await adminDb.collection('stories').doc(storyId).update({
      chapterCount: FieldValue.increment(1),
      updatedAt: new Date().toISOString()
    });

    revalidatePath(`/dashboard/creations/${storyId}`);
    return { success: true, id: chapterRef.id };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Supprime une œuvre (Seul l'auteur ou un admin peut le faire).
 */
export async function deleteStory(storyId: string) {
  try {
    const { uid, adminDb } = await getAuthenticatedArtist();
    const storyRef = adminDb.collection('stories').doc(storyId);
    const storyDoc = await storyRef.get();

    if (!storyDoc.exists) throw new Error('Histoire introuvable');
    if (storyDoc.data()?.artistId !== uid) throw new Error('Accès non autorisé');

    await storyRef.delete();
    revalidatePath('/dashboard/creations');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
