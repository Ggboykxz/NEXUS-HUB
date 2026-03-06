import { getAdminServices } from '@/lib/firebase-admin';
import { StoryCard } from '@/components/story-card';
import { TrendingUp } from 'lucide-react';
import type { Story } from '@/lib/types';
import type { Metadata } from 'next';

export const revalidate = 3600; // 1 hour

export const metadata: Metadata = {
  title: 'Les Plus Populaires - Tendances sur NexusHub',
  description: 'Découvrez les œuvres, webtoons et séries qui passionnent notre communauté en ce moment. Le classement des histoires les plus lues.',
};

async function getPopularStories() {
  const { adminDb } = getAdminServices();
  const snap = await adminDb.collection('stories')
    .where('isPublished', '==', true)
    .where('isBanned', '==', false)
    .orderBy('views', 'desc')
    .limit(40)
    .get();
  
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Story));
}

export default async function PopularStoriesPage() {
  const popularStories = await getPopularStories();

  return (
    <div className="container mx-auto max-w-7xl px-4 py-12">
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
            <div className="flex items-center gap-4">
                <div className="bg-red-500/10 p-3 rounded-full border border-red-500/20">
                    <TrendingUp className="w-8 h-8 text-red-400" />
                </div>
                <div>
                    <h1 className="text-4xl font-bold font-display text-white">Les Plus Populaires</h1>
                    <p className="text-lg text-muted-foreground mt-1 max-w-2xl">
                        Découvrez les œuvres qui passionnent notre communauté en ce moment.
                    </p>
                </div>
            </div>
        </div>
      </header>

      {popularStories.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-6 gap-y-12">
          {popularStories.map((story) => (
            <StoryCard key={story.id} story={story} />
          ))}
        </div>
      ) : (
        <div className="text-center py-24 border-2 border-dashed border-white/5 rounded-[3rem] bg-white/[0.02]">
            <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
            <p className="text-stone-400 font-bold text-xl mb-2">Le Hall de la Gloire est vide</p>
            <p className="text-stone-500 italic font-light">Aucune œuvre n'a encore atteint le sommet.<br/>La compétition est ouverte !</p>
        </div>
      )}
    </div>
  );
}
