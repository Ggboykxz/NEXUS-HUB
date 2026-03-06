import { getAdminServices } from '@/lib/firebase-admin';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import type { Story, UserProfile } from '@/lib/types';
import ArtistDetailClient from './artist-detail-client';

interface PageProps {
  params: { slug: string };
}

/**
 * Récupère les données d'un artiste et ses histoires publiées depuis Firestore.
 * Sécurisé pour ne retourner que les artistes non-bannis et les histoires publiées.
 * @param slug Le slug unique de l'artiste.
 * @returns Un objet contenant le profil de l'artiste et la liste de ses histoires, ou null si introuvable.
 */
async function getArtistData(slug: string) {
  const { adminDb } = getAdminServices();

  // 1. Récupérer le profil de l'artiste, en s'assurant qu'il n'est pas banni
  const usersSnap = await adminDb.collection('users')
    .where('slug', '==', slug)
    .where('isBanned', '==', false) // Correction de sécurité : Ne pas afficher les artistes bannis
    .limit(1)
    .get();
  
  if (usersSnap.empty) {
    return null;
  }
  
  const artistDoc = usersSnap.docs[0];
  const artist = { uid: artistDoc.id, ...artistDoc.data() } as UserProfile;
  
  // 2. Récupérer les histoires publiées de cet artiste
  const storiesSnap = await adminDb.collection('stories')
    .where('artistId', '==', artist.uid)
    .where('isPublished', '==', true)
    .orderBy('publishedAt', 'desc')
    .get();
    
  const artistStories = storiesSnap.docs.map(d => ({ id: d.id, ...d.data() } as Story));

  return { artist, artistStories };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
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
      // Correction de la structure OpenGraph : 'username' est une propriété directe de 'profile'
      // mais 'profile' lui-même n'est pas un objet standard. On utilise les champs directs.
      // Next.js va mapper 'username' à 'profile:username'
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

export default async function ArtistProfilePage({ params }: PageProps) {
  const data = await getArtistData(params.slug);

  if (!data) {
    notFound(); 
  }

  return <ArtistDetailClient artist={data.artist} artistStories={data.artistStories} />;
}
