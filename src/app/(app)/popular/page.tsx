import { adminDb } from '@/lib/firebase-admin';
import { StoryCard } from '@/components/story-card';
import { TrendingUp } from 'lucide-react';
import type { Story } from '@/lib/types';

export const revalidate = 3600;

export default async function PopularStoriesPage() {
  const snap = await adminDb.collection('stories')
    .where('isPublished', '==', true)
    .where('isBanned', '==', false)
    .orderBy('views', 'desc')
    .limit(40)
    .get();
  
  const popularStories = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Story));

  return (
    <div className="container mx-auto max-w-7xl px-4 py-12">
      <div className="flex items-center gap-4 mb-8">
        <div className="bg-primary/10 p-3 rounded-full">
            <TrendingUp className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-4xl font-bold font-display">Les Plus Populaires</h1>
      </div>
      <p className="text-lg text-muted-foreground mb-12">
        Découvrez les œuvres qui passionnent notre communauté en ce moment.
      </p>

      {popularStories.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-12">
          {popularStories.map((story) => (
            <StoryCard key={story.id} story={story} />
          ))}
        </div>
      ) : (
        <div className="text-center py-24 border rounded-xl bg-card/50">
            <p className="text-muted-foreground italic">Aucune œuvre populaire pour le moment.</p>
        </div>
      )}
    </div>
  );
}
