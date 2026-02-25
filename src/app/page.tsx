'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StoryCard } from '@/components/story-card';
import { db, auth } from '@/lib/firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import type { Story } from '@/lib/types';
import { useQuery } from '@tanstack/react-query';
import { onAuthStateChanged } from 'firebase/auth';
import { PwaInstallBanner } from '@/components/pwa/pwa-install-banner';
import Header from '@/components/common/header';
import Footer from '@/components/common/footer';
import { cn } from '@/lib/utils';
import { 
  Play, TrendingUp, Sparkles, Trophy, Globe, Flame, 
  Zap, Award, ChevronRight, BrainCircuit, Headphones, Film
} from 'lucide-react';

const GENRES = [
  { name: 'Mythologie', slug: 'mythologie', emoji: '⚡', color: 'from-amber-900/60 to-amber-950' },
  { name: 'Afrofuturisme', slug: 'afrofuturisme', emoji: '🚀', color: 'from-cyan-900/60 to-cyan-950' },
  { name: 'Action', slug: 'action', emoji: '⚔️', color: 'from-red-900/60 to-red-950' },
  { name: 'Romance', slug: 'romance', emoji: '🌸', color: 'from-rose-900/60 to-rose-950' },
  { name: 'Histoire', slug: 'histoire', emoji: '🏛️', color: 'from-stone-700/60 to-stone-950' },
];

export default function RootHomePage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [heroLoaded, setHeroLoaded] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, setCurrentUser);
    return unsub;
  }, []);

  const { data: popular = [], isLoading } = useQuery<Story[]>({
    queryKey: ['stories', 'popular'],
    queryFn: async () => {
      const q = query(collection(db, 'stories'), orderBy('views', 'desc'), limit(10));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as Story));
    },
  });

  const featured = popular[0];

  return (
    <div className="flex flex-col bg-stone-950 min-h-screen">
      <Header />
      <PwaInstallBanner />

      <section className="relative w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-stone-950 via-transparent to-stone-950 z-10 pointer-events-none" />
        <div className="relative w-full min-h-[80vh] flex items-end">
          {featured && (
            <div className="absolute inset-0">
              <Image
                src={featured.coverImage}
                alt={featured.title}
                fill
                className={cn(
                  'object-cover transition-all duration-[3000ms]',
                  heroLoaded ? 'opacity-35 scale-100' : 'opacity-0 scale-105'
                )}
                priority
                onLoad={() => setHeroLoaded(true)}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-950/60 to-transparent" />
            </div>
          )}

          <div className="relative z-20 container max-w-7xl mx-auto px-6 pb-16">
            <div className="max-w-3xl">
              {featured ? (
                <>
                  <Badge className="bg-primary text-black mb-6 uppercase tracking-widest font-black text-[10px]">NexusHub Originals</Badge>
                  <h1 className="text-5xl md:text-8xl font-display font-black text-white leading-[0.9] tracking-tight mb-6">{featured.title}</h1>
                  <p className="text-stone-300 text-lg md:text-xl font-light italic leading-relaxed mb-10 max-w-xl line-clamp-2">"{featured.description}"</p>
                  <div className="flex flex-wrap gap-4">
                    <Button asChild className="h-14 px-8 rounded-full font-black text-base gold-shimmer bg-primary text-black">
                      <Link href={`/read/${featured.id}`}><Play className="mr-2 h-5 w-5 fill-current" /> Lire l'Épisode</Link>
                    </Button>
                    <Button asChild variant="outline" className="h-14 px-8 rounded-full font-bold border-white/15 text-white hover:bg-white/10 backdrop-blur-md">
                      <Link href={`/read/${featured.id}`}><Headphones className="mr-2 h-5 w-5" /> Mode Sonore</Link>
                    </Button>
                  </div>
                </>
              ) : (
                <div className="h-24 w-3/4 bg-stone-800 animate-pulse rounded-2xl" />
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="container max-w-7xl mx-auto px-6 lg:px-8 space-y-24 py-20">
        <section>
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-3xl font-display font-black">Tendances Actuelles</h2>
            </div>
            <Link href="/popular" className="text-primary text-xs font-black uppercase tracking-widest flex items-center gap-2">Tout voir <ChevronRight className="h-4 w-4" /></Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {popular.slice(0, 5).map((story) => (
              <StoryCard key={story.id} story={story} />
            ))}
          </div>
        </section>

        <section className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {GENRES.map((genre) => (
            <Link key={genre.slug} href={`/genre/${genre.slug}`} className={cn('relative overflow-hidden rounded-2xl border border-white/5 flex flex-col items-center justify-center gap-3 py-10 px-4 bg-gradient-to-b', genre.color, 'group hover:scale-105 transition-all')}>
              <span className="text-4xl group-hover:scale-110 transition-transform">{genre.emoji}</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-white/80 text-center">{genre.name}</span>
            </Link>
          ))}
        </section>

        <section className="p-10 rounded-[3rem] bg-stone-900 border border-primary/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5"><BrainCircuit className="h-48 w-48 text-primary" /></div>
            <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                    <Badge className="bg-emerald-500 text-white border-none uppercase text-[8px] font-black px-3">NOUVEAU : NEXUSHUB AI STUDIO</Badge>
                    <h2 className="text-4xl font-display font-black text-white leading-tight">Assistance Créative <br/> de Prochaine Génération</h2>
                    <p className="text-stone-400 text-lg font-light italic">"Storyboard, Colorisation textile et Consistance de personnages. Libérez votre génie avec nos outils IA spécialisés."</p>
                    <Button asChild size="lg" className="rounded-full bg-primary text-black font-black px-8 h-14 gold-shimmer shadow-2xl">
                        <Link href="/dashboard/ai-studio">Découvrir le Studio AI</Link>
                    </Button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 p-6 rounded-3xl border border-white/5 flex flex-col items-center gap-3">
                        <Film className="h-8 w-8 text-primary" />
                        <span className="text-[10px] font-bold uppercase text-stone-300">Storyboard AI</span>
                    </div>
                    <div className="bg-white/5 p-6 rounded-3xl border border-white/5 flex flex-col items-center gap-3">
                        <Sparkles className="h-8 w-8 text-primary" />
                        <span className="text-[10px] font-bold uppercase text-stone-300">Palettes Kente</span>
                    </div>
                </div>
            </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}
