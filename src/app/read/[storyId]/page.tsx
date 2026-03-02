import { adminDb } from '@/lib/firebase-admin';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ReaderClient from './reader-client';

type Props = {
  params: Promise<{ storyId: string }>;
};

/**
 * Composant serveur pour la route /read/[storyId].
 * Gère la génération des métadonnées SEO/OG et délègue l'interactivité au ReaderClient.
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { storyId } = await params;
  
  try {
    const storyDoc = await adminDb.collection('stories').doc(storyId).get();
    
    if (!storyDoc.exists) {
      return { title: 'Histoire introuvable - NexusHub' };
    }

    const story = storyDoc.data();
    const title = `${story?.title} - Lecture en ligne | NexusHub`;
    const description = story?.description?.slice(0, 160) || "Plongez au cœur des légendes africaines sur NexusHub.";

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: story?.coverImage?.imageUrl ? [{ url: story.coverImage.imageUrl }] : [],
        type: 'article',
        siteName: 'NexusHub',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: story?.coverImage?.imageUrl ? [story.coverImage.imageUrl] : [],
      }
    };
  } catch (error) {
    console.error("Metadata generation error:", error);
    return { title: 'Lecture - NexusHub' };
  }
}

export default async function ReadPage({ params }: Props) {
  const { storyId } = await params;
  
  // On vérifie l'existence côté serveur pour éviter un flash 404
  const storyDoc = await adminDb.collection('stories').doc(storyId).get();
  if (!storyDoc.exists) {
    notFound();
  }

  return <ReaderClient storyId={storyId} />;
}
