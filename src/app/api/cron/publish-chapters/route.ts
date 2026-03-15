import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

// Force la route à être dynamique et non mise en cache statiquement
export const dynamic = 'force-dynamic';

/**
 * Endpoint d'API sécurisé (appelé par un cron job)
 * pour publier les chapitres programmés.
 */
export async function GET() {
  try {
    const now = Timestamp.now();
    const batch = adminDb.batch();
    let chaptersToPublish = 0;

    // 1. Récupérer tous les chapitres qui sont programmés et dont la date est passée
    const scheduledChaptersQuery = adminDb.collectionGroup('chapters')
      .where('status', '==', 'scheduled')
      .where('scheduledAt', '<=', now);

    const snapshot = await scheduledChaptersQuery.get();

    if (snapshot.empty) {
      console.log('Aucun chapitre programmé à publier.');
      return NextResponse.json({
        success: true,
        message: 'Aucun chapitre à publier.',
        publishedCount: 0
      });
    }

    // 2. Préparer les mises à jour en batch
    snapshot.forEach(doc => {
      chaptersToPublish++;
      const chapterRef = doc.ref;
      batch.update(chapterRef, {
        status: 'published',
        publishedAt: now, // Utiliser la date actuelle de publication
        updatedAt: now,
      });
      console.log(`Préparation de la publication du chapitre: ${doc.id}`);
    });

    // 3. Exécuter toutes les mises à jour en une seule fois
    await batch.commit();

    console.log(`${chaptersToPublish} chapitres ont été publiés avec succès.`);

    return NextResponse.json({
      success: true,
      message: `${chaptersToPublish} chapitres publiés avec succès.`,
      publishedCount: chaptersToPublish
    });

  } catch (error) {
    console.error("Erreur lors de la publication des chapitres programmés:", error);
    return new NextResponse(
      JSON.stringify({ success: false, message: 'Erreur interne du serveur.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
