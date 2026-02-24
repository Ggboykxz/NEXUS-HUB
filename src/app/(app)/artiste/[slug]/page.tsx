import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import type { Story, UserProfile } from '@/lib/types';
import ArtistDetailClient from './artist-detail-client';

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getArtistData(slug: string) {
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('slug', '==', slug), limit(1));
  const snap = await getDocs(q);
  
  if (snap.empty) return null;
  
  const artist = { uid: snap.docs[0].id, ...snap.docs[0].data() } as UserProfile;
  
  // Fetch Stories
  const storiesSnap = await getDocs(query(collection(db, 'stories'), where('artistId', '==', artist.uid)));
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