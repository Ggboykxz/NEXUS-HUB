import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import type { Story, UserProfile, Chapter } from '@/lib/types';
import StoryDetailClient from './story-detail-client';

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getStoryData(slug: string) {
  const storiesRef = collection(db, 'stories');
  const q = query(storiesRef, where('slug', '==', slug), limit(1));
  const snap = await getDocs(q);
  
  if (snap.empty) return null;
  
  const story = { id: snap.docs[0].id, ...snap.docs[0].data() } as Story;
  
  // Fetch Artist
  const userDoc = await getDocs(query(collection(db, 'users'), where('uid', '==', story.artistId), limit(1)));
  const artist = !userDoc.empty ? (userDoc.docs[0].data() as UserProfile) : null;

  // Fetch Chapters
  const chaptersSnap = await getDocs(query(collection(storiesRef, story.id, 'chapters'), orderBy('chapterNumber', 'asc')));
  story.chapters = chaptersSnap.docs.map(d => ({ id: d.id, ...d.data() } as Chapter));

  // Fetch Similar
  const similarSnap = await getDocs(query(storiesRef, where('genreSlug', '==', story.genreSlug), limit(5)));
  const similar = similarSnap.docs
    .map(d => ({ id: d.id, ...d.data() } as Story))
    .filter(s => s.id !== story.id)
    .slice(0, 4);

  return { story, artist, similar };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getStoryData(slug);

  if (!data) return { title: 'Œuvre introuvable - NexusHub' };

  return {
    title: `${data.story.title} - NexusHub`,
    description: data.story.description.slice(0, 160),
    openGraph: {
      title: data.story.title,
      description: data.story.description.slice(0, 160),
      images: [{ url: data.story.coverImage.imageUrl }],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: data.story.title,
      description: data.story.description.slice(0, 160),
      images: [data.story.coverImage.imageUrl],
    },
  };
}

export default async function StoryDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const data = await getStoryData(slug);

  if (!data) notFound();

  return <StoryDetailClient story={data.story} artist={data.artist} similarStories={data.similar} />;
}