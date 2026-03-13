
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
 * Supprime une œuvre et ses chapitres associés.
 */
export async function deleteStory(storyId: string) {
  try {
    const { uid, adminDb } = await getAuthenticatedArtist();
    const storyRef = adminDb.collection('stories').doc(storyId);
    const storyDoc = await storyRef.get();

    if (!storyDoc.exists) throw new Error('Histoire introuvable');
    if (storyDoc.data()?.artistId !== uid && (await adminDb.collection('users').doc(uid).get()).data()?.role !== 'admin') {
      throw new Error('Accès non autorisé');
    }

    // Suppression en cascade (simplifiée pour le prototype)
    const chapters = await storyRef.collection('chapters').get();
    const batch = adminDb.batch();
    chapters.forEach(c => batch.delete(c.ref));
    batch.delete(storyRef);
    
    await batch.commit();
    
    revalidatePath('/dashboard/creations');
    revalidatePath('/stories');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Alterne l'état de publication d'une œuvre.
 */
export async function toggleStoryPublication(storyId: string, isPublished: boolean) {
  try {
    const { uid, adminDb } = await getAuthenticatedArtist();
    await adminDb.collection('stories').doc(storyId).update({
      isPublished,
      status: isPublished ? 'published' : 'draft',
      updatedAt: FieldValue.serverTimestamp()
    });
    
    revalidatePath(`/dashboard/creations/${storyId}`);
    revalidatePath('/stories');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
