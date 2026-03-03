import { adminDb } from '@/lib/firebase-admin';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import type { Story, UserProfile } from '@/lib/types';
import ArtistDetailClient from './artist-detail-client';

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getArtistData(slug: string) {
  const usersSnap = await adminDb.collection('users')
    .where('slug', '==', slug)
    .limit(1)
    .get();
  
  if (usersSnap.empty) return null;
  
  const artistDoc = usersSnap.docs[0];
  const artist = { uid: artistDoc.id, ...artistDoc.data() } as UserProfile;
  
  // Fetch Stories
  const storiesSnap = await adminDb.collection('stories')
    .where('artistId', '==', artist.uid)
    .get();
    
  const artistStories = storiesSnap.docs.map(d => ({ id: d.id, ...d.data() } as Story));

  return { artist, artistStories };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getArtistData(slug);

  if (!data) return { title: 'Artiste introuvable - NexusHub' };

  return {
    title: `${data.artist.displayName} - Artiste NexusHub`,
    description: data.artist.bio?.slice(0, 160) || `Découvrez l'univers de ${data.artist.displayName} sur NexusHub.`,
    openGraph: {
      title: data.artist.displayName,
      description: data.artist.bio?.slice(0, 160),
      images: [{ url: data.artist.photoURL }],
      type: 'profile',
    },
  };
}

export default async function ArtistProfilePage({ params }: PageProps) {
  const { slug } = await params;
  const data = await getArtistData(slug);

  if (!data) notFound();

  return <ArtistDetailClient artist={data.artist} artistStories={data.artistStories} />;
}
