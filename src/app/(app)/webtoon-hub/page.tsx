'use client';

import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { StoryCard } from '@/components/story-card';
import { Layers, Loader2, Sparkles } from 'lucide-react';
import type { Story } from '@/lib/types';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';

export default function WebtoonHubPage() {
  const { data: webtoons = [], isLoading } = useQuery({
    queryKey: ['webtoons-listing-hub'],
    queryFn: async () => {
      const q = query(
        collection(db, 'stories'), 
        where('format', 'in', ['Webtoon', 'Roman Illustré', 'Hybride']),
        where('isPublished', '==', true),
        orderBy('updatedAt', 'desc')
      );
      const snap = await getDocs(q);
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Story));
    }
  });

  return (
    <div className="container mx-auto max-w-7xl px-6 py-12 flex-1">
      <header className="mb-16 relative p-12 rounded-[3rem] bg-primary/[0.03] border border-primary/10 overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.1),transparent_70%)]" />
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 relative z-10">
          <div className="space-y-6 text-center lg:text-left flex-1">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 px-4 py-1.5 rounded-full">
              <Layers className="h-4 w-4 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Univers Webtoon</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-display font-black text-white tracking-tighter leading-none">
              L'Immersion <br/><span className="gold-resplendant">Verticale</span>
            </h1>
            <p className="text-lg text-stone-400 font-light italic max-w-xl">
              "Découvrez une nouvelle façon de lire. Des récits conçus pour le scroll, optimisés pour votre mobile et enrichis par l'IA."
            </p>
          </div>
          <div className="hidden lg:block w-64 h-64 bg-stone-900 rounded-[2rem] border border-white/5 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent" />
              <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-20 w-20 text-primary opacity-20" />
          </div>
        </div>
      </header>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-stone-500 font-display font-bold uppercase text-[10px] tracking-widest animate-pulse">Chargement des mondes...</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-12">
          {webtoons.map((story) => (
            <StoryCard key={story.id} story={story} />
          ))}
          {webtoons.length === 0 && (
            <div className="col-span-full text-center py-32 border-2 border-dashed border-white/5 rounded-[3rem] bg-white/[0.02]">
                <p className="text-stone-500 italic font-light">Aucun webtoon n'a encore été découvert dans ces sables.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
