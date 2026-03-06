'use server';

import { getAdminServices } from '@/lib/firebase-admin';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

async function verifyAdmin() {
  const { adminAuth, adminDb } = getAdminServices();
  const session = (await cookies()).get('__session')?.value;
  if (!session) throw new Error('Accès interdit');

  const decoded = await adminAuth.verifySessionCookie(session);
  const userDoc = await adminDb.collection('users').doc(decoded.uid).get();
  
  if (userDoc.data()?.role !== 'admin') {
    throw new Error('Droits administrateur requis');
  }

  return { adminDb };
}

/**
 * Valide ou refuse une candidature artiste pro.
 */
export async function validateArtist(artistUid: string, approve: boolean) {
  try {
    const { adminDb } = await verifyAdmin();
    await adminDb.collection('users').doc(artistUid).update({
      role: approve ? 'artist_pro' : 'artist_draft',
      isCertified: approve,
      updatedAt: new Date().toISOString()
    });

    revalidatePath('/dashboard');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Traite un signalement.
 */
export async function resolveReport(reportId: string) {
  try {
    const { adminDb } = await verifyAdmin();
    await adminDb.collection('reports').doc(reportId).update({
      status: 'resolved',
      resolvedAt: new Date().toISOString()
    });

    revalidatePath('/dashboard');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
