'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { StoryCard } from '@/components/story-card';
import { Sparkles, Loader2 } from 'lucide-react';
import type { Story } from '@/lib/types';

export default function NewReleasesPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNew() {
      try {
        const q = query(
          collection(db, 'stories'),
          where('isPublished', '==', true),
          orderBy('updatedAt', 'desc'),
          limit(40)
        );
        const snap = await getDocs(q);
        setStories(snap.docs.map(d => ({ id: d.id, ...d.data() } as Story)));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchNew();
  }, []);

  if (loading) return <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <div className="container mx-auto max-w-7xl px-4 py-12">
      <header className="flex items-center gap-4 mb-8">
        <div className="bg-primary/10 p-3 rounded-full">
          <Sparkles className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h1 className="text-4xl font-bold font-display text-white">Nouveautés</h1>
          <p className="text-lg text-muted-foreground mt-1">Découvrez les dernières sorties de la communauté.</p>
        </div>
      </header>

      {stories.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-6 gap-y-12">
          {stories.map((story) => <StoryCard key={story.id} story={story} showUpdateDate={true} />)}
        </div>
      ) : (
        <p className="text-stone-500 italic text-center py-20">Rien de neuf pour l'instant.</p>
      )}
    </div>
  );
}
