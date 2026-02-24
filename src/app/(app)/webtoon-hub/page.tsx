'use client';

import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { StoryCard } from '@/components/story-card';
import { Layers, Loader2 } from 'lucide-react';
import type { Story } from '@/lib/types';
import { useQuery } from '@tanstack/react-query';

export default function WebtoonHubPage() {
  const { data: webtoons = [], isLoading } = useQuery({
    queryKey: ['webtoons-listing'],
    queryFn: async () => {
      const q = query(
        collection(db, 'stories'), 
        where('format', 'in', ['Webtoon', 'Roman Illustré', 'Hybride']),
        where('isPublished', '==', true),
        where('isBanned', '==', false),
        orderBy('updatedAt', 'desc')
      );
      const snap = await getDocs(q);
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Story));
    }
  });

  return (
    <div className="container mx-auto max-w-7xl px-4 py-12">
      <div className="flex items-center gap-4 mb-8">
        <div className="bg-primary/10 p-3 rounded-full">
            <Layers className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-4xl font-bold font-display">Univers Webtoon</h1>
      </div>
      <p className="text-lg text-muted-foreground mb-12">
        Plongez dans des récits conçus pour une lecture verticale immersive. Des webtoons épiques, romantiques ou futuristes au bout de vos doigts.
      </p>

      {isLoading ? (
        <div className="flex justify-center py-24"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-12">
          {webtoons.map((story) => (
            <StoryCard key={story.id} story={story} />
          ))}
          {webtoons.length === 0 && (
            <div className="col-span-full text-center py-24 border rounded-xl bg-card/50">
                <p className="text-muted-foreground italic">Aucun webtoon n'est disponible pour le moment.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
