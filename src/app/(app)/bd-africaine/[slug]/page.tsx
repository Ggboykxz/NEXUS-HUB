import { getAdminServices } from '@/lib/firebase-admin';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import type { Story, UserProfile, Chapter } from '@/lib/types';
import StoryDetailClient from '../../webtoon/[slug]/story-detail-client';

interface PageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Récupère les données d'une histoire (format BD/One-shot) et son contenu associé.
 * @param slug Le slug de l'histoire.
 * @returns Les données nécessaires pour la page, ou null si l'histoire n'est pas trouvée ou n'est pas une BD.
 */
async function getBdData(slug: string) {
  const { adminDb } = getAdminServices();

  // 1. Récupérer l'histoire principale (doit être publiée)
  const storyQuery = adminDb.collection('stories')
    .where('slug', '==', slug)
    .where('isPublished', '==', true)
    .where('format', 'in', ['BD', 'One-shot', 'Hybride'])
    .limit(1);
  
  const storiesSnap = await storyQuery.get();
  if (storiesSnap.empty) return null;
  
  const storyDoc = storiesSnap.docs[0];
  const story = { id: storyDoc.id, ...storyDoc.data() } as Story;
  
  // 2. Récupérer l'artiste
  const artistSnap = await adminDb.collection('users').doc(story.artistId).get();
  const artist = artistSnap.exists ? (artistSnap.data() as UserProfile) : null;

  // 3. Récupérer les chapitres publiés
  const chaptersSnap = await adminDb.collection('stories').doc(story.id).collection('chapters')
    .where('status', '==', 'Publié')
    .orderBy('chapterNumber', 'asc')
    .get();
  story.chapters = chaptersSnap.docs.map(d => ({ id: d.id, ...d.data() } as Chapter));

  // 4. Récupérer des histoires similaires (publiées)
  const similarSnap = await adminDb.collection('stories')
    .where('genreSlug', '==', story.genreSlug)
    .where('isPublished', '==', true)
    .where('format', '==', 'BD')
    .limit(5)
    .get();
    
  const similar = similarSnap.docs
    .map(d => ({ id: d.id, ...d.data() } as Story))
    .filter(s => s.id !== story.id) // Exclure l'histoire actuelle de la liste
    .slice(0, 4);

  return { story, artist, similar };
}

// Amélioration: Ajout de métadonnées dynamiques pour le SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getBdData(slug);

  if (!data) {
    return { title: 'Contenu introuvable' };
  }

  const { story, artist } = data;
  const description = story.description.substring(0, 160);

  return {
    title: `${story.title} par ${artist?.displayName || 'Artiste inconnu'}`,
    description,
    openGraph: {
      title: story.title,
      description,
      images: [{ url: story.coverImage.imageUrl }],
      type: 'article',
      authors: artist ? [artist.displayName] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: story.title,
      description,
      images: [story.coverImage.imageUrl],
    },
  };
}

export default async function BdAfricaineDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const data = await getBdData(slug);

  if (!data) {
    notFound();
  }

  return <StoryDetailClient story={data.story} artist={data.artist} similarStories={data.similar} />;
}
