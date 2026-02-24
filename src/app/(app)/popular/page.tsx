'use client';

import { useState, useEffect } from 'react';
import { type Story } from '@/lib/data';
import { StoryCard } from '@/components/story-card';
import { TrendingUp, Loader2 } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';

export default function PopularStoriesPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPopular() {
      try {
        const q = query(collection(db, 'stories'), orderBy('views', 'desc'), limit(20));
        const snap = await getDocs(q);
        setStories(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Story)));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchPopular();
  }, []);

  return (
    <div className="container mx-auto max-w-7xl px-4 py-12">
      <div className="flex items-center gap-4 mb-8">
        <div className="bg-primary/10 p-3 rounded-full">
            <TrendingUp className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-4xl font-bold font-display">Les Plus Populaires</h1>
      </div>
      <p className="text-lg text-muted-foreground mb-12">
        Découvrez les œuvres qui passionnent notre communauté en ce moment.
      </p>

      {loading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      ) : stories.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-12">
          {stories.map((story) => (
            <StoryCard key={story.id} story={story} />
          ))}
        </div>
      ) : (
        <div className="text-center py-24 border rounded-xl bg-card/50">
            <p className="text-muted-foreground italic">Aucune œuvre populaire pour le moment.</p>
        </div>
      )}
    </div>
  );
}
