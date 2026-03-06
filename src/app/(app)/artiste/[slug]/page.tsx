import { getAdminServices } from '@/lib/firebase-admin';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import type { Story, UserProfile } from '@/lib/types';
import ArtistDetailClient from './artist-detail-client';

// Correction: Le type des props d'une page. `params` n'est pas une promesse.
interface PageProps {
  params: { slug: string };
}

/**
 * Récupère les données d'un artiste et ses histoires publiées depuis Firestore.
 * @param slug Le slug unique de l'artiste.
 * @returns Un objet contenant le profil de l'artiste et la liste de ses histoires, ou null si introuvable.
 */
async function getArtistData(slug: string) {
  const { adminDb } = getAdminServices(); // Correction: Utilisation du service admin.

  // 1. Récupérer le profil de l'artiste
  const usersSnap = await adminDb.collection('users')
    .where('slug', '==', slug)
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
    .where('isPublished', '==', true) // Amélioration: Ne montrer que les histoires publiées
    .orderBy('publishedAt', 'desc')
    .get();
    
  const artistStories = storiesSnap.docs.map(d => ({ id: d.id, ...d.data() } as Story));

  return { artist, artistStories };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = params; // Correction: `params` n'est plus une promesse
  const data = await getArtistData(slug);

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
      profile: {
        username: data.artist.displayName,
      }
    },
  };
}

export default async function ArtistProfilePage({ params }: PageProps) {
  const { slug } = params; // Correction: `params` n'est plus une promesse
  const data = await getArtistData(slug);

  if (!data) {
    notFound(); // Affiche une page 404 si l'artiste n'est pas trouvé
  }

  return <ArtistDetailClient artist={data.artist} artistStories={data.artistStories} />;
}
