'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { StoryCard } from '@/components/story-card';
import { CheckCircle2, Loader2 } from 'lucide-react';
import type { Story } from '@/lib/types';

export default function CompletedStoriesPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCompleted() {
      try {
        const q = query(
          collection(db, 'stories'),
          where('status', '==', 'Terminé'),
          where('isPublished', '==', true),
          orderBy('updatedAt', 'desc')
        );
        const snap = await getDocs(q);
        setStories(snap.docs.map(d => ({ id: d.id, ...d.data() } as Story)));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchCompleted();
  }, []);

  if (loading) return <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <div className="container mx-auto max-w-7xl px-4 py-12">
      <header className="flex items-center gap-4 mb-8">
        <div className="bg-green-500/10 p-3 rounded-full">
          <CheckCircle2 className="w-10 h-10 text-green-500" />
        </div>
        <div>
          <h1 className="text-4xl font-bold font-display text-white">Séries Terminées</h1>
          <p className="text-lg text-muted-foreground mt-1 max-w-2xl">Plongez dans des histoires complètes du début à la fin.</p>
        </div>
      </header>

      {stories.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-6 gap-y-12">
          {stories.map((story) => <StoryCard key={story.id} story={story} />)}
        </div>
      ) : (
        <div className="text-center py-24 border-2 border-dashed border-white/5 rounded-[3rem] bg-white/[0.02]">
          <p className="text-stone-500 italic font-light">Aucune série n'est encore terminée.</p>
        </div>
      )}
    </div>
  );
}
