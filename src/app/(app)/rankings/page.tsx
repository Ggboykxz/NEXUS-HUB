
'use client';

import { Suspense, useState, useEffect } from 'react';
import type { Story } from '@/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { Crown, Eye, Heart, TrendingUp, Sparkles, Award, Trophy, ChevronRight, Loader2, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';

export default function RankingsPage() {
  const [indexError, setIndexError] = useState(false);

  const { data: popular = [], isLoading } = useQuery<Story[]>({
    queryKey: ['rankings-popular'],
    queryFn: async () => {
      setIndexError(false);
      const storiesRef = collection(db, 'stories');
      try {
        const q = query(storiesRef, where('isPublished', '==', true), orderBy('views', 'desc'), limit(50));
        const snap = await getDocs(q);
        return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Story));
      } catch (e: any) {
        if (e.code === 'failed-precondition' || e.message.includes('index')) {
          setIndexError(true);
          const fallbackQ = query(storiesRef, where('isPublished', '==', true), limit(50));
          const snap = await getDocs(fallbackQ);
          return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Story));
        }
        throw e;
      }
    },
    staleTime: 10 * 60 * 1000,
  });

  return (
    <div className="container max-w-7xl mx-auto px-6 py-12 space-y-16">
      <header className="relative p-12 rounded-[3rem] bg-stone-950 border border-primary/10 overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.15),transparent_70%)]" />
        <div className="relative z-10 space-y-6">
          <Badge variant="outline" className="border-primary/20 text-primary uppercase text-[10px] font-black tracking-[0.2em] px-4 py-1">Temple de la Renommée</Badge>
          <h1 className="text-4xl md:text-7xl font-display font-black text-white tracking-tighter leading-none">L'Élite <span className="gold-resplendant">du Hub</span></h1>
          <p className="text-lg text-stone-400 font-light italic max-w-xl">"Découvrez le sommet de la narration visuelle africaine. Les œuvres qui battent tous les records."</p>
        </div>
      </header>

      {indexError && (
        <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl flex items-center gap-3 animate-in fade-in duration-500">
          <AlertCircle className="h-5 w-5 text-amber-500" />
          <p className="text-xs text-amber-200 font-medium">Mode Dégradé : Tri désactivé (Index Firestore en cours de création)</p>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary h-12 w-12" /></div>
      ) : (
        <div className="grid gap-6">
          {popular.map((story, index) => (
            <Card key={story.id} className="group overflow-hidden transition-all bg-card/50 border-white/5 rounded-2xl hover:border-primary/30">
              <CardContent className="p-0 flex items-center">
                <div className="w-20 md:w-28 h-full flex items-center justify-center border-r border-white/5 bg-white/[0.02] font-display font-black text-3xl text-stone-700">#{index + 1}</div>
                <div className="flex-1 p-6 flex items-center gap-6">
                  <div className="relative w-16 md:w-24 aspect-[2/3] rounded-xl overflow-hidden shadow-xl shrink-0">
                    <Image src={story.coverImage.imageUrl} alt={story.title} fill className="object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors truncate">{story.title}</h3>
                    <p className="text-[10px] uppercase font-black text-stone-500 mt-1">par {story.artistName}</p>
                    <div className="flex gap-4 mt-3 text-[10px] font-bold text-stone-600">
                      <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {(story.views/1000).toFixed(1)}K</span>
                      <span className="flex items-center gap-1"><Heart className="h-3 w-3" /> {(story.likes/1000).toFixed(1)}K</span>
                    </div>
                  </div>
                  <Button asChild variant="outline" className="hidden sm:flex rounded-full border-white/10 text-white font-black text-[10px] uppercase">
                    <Link href={`/webtoon-hub/${story.slug}`}>Ouvrir <ChevronRight className="h-3 w-3 ml-1" /></Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
