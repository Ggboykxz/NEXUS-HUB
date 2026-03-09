import { getAdminServices } from '@/lib/firebase-admin';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ReaderClient from './reader-client';
import type { Story, Chapter } from '@/lib/types';
import { Timestamp } from 'firebase-admin/firestore';

interface PageProps {
  params: { storyId: string };
}

async function getReaderData(storyId: string): Promise<{ story: Story; chapters: Chapter[] } | null> {
  const { adminDb } = getAdminServices();

  // 1. Fetch the story with security checks
  const storyDoc = await adminDb.collection('stories').doc(storyId).get();

  if (!storyDoc.exists) return null;

  const storyData = storyDoc.data() as Omit<Story, 'id'>;

  // Security Gate: Do not show if not published or banned
  if (!storyData.isPublished || storyData.isBanned) {
    return null;
  }

  // 2. Fetch all published chapters for that story
  const chaptersSnap = await adminDb.collection('stories').doc(storyId).collection('chapters')
    .where('isPublished', '==', true)
    .orderBy('chapterNumber', 'asc')
    .get();

  const chapters = chaptersSnap.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      publishedAt: (data.publishedAt as Timestamp).toDate(),
    } as Chapter;
  });
  
  // 3. Assemble the data
  const story: Story = {
    id: storyDoc.id,
    ...storyData,
    createdAt: (storyData.createdAt as Timestamp).toDate(),
    updatedAt: (storyData.updatedAt as Timestamp).toDate(),
  };

  return { story, chapters };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const data = await getReaderData(params.storyId);

  if (!data) {
    return { title: 'Histoire Introuvable | NexusHub' };
  }

  const { story } = data;
  const title = `${story.title} - Lecture en ligne | NexusHub`;
  const description = story.synopsis?.slice(0, 160) || "Plongez dans un univers d'histoires captivantes sur NexusHub.";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: story.coverImage ? [{ url: story.coverImage.imageUrl }] : [],
      type: 'article',
      siteName: 'NexusHub',
      authors: [story.artistName],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: story.coverImage ? [story.coverImage.imageUrl] : [],
    },
  };
}

export default async function ReadPage({ params }: PageProps) {
  const data = await getReaderData(params.storyId);

  if (!data) {
    notFound();
  }

  const { story, chapters } = data;

  return <ReaderClient story={story} chapters={chapters} />;
}
