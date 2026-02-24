'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { StoryCard } from '@/components/story-card';
import { db, auth } from '@/lib/firebase';
import { collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore';
import type { Story, LibraryEntry } from '@/lib/types';
import { 
  Play, 
  Info, 
  TrendingUp, 
  Sparkles, 
  Trophy, 
  Banknote,
  Users,
  ChevronRight,
  History,
  BookHeart,
  Globe,
  Flame
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { useQuery } from '@tanstack/react-query';
import { onAuthStateChanged } from 'firebase/auth';

const DEFAULT_BLUR = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

export default function HomePage() {
  const [currentUser, setCurrentUser] = React.useState<any>(null);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => setCurrentUser(user));
    return () => unsubscribe();
  }, []);

  const { data: popular = [], isLoading: loadingPopular } = useQuery({
    queryKey: ['stories', 'popular'],
    queryFn: async () => {
      const q = query(collection(db, 'stories'), orderBy('views', 'desc'), limit(5));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as Story));
    }
  });

  const { data: newReleases = [], isLoading: loadingNew } = useQuery({
    queryKey: ['stories', 'new-releases'],
    queryFn: async () => {
      const q = query(collection(db, 'stories'), orderBy('updatedAt', 'desc'), limit(5));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as Story));
    }
  });

  const { data: continueReading = [] } = useQuery({
    queryKey: ['continue-reading', currentUser?.uid],
    enabled: !!currentUser,
    queryFn: async () => {
      const q = query(
        collection(db, 'users', currentUser.uid, 'library'),
        orderBy('lastReadAt', 'desc'),
        limit(3)
      );
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ ...d.data() } as LibraryEntry));
    }
  });

  const featured = popular.length > 0 ? popular[0] : null;
  const isLoading = loadingPopular || loadingNew;

  return (
    <div className="flex flex-col gap-12 pb-20">
      
      {/* HERO SECTION */}
      <section className="relative w-full pt-4 overflow-hidden px-4 md:px-8">
        <div className="container max-w-7xl mx-auto">
          <div className="relative w-full aspect-[16/9] md:aspect-[21/8] rounded-[2.5rem] overflow-hidden shadow-2xl border border-primary/10 bg-stone-950">
            {featured ? (
              <>
                <Image 
                  src={featured.coverImage.imageUrl} 
                  alt={featured.title} 
                  fill 
                  className="object-cover opacity-50 transition-transform duration-[10000ms] hover:scale-110"
                  priority
                  placeholder="blur"
                  blurDataURL={featured.coverImage.blurHash || DEFAULT_BLUR}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent flex flex-col justify-end p-8 md:p-16">
                  <div className="max-w-2xl space-y-4">
                    <Badge className="bg-primary text-black border-none uppercase tracking-widest font-black text-[10px] px-3 py-1">À la une</Badge>
                    <h1 className="text-4xl md:text-6xl font-display font-black text-white leading-tight tracking-tighter">{featured.title}</h1>
                    <p className="text-stone-300 text-sm md:text-lg font-light italic line-clamp-2">"{featured.description}"</p>
                    <div className="flex gap-4 pt-4">
                      <Button asChild size="lg" className="rounded-full font-black px-8 gold-shimmer h-14">
                        <Link href={`/webtoon-hub/${featured.slug}/chapitre-1`}><Play className="mr-2 h-5 w-5 fill-current" /> Lire le Chapitre 1</Link>
                      </Button>
                      <Button asChild variant="outline" size="lg" className="rounded-full border-white/20 text-white hover:bg-white/10 backdrop-blur-md h-14 px-8">
                        <Link href={`/webtoon-hub/${featured.slug}`}><Info className="mr-2 h-5 w-5" /> Détails</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="container max-w-7xl mx-auto px-6 lg:px-8 space-y-20">
        
        {/* ORIGINALS TEASER */}
        <section className="animate-in fade-in duration-1000">
            <Link href="/originals" className="block group">
                <Card className="bg-stone-900 border-none rounded-[2rem] p-8 md:p-12 overflow-hidden relative shadow-2xl transition-all hover:ring-4 ring-primary/20">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 group-hover:opacity-20 transition-all duration-700">
                        <Trophy className="h-48 w-48 text-primary" />
                    </div>
                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                        <div className="space-y-4 text-center md:text-left flex-1">
                            <Badge className="bg-orange-500 text-white border-none animate-pulse">EN COURS : AFROFUTURISME 2100</Badge>
                            <h2 className="text-3xl md:text-5xl font-display font-black text-white gold-resplendant">NexusHub Originals</h2>
                            <p className="text-stone-400 text-lg font-light italic">Participez à la plus grande compétition trimestrielle de BD africaine. 5 000€ de prix à gagner.</p>
                            <Button className="rounded-full px-8 font-black bg-primary text-black h-12 shadow-lg shadow-primary/20">Voir la Compétition <ChevronRight className="ml-2 h-4 w-4" /></Button>
                        </div>
                        <div className="hidden md:flex gap-4">
                            <div className="flex flex-col items-center gap-2 p-6 bg-white/5 rounded-[2rem] border border-white/10 text-center w-32">
                                <Banknote className="h-8 w-8 text-primary" />
                                <span className="text-[10px] font-black text-white uppercase">Cash</span>
                            </div>
                            <div className="flex flex-col items-center gap-2 p-6 bg-white/5 rounded-[2rem] border border-white/10 text-center w-32">
                                <Globe className="h-8 w-8 text-emerald-500" />
                                <span className="text-[10px] font-black text-white uppercase">Promo</span>
                            </div>
                        </div>
                    </div>
                </Card>
            </Link>
        </section>

        {/* CONTINUE READING */}
        {currentUser && continueReading.length > 0 && (
          <section className="animate-in fade-in slide-in-from-left-4 duration-700">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-primary/10 p-2 rounded-lg">
                <History className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-2xl font-display font-bold uppercase tracking-tighter text-foreground">Reprendre la lecture</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {continueReading.map((entry) => (
                <Link key={entry.storyId} href={`/webtoon-hub/${entry.lastReadChapterSlug}`} className="group relative overflow-hidden bg-card border border-border/50 rounded-2xl p-4 flex gap-4 hover:border-primary/30 transition-all hover:shadow-xl">
                  <div className="relative h-24 w-16 rounded-lg overflow-hidden shrink-0 shadow-md">
                    <Image src={entry.storyCover} alt={entry.storyTitle} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <h3 className="font-bold text-sm truncate group-hover:text-primary transition-colors text-foreground">{entry.storyTitle}</h3>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold mt-1">Chap. {entry.lastReadChapterTitle}</p>
                    <div className="mt-3 space-y-1">
                      <div className="flex justify-between items-center text-[9px] uppercase font-black text-primary/60">
                        <span>Progression</span>
                        <span>{entry.progress}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary shadow-[0_0_8px_hsl(var(--primary))] transition-all duration-1000" style={{ width: `${entry.progress}%` }} />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* CLUBS DE LECTURE TEASER */}
        <section className="py-12 border-y border-border/50">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-emerald-500/10 p-2 rounded-lg"><Users className="h-6 w-6 text-emerald-500" /></div>
                        <h2 className="text-3xl font-display font-black uppercase tracking-tighter text-emerald-500">Clubs de Lecture</h2>
                    </div>
                    <p className="text-muted-foreground text-lg italic font-light max-w-xl">Rejoignez des milliers de lecteurs pour décortiquer vos chapitres préférés, voter pour des théories et partager vos fan arts.</p>
                </div>
                <Button asChild size="lg" className="rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-black h-12">
                    <Link href="/clubs">Explorer les Clubs</Link>
                </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="bg-stone-950 border-none rounded-[2rem] overflow-hidden relative shadow-2xl group cursor-pointer h-64">
                    <Image src="https://picsum.photos/seed/club1/800/400" alt="Official Club" fill className="object-cover opacity-40 group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent p-8 flex flex-col justify-end">
                        <Badge className="bg-emerald-500 text-white border-none w-fit mb-2">Club Officiel du Mois</Badge>
                        <h3 className="text-2xl font-display font-black text-white">Le Sanctuaire d'Orisha</h3>
                        <p className="text-stone-300 text-sm italic">"On discute du chapitre 15 et de la trahison de Shango !"</p>
                        <div className="flex items-center gap-4 mt-4">
                            <div className="flex -space-x-2">
                                {[1,2,3,4].map(i => <Avatar key={i} className="h-6 w-6 border-2 border-black"><AvatarImage src={`https://picsum.photos/seed/u${i}/100/100`} /></Avatar>)}
                            </div>
                            <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">+1.2k membres</span>
                        </div>
                    </div>
                </Card>
                <div className="grid grid-cols-1 gap-4">
                    {[1, 2].map(i => (
                        <div key={i} className="bg-muted/30 border border-border/50 p-6 rounded-3xl flex items-center justify-between group hover:bg-muted/50 transition-all cursor-pointer">
                            <div className="flex items-center gap-4">
                                <div className="h-14 w-14 rounded-2xl bg-stone-900 border border-white/5 flex items-center justify-center overflow-hidden">
                                    <Image src={`https://picsum.photos/seed/c${i}/100/100`} alt="Club" width={100} height={100} className="object-cover" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg text-foreground">Théories {i === 1 ? 'Cyber-Reines' : 'Légendes Kasaï'}</h4>
                                    <p className="text-xs text-muted-foreground">Discussions · {i * 20} nouveaux messages</p>
                                </div>
                            </div>
                            <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                    ))}
                </div>
            </div>
        </section>

        {/* POPULAR */}
        <section>
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-display font-bold uppercase tracking-tighter text-foreground">Tendances</h2>
            </div>
            <Button variant="link" asChild className="p-0 h-auto font-black text-xs uppercase tracking-widest text-primary">
              <Link href="/popular">Voir tout <ChevronRight className="h-4 w-4" /></Link>
            </Button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {isLoading ? [...Array(5)].map((_, i) => <div key={i} className="aspect-[3/4] bg-muted animate-pulse rounded-xl" />) : popular.map(s => <StoryCard key={s.id} story={s} />)}
          </div>
        </section>

        {/* NEW RELEASES */}
        <section>
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
              <Sparkles className="h-6 w-6 text-cyan-500" />
              <h2 className="text-2xl font-display font-bold uppercase tracking-tighter text-cyan-500">Nouveautés</h2>
            </div>
            <Button variant="link" asChild className="p-0 h-auto font-black text-xs uppercase tracking-widest text-cyan-500">
              <Link href="/new-releases">Voir tout <ChevronRight className="h-4 w-4" /></Link>
            </Button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {isLoading ? [...Array(5)].map((_, i) => <div key={i} className="aspect-[3/4] bg-muted animate-pulse rounded-xl" />) : newReleases.map(s => <StoryCard key={s.id} story={s} />)}
          </div>
        </section>
      </div>
    </div>
  );
}
