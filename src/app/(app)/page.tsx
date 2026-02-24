'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { StoryCard } from '@/components/story-card';
import { db, auth } from '@/lib/firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import type { Story } from '@/lib/types';
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
  Flame,
  Zap,
  Calendar,
  Award,
  Star,
  PlayCircle,
  Coins,
  Share2,
  MessageSquare,
  Gift,
  ShieldCheck,
  Building2,
  Handshake,
  LayoutGrid,
  Languages,
  BrainCircuit,
  MapPin,
  Smile,
  Compass,
  Film,
  Headphones,
  Mic2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { onAuthStateChanged } from 'firebase/auth';
import { useTranslation } from '@/components/providers/language-provider';
import { PwaInstallBanner } from '@/components/pwa/pwa-install-banner';
import { cn } from '@/lib/utils';

export default function HomePage() {
  const { t } = useTranslation();
  const [currentUser, setCurrentUser] = React.useState<any>(null);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => setCurrentUser(user));
    return () => unsubscribe();
  }, []);

  const { data: popular = [], isLoading: loadingPopular } = useQuery({
    queryKey: ['stories', 'popular'],
    queryFn: async () => {
      const q = query(collection(db, 'stories'), orderBy('views', 'desc'), limit(10));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as Story));
    }
  });

  const featured = popular.length > 0 ? popular[0] : null;
  const isLoading = loadingPopular;

  const studiosInfo = [
    { icon: Film, title: "Studios Internes", text: "3-5 séries Originales produites par an." },
    { icon: Handshake, title: "Co-productions", text: "En partenariat avec Kugali & Afrocomics." },
    { icon: Mic2, title: "Versions Sonores", text: "Webtoons audio dramatisés en Swahili & Wolof." },
  ];

  return (
    <div className="flex flex-col gap-12 pb-20">
      <PwaInstallBanner />

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
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent flex flex-col justify-end p-8 md:p-16">
                  <div className="max-w-2xl space-y-4">
                    <Badge className="bg-primary text-black border-none uppercase tracking-widest font-black text-[10px] px-3 py-1">NexusHub Originals</Badge>
                    <h1 className="text-4xl md:text-6xl font-display font-black text-white leading-tight tracking-tighter">{featured.title}</h1>
                    <p className="text-stone-300 text-sm md:text-lg font-light italic line-clamp-2">"{featured.description}"</p>
                    <div className="flex gap-4 pt-4">
                      <Button asChild size="lg" className="rounded-full font-black px-8 gold-shimmer h-14">
                        <Link href={`/webtoon-hub/${featured.slug}/chapitre-1`}><Play className="mr-2 h-5 w-5 fill-current" /> Lire l'Épisode</Link>
                      </Button>
                      <Button asChild variant="outline" size="lg" className="rounded-full border-white/20 text-white hover:bg-white/10 backdrop-blur-md h-14 px-8">
                        <Link href={`/webtoon-hub/${featured.slug}`}><Headphones className="mr-2 h-5 w-5" /> Mode Sonore</Link>
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
        
        {/* REWARDS & ENGAGEMENT */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: Flame, title: "Streak de Lecture", text: "+2 🪙 / jour", color: "text-orange-500 bg-orange-500/10" },
            { icon: Star, title: "Artiste Parrainé", text: "+20 🪙 / Pro", color: "text-amber-500 bg-amber-500/10" },
            { icon: Gift, title: "Pub Récompensée", text: "+1 🪙 / pub", color: "text-emerald-500 bg-emerald-500/10" },
            { icon: Trophy, title: "Challenges 24h", text: "Gagnez 1000€", color: "text-primary bg-primary/10" },
          ].map((item, i) => (
            <Card key={i} className="bg-card/50 border-border/50 rounded-[2rem] hover:border-primary/20 transition-all group overflow-hidden">
              <div className="p-6 flex items-center gap-4">
                <div className={cn("p-3 rounded-2xl transition-transform group-hover:scale-110", item.color)}>
                  <item.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{item.title}</p>
                  <p className="text-xl font-black text-foreground">{item.text}</p>
                </div>
              </div>
            </Card>
          ))}
        </section>

        {/* NEXUSHUB STUDIOS TEASER */}
        <section className="animate-in fade-in duration-700">
          <div className="grid md:grid-cols-3 gap-6">
            {studiosInfo.map((info, i) => (
              <Card key={i} className="bg-stone-900 border-white/5 rounded-3xl p-6 flex items-center gap-4 group hover:border-primary/20 transition-all">
                <div className="bg-primary/10 p-3 rounded-2xl text-primary group-hover:scale-110 transition-transform">
                  <info.icon className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-black text-white text-sm uppercase tracking-tight">{info.title}</h4>
                  <p className="text-stone-500 text-xs italic">{info.text}</p>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* POPULAR STORIES */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-lg"><TrendingUp className="h-6 w-6 text-primary" /></div>
              <h2 className="text-3xl font-display font-black uppercase tracking-tighter">Les Plus Lus</h2>
            </div>
            <Button asChild variant="ghost" className="text-primary font-black text-[10px] uppercase tracking-widest">
              <Link href="/rankings">Tout le classement <ChevronRight className="ml-1 h-3 w-3" /></Link>
            </Button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {isLoading ? [...Array(5)].map((_, i) => <div key={i} className="aspect-[3/4] bg-muted animate-pulse rounded-xl" />) : popular.slice(0, 5).map(s => <StoryCard key={s.id} story={s} />)}
          </div>
        </section>

        {/* AI STUDIO QUICK ACCESS */}
        <section className="p-8 rounded-[2.5rem] bg-stone-900 border border-primary/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity"><BrainCircuit className="h-48 w-48 text-primary" /></div>
            <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
                <div className="space-y-6">
                    <Badge className="bg-emerald-500 text-white border-none uppercase text-[8px] font-black tracking-widest px-3">NOUVEAU : NEXUSHUB AI STUDIO</Badge>
                    <h2 className="text-4xl font-display font-black text-white leading-tight">Assistance Créative <br/> de Prochaine Génération</h2>
                    <p className="text-stone-400 text-lg font-light italic">"Storyboard, Colorisation textile et Consistance de personnages. Libérez votre génie avec nos outils IA spécialisés."</p>
                    <Button asChild size="lg" className="rounded-full bg-primary text-black font-black px-8 h-14 gold-shimmer shadow-2xl shadow-primary/20">
                        <Link href="/dashboard/ai-studio">Découvrir le Studio AI <ChevronRight className="ml-2 h-5 w-5" /></Link>
                    </Button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex flex-col items-center gap-2">
                        <LayoutGrid className="h-6 w-6 text-primary" />
                        <span className="text-[10px] font-bold uppercase text-stone-300">Storyboard</span>
                    </div>
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex flex-col items-center gap-2">
                        <Sparkles className="h-6 w-6 text-primary" />
                        <span className="text-[10px] font-bold uppercase text-stone-300">Palettes</span>
                    </div>
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex flex-col items-center gap-2">
                        <Mic2 className="h-6 w-6 text-primary" />
                        <span className="text-[10px] font-bold uppercase text-stone-300">SFX Sonores</span>
                    </div>
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex flex-col items-center gap-2">
                        <ShieldCheck className="h-6 w-6 text-primary" />
                        <span className="text-[10px] font-bold uppercase text-stone-300">Anti-Burnout</span>
                    </div>
                </div>
            </div>
        </section>

        {/* VISION & CTA */}
        <section className="py-24 border-t border-border/50 text-center space-y-12">
            <div className="max-w-3xl mx-auto space-y-6">
                <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 px-4 py-1.5 rounded-full">
                    <Globe className="h-4 w-4 text-primary" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Rejoignez la Révolution</span>
                </div>
                <h2 className="text-4xl md:text-6xl font-display font-black leading-tight tracking-tighter">Votre talent mérite <br/> un public mondial</h2>
                <p className="text-lg text-stone-400 font-light leading-relaxed italic">
                    NexusHub n'est pas qu'une plateforme, c'est un tremplin. De la production propre à l'exportation mondiale, nous bâtissons l'avenir de la BD africaine.
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
