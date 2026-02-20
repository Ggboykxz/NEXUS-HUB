'use client';

import { Suspense, use, useMemo } from 'react';
import { stories, getStoryUrl, artists } from '@/lib/data';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Image from 'next/image';
import Link from 'next/link';
import { Crown, Eye, Heart, Star, TrendingUp, Sparkles, Award, Trophy, ChevronRight, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';

function RankingsContent() {
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'popular';
  
  const popular = useMemo(() => [...stories].sort((a, b) => b.views - a.views), []);
  const trending = useMemo(() => [...stories].sort((a, b) => b.likes - a.likes), []);
  const newest = useMemo(() => [...stories].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()), []);

  return (
    <Tabs defaultValue={defaultTab} className="w-full">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
        <TabsList className="grid w-full grid-cols-3 md:w-[500px] h-14 bg-muted/50 p-1.5 rounded-2xl">
            <TabsTrigger value="popular" className="rounded-xl gap-2 font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Trophy className="h-4 w-4" /> Populaires
            </TabsTrigger>
            <TabsTrigger value="trending" className="rounded-xl gap-2 font-bold data-[state=active]:bg-rose-500 data-[state=active]:text-white">
                <TrendingUp className="h-4 w-4" /> Tendance
            </TabsTrigger>
            <TabsTrigger value="newest" className="rounded-xl gap-2 font-bold data-[state=active]:bg-cyan-500 data-[state=active]:text-white">
                <Sparkles className="h-4 w-4" /> Nouveautés
            </TabsTrigger>
        </TabsList>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium bg-muted/30 px-4 py-2 rounded-full border border-border/50">
            <Zap className="h-4 w-4 text-primary" />
            <span>Mis à jour en temps réel</span>
        </div>
      </div>

      <TabsContent value="popular" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <RankingList stories={popular} metric="views" />
      </TabsContent>
      <TabsContent value="trending" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <RankingList stories={trending} metric="likes" />
      </TabsContent>
      <TabsContent value="newest" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <RankingList stories={newest} metric="updatedAt" />
      </TabsContent>
    </Tabs>
  );
}

export default function RankingsPage() {
  return (
    <div className="container mx-auto max-w-7xl px-6 py-12">
      <section className="mb-16">
        <div className="flex items-center gap-4 mb-4">
            <div className="bg-primary/10 p-3 rounded-2xl">
                <Crown className="w-10 h-10 text-primary" />
            </div>
            <div>
                <h1 className="text-4xl md:text-5xl font-bold font-display">Elite du Hub</h1>
                <p className="text-lg text-muted-foreground font-light max-w-2xl mt-1">
                    Découvrez le sommet de la narration visuelle africaine. Les œuvres qui battent tous les records.
                </p>
            </div>
        </div>
      </section>

      <Suspense fallback={
        <div className="h-96 flex flex-col items-center justify-center gap-4">
            <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-muted-foreground font-display font-bold">Calcul des scores en cours...</p>
        </div>
      }>
        <RankingsContent />
      </Suspense>
    </div>
  );
}

interface RankingListProps {
  stories: typeof stories;
  metric: 'views' | 'likes' | 'updatedAt';
}

function RankingList({ stories, metric }: RankingListProps) {
  const formatStat = (num: number): string => {
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(0)}k`;
    return num.toString();
  };

  return (
    <div className="grid gap-6">
      {stories.map((story, index) => {
        const storyUrl = getStoryUrl(story);
        const artist = artists.find(a => a.id === story.artistId);
        const rank = index + 1;
        const isTop3 = rank <= 3;

        return (
          <div key={story.id} className="relative">
            <Card className={cn(
                "group relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:border-primary/30",
                isTop3 ? "border-primary/20 bg-primary/[0.02]" : "border-border/50 bg-card/50"
            )}>
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row items-stretch">
                  {/* Rank Indicator */}
                  <div className={cn(
                    "flex flex-col items-center justify-center p-6 md:w-24 text-center border-b md:border-b-0 md:border-r border-border/50 transition-colors",
                    rank === 1 ? "bg-primary/10 text-primary" : 
                    rank === 2 ? "bg-slate-200/50 text-slate-500" :
                    rank === 3 ? "bg-amber-100/50 text-amber-600" : "bg-muted/30 text-muted-foreground"
                  )}>
                    <span className="text-4xl font-display font-black tracking-tighter">#{rank}</span>
                    {rank === 1 && <Award className="h-5 w-5 mt-1 animate-bounce" />}
                  </div>

                  {/* Content Area */}
                  <div className="flex flex-1 p-6 gap-6 items-center">
                    <Link href={storyUrl} className="shrink-0 relative">
                        <div className="relative w-20 md:w-32 aspect-[2/3] rounded-xl overflow-hidden shadow-xl transition-transform group-hover:scale-105 duration-500">
                            <Image
                            src={story.coverImage.imageUrl}
                            alt={story.title}
                            fill
                            className="object-cover"
                            data-ai-hint={story.coverImage.imageHint}
                            />
                            {story.isPremium && (
                                <div className="absolute top-1 right-1 bg-primary p-1 rounded-md shadow-lg">
                                    <Crown className="h-3 w-3 text-white" />
                                </div>
                            )}
                        </div>
                    </Link>

                    <div className="flex-grow min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                            <Link href={`/genre/${story.genreSlug}`}>
                                <Badge variant="secondary" className="hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer text-[10px] uppercase font-bold tracking-widest">
                                    {story.genre}
                                </Badge>
                            </Link>
                            <Badge variant="outline" className="text-[10px] uppercase tracking-tighter border-primary/20 text-primary">
                                {story.format}
                            </Badge>
                        </div>

                        <Link href={storyUrl}>
                            <h3 className="text-2xl md:text-3xl font-display font-bold group-hover:text-primary transition-colors leading-none mb-2 truncate">
                                {story.title}
                            </h3>
                        </Link>

                        <div className="flex items-center gap-3 mb-4">
                            <Avatar className="h-6 w-6">
                                <AvatarImage src={artist?.avatar.imageUrl} />
                                <AvatarFallback>{story.artistName?.[0]}</AvatarFallback>
                            </Avatar>
                            <Link href={`/artiste/${story.artistSlug}`} className="text-sm text-muted-foreground hover:text-primary font-medium transition-colors">
                                par {story.artistName}
                            </Link>
                            {artist?.isMentor && <Badge className="bg-emerald-500 text-white border-none text-[9px] h-4">PRO</Badge>}
                        </div>

                        <div className="flex flex-wrap items-center gap-6">
                            <div className="flex items-center gap-2 text-sm font-bold">
                                <div className="bg-primary/10 p-1.5 rounded-md">
                                    <Eye className={cn("h-4 w-4", metric === 'views' ? "text-primary" : "text-muted-foreground")} />
                                </div>
                                <span>{formatStat(story.views)} <span className="text-[10px] uppercase text-muted-foreground font-light">lectures</span></span>
                            </div>
                            <div className="flex items-center gap-2 text-sm font-bold">
                                <div className="bg-rose-500/10 p-1.5 rounded-md">
                                    <Heart className={cn("h-4 w-4", metric === 'likes' ? "text-rose-500" : "text-muted-foreground")} />
                                </div>
                                <span>{formatStat(story.likes)} <span className="text-[10px] uppercase text-muted-foreground font-light">likes</span></span>
                            </div>
                            <div className="flex items-center gap-2 text-sm font-bold">
                                <div className="bg-blue-500/10 p-1.5 rounded-md">
                                    <Star className="h-4 w-4 text-blue-500" />
                                </div>
                                <span>{formatStat(story.subscriptions)} <span className="text-[10px] uppercase text-muted-foreground font-light">fans</span></span>
                            </div>
                        </div>
                    </div>

                    <div className="hidden lg:flex flex-col items-end gap-4 ml-auto">
                        <Button asChild variant={isTop3 ? "default" : "outline"} className="rounded-full px-8 gap-2 group/btn h-12 shadow-lg transition-all active:scale-95">
                            <Link href={storyUrl}>
                                Lire maintenant <ChevronRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                            </Link>
                        </Button>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Rank #{rank}</p>
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