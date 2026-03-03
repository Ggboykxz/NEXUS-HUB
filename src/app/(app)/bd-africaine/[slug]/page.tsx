import { adminDb } from '@/lib/firebase-admin';
import { notFound } from 'next/navigation';
import type { Story, UserProfile, Chapter } from '@/lib/types';
import StoryDetailClient from '../../webtoon/[slug]/story-detail-client';

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getBdData(slug: string) {
  // On vérifie que le slug correspond ET que c'est une BD ou un One-shot
  const storiesSnap = await adminDb.collection('stories')
    .where('slug', '==', slug)
    .where('format', 'in', ['BD', 'One-shot', 'Hybride'])
    .limit(1)
    .get();
  
  if (storiesSnap.empty) return null;
  
  const storyDoc = storiesSnap.docs[0];
  const story = { id: storyDoc.id, ...storyDoc.data() } as Story;
  
  // Fetch Artist
  const artistSnap = await adminDb.collection('users').doc(story.artistId).get();
  const artist = artistSnap.exists ? (artistSnap.data() as UserProfile) : null;

  // Fetch Chapters
  const chaptersSnap = await adminDb.collection('stories').doc(story.id).collection('chapters')
    .orderBy('chapterNumber', 'asc')
    .get();
  story.chapters = chaptersSnap.docs.map(d => ({ id: d.id, ...d.data() } as Chapter));

  // Fetch Similar (autres BD du même genre)
  const similarSnap = await adminDb.collection('stories')
    .where('genreSlug', '==', story.genreSlug)
    .where('format', '==', 'BD')
    .limit(5)
    .get();
    
  const similar = similarSnap.docs
    .map(d => ({ id: d.id, ...d.data() } as Story))
    .filter(s => s.id !== story.id)
    .slice(0, 4);

  return { story, artist, similar };
}

export default async function BdAfricaineDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const data = await getBdData(slug);

  if (!data) notFound();

  return <StoryDetailClient story={data.story} artist={data.artist} similarStories={data.similar} />;
}
