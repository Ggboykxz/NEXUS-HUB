'use client';

import { Suspense, useState, useEffect, useMemo } from 'react';
import { type Story, getStoryUrl } from '@/lib/data';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { Crown, Eye, Heart, TrendingUp, Sparkles, Award, Trophy, ChevronRight, Loader2, Star, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';

function RankingList({ stories, metric }: { stories: Story[], metric: 'views' | 'likes' | 'updatedAt' }) {
  const formatStat = (num: number): string => {
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(0)}k`;
    return num.toString();
  };

  return (
    <div className="grid gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {stories.map((story, index) => {
        const storyUrl = getStoryUrl(story.id);
        const rank = index + 1;
        const isTop3 = rank <= 3;

        return (
          <div key={story.id} className="relative">
            <Card className={cn(
                "group relative overflow-hidden transition-all duration-500 hover:shadow-2xl rounded-[2rem]",
                isTop3 ? "border-primary/20 bg-primary/[0.03]" : "border-white/5 bg-card/50"
            )}>
              {isTop3 && <div className="absolute top-0 left-0 w-1 h-full bg-primary" />}
              
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row items-stretch">
                  <div className={cn(
                    "flex flex-col items-center justify-center p-8 md:w-28 text-center border-b md:border-b-0 md:border-r border-white/5 transition-colors",
                    rank === 1 ? "bg-primary/10 text-primary" : 
                    rank === 2 ? "bg-stone-300/10 text-stone-400" :
                    rank === 3 ? "bg-amber-600/10 text-amber-600" : "bg-white/[0.02] text-stone-600"
                  )}>
                    <span className="text-5xl font-display font-black tracking-tighter">#{rank}</span>
                    {rank === 1 && <Trophy className="h-6 w-6 mt-2 animate-bounce" />}
                  </div>

                  <div className="flex flex-1 p-8 gap-8 items-center">
                    <Link href={storyUrl} className="shrink-0 relative">
                        <div className="relative w-24 md:w-36 aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl transition-all duration-700 group-hover:scale-105 group-hover:shadow-primary/10">
                            <Image src={story.coverImage} alt={story.title} fill className="object-cover" />
                            {story.isPremium && (
                                <div className="absolute top-2 right-2 bg-primary p-1.5 rounded-lg shadow-xl">
                                    <Crown className="h-4 w-4 text-black fill-current" />
                                </div>
                            )}
                        </div>
                    </Link>

                    <div className="flex-grow min-w-0 space-y-4">
                        <div className="flex flex-wrap items-center gap-3">
                            <Badge variant="secondary" className="bg-white/5 text-stone-400 border-none text-[9px] uppercase font-black tracking-widest px-3">
                                {story.genre}
                            </Badge>
                            <Badge variant="outline" className="text-[9px] uppercase tracking-widest border-primary/20 text-primary font-black px-3">
                                {story.format}
                            </Badge>
                        </div>

                        <div>
                          <Link href={storyUrl}>
                              <h3 className="text-3xl md:text-4xl font-display font-black group-hover:text-primary transition-colors leading-none mb-2 truncate text-white">
                                  {story.title}
                              </h3>
                          </Link>
                          <p className="text-stone-500 font-bold uppercase text-[10px] tracking-[0.2em]">par {story.artistName}</p>
                        </div>

                        <div className="flex flex-wrap items-center gap-8 pt-2">
                            <div className="flex items-center gap-3">
                                <div className="bg-primary/10 p-2 rounded-xl">
                                    <Eye className={cn("h-5 w-5", metric === 'views' ? "text-primary" : "text-stone-600")} />
                                </div>
                                <div className="leading-tight">
                                  <p className="text-lg font-black text-white">{formatStat(story.views)}</p>
                                  <p className="text-[8px] uppercase font-bold text-stone-600 tracking-widest">Lectures</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="bg-rose-500/10 p-2 rounded-xl">
                                    <Heart className={cn("h-5 w-5", metric === 'likes' ? "text-rose-500" : "text-stone-600")} />
                                </div>
                                <div className="leading-tight">
                                  <p className="text-lg font-black text-white">{formatStat(story.likes)}</p>
                                  <p className="text-[8px] uppercase font-bold text-stone-600 tracking-widest">Favoris</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="hidden lg:flex flex-col items-end gap-4 ml-auto">
                        <Button asChild size="lg" className="rounded-full px-10 gap-3 font-black h-14 shadow-2xl transition-all active:scale-95 bg-white/5 border border-white/10 text-white hover:bg-primary hover:text-black">
                            <Link href={storyUrl}>
                                Lire l'Épisode <ChevronRight className="h-5 w-5" />
                            </Link>
                        </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      })}
    </div>
  );
}

export default function RankingsPage() {
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'popular';
  
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAll() {
      try {
        const q = query(collection(db, 'stories'), limit(50));
        const snap = await getDocs(q);
        setStories(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Story)));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  const popular = useMemo(() => [...stories].sort((a, b) => b.views - a.views), [stories]);
  const trending = useMemo(() => [...stories].sort((a, b) => b.likes - a.likes), [stories]);
  const newest = useMemo(() => [...stories].sort((a, b) => new Date(b.updatedAt as string).getTime() - new Date(a.updatedAt as string).getTime()), [stories]);

  return (
    <div className="container max-w-7xl mx-auto px-6 py-12 space-y-16">
      {/* 1. ELITE HEADER */}
      <header className="relative p-12 rounded-[3rem] bg-stone-950 border border-primary/10 overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.15),transparent_70%)]" />
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 relative z-10">
          <div className="space-y-6 text-center lg:text-left flex-1">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 px-4 py-1.5 rounded-full">
              <Award className="h-4 w-4 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Temple de la Renommée</span>
            </div>
            <h1 className="text-4xl md:text-7xl font-display font-black text-white tracking-tighter leading-none">
              L'Élite <br/><span className="gold-resplendant">du Hub</span>
            </h1>
            <p className="text-lg text-stone-400 font-light italic max-w-xl">
              "Découvrez le sommet de la narration visuelle africaine. Les œuvres qui battent tous les records et forgent l'avenir du 9ème art."
            </p>
          </div>
          <div className="w-full lg:w-auto flex flex-col items-center gap-4">
            <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10 text-center space-y-4">
              <div className="h-16 w-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(212,168,67,0.3)]">
                <Crown className="h-8 w-8 text-primary" />
              </div>
              <p className="text-xs font-black text-white uppercase tracking-widest">Actualisé en direct</p>
            </div>
          </div>
        </div>
      </header>

      {/* 2. RANKINGS TABS */}
      {loading ? (
        <div className="h-96 flex flex-col items-center justify-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-stone-500 font-display font-bold uppercase text-[10px] tracking-widest animate-pulse">Calcul des scores stellaires...</p>
        </div>
      ) : (
        <Tabs defaultValue={defaultTab} className="w-full">
          <div className="flex justify-center mb-16">
            <TabsList className="bg-muted/50 p-1 rounded-2xl h-14 border border-border/50 max-w-xl w-full">
                <TabsTrigger value="popular" className="rounded-xl flex-1 gap-2 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-black">
                    <Trophy className="h-4 w-4" /> Populaires
                </TabsTrigger>
                <TabsTrigger value="trending" className="rounded-xl flex-1 gap-2 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-rose-500 data-[state=active]:text-white">
                    <TrendingUp className="h-4 w-4" /> Tendance
                </TabsTrigger>
                <TabsTrigger value="newest" className="rounded-xl flex-1 gap-2 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-cyan-500 data-[state=active]:text-white">
                    <Sparkles className="h-4 w-4" /> Nouveautés
                </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="popular"><RankingList stories={popular} metric="views" /></TabsContent>
          <TabsContent value="trending"><RankingList stories={trending} metric="likes" /></TabsContent>
          <TabsContent value="newest"><RankingList stories={newest} metric="updatedAt" /></TabsContent>
        </Tabs>
      )}
    </div>
  );
}
