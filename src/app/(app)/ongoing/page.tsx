import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { StoryCard } from '@/components/story-card';
import { Clock } from 'lucide-react';
import type { Story } from '@/lib/types';

export const revalidate = 3600;

export default async function OngoingPage() {
  const q = query(
    collection(db, 'stories'), 
    where('status', '==', 'En cours'),
    where('isPublished', '==', true),
    where('isBanned', '==', false),
    orderBy('updatedAt', 'desc')
  );
  
  const snap = await getDocs(q);
  const ongoingStories = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Story));

  return (
    <div className="container mx-auto max-w-7xl px-4 py-12">
      <div className="flex items-center gap-4 mb-8">
        <Clock className="w-10 h-10 text-primary" />
        <h1 className="text-4xl font-bold font-display">Séries en Cours</h1>
      </div>
      <p className="text-lg text-muted-foreground mb-12">
        Ne manquez aucun chapitre ! Suivez les dernières aventures de vos héros préférés, mises à jour régulièrement.
      </p>

      {ongoingStories.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-12">
          {ongoingStories.map((story) => (
            <StoryCard key={story.id} story={story} />
          ))}
        </div>
      ) : (
        <div className="text-center py-24 border rounded-xl bg-card/50">
            <p className="text-muted-foreground italic">Aucune série en cours pour le moment.</p>
        </div>
      )}
    </div>
  );
}
