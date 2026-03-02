'use client';

import { Suspense, useState, useEffect, useMemo } from 'react';
import { getStoryUrl, type Story, type UserProfile } from '@/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { Crown, Eye, Heart, TrendingUp, Sparkles, Award, Trophy, ChevronRight, Loader2, Star, Zap, Users, UserPlus, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { db, auth } from '@/lib/firebase';
import { collection, query, orderBy, limit, getDocs, where, doc, setDoc, deleteDoc, updateDoc, increment, serverTimestamp, getDoc } from 'firebase/firestore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuthModal } from '@/components/providers/auth-modal-provider';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { onAuthStateChanged } from 'firebase/auth';

function RankingRowSkeleton() {
  return (
    <Card className="border-white/5 bg-card/50 rounded-[2rem] overflow-hidden">
      <div className="flex flex-col md:flex-row items-stretch">
        <div className="p-8 md:w-28 flex items-center justify-center border-r border-white/5">
          <Skeleton className="h-12 w-12 bg-stone-800 rounded-lg" />
        </div>
        <div className="flex-1 p-8 flex items-center gap-8">
          <Skeleton className="w-24 md:w-36 aspect-[2/3] bg-stone-800 rounded-2xl shrink-0" />
          <div className="flex-1 space-y-4">
            <div className="flex gap-2">
              <Skeleton className="h-4 w-16 bg-stone-800" />
              <Skeleton className="h-4 w-16 bg-stone-800" />
            </div>
            <Skeleton className="h-8 w-3/4 bg-stone-800" />
            <Skeleton className="h-4 w-1/4 bg-stone-800/50" />
            <div className="flex gap-8 pt-2">
              <Skeleton className="h-10 w-24 bg-stone-800" />
              <Skeleton className="h-10 w-24 bg-stone-800" />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

const formatStat = (num: number): string => {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(0)}k`;
  return num.toString();
};

function PodiumCard({ story, rank, metric }: { story: Story, rank: number, metric: 'views' | 'likes' | 'updatedAt' }) {
  const storyUrl = getStoryUrl(story);
  
  const styles = {
    1: {
      container: "md:order-2 h-full z-20 pb-12",
      card: "border-primary/40 bg-primary/10 shadow-[0_0_50px_rgba(212,168,67,0.2)]",
      badge: "bg-primary text-black",
      icon: <Crown className="h-8 w-8 text-primary animate-[spin_4s_linear_infinite]" />,
      cover: "w-40 md:w-48"
    },
    2: {
      container: "md:order-1 h-[90%] z-10",
      card: "border-stone-400/20 bg-stone-400/5",
      badge: "bg-stone-400 text-black",
      icon: <Trophy className="h-6 w-6 text-stone-400" />,
      cover: "w-32 md:w-40"
    },
    3: {
      container: "md:order-3 h-[85%] z-10",
      card: "border-amber-700/20 bg-amber-700/5",
      badge: "bg-amber-700 text-white",
      icon: <Award className="h-6 w-6 text-amber-700" />,
      cover: "w-28 md:w-36"
    }
  }[rank as 1|2|3];

  return (
    <div className={cn("flex flex-col items-center gap-4 transition-all duration-700", styles.container)}>
      <div className="flex flex-col items-center -space-y-4">
        <div className="relative z-10">
          {styles.icon}
        </div>
        <Link href={storyUrl} className="block group">
          <div className={cn(
            "relative aspect-[2/3] rounded-[2rem] overflow-hidden shadow-2xl transition-all duration-500 group-hover:scale-105 border-4 border-stone-900 group-hover:border-primary/50",
            styles.cover
          )}>
            <Image src={story.coverImage.imageUrl} alt={story.title} fill className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
              <Badge className={cn("font-black text-xs px-4 py-1", styles.badge)}>#{rank}</Badge>
            </div>
          </div>
        </Link>
      </div>

      <Card className={cn("w-full rounded-[2.5rem] p-6 text-center space-y-2 border-2", styles.card)}>
        <h3 className="font-display font-black text-lg md:text-xl text-white truncate px-2">{story.title}</h3>
        <p className="text-[9px] font-bold uppercase tracking-widest text-stone-500">par {story.artistName}</p>
        <div className="pt-3 flex items-center justify-center gap-2">
          {metric === 'views' ? (
            <div className="flex items-center gap-1.5 text-primary">
              <Eye className="h-4 w-4" />
              <span className="font-black text-sm">{formatStat(story.views)}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-rose-500">
              <Heart className="h-4 w-4" />
              <span className="font-black text-sm">{formatStat(story.likes)}</span>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

function RankingList({ stories, metric }: { stories: Story[], metric: 'views' | 'likes' | 'updatedAt' }) {
  const top3 = stories.slice(0, 3);
  const others = stories.slice(3);

  return (
    <div className="space-y-20 animate-in fade-in duration-1000">
      {/* PODIUM SECTION */}
      {top3.length > 0 && (
        <section className="pt-12">
          <div className="flex flex-col md:flex-row items-center md:items-end justify-center gap-8 md:gap-4 max-w-6xl mx-auto px-4">
            {top3[1] && <PodiumCard story={top3[1]} rank={2} metric={metric} />}
            {top3[0] && <PodiumCard story={top3[0]} rank={1} metric={metric} />}
            {top3[2] && <PodiumCard story={top3[2]} rank={3} metric={metric} />}
          </div>
        </section>
      )}

      {/* OTHERS LIST */}
      <div className="grid gap-6">
        {others.map((story, index) => {
          const storyUrl = getStoryUrl(story);
          const rank = index + 4;

          return (
            <Card key={story.id} className="group relative overflow-hidden transition-all duration-500 hover:shadow-2xl rounded-[2rem] border-white/5 bg-card/50">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row items-stretch">
                  <div className="flex flex-col items-center justify-center p-8 md:w-28 text-center border-b md:border-b-0 md:border-r border-white/5 bg-white/[0.02] text-stone-600 group-hover:text-stone-400 transition-colors">
                    <span className="text-4xl font-display font-black tracking-tighter">#{rank}</span>
                  </div>

                  <div className="flex flex-1 p-6 md:p-8 gap-8 items-center">
                    <Link href={storyUrl} className="shrink-0 relative">
                        <div className="relative w-20 md:w-32 aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl transition-all duration-700 group-hover:scale-105 group-hover:shadow-primary/10">
                            <Image src={story.coverImage.imageUrl} alt={story.title} fill className="object-cover" />
                            {story.isPremium && (
                                <div className="absolute top-2 right-2 bg-primary p-1 rounded-lg shadow-xl">
                                    <Crown className="h-3 w-3 text-black fill-current" />
                                </div>
                            )}
                        </div>
                    </Link>

                    <div className="flex-grow min-w-0 space-y-4">
                        <div className="flex flex-wrap items-center gap-3">
                            <Badge variant="secondary" className="bg-white/5 text-stone-400 border-none text-[8px] uppercase font-black tracking-widest px-2">
                                {story.genre}
                            </Badge>
                            <Badge variant="outline" className="text-[8px] uppercase tracking-widest border-primary/20 text-primary font-black px-2">
                                {story.format}
                            </Badge>
                        </div>

                        <div>
                          <Link href={storyUrl}>
                              <h3 className="text-2xl md:text-3xl font-display font-black group-hover:text-primary transition-colors leading-none mb-2 truncate text-white">
                                  {story.title}
                              </h3>
                          </Link>
                          <p className="text-stone-500 font-bold uppercase text-[9px] tracking-[0.2em]">par {story.artistName}</p>
                        </div>

                        <div className="flex flex-wrap items-center gap-6 pt-2">
                            <div className="flex items-center gap-2">
                                <Eye className={cn("h-4 w-4", metric === 'views' ? "text-primary" : "text-stone-600")} />
                                <div className="leading-tight">
                                  <p className="text-base font-black text-white">{formatStat(story.views)}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Heart className={cn("h-4 w-4", metric === 'likes' ? "text-rose-500" : "text-stone-600")} />
                                <div className="leading-tight">
                                  <p className="text-base font-black text-white">{formatStat(story.likes)}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="hidden lg:flex flex-col items-end gap-4 ml-auto">
                        <Button asChild size="lg" className="rounded-full px-8 gap-3 font-black h-12 shadow-2xl transition-all active:scale-95 bg-white/5 border border-white/10 text-white hover:bg-primary hover:text-black">
                            <Link href={storyUrl}>
                                Lire l'Épisode <ChevronRight className="h-4 w-4" />
                            </Link>
                        </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function ArtistRankingList() {
  const { openAuthModal } = useAuthModal();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    return onAuthStateChanged(auth, (user) => setCurrentUser(user));
  }, []);

  const { data: artists = [], isLoading } = useQuery({
    queryKey: ['artist-rankings'],
    queryFn: async () => {
      const q = query(
        collection(db, 'users'),
        where('role', 'in', ['artist_draft', 'artist_pro', 'artist_elite']),
        orderBy('subscribersCount', 'desc'),
        limit(20)
      );
      const snap = await getDocs(q);
      return snap.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile));
    },
    staleTime: 10 * 60 * 1000,
  });

  const followMutation = useMutation({
    mutationFn: async ({ artistId, isFollowing }: { artistId: string, isFollowing: boolean }) => {
      if (!currentUser) {
        openAuthModal('suivre des artistes');
        return;
      }

      const subRef = doc(db, 'users', currentUser.uid, 'subscriptions', artistId);
      const artistRef = doc(db, 'users', artistId);

      if (isFollowing) {
        await deleteDoc(subRef);
        await updateDoc(artistRef, { subscribersCount: increment(-1) });
      } else {
        const artistSnap = await getDoc(artistRef);
        const artistData = artistSnap.data();
        await setDoc(subRef, {
          artistId,
          artistName: artistData?.displayName || 'Artiste',
          artistPhoto: artistData?.photoURL || '',
          subscribedAt: serverTimestamp()
        });
        await updateDoc(artistRef, { subscribersCount: increment(1) });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artist-rankings'] });
      toast({ title: "Action effectuée" });
    }
  });

  if (isLoading) {
    return (
      <div className="grid gap-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="bg-stone-900/30 border-white/5 rounded-3xl p-6 flex items-center gap-6">
            <Skeleton className="w-12 h-12 rounded-2xl bg-stone-800" />
            <Skeleton className="h-14 w-14 rounded-full bg-stone-800" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-5 w-1/3 bg-stone-800" />
              <Skeleton className="h-3 w-1/4 bg-stone-800/50" />
            </div>
            <Skeleton className="h-11 w-32 rounded-xl bg-stone-800" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 animate-in fade-in duration-700">
      {artists.map((artist, index) => {
        const rank = index + 1;
        return (
          <Card key={artist.uid} className="bg-stone-900/30 border-white/5 rounded-3xl p-6 hover:border-primary/20 transition-all group">
            <div className="flex items-center gap-6">
              <div className={cn(
                "w-12 h-12 flex items-center justify-center rounded-2xl font-display font-black text-2xl shrink-0",
                rank === 1 ? "bg-primary text-black" : "bg-white/5 text-stone-600"
              )}>
                {rank}
              </div>
              
              <Link href={`/artiste/${artist.slug}`} className="flex items-center gap-4 flex-1 min-w-0">
                <Avatar className="h-14 w-14 border-2 border-white/10 group-hover:border-primary/50 transition-all">
                  <AvatarImage src={artist.photoURL} />
                  <AvatarFallback>{artist.displayName?.slice(0,2)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-lg text-white truncate">{artist.displayName}</h4>
                    {artist.role === 'artist_pro' ? (
                      <Badge className="bg-emerald-500 text-white border-none text-[8px] font-black uppercase px-2 h-4">PRO</Badge>
                    ) : (
                      <Badge variant="outline" className="border-orange-500/50 text-orange-400 text-[8px] font-black uppercase px-2 h-4">DRAFT</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-stone-500">
                    <span className="flex items-center gap-1"><Users className="h-3 w-3 text-primary" /> {artist.subscribersCount.toLocaleString()} abonnés</span>
                  </div>
                </div>
              </Link>

              <Button 
                variant="outline"
                className="rounded-xl h-11 px-6 font-black text-[10px] uppercase tracking-widest border-white/10 hover:bg-primary hover:text-black transition-all gap-2"
                onClick={() => followMutation.mutate({ artistId: artist.uid, isFollowing: false })}
              >
                <UserPlus className="h-4 w-4" /> Suivre
              </Button>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

export default function RankingsPage() {
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'popular';
  
  // 1. FETCH POPULAR (BY VIEWS)
  const { data: popular = [], isLoading: loadingPopular } = useQuery<Story[]>({
    queryKey: ['rankings-popular'],
    queryFn: async () => {
      const q = query(collection(db, 'stories'), where('isPublished', '==', true), orderBy('views', 'desc'), limit(50));
      const snap = await getDocs(q);
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Story));
    },
    staleTime: 10 * 60 * 1000,
  });

  // 2. FETCH TRENDING (BY LIKES)
  const { data: trending = [], isLoading: loadingTrending } = useQuery<Story[]>({
    queryKey: ['rankings-trending'],
    queryFn: async () => {
      const q = query(collection(db, 'stories'), where('isPublished', '==', true), orderBy('likes', 'desc'), limit(50));
      const snap = await getDocs(q);
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Story));
    },
    staleTime: 10 * 60 * 1000,
  });

  // 3. FETCH NEWEST (BY UPDATED DATE)
  const { data: newest = [], isLoading: loadingNewest } = useQuery<Story[]>({
    queryKey: ['rankings-newest'],
    queryFn: async () => {
      const q = query(collection(db, 'stories'), where('isPublished', '==', true), orderBy('updatedAt', 'desc'), limit(30));
      const snap = await getDocs(q);
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Story));
    },
    staleTime: 10 * 60 * 1000,
  });

  return (
    <div className="container max-w-7xl mx-auto px-6 py-12 space-y-16">
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

      <Tabs defaultValue={defaultTab} className="w-full">
        <div className="flex justify-center mb-16">
          <TabsList className="bg-muted/50 p-1.5 rounded-2xl h-14 border border-border/50 max-w-2xl w-full overflow-x-auto">
              <TabsTrigger value="popular" className="rounded-xl flex-1 gap-2 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-black">
                  <Trophy className="h-4 w-4" /> Par Vues
              </TabsTrigger>
              <TabsTrigger value="trending" className="rounded-xl flex-1 gap-2 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-rose-500 data-[state=active]:text-white">
                  <Heart className="h-4 w-4" /> Par Likes
              </TabsTrigger>
              <TabsTrigger value="newest" className="rounded-xl flex-1 gap-2 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-cyan-500 data-[state=active]:text-white">
                  <Sparkles className="h-4 w-4" /> Nouveaux
              </TabsTrigger>
              <TabsTrigger value="artists" className="rounded-xl flex-1 gap-2 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
                  <Users className="h-4 w-4" /> Artistes
              </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="popular">
          {loadingPopular ? (
            <div className="space-y-6">
              {[...Array(5)].map((_, i) => <RankingRowSkeleton key={i} />)}
            </div>
          ) : (
            <RankingList stories={popular} metric="views" />
          )}
        </TabsContent>

        <TabsContent value="trending">
          {loadingTrending ? (
            <div className="space-y-6">
              {[...Array(5)].map((_, i) => <RankingRowSkeleton key={i} />)}
            </div>
          ) : (
            <RankingList stories={trending} metric="likes" />
          )}
        </TabsContent>

        <TabsContent value="newest">
          {loadingNewest ? (
            <div className="space-y-6">
              {[...Array(5)].map((_, i) => <RankingRowSkeleton key={i} />)}
            </div>
          ) : (
            <RankingList stories={newest} metric="updatedAt" />
          )}
        </TabsContent>

        <TabsContent value="artists">
          <ArtistRankingList />
        </TabsContent>
      </Tabs>
    </div>
  );
}
