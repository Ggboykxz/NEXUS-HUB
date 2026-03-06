import { getAdminServices } from '@/lib/firebase-admin';
import { notFound } from 'next/navigation';
import type { Story, UserProfile, Chapter } from '@/lib/types';
import StoryDetailClient from '../../webtoon/[slug]/story-detail-client';
import type { Metadata } from 'next';
import { Timestamp } from 'firebase-admin/firestore';

interface PageProps {
  params: { slug: string };
}

async function getStoryDetails(slug: string) {
  const { adminDb } = getAdminServices();

  // 1. Fetch Story with security checks
  const storySnap = await adminDb.collection('stories')
    .where('slug', '==', slug)
    .where('isPublished', '==', true)
    .where('isBanned', '==', false)
    .limit(1)
    .get();

  if (storySnap.empty) {
    return null;
  }

  const storyDoc = storySnap.docs[0];
  const storyData = storyDoc.data();
  const story: Story = {
    id: storyDoc.id,
    ...storyData,
    createdAt: (storyData.createdAt as Timestamp).toDate(),
    updatedAt: (storyData.updatedAt as Timestamp).toDate(),
  } as Story;

  // 2. Fetch Artist, Chapters, and Similar Stories in parallel for performance
  const [artistSnap, chaptersSnap, similarSnap] = await Promise.all([
    adminDb.collection('users').doc(story.artistId).get(),
    adminDb.collection('stories').doc(story.id).collection('chapters')
      .where('isPublished', '==', true)
      .orderBy('chapterNumber', 'asc')
      .get(),
    adminDb.collection('stories')
      .where('genreSlug', '==', story.genreSlug)
      .where('isPublished', '==', true)
      .where('isBanned', '==', false)
      .orderBy('views', 'desc')
      .limit(7)
      .get()
  ]);

  // 3. Process data
  const artist = artistSnap.exists ? (artistSnap.data() as UserProfile) : null;

  const chapters = chaptersSnap.docs.map(doc => {
      const chapterData = doc.data();
      return {
          id: doc.id,
          ...chapterData,
          publishedAt: (chapterData.publishedAt as Timestamp).toDate(),
      } as Chapter;
  });

  const similarStories = similarSnap.docs
    .map(d => ({ id: d.id, ...d.data() } as Story))
    .filter(s => s.id !== story.id)
    .slice(0, 6);

  return {
    story: { ...story, chapters },
    artist,
    similarStories
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const data = await getStoryDetails(params.slug);
  if (!data) return { title: 'Histoire Introuvable' };

  const { story } = data;
  const description = `Lisez ${story.title}, un ${story.type} de ${story.genreName}. ${story.synopsis.substring(0, 120)}...`;

  return {
    title: `${story.title} - ${story.artistName}`,
    description,
    openGraph: {
      title: story.title,
      description: story.synopsis,
      images: [{ url: story.coverImage, width: 1200, height: 630 }],
      type: 'article',
      authors: [story.artistName],
    },
    twitter: {
      card: 'summary_large_image',
      title: story.title,
      description: story.synopsis,
      images: [story.coverImage],
    }
  };
}

export default async function WebtoonDetailPage({ params }: PageProps) {
  const data = await getStoryDetails(params.slug);

  if (!data) {
    notFound();
  }
  
  return <StoryDetailClient story={data.story} artist={data.artist} similarStories={data.similarStories} />;
}
