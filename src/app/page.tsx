'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
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
  Play, TrendingUp, Sparkles, Trophy, ChevronRight, BrainCircuit, 
  Headphones, Film, Star, Flame, Gift, History, Bookmark, 
  Users, Zap, LayoutGrid, Globe, Coins, Mic2, MapPin, 
  Activity, Timer, Languages, Map, MessageSquare, CheckCircle2,
  ArrowUpRight, Heart, Share2, PlayCircle
} from 'lucide-react';

const REGIONS = [
  { name: 'Afrique de l\'Ouest', slug: 'west', flag: '🇸🇳', color: 'bg-emerald-500/10 border-emerald-500/20' },
  { name: 'Afrique Centrale', slug: 'central', flag: '🇬🇦', color: 'bg-primary/10 border-primary/20' },
  { name: 'Afrique de l\'Est', slug: 'east', flag: '🇰🇪', color: 'bg-blue-500/10 border-blue-500/20' },
  { name: 'Afrique Australe', slug: 'south', flag: '🇿🇦', color: 'bg-amber-500/10 border-amber-500/20' },
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
      const q = query(collection(db, 'stories'), orderBy('views', 'desc'), limit(15));
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

// ==================== VUE UTILISATEUR CONNECTÉ ====================
function UserHomeView({ profile, popular, isLoading }: { profile: UserProfile | null, popular: Story[], isLoading: boolean }) {
  return (
    <div className="container max-w-7xl mx-auto px-6 py-8 space-y-16 animate-in fade-in duration-1000">
      
      {/* 1. AFRI-COINS DAILY BANNER */}
      <section className="bg-primary/10 border border-primary/20 rounded-3xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg shadow-primary/5">
        <div className="flex items-center gap-4">
          <div className="bg-primary/20 p-2 rounded-xl animate-pulse">
            <Coins className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm font-black text-white uppercase tracking-widest">Bonus Quotidien</p>
            <p className="text-xs text-primary font-bold italic">Vous avez gagné 2 🪙 aujourd'hui !</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] text-stone-500 uppercase font-black">Prochain palier</p>
            <p className="text-xs text-white font-bold">5 min de lecture pour +1 🪙</p>
          </div>
          <Button size="sm" className="rounded-full bg-primary text-black font-black px-6 h-9">Détails</Button>
        </div>
      </section>

      {/* 2. REPRENDRE LA LECTURE */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xl font-display font-black text-white flex items-center gap-2">
              <History className="h-5 w-5 text-primary" /> En cours de lecture
            </h2>
            <Link href="/library" className="text-[10px] font-black text-stone-500 uppercase hover:text-primary transition-colors">Tout voir</Link>
          </div>
          
          <div className="bg-stone-900 border border-white/5 rounded-[2.5rem] p-6 flex flex-col md:flex-row items-center gap-6 hover:border-primary/20 transition-all group">
            <div className="relative h-32 w-24 rounded-2xl overflow-hidden shadow-2xl shrink-0">
              <Image 
                src={popular[1]?.coverImage?.imageUrl || 'https://picsum.photos/seed/read/400/600'} 
                alt="Story" 
                fill 
                className="object-cover group-hover:scale-110 transition-transform" 
                blurDataURL={popular[1]?.coverImage?.blurHash}
                placeholder={popular[1]?.coverImage?.blurHash ? "blur" : "empty"}
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Play className="h-8 w-8 text-primary fill-current" />
              </div>
            </div>
            <div className="flex-1 space-y-4 w-full">
              <div>
                <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors">{popular[1]?.title || "Chroniques d'Orisha"}</h3>
                <p className="text-xs text-stone-500 font-bold uppercase tracking-tighter mt-1">Dernière lecture : Chapitre 14</p>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-black uppercase text-stone-600">
                  <span>Progression</span>
                  <span>75%</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: '75%' }} />
                </div>
              </div>
            </div>
            <Button asChild variant="outline" className="rounded-full px-8 hover:bg-primary hover:text-black">
              <Link href="/read/1">Reprendre</Link>
            </Button>
          </div>
        </div>

        {/* STREAK CARD */}
        <div className="bg-stone-900 border border-primary/20 rounded-[2.5rem] p-8 flex flex-col justify-center items-center text-center space-y-4 shadow-xl relative overflow-hidden group">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
          <div className="bg-primary/10 p-4 rounded-3xl relative z-10">
            <Flame className="h-10 w-10 text-orange-500 animate-bounce" />
          </div>
          <div className="relative z-10">
            <p className="text-5xl font-black text-white tracking-tighter">{profile?.readingStreak?.currentCount || 0} Jours</p>
            <p className="text-[10px] uppercase font-black tracking-[0.2em] text-primary">Série de lecture active</p>
          </div>
          <p className="text-[10px] text-stone-500 font-bold italic relative z-10">Gardez le feu sacré allumé !</p>
        </div>
      </section>

      {/* 3. POUR TOI (IA RECOMMANDATIONS) */}
      <section className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <BrainCircuit className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-2xl font-display font-black text-white uppercase tracking-tighter">Pour Toi : Affinités IA</h2>
          </div>
          <Badge variant="outline" className="border-primary/20 text-primary text-[8px] font-black uppercase px-3">Algorithme Nexus v4</Badge>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {popular.slice(2, 7).map(s => <StoryCard key={s.id} story={s} />)}
        </div>
      </section>

      {/* 4. CLUBS DE LECTURE ACTIFS */}
      <section className="p-10 rounded-[3rem] bg-stone-900 border border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5"><Users className="h-48 w-48 text-emerald-500" /></div>
        <div className="flex flex-col md:flex-row items-center justify-between gap-12 relative z-10">
          <div className="space-y-4 text-center md:text-left max-w-xl">
            <Badge className="bg-emerald-500 text-white border-none uppercase text-[8px] font-black px-3">COMMUNAUTÉ ACTIVE</Badge>
            <h2 className="text-3xl font-display font-black text-white leading-tight">Rejoignez les Cercles de Discussion</h2>
            <p className="text-stone-400 italic">"Ne lisez plus jamais seul. Participez aux débats enflammés sur vos séries préférées avec des milliers de passionnés."</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full md:w-auto">
            <Card className="bg-white/5 border-white/10 p-4 rounded-2xl flex items-center gap-4 hover:bg-white/10 transition-colors cursor-pointer">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/20 flex items-center justify-center"><MessageSquare className="h-5 w-5 text-emerald-500" /></div>
              <div>
                <p className="text-xs font-bold text-white">Le Sanctuaire d'Orisha</p>
                <p className="text-[9px] text-stone-500 uppercase font-black">1 245 membres en direct</p>
              </div>
            </Card>
            <Card className="bg-white/5 border-white/10 p-4 rounded-2xl flex items-center gap-4 hover:bg-white/10 transition-colors cursor-pointer">
              <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center"><Activity className="h-5 w-5 text-primary" /></div>
              <div>
                <p className="text-xs font-bold text-white">Cyber-Reines Fans</p>
                <p className="text-[9px] text-stone-500 uppercase font-black">850 débats aujourd'hui</p>
              </div>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}

// ==================== VUE LANDING (VISITEURS) ====================
function LandingView({ featured, popular, isLoading, heroLoaded, setHeroLoaded }: any) {
  return (
    <div className="flex flex-col gap-24">
      {/* 1. HERO EXCLUSIF */}
      <section className="relative w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-stone-950 via-transparent to-stone-950 z-10 pointer-events-none" />
        <div className="relative w-full min-h-[85vh] flex items-end">
          {featured && (
            <div className="absolute inset-0">
              <Image
                src={featured.coverImage.imageUrl}
                alt={featured.title}
                fill
                className={cn(
                  'object-cover transition-all duration-[3000ms]',
                  heroLoaded ? 'opacity-35 scale-100' : 'opacity-0 scale-105'
                )}
                priority
                placeholder="blur"
                blurDataURL={featured.coverImage.blurHash}
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
                    <Button asChild size="lg" className="h-16 px-10 rounded-full font-black text-xl shadow-2xl shadow-primary/30">
                      <Link href={`/read/${featured.id}`}>Commencer l'Aventure</Link>
                    </Button>
                    <Button asChild variant="outline" size="lg" className="h-16 px-10 rounded-full font-bold border-white/15 text-white hover:bg-white/10 backdrop-blur-md">
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
        
        {/* 2. STATS PLATEFORME & PROFIL ARTISTES */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: Globe, title: "Panafricain", text: "15+ Pays représentés", color: "text-blue-500 bg-blue-500/10" },
            { icon: Languages, title: "Multilingue", text: "6 Langues régionales", color: "text-emerald-500 bg-emerald-500/10" },
            { icon: Coins, title: "Économie", text: "Payé en AfriCoins", color: "text-amber-500 bg-amber-500/10" },
            { icon: Users, title: "Fans", text: "50k+ Passionnés", color: "text-primary bg-primary/10" },
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

        {/* 3. DÉCOUVERTE PAR RÉGION (EXCLUSIVITÉ NEXUSHUB) */}
        <section className="space-y-10">
          <div className="text-center space-y-2">
            <h2 className="text-3xl md:text-4xl font-display font-black text-white uppercase tracking-tighter">Découverte par Région</h2>
            <p className="text-stone-500 italic font-light">"Chaque coin du continent a sa propre façon de raconter."</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {REGIONS.map((region) => (
              <Link key={region.slug} href={`/search?region=${region.name}`} className={cn("p-8 rounded-[2.5rem] border flex flex-col items-center justify-center gap-4 group hover:scale-105 transition-all shadow-xl", region.color)}>
                <span className="text-5xl group-hover:rotate-12 transition-transform">{region.flag}</span>
                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-white/80 text-center">{region.name}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* 4. TENDANCES MONDIALES */}
        <section>
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-lg"><TrendingUp className="h-6 w-6 text-primary" /></div>
              <h2 className="text-3xl font-display font-black text-white uppercase tracking-tighter">Tendances Mondiales</h2>
            </div>
            <Link href="/rankings" className="text-primary text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:underline">Voir tout le classement <ChevronRight className="h-3 w-3" /></Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {popular.slice(0, 5).map((story) => (
              <StoryCard key={story.id} story={story} />
            ))}
          </div>
        </section>

        {/* 5. ORIGINALS & CONCOURS (AIMANT CRÉATEURS) */}
        <section className="bg-stone-900 border border-primary/20 rounded-[3.5rem] p-12 relative overflow-hidden group shadow-2xl">
          <div className="absolute top-0 right-0 p-8 opacity-5"><Trophy className="h-64 w-64 text-primary" /></div>
          <div className="relative z-10 grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Badge className="bg-emerald-500 text-white border-none uppercase text-[8px] font-black px-3">CONCOURS ACTIF</Badge>
                  <div className="flex items-center gap-2 text-primary font-bold text-[10px] uppercase tracking-widest">
                    <Timer className="h-3.5 w-3.5" /> 12j : 05h : 42m
                  </div>
                </div>
                <h2 className="text-4xl md:text-5xl font-display font-black text-white leading-tight">Afrofuturisme 2100 : <br/>Le Grand Défi</h2>
                <p className="text-stone-400 text-lg font-light italic leading-relaxed">
                  "Imaginez l'Afrique du prochain siècle. 5 000€ de dotation et un contrat NexusHub Originals pour le gagnant."
                </p>
              </div>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" className="rounded-full px-10 h-14 shadow-2xl">Participer au concours</Button>
                <Button variant="outline" size="lg" className="rounded-full border-white/10 text-white font-bold h-14 px-8">Voir les Originals</Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-white/5 border-white/5 p-6 rounded-[2rem] text-center space-y-2">
                <p className="text-3xl font-black text-primary">5 000€</p>
                <p className="text-[9px] text-stone-500 uppercase font-black">Grand Prix Cash</p>
              </Card>
              <Card className="bg-white/5 border-white/5 p-6 rounded-[2rem] text-center space-y-2">
                <p className="text-3xl font-black text-emerald-500">50k 🪙</p>
                <p className="text-[9px] text-stone-500 uppercase font-black">Bonus AfriCoins</p>
              </Card>
            </div>
          </div>
        </section>

        {/* 6. AI STUDIO TEASER */}
        <section className="p-12 rounded-[3rem] border border-white/5 bg-gradient-to-br from-stone-900 to-black relative overflow-hidden group">
            <div className="absolute -bottom-10 -left-10 p-8 opacity-5"><BrainCircuit className="h-64 w-64 text-primary" /></div>
            <div className="relative z-10 grid md:grid-cols-2 gap-16 items-center">
                <div className="space-y-6">
                    <Badge className="bg-primary text-black uppercase text-[8px] font-black px-4">POUR LES ARTISTES</Badge>
                    <h2 className="text-4xl font-display font-black text-white leading-tight">Boostez votre production avec l'IA</h2>
                    <p className="text-stone-400 text-lg font-light italic leading-relaxed">"Storyboard automatique, palettes textiles Kente et aide à la consistance des personnages. Libérez votre génie, NexusHub s'occupe du reste."</p>
                    <Button asChild size="lg" className="rounded-full bg-white text-black font-black px-10 h-14 shadow-2xl hover:bg-stone-200">
                        <Link href="/dashboard/ai-studio">Accéder au Studio AI <ChevronRight className="ml-2 h-5 w-5" /></Link>
                    </Button>
                </div>
                <div className="relative aspect-video rounded-3xl overflow-hidden border-8 border-white/5 shadow-2xl">
                  <Image src="https://res.cloudinary.com/demo/image/upload/v1/samples/people/artist-working.jpg" alt="AI Studio" fill className="object-cover opacity-60" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-black/60 backdrop-blur-xl p-4 rounded-2xl border border-white/10 flex items-center gap-3">
                      <Sparkles className="h-6 w-6 text-primary" />
                      <span className="text-[10px] font-black text-white uppercase tracking-widest">Optimisation IA Active</span>
                    </div>
                  </div>
                </div>
            </div>
        </section>

        {/* 7. CTA CRÉATEUR DIFFÉRENCIÉ (TRANSPARENCE) */}
        <section className="py-24 border-t border-border/50 text-center space-y-12">
            <div className="max-w-3xl mx-auto space-y-6">
                <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 px-4 py-1.5 rounded-full">
                    <Globe className="h-4 w-4 text-primary" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Rejoignez la Révolution</span>
                </div>
                <h2 className="text-4xl md:text-6xl font-display font-black leading-tight tracking-tighter">Vivez de votre talent</h2>
                <p className="text-lg text-stone-400 font-light leading-relaxed italic">
                    "Plus de 12 000€ ont été reversés à nos artistes Pro le mois dernier via les AfriCoins et les dons directs. Pas de frais cachés, juste votre art."
                </p>
            </div>

            <div className="flex flex-col items-center gap-8">
              <Button asChild size="lg" className="h-16 px-12 rounded-full font-black text-xl shadow-2xl shadow-primary/20 bg-primary text-black">
                  <Link href="/submit">Lancer mon Projet Maintenant</Link>
              </Button>
              
              <div className="flex flex-wrap justify-center gap-8 text-stone-500 text-[10px] font-black uppercase tracking-widest">
                <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> 70% de revenus Artiste</div>
                <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Publication 100% Gratuite</div>
                <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Support Multilingue Auto</div>
              </div>
            </div>
        </section>
      </div>
    </div>
  );
}
