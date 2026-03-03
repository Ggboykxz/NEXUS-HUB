import { adminDb } from '@/lib/firebase-admin';
import { notFound, redirect } from 'next/navigation';
import ArtistDetailClient from '../../artiste/[slug]/artist-detail-client';
import type { UserProfile, Story } from '@/lib/types';

interface PageProps {
  params: Promise<{ artistId: string }>;
}

/**
 * Page de redirection et de secours pour les profils artistes par ID.
 * Tente de rediriger vers l'URL slugifiée (/artiste/[slug]).
 * Si aucun slug n'existe, affiche le profil en utilisant le client partagé.
 */
export default async function ArtistProfileRedirectPage({ params }: PageProps) {
  const { artistId } = await params;

  // 1. Récupération du profil artiste dans Firestore (Server-side)
  const artistSnap = await adminDb.collection('users').doc(artistId).get();
  
  if (!artistSnap.exists) {
    notFound();
  }

  const artist = { uid: artistSnap.id, ...artistSnap.data() } as UserProfile;

  // 2. Redirection vers l'URL SEO si le slug est disponible
  if (artist.slug) {
    redirect(`/artiste/${artist.slug}`);
  }

  // 3. Fallback : Chargement des histoires et rendu inline si pas de slug
  const storiesSnap = await adminDb.collection('stories')
    .where('artistId', '==', artistId)
    .get();
  
  const artistStories = storiesSnap.docs.map(d => ({ 
    id: d.id, 
    ...d.data() 
  } as Story));

  return (
    <ArtistDetailClient 
      artist={artist} 
      artistStories={artistStories} 
    />
  );
}
