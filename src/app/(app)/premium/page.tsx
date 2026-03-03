import { adminDb } from '@/lib/firebase-admin';
import { StoryCard } from '@/components/story-card';
import { Crown } from 'lucide-react';
import type { Story } from '@/lib/types';

export const revalidate = 3600;

export default async function PremiumStoriesPage() {
  const snap = await adminDb.collection('stories')
    .where('isPremium', '==', true)
    .where('isPublished', '==', true)
    .orderBy('views', 'desc')
    .limit(24)
    .get();
  
  const premiumStories = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Story));

  return (
    <div className="container mx-auto max-w-7xl px-4 py-12">
      <div className="flex items-center gap-4 mb-8">
        <div className="bg-primary/10 p-3 rounded-full">
            <Crown className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-4xl font-bold font-display text-white">Exclusivités Premium</h1>
      </div>
      <p className="text-lg text-stone-400 mb-12 italic font-light">
        Accédez à du contenu exclusif de haute qualité avec NexusHub Pro.
      </p>

      {premiumStories.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-12">
          {premiumStories.map((story) => (
            <StoryCard key={story.id} story={story} />
          ))}
        </div>
      ) : (
        <div className="text-center py-32 border-2 border-dashed border-white/5 rounded-[2.5rem] bg-stone-900/30">
            <p className="text-stone-500 italic font-light">Aucune œuvre premium n'a encore été découverte dans ces sables.</p>
        </div>
      )}
    </div>
  );
}
