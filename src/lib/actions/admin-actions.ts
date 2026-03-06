'use server';

import { getAdminServices } from '@/lib/firebase-admin';

/**
 * Récupère les statistiques globales de la plateforme via le SDK Admin.
 * Permet de contourner les restrictions de lecture globale sur le client.
 */
export async function getAdminStats() {
  const { adminDb } = getAdminServices();

  try {
    const [usersSnap, storiesSnap] = await Promise.all([
      adminDb.collection('users').count().get(),
      adminDb.collection('stories').count().get()
    ]);

    const userCount = usersSnap.data().count;
    const storyCount = storiesSnap.data().count;

    return {
      totalUsers: userCount,
      totalStories: storyCount,
      dau: Math.floor(userCount * 0.15) // Estimation basée sur les inscrits
    };
  } catch (error) {
    console.error("Error fetching admin stats via Admin SDK:", error);
    return {
      totalUsers: 0,
      totalStories: 0,
      dau: 0
    };
  }
}
