
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
 * Récupère les statistiques globales pour le Nexus Core.
 */
export async function getAdminStats() {
  try {
    const { adminDb } = await verifyAdmin();
    
    const [usersSnap, storiesSnap, reportsSnap] = await Promise.all([
      adminDb.collection('users').count().get(),
      adminDb.collection('stories').where('isPublished', '==', true).count().get(),
      adminDb.collection('reports').where('status', '==', 'pending').count().get()
    ]);

    return {
      totalUsers: usersSnap.data().count,
      totalStories: storiesSnap.data().count,
      pendingReports: reportsSnap.data().count,
      dau: Math.floor(usersSnap.data().count * 0.15) // Estimation active
    };
  } catch (error) {
    console.error("Admin stats error:", error);
    return { totalUsers: 0, totalStories: 0, pendingReports: 0, dau: 0 };
  }
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
