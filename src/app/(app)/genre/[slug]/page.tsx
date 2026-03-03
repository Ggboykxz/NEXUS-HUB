import { adminDb } from '@/lib/firebase-admin';
import { StoryCard } from '@/components/story-card';
import { Sparkles } from 'lucide-react';
import { notFound } from 'next/navigation';
import type { Story } from '@/lib/types';

export const revalidate = 3600;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function GenrePage({ params }: PageProps) {
  const { slug } = await params;
  
  const snap = await adminDb.collection('stories')
    .where('genreSlug', '==', slug)
    .where('isPublished', '==', true)
    .orderBy('views', 'desc')
    .get();
  
  if (snap.empty) {
    notFound();
  }

  const genreStories = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Story));
  const genreName = genreStories[0].genre;

  return (
    <div className="container mx-auto max-w-7xl px-4 py-12">
      <div className="flex items-center gap-4 mb-8">
        <Sparkles className="w-10 h-10 text-primary" />
        <h1 className="text-4xl font-bold font-display">{genreName}</h1>
      </div>
      <p className="text-lg text-muted-foreground mb-12">
        Explorez toutes nos œuvres classées dans la catégorie {genreName}.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-12">
        {genreStories.map((story) => (
          <StoryCard key={story.id} story={story} />
        ))}
      </div>
    </div>
  );
}
