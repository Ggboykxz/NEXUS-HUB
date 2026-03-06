import { getAdminServices } from '@/lib/firebase-admin';
import { StoryCard } from '@/components/story-card';
import { Sparkles } from 'lucide-react';
import type { Story } from '@/lib/types';
import type { Metadata } from 'next';

export const revalidate = 3600; // 1 hour

export const metadata: Metadata = {
  title: 'Nouveautés - Les Dernières Sorties NexusHub',
  description: 'Soyez les premiers à découvrir les dernières pépites, les nouveaux chapitres et les séries fraîchement publiées sur la plateforme NexusHub.',
};

async function getNewStories() {
  const { adminDb } = getAdminServices();
  const snap = await adminDb.collection('stories')
    .where('isPublished', '==', true)
    .where('isBanned', '==', false)
    .orderBy('updatedAt', 'desc')
    .limit(40)
    .get();
  
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Story));
}

export default async function NewReleasesPage() {
  const newStories = await getNewStories();

  return (
    <div className="container mx-auto max-w-7xl px-4 py-12">
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
            <div className="flex items-center gap-4">
                <div className="bg-primary/10 p-3 rounded-full border border-primary/20">
                    <Sparkles className="w-8 h-8 text-primary" />
                </div>
                <div>
                    <h1 className="text-4xl font-bold font-display text-white">Nouveautés</h1>
                    <p className="text-lg text-muted-foreground mt-1 max-w-2xl">
                        Les dernières mises à jour et sorties de la communauté NexusHub.
                    </p>
                </div>
            </div>
        </div>
      </header>

      {newStories.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-6 gap-y-12">
            {newStories.map((story) => (
            <StoryCard key={story.id} story={story} showUpdateDate={true} />
            ))}
        </div>
       ) : (
        <div className="text-center py-24 border-2 border-dashed border-white/5 rounded-[3rem] bg-white/[0.02]">
            <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
            <p className="text-stone-400 font-bold text-xl mb-2">Rien de neuf pour l'instant</p>
            <p className="text-stone-500 italic font-light">Les auteurs sont sûrement en train de préparer leurs prochaines œuvres.<br/>Revenez bientôt !</p>
        </div>
      )}
    </div>
  );
}
