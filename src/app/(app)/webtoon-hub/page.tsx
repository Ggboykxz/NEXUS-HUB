'use client';

import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { StoryCard } from '@/components/story-card';
import { Layers, Loader2, Sparkles, ChevronRight, Zap, Flame } from 'lucide-react';
import type { Story } from '@/lib/types';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

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
    <div className="container max-w-7xl mx-auto px-6 py-12 flex-1 space-y-16">
      {/* 1. IMMERSIVE HUB HEADER */}
      <header className="relative p-12 rounded-[3rem] bg-stone-950 border border-primary/10 overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.15),transparent_70%)]" />
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 relative z-10">
          <div className="space-y-6 text-center lg:text-left flex-1">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 px-4 py-1.5 rounded-full">
              <Layers className="h-4 w-4 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Univers Webtoon</span>
            </div>
            <h1 className="text-4xl md:text-7xl font-display font-black text-white tracking-tighter leading-none">
              L'Immersion <br/><span className="gold-resplendant">Verticale</span>
            </h1>
            <p className="text-lg text-stone-400 font-light italic max-w-xl">
              "Découvrez une nouvelle façon de lire. Des récits conçus pour le scroll, optimisés pour votre mobile et enrichis par l'IA."
            </p>
            <div className="flex flex-wrap justify-center lg:justify-start gap-4 pt-4">
              <Button className="rounded-full px-8 bg-primary text-black font-black gold-shimmer h-12">Dernières Sorties</Button>
              <Button variant="outline" className="rounded-full px-8 border-white/10 text-white font-bold h-12 hover:bg-white/5">Genres Populaires</Button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 w-full lg:w-auto shrink-0">
            <div className="bg-white/5 backdrop-blur-md p-6 rounded-[2rem] border border-white/10 text-center space-y-1">
              <p className="text-3xl font-black text-primary">100%</p>
              <p className="text-[10px] uppercase font-bold text-stone-500 tracking-widest">Mobile First</p>
            </div>
            <div className="bg-white/5 backdrop-blur-md p-6 rounded-[2rem] border border-white/10 text-center space-y-1">
              <p className="text-3xl font-black text-emerald-500">HD</p>
              <p className="text-[10px] uppercase font-bold text-stone-500 tracking-widest">Qualité</p>
            </div>
          </div>
        </div>
      </header>

      {/* 2. LISTING GRID */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-stone-500 font-display font-bold uppercase text-[10px] tracking-widest animate-pulse">Ouverture des portails...</p>
        </div>
      ) : (
        <div className="space-y-10">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-2xl font-display font-black text-white uppercase tracking-tighter">Toute la Sélection</h2>
            </div>
            <Badge variant="outline" className="border-white/10 text-stone-500 text-[9px] uppercase font-black px-3">{webtoons.length} Œuvres</Badge>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {webtoons.map((story) => (
              <StoryCard key={story.id} story={story} />
            ))}
          </div>

          {webtoons.length === 0 && (
            <div className="text-center py-32 border-2 border-dashed border-white/5 rounded-[3rem] bg-white/[0.02]">
                <p className="text-stone-500 italic font-light">Aucun webtoon n'a encore été découvert dans ces sables.</p>
            </div>
          )}
        </div>
      )}

      {/* 3. CTA BOTTOM */}
      <section className="py-24 border-t border-white/5 text-center space-y-8">
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="bg-primary/10 p-4 rounded-3xl w-fit mx-auto mb-4">
            <Flame className="h-8 w-8 text-orange-500" />
          </div>
          <h2 className="text-3xl font-display font-black text-white">Prêt pour le prochain chapitre ?</h2>
          <p className="text-stone-400 font-light italic">"Accédez à des centaines d'épisodes exclusifs et soutenez les créateurs locaux."</p>
          <Button asChild size="lg" className="rounded-full px-12 h-16 font-black text-xl bg-primary text-black gold-shimmer">
            <Link href="/signup">Rejoindre la Communauté</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
