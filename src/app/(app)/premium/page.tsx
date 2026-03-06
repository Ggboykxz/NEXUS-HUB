import { getAdminServices } from '@/lib/firebase-admin';
import { StoryCard } from '@/components/story-card';
import { Crown } from 'lucide-react';
import type { Story } from '@/lib/types';
import type { Metadata } from 'next';

export const revalidate = 3600; // 1 hour

export const metadata: Metadata = {
  title: 'Exclusivités Premium - NexusHub Pro',
  description: 'Accédez à des webtoons, séries et œuvres exclusives de haute qualité réservées aux membres NexusHub Pro.',
};

async function getPremiumStories() {
  const { adminDb } = getAdminServices();
  const snap = await adminDb.collection('stories')
    .where('isPremium', '==', true)
    .where('isPublished', '==', true)
    .where('isBanned', '==', false)
    .orderBy('updatedAt', 'desc')
    .limit(40)
    .get();
  
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Story));
}

export default async function PremiumStoriesPage() {
  const premiumStories = await getPremiumStories();

  return (
    <div className="container mx-auto max-w-7xl px-4 py-12">
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
            <div className="flex items-center gap-4">
                <div className="bg-yellow-400/10 p-3 rounded-full border border-yellow-400/20">
                    <Crown className="w-8 h-8 text-yellow-300" />
                </div>
                <div>
                    <h1 className="text-4xl font-bold font-display text-white">Exclusivités Pro</h1>
                    <p className="text-lg text-muted-foreground mt-1 max-w-2xl">
                       Accédez à du contenu exclusif de haute qualité avec les créateurs NexusHub Pro.
                    </p>
                </div>
            </div>
        </div>
      </header>

      {premiumStories.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-6 gap-y-12">
          {premiumStories.map((story) => (
            <StoryCard key={story.id} story={story} />
          ))}
        </div>
      ) : (
        <div className="text-center py-24 border-2 border-dashed border-white/5 rounded-[3rem] bg-white/[0.02]">
            <Crown className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
            <p className="text-stone-400 font-bold text-xl mb-2">Le Trésor est encore scellé</p>
            <p className="text-stone-500 italic font-light">Aucune œuvre exclusive Pro n'est disponible pour le moment.<br/>Les créateurs préparent leurs chefs-d'œuvre.</p>
        </div>
      )}
    </div>
  );
}
