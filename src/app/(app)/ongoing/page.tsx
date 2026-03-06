import { getAdminServices } from '@/lib/firebase-admin';
import { StoryCard } from '@/components/story-card';
import { Clock } from 'lucide-react';
import type { Story } from '@/lib/types';
import type { Metadata } from 'next';

export const revalidate = 3600; // 1 hour

export const metadata: Metadata = {
  title: 'Séries en Cours - NexusHub',
  description: 'Ne manquez aucun chapitre ! Suivez les dernières aventures de vos héros préférés, mises à jour régulièrement sur NexusHub.',
};

async function getOngoingStories() {
  const { adminDb } = getAdminServices();
  const snap = await adminDb.collection('stories')
    .where('status', '==', 'En cours')
    .where('isPublished', '==', true)
    .where('isBanned', '==', false)
    .orderBy('updatedAt', 'desc')
    .limit(50)
    .get();
  
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Story));
}

export default async function OngoingPage() {
  const ongoingStories = await getOngoingStories();

  return (
    <div className="container mx-auto max-w-7xl px-4 py-12">
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-4">
            <div className="bg-blue-500/10 p-3 rounded-full border border-blue-500/20">
              <Clock className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <h1 className="text-4xl font-bold font-display text-white">Séries en Cours</h1>
              <p className="text-lg text-muted-foreground mt-1 max-w-2xl">
                Suivez les dernières aventures de vos héros préférés, mises à jour régulièrement.
              </p>
            </div>
          </div>
        </div>
      </header>

      {ongoingStories.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-6 gap-y-12">
          {ongoingStories.map((story) => (
            <StoryCard key={story.id} story={story} showUpdateDate={true} />
          ))}
        </div>
      ) : (
        <div className="text-center py-24 border-2 border-dashed border-white/5 rounded-[3rem] bg-white/[0.02]">
          <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
          <p className="text-stone-400 font-bold text-xl mb-2">L'aventure continue... ailleurs</p>
          <p className="text-stone-500 italic font-light">Aucune série n'est en cours de publication pour le moment.<br/>De nouvelles histoires arrivent bientôt !</p>
        </div>
      )}
    </div>
  );
}
