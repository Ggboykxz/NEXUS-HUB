import { adminDb } from '@/lib/firebase-admin';
import { notFound } from 'next/navigation';
import type { Story, UserProfile, Chapter } from '@/lib/types';
import StoryDetailClient from '../../webtoon/[slug]/story-detail-client';

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getStoryData(slug: string) {
  const storiesSnap = await adminDb.collection('stories')
    .where('slug', '==', slug)
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

  // Fetch Similar
  const similarSnap = await adminDb.collection('stories')
    .where('genreSlug', '==', story.genreSlug)
    .limit(5)
    .get();
    
  const similar = similarSnap.docs
    .map(d => ({ id: d.id, ...d.data() } as Story))
    .filter(s => s.id !== story.id)
    .slice(0, 4);

  return { story, artist, similar };
}

export default async function WebtoonDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const data = await getStoryData(slug);

  if (!data) notFound();

  return <StoryDetailClient story={data.story} artist={data.artist} similarStories={data.similar} />;
}
