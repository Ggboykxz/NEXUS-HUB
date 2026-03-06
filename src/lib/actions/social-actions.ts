'use server';

import { getAdminServices } from '@/lib/firebase-admin';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { FieldValue } from 'firebase-admin/firestore';

/**
 * Rejoindre un club de lecture.
 */
export async function joinClub(clubId: string) {
  const { adminAuth, adminDb } = getAdminServices();
  const session = (await cookies()).get('__session')?.value;
  if (!session) throw new Error('Authentification requise');

  const decoded = await adminAuth.verifySessionCookie(session);
  const userDoc = await adminDb.collection('users').doc(decoded.uid).get();
  const userData = userDoc.data();

  const memberRef = adminDb.collection('readingClubs').doc(clubId).collection('members').doc(decoded.uid);
  const clubRef = adminDb.collection('readingClubs').doc(clubId);

  try {
    const memberSnap = await memberRef.get();
    if (memberSnap.exists) return { success: true, message: 'Déjà membre' };

    await memberRef.set({
      userId: decoded.uid,
      userName: userData?.displayName,
      userPhoto: userData?.photoURL,
      joinedAt: new Date().toISOString()
    });

    await clubRef.update({
      membersCount: FieldValue.increment(1)
    });

    revalidatePath(`/clubs/${clubId}`);
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

/**
 * Signaler un contenu inapproprié.
 */
export async function reportContent(data: { type: 'story' | 'comment' | 'user'; targetId: string; reason: string }) {
  const { adminAuth, adminDb } = getAdminServices();
  const session = (await cookies()).get('__session')?.value;
  
  try {
    const reporterId = session ? (await adminAuth.verifySessionCookie(session)).uid : 'anonymous';
    
    await adminDb.collection('reports').add({
      ...data,
      reporterId,
      status: 'pending',
      createdAt: new Date().toISOString()
    });

    return { success: true };
  } catch (e) {
    return { success: false };
  }
}
