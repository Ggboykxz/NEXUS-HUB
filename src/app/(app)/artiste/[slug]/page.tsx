import { getAdminServices } from '@/lib/firebase-admin';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import type { Story, UserProfile } from '@/lib/types';
import ArtistDetailClient from './artist-detail-client';

interface PageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Récupère les données d'un artiste par son slug ou son UID (fallback).
 * Sécurisé pour ne retourner que les artistes non-bannis.
 * @param identifier Le slug ou l'UID de l'artiste.
 */
async function getArtistData(identifier: string) {
  const { adminDb } = getAdminServices();

  // 1. Tentative par slug
  let usersSnap = await adminDb.collection('users')
    .where('slug', '==', identifier)
    .where('isBanned', '==', false)
    .limit(1)
    .get();
  
  // 2. Fallback par UID si non trouvé par slug
  if (usersSnap.empty) {
    const directDoc = await adminDb.collection('users').doc(identifier).get();
    if (directDoc.exists && !directDoc.data()?.isBanned && (directDoc.data()?.role?.startsWith('artist'))) {
      const artist = { uid: directDoc.id, ...directDoc.data() } as UserProfile;
      return fetchStories(adminDb, artist);
    }
    return null;
  }
  
  const artistDoc = usersSnap.docs[0];
  const artist = { uid: artistDoc.id, ...artistDoc.data() } as UserProfile;
  return fetchStories(adminDb, artist);
}

/**
 * Helper pour récupérer les histoires d'un artiste trouvé.
 */
async function fetchStories(adminDb: any, artist: UserProfile) {
  const storiesSnap = await adminDb.collection('stories')
    .where('artistId', '==', artist.uid)
    .where('isPublished', '==', true)
    .orderBy('updatedAt', 'desc')
    .get();
    
  const artistStories = storiesSnap.docs.map(d => ({ id: d.id, ...d.data() } as Story));
  return { artist, artistStories };
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const params = await props.params;
  const data = await getArtistData(params.slug);

  if (!data) {
    return { title: 'Artiste introuvable' };
  }

  const description = data.artist.bio?.slice(0, 160) || `Découvrez toutes les créations de ${data.artist.displayName} sur NexusHub.`;

  return {
    title: `${data.artist.displayName} - Artiste sur NexusHub`,
    description,
    openGraph: {
      title: data.artist.displayName,
      description,
      images: [{ url: data.artist.photoURL }],
      type: 'profile',
      username: data.artist.displayName 
    },
    twitter: {
        card: 'summary_large_image',
        title: `${data.artist.displayName} - Artiste sur NexusHub`,
        description,
        images: [data.artist.photoURL],
    }
  };
}

export default async function ArtistProfilePage(props: PageProps) {
  const params = await props.params;
  const data = await getArtistData(params.slug);

  if (!data) {
    notFound(); 
  }

  return <ArtistDetailClient artist={data.artist} artistStories={data.artistStories} />;
}
