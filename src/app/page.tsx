'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StoryCard } from '@/components/story-card';
import { db, auth } from '@/lib/firebase';
import { collection, query, orderBy, limit, getDocs, doc, getDoc } from 'firebase/firestore';
import type { Story, UserProfile } from '@/lib/types';
import { useQuery } from '@tanstack/react-query';
import { onAuthStateChanged } from 'firebase/auth';
import Header from '@/components/common/header';
import Footer from '@/components/common/footer';
import { cn } from '@/lib/utils';
import { 
  Play, 
  TrendingUp, 
  Sparkles, 
  Trophy, 
  ChevronRight, 
  BrainCircuit, 
  Headphones, 
  Film, 
  Star, 
  Flame, 
  Gift,
  History, 
  Bookmark, 
  Users, 
  Zap, 
  LayoutGrid,
  Globe,
  Coins
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
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [heroLoaded, setHeroLoaded] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        const snap = await getDoc(doc(db, 'users', user.uid));
        if (snap.exists()) setUserProfile(snap.data() as UserProfile);
      }
    });
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

      {currentUser ? (
        <UserHomeView profile={userProfile} popular={popular} isLoading={isLoading} />
      ) : (
        <LandingView featured={featured} popular={popular} isLoading={isLoading} heroLoaded={heroLoaded} setHeroLoaded={setHeroLoaded} />
      )}

      <Footer />
    </div>
  );
}

/**
 * VUE CONNECTÉE : Orientée progression et personnalisation
 */
function UserHomeView({ profile, popular, isLoading }: { profile: UserProfile | null, popular: Story[], isLoading: boolean }) {
  return (
    <div className="container max-w-7xl mx-auto px-6 py-12 space-y-16 animate-in fade-in duration-1000">
      {/* 1. DASHBOARD SUMMARY */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-gradient-to-br from-stone-900 to-black border border-white/5 rounded-[2.5rem] p-8 flex flex-col md:flex-row items-center gap-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5"><Sparkles className="h-48 w-48 text-primary" /></div>
          <div className="relative z-10 text-center md:text-left space-y-4">
            <h2 className="text-3xl md:text-4xl font-display font-black text-white">Bon retour, <span className="gold-resplendant">{profile?.displayName?.split(' ')[0]}</span></h2>
            <p className="text-stone-400 italic font-light">"Votre légende continue. Prêt pour votre dose quotidienne de culture ?"</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-2">
              <Button asChild className="rounded-full px-8 font-black bg-primary text-black gold-shimmer h-12">
                <Link href="/library"><History className="mr-2 h-4 w-4" /> Reprendre la lecture</Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full border-white/10 text-white hover:bg-white/5 h-12">
                <Link href="/for-you">Exploration IA</Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="bg-stone-900 border border-primary/20 rounded-[2.5rem] p-8 flex flex-col justify-center items-center text-center space-y-4 shadow-xl">
          <div className="bg-primary/10 p-4 rounded-3xl">
            <Flame className="h-10 w-10 text-orange-500 animate-bounce" />
          </div>
          <div>
            <p className="text-4xl font-black text-white">{profile?.readingStreak?.currentCount || 0} Jours</p>
            <p className="text-[10px] uppercase font-black tracking-[0.2em] text-primary">Série de lecture active</p>
          </div>
          <p className="text-[10px] text-stone-500 font-bold italic">+2 🪙 attendus demain</p>
        </div>
      </section>

      {/* 2. RECOMMANDATIONS IA */}
      <section className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <BrainCircuit className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-2xl font-display font-black text-white uppercase tracking-tighter">Sélectionné pour vous</h2>
          </div>
          <Link href="/for-you" className="text-primary text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:underline">Voir plus <ChevronRight className="h-3 w-3" /></Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {popular.slice(0, 5).map(s => <StoryCard key={s.id} story={s} />)}
        </div>
      </section>

      {/* 3. MISES À JOUR ABONNEMENTS */}
      <section className="bg-white/[0.02] border border-white/5 rounded-[3rem] p-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-2xl font-display font-bold text-white flex items-center gap-3 justify-center md:justify-start">
              <Users className="h-6 w-6 text-emerald-500" /> Vos Créateurs Suivis
            </h3>
            <p className="text-stone-500 text-sm italic">"3 nouveaux chapitres ont été publiés par vos artistes favoris cette semaine."</p>
          </div>
          <Button variant="outline" className="rounded-full border-white/10 text-white font-bold h-11 px-8">Voir les sorties</Button>
        </div>
      </section>
    </div>
  );
}

/**
 * VUE VISITEUR : Orientée découverte et conversion
 */
function LandingView({ featured, popular, isLoading, heroLoaded, setHeroLoaded }: any) {
  return (
    <div className="flex flex-col gap-24">
      <section className="relative w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-stone-950 via-transparent to-stone-950 z-10 pointer-events-none" />
        <div className="relative w-full min-h-[85vh] flex items-end">
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

          <div className="relative z-20 container max-w-7xl mx-auto px-6 pb-20">
            <div className="max-w-3xl space-y-8">
              {featured ? (
                <>
                  <div className="space-y-4">
                    <Badge className="bg-primary text-black mb-2 uppercase tracking-widest font-black text-[10px] px-4 py-1">Exclusivité NexusHub</Badge>
                    <h1 className="text-5xl md:text-8xl font-display font-black text-white leading-[0.85] tracking-tighter mb-6">
                      L'Art <br/> Africain <br/> <span className="gold-resplendant">Réinventé.</span>
                    </h1>
                    <p className="text-stone-300 text-lg md:text-2xl font-light italic leading-relaxed max-w-xl">
                      "Plongez dans des mondes où les mythes ancestraux rencontrent le futur technologique."
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-4 pt-4">
                    <Button asChild className="h-16 px-10 rounded-full font-black text-xl gold-shimmer bg-primary text-black shadow-2xl shadow-primary/30">
                      <Link href={`/read/${featured.id}`}>Commencer l'Aventure</Link>
                    </Button>
                    <Button asChild variant="outline" className="h-16 px-10 rounded-full font-bold border-white/15 text-white hover:bg-white/10 backdrop-blur-md">
                      <Link href="/signup">S'inscrire Gratuitement</Link>
                    </Button>
                  </div>
                </>
              ) : (
                <div className="space-y-6">
                  <div className="h-24 w-full bg-stone-800 animate-pulse rounded-2xl" />
                  <div className="h-12 w-3/4 bg-stone-800 animate-pulse rounded-2xl" />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="container max-w-7xl mx-auto px-6 space-y-24">
        {/* STATS / FEATURES */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: Globe, title: "Panafricain", text: "Artistes de 15+ pays", color: "text-blue-500 bg-blue-500/10" },
            { icon: Zap, title: "Instantané", text: "Lecture optimisée mobile", color: "text-amber-500 bg-amber-500/10" },
            { icon: Coins, title: "Équitable", text: "Payez via AfriCoins", color: "text-emerald-500 bg-emerald-500/10" },
            { icon: Trophy, title: "Qualité", text: "Séries Certifiées Pro", color: "text-primary bg-primary/10" },
          ].map((item, i) => (
            <div key={i} className="bg-card/50 border border-border/50 rounded-[2rem] p-6 flex items-center gap-4 group hover:border-primary/30 transition-all">
              <div className={cn("p-3 rounded-2xl transition-transform group-hover:scale-110", item.color)}>
                <item.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{item.title}</p>
                <p className="text-lg font-black text-foreground">{item.text}</p>
              </div>
            </div>
          ))}
        </section>

        {/* TRENDING */}
        <section>
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-3xl font-display font-black text-white uppercase tracking-tighter">Tendances Mondiales</h2>
            <Link href="/rankings" className="text-primary text-[10px] font-black uppercase tracking-widest flex items-center gap-2">Tout voir <ChevronRight className="h-3 w-3" /></Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {popular.slice(0, 5).map((story) => (
              <StoryCard key={story.id} story={story} />
            ))}
          </div>
        </section>

        {/* GENRES */}
        <section className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {GENRES.map((genre) => (
            <Link key={genre.slug} href={`/genre/${genre.slug}`} className={cn('relative overflow-hidden rounded-[2rem] border border-white/5 flex flex-col items-center justify-center gap-3 py-12 px-4 bg-gradient-to-b', genre.color, 'group hover:scale-105 transition-all shadow-xl')}>
              <span className="text-5xl group-hover:scale-110 transition-transform">{genre.emoji}</span>
              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-white/80 text-center">{genre.name}</span>
            </Link>
          ))}
        </section>

        {/* AI STUDIO CTA */}
        <section className="p-12 rounded-[3.5rem] bg-stone-900 border border-primary/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity"><BrainCircuit className="h-64 w-64 text-primary" /></div>
            <div className="relative z-10 grid md:grid-cols-2 gap-16 items-center">
                <div className="space-y-8">
                    <Badge className="bg-emerald-500 text-white border-none uppercase text-[8px] font-black px-4">ESPACE CRÉATEUR</Badge>
                    <h2 className="text-4xl md:text-5xl font-display font-black text-white leading-tight">Vous avez une <br/> histoire à raconter ?</h2>
                    <p className="text-stone-400 text-lg font-light italic leading-relaxed">"Rejoignez le programme NexusHub Draft. Publiez vos planches, recevez des avis et progressez jusqu'au statut de Légende Pro."</p>
                    <Button asChild size="lg" className="rounded-full bg-primary text-black font-black px-10 h-14 gold-shimmer shadow-2xl">
                        <Link href="/submit">Lancer mon Projet <ChevronRight className="ml-2 h-5 w-5" /></Link>
                    </Button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/5 flex flex-col items-center gap-4 hover:bg-white/10 transition-colors">
                        <Film className="h-10 w-10 text-primary" />
                        <span className="text-[10px] font-black uppercase text-stone-300 tracking-widest">Storyboard AI</span>
                    </div>
                    <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/5 flex flex-col items-center gap-4 hover:bg-white/10 transition-colors">
                        <Sparkles className="h-10 w-10 text-primary" />
                        <span className="text-[10px] font-black uppercase text-stone-300 tracking-widest">Palettes Kente</span>
                    </div>
                </div>
            </div>
        </section>

        {/* REJOIGNEZ LA RÉVOLUTION */}
        <section className="py-24 border-t border-border/50 text-center space-y-12">
            <div className="max-w-3xl mx-auto space-y-6">
                <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 px-4 py-1.5 rounded-full">
                    <Globe className="h-4 w-4 text-primary" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Rejoignez la Révolution</span>
                </div>
                <h2 className="text-4xl md:text-6xl font-display font-black leading-tight tracking-tighter">Votre talent mérite <br/> un public mondial</h2>
                <p className="text-lg text-stone-400 font-light leading-relaxed italic">
                    NexusHub n'est pas qu'une plateforme, c'est un tremplin. De la production propre à l'exportation mondial, nous bâtissons l'avenir de la BD africaine.
                </p>
            </div>

            <Button asChild size="lg" className="h-16 px-12 rounded-full font-black text-xl shadow-2xl shadow-primary/20 gold-shimmer bg-primary text-black">
                <Link href="/submit">Soumettre mon Projet</Link>
            </Button>
        </section>
      </div>
    </div>
  );
}

function PlayCircle(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>
}
