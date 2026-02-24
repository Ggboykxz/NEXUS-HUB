import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { StoryCard } from '@/components/story-card';
import { Sparkles } from 'lucide-react';
import type { Story } from '@/lib/types';

export const revalidate = 3600;

export default async function NewReleasesPage() {
  const q = query(
    collection(db, 'stories'), 
    where('isPublished', '==', true),
    where('isBanned', '==', false),
    orderBy('updatedAt', 'desc'),
    limit(40)
  );
  
  const snap = await getDocs(q);
  const newStories = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Story));

  return (
    <div className="container mx-auto max-w-7xl px-4 py-12">
      <div className="flex items-center gap-4 mb-8">
        <div className="bg-primary/10 p-3 rounded-full">
            <Sparkles className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-4xl font-bold font-display">Nouveautés</h1>
      </div>
      <p className="text-lg text-muted-foreground mb-12">
        Soyez les premiers à découvrir les dernières pépites publiées sur la plateforme.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-12">
        {newStories.map((story) => (
          <StoryCard key={story.id} story={story} showUpdateDate={true} />
        ))}
      </div>
    </div>
  );
}
