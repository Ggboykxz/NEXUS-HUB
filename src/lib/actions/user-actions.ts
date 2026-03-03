'use server';

import { adminDb } from '@/lib/firebase-admin';
import { revalidatePath } from 'next/cache';
import { FieldValue } from 'firebase-admin/firestore';

/**
 * Met à jour le profil d'un utilisateur.
 */
export async function updateProfile(userId: string, data: any) {
  try {
    await adminDb.collection('users').doc(userId).update({
      ...data,
      updatedAt: new Date().toISOString()
    });
    revalidatePath(`/profile/${userId}`);
    revalidatePath('/settings');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Traite un don d'AfriCoins d'un utilisateur à un artiste.
 */
export async function processDonation(senderId: string, artistId: string, amount: number) {
  try {
    const senderRef = adminDb.collection('users').doc(senderId);
    const artistRef = adminDb.collection('users').doc(artistId);
    
    const senderDoc = await senderRef.get();
    if (!senderDoc.exists || (senderDoc.data()?.afriCoins || 0) < amount) {
      throw new Error("Solde insuffisant.");
    }

    const batch = adminDb.batch();
    
    batch.update(senderRef, { afriCoins: FieldValue.increment(-amount) });
    batch.update(artistRef, { afriCoins: FieldValue.increment(amount) });
    
    // Notification à l'artiste
    const notifRef = artistRef.collection('notifications').doc();
    batch.set(notifRef, {
      type: 'donation',
      fromUserId: senderId,
      fromDisplayName: senderDoc.data()?.displayName || 'Un voyageur',
      message: `vous a envoyé ${amount} 🪙 pour soutenir votre art.`,
      amount,
      read: false,
      createdAt: new Date().toISOString()
    });

    await batch.commit();
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
