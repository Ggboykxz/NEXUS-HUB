import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, limit, Timestamp } from 'firebase/firestore';
import type { Story, UserProfile } from '@/lib/types';
import ArtistDetailClient from './artist-detail-client';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: { slug: string };
}

/**
 * Récupère les données de l'artiste côté serveur, avec tri côté serveur pour éviter les erreurs d'index.
 */
async function getArtistData(slug: string): Promise<{ artist: UserProfile; artistStories: Story[] } | null> {
  try {
    const usersRef = collection(db, 'users');
    const userQuery = query(usersRef, where('slug', '==', slug), limit(1));
    const userSnap = await getDocs(userQuery);

    if (userSnap.empty) {
      return null;
    }

    const userDoc = userSnap.docs[0];
    const userData = userDoc.data();

    const isArtist = userData.role?.startsWith('artist');
    if (!isArtist || userData.isBanned) {
      return null;
    }

    const artist = { uid: userDoc.id, ...userData } as UserProfile;

    const storiesRef = collection(db, 'stories');
    // FIX: Suppression de `orderBy` pour éviter la dépendance à un index composite.
    const qStories = query(
      storiesRef,
      where('artistId', '==', artist.uid),
      where('isPublished', '==', true)
    );
    
    const storiesSnap = await getDocs(qStories);
    const stories = storiesSnap.docs.map(d => ({ id: d.id, ...d.data() } as Story));

    // FIX: Tri des œuvres côté serveur (dans le code) après la récupération.
    stories.sort((a, b) => {
        const timeA = a.updatedAt instanceof Timestamp ? a.updatedAt.toMillis() : 0;
        const timeB = b.updatedAt instanceof Timestamp ? b.updatedAt.toMillis() : 0;
        return timeB - timeA; // Tri décroissant
    });

    return { artist, artistStories: stories };
  } catch (error) {
    console.error(`[Server Fetch] Erreur critique lors de la récupération pour ${slug}:`, error);
    return null;
  }
}

/**
 * Page Artiste côté Serveur, maintenant entièrement résiliente aux erreurs d'index.
 */
export default async function ArtistProfilePage({ params }: PageProps) {
  const data = await getArtistData(params.slug);

  if (!data) {
    notFound();
  }

  return <ArtistDetailClient artist={data.artist} artistStories={data.artistStories} />;
}
