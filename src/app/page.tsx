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
  Crown, 
  Award, 
  PenSquare, 
  ChevronRight, 
  History, 
  Clock, 
  BookHeart, 
  Globe, 
  Trophy, 
  Banknote 
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import Header from '@/components/common/header';
import Footer from '@/components/common/footer';
import { useQuery } from '@tanstack/react-query';
import { onAuthStateChanged } from 'firebase/auth';

const DEFAULT_BLUR = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

export default function HomePage() {
  const [currentUser, setCurrentUser] = React.useState<any>(null);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => setCurrentUser(user));
    return () => unsubscribe();
  }, []);

  // Fetch Popular Stories
  const { data: popular = [], isLoading: loadingPopular } = useQuery({
    queryKey: ['stories', 'popular'],
    queryFn: async () => {
      const q = query(collection(db, 'stories'), orderBy('views', 'desc'), limit(5));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as Story));
    }
  });

  // Fetch New Releases
  const { data: newReleases = [], isLoading: loadingNew } = useQuery({
    queryKey: ['stories', 'new-releases'],
    queryFn: async () => {
      const q = query(collection(db, 'stories'), orderBy('updatedAt', 'desc'), limit(5));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as Story));
    }
  });

  // Continue Reading Query
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

  // AI Recom Query (Preview for Home)
  const { data: forYou = [] } = useQuery({
    queryKey: ['home-for-you', currentUser?.uid],
    enabled: !!currentUser,
    queryFn: async () => {
      const q = query(collection(db, 'stories'), where('isPublished', '==', true), limit(5));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as Story));
    }
  });

  const featured = popular.length > 0 ? popular[0] : null;
  const isLoading = loadingPopular || loadingNew;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1">
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
                      className="object-cover opacity-50 transition-transform duration-10000 hover:scale-110"
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
                  <h2 className="text-2xl font-display font-bold uppercase tracking-tighter">Reprendre la lecture</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {continueReading.map((entry) => (
                    <Link key={entry.storyId} href={`/webtoon-hub/${entry.lastReadChapterSlug}`} className="group relative overflow-hidden bg-card border border-border/50 rounded-2xl p-4 flex gap-4 hover:border-primary/30 transition-all hover:shadow-xl">
                      <div className="relative h-24 w-16 rounded-lg overflow-hidden shrink-0 shadow-md">
                        <Image src={entry.storyCover} alt={entry.storyTitle} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <h3 className="font-bold text-sm truncate group-hover:text-primary transition-colors">{entry.storyTitle}</h3>
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
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all">
                        <Button size="icon" variant="ghost" className="rounded-full bg-primary/10 text-primary h-8 w-8">
                          <Play className="h-4 w-4 fill-current" />
                        </Button>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* POUR TOI - RECOM AI */}
            {currentUser && forYou.length > 0 && (
              <section className="animate-in fade-in slide-in-from-right-4 duration-700">
                <div className="flex justify-between items-center mb-8">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-lg">
                      <BookHeart className="h-6 w-6 text-primary" />
                    </div>
                    <h2 className="text-2xl font-display font-bold uppercase tracking-tighter">Pour Toi</h2>
                  </div>
                  <Button variant="link" asChild className="p-0 h-auto font-black text-xs uppercase tracking-widest text-primary">
                    <Link href="/for-you">Plus de recommandations <ChevronRight className="h-4 w-4" /></Link>
                  </Button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                  {forYou.map(s => <StoryCard key={s.id} story={s} />)}
                </div>
              </section>
            )}

            {/* TENDANCES */}
            <section>
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-6 w-6 text-primary" />
                  <h2 className="text-2xl font-display font-bold uppercase tracking-tighter">Tendances</h2>
                </div>
                <Button variant="link" asChild className="p-0 h-auto font-black text-xs uppercase tracking-widest text-primary">
                  <Link href="/popular">Voir tout <ChevronRight className="h-4 w-4" /></Link>
                </Button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {isLoading ? [...Array(5)].map((_, i) => <div key={i} className="aspect-[3/4] bg-muted animate-pulse rounded-xl" />) : popular.map(s => <StoryCard key={s.id} story={s} />)}
              </div>
            </section>

            {/* NOUVEAUTÉS */}
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

            {/* DISCOVER RÉGIONAL - AFRIQUE CENTRALE (GABON) */}
            <section className="bg-primary/5 p-8 md:p-12 rounded-[3rem] border border-primary/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Globe className="h-32 w-32 text-primary" />
              </div>
              <div className="flex flex-col md:flex-row items-center gap-12 relative z-10">
                <div className="flex-1 space-y-6">
                  <Badge variant="outline" className="border-primary/20 text-primary uppercase font-bold tracking-widest px-4 py-1">Focus Régional : Gabon 🇬🇦</Badge>
                  <h2 className="text-3xl md:text-5xl font-display font-black leading-tight tracking-tighter">Découvrez les Talents de l'Estuaire</h2>
                  <p className="text-lg text-muted-foreground font-light leading-relaxed italic">
                    Chaque semaine, notre algorithme met en lumière une pépite locale. Explorez des récits nés à Libreville, Port-Gentil ou Franceville.
                  </p>
                  <Button asChild size="lg" className="rounded-full px-10 h-14 font-black text-lg">
                    <Link href="/genre/mythologie">Explorer la Scène Locale</Link>
                  </Button>
                </div>
                <div className="w-full md:w-1/3 aspect-[3/4] relative rounded-3xl overflow-hidden shadow-2xl border-8 border-background">
                  <Image src="https://picsum.photos/seed/gabon/600/800" alt="Scène Locale" fill className="object-cover" />
                </div>
              </div>
            </section>

            {/* CTA SECTION */}
            <section className="bg-stone-900 rounded-[2.5rem] p-12 text-center relative overflow-hidden border border-white/5 shadow-2xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px]" />
              <div className="relative z-10 space-y-6">
                <div className="bg-primary/10 p-4 rounded-full w-fit mx-auto mb-4">
                  <Sparkles className="h-10 w-10 text-primary" />
                </div>
                <h2 className="text-3xl md:text-4xl font-display font-black text-white tracking-tighter">Rejoignez la Révolution Panafricaine</h2>
                <p className="text-stone-400 max-w-2xl mx-auto text-lg font-light leading-relaxed">Devenez acteur de la culture. Publiez vos œuvres, soutenez vos artistes préférés en AfriCoins et participez aux débats de la communauté.</p>
                <div className="flex flex-wrap justify-center gap-4 pt-4">
                  <Button asChild size="lg" className="rounded-full px-10 h-14 font-black text-lg shadow-xl shadow-primary/20"><Link href="/submit">Publier mon œuvre</Link></Button>
                  <Button asChild variant="outline" size="lg" className="rounded-full px-10 h-14 border-white/20 text-white hover:bg-white/5 backdrop-blur-sm"><Link href="/forums">Accéder au Forum</Link></Button>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
