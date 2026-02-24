'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { StoryCard } from '@/components/story-card';
import { db, auth } from '@/lib/firebase';
import { collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore';
import type { Story, UserProfile } from '@/lib/types';
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
  Languages
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useQuery } from '@tanstack/react-query';
import { onAuthStateChanged } from 'firebase/auth';
import { useTranslation } from '@/components/providers/language-provider';
import { PwaInstallBanner } from '@/components/pwa/pwa-install-banner';

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

  const { data: artists = [] } = useQuery({
    queryKey: ['featured-artists'],
    queryFn: async () => {
      const q = query(collection(db, 'users'), limit(6));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ uid: d.id, ...d.data() } as UserProfile));
    }
  });

  const featured = popular.length > 0 ? popular[0] : null;
  const isLoading = loadingPopular;

  const rewardSteps = [
    { icon: Flame, title: "Streak Quotidien", reward: "+2 🪙", desc: "Lisez chaque jour pour accumuler des coins." },
    { icon: Share2, title: "Partage Social", reward: "+5 🪙", desc: "Invitez un ami et gagnez dès son inscription." },
    { icon: Languages, title: "Traduction", reward: "+10 🪙", desc: "Contribuez aux traductions communautaires." },
    { icon: Users, title: "Parrainage Artiste", reward: "+20 🪙", desc: "Gagnez gros si votre ami devient un artiste Pro." },
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
        
        {/* REWARDS & ECONOMY QUICK ACCESS */}
        <section className="animate-in fade-in duration-700">
          <div className="flex items-center justify-between mb-8">
            <div className="space-y-1">
              <h2 className="text-2xl font-display font-black uppercase tracking-tighter flex items-center gap-2">
                <Gift className="h-6 w-6 text-primary" /> Gagnez des AfriCoins
              </h2>
              <p className="text-muted-foreground text-sm italic font-light">Votre engagement est une monnaie précieuse.</p>
            </div>
            <Button asChild variant="ghost" className="text-primary font-black text-[10px] uppercase tracking-widest">
              <Link href="/africoins">Voir tout le système <ChevronRight className="ml-1 h-3 w-3" /></Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {rewardSteps.map((step, i) => (
              <Card key={i} className="bg-card/50 border-border/50 rounded-2xl hover:border-primary/30 transition-all group">
                <CardContent className="p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="bg-primary/10 p-2.5 rounded-xl text-primary group-hover:scale-110 transition-transform">
                      <step.icon className="h-5 w-5" />
                    </div>
                    <Badge className="bg-primary text-black border-none font-black text-[10px]">{step.reward}</Badge>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-foreground">{step.title}</h4>
                    <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed italic">"{step.desc}"</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* TRANSLATION HIGHLIGHT */}
        <section className="p-12 rounded-[3rem] bg-emerald-950/20 border border-emerald-500/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-12 opacity-5"><Languages className="h-64 w-64 text-emerald-500" /></div>
            <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                    <Badge className="bg-emerald-500 text-white border-none uppercase text-[8px] font-black tracking-widest px-3">Nouveauté : Hub de Traduction</Badge>
                    <h2 className="text-4xl font-display font-black text-white">Le monde parle votre langue</h2>
                    <p className="text-emerald-100/70 text-lg leading-relaxed font-light italic">
                        "Grâce à notre programme de traducteurs certifiés et notre IA culturelle, découvrez des œuvres en Hausa, Wolof, Yoruba et plus encore. Brisons les barrières de la langue."
                    </p>
                    <div className="flex gap-4">
                        <Button asChild className="rounded-full bg-emerald-500 text-black font-black px-8">
                            <Link href="/translators">Devenir Traducteur Certifié</Link>
                        </Button>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-6 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 text-center">
                        <p className="text-3xl font-black text-emerald-500">12+</p>
                        <p className="text-[10px] font-bold text-white uppercase tracking-widest">Langues Africaines</p>
                    </div>
                    <div className="p-6 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 text-center">
                        <p className="text-3xl font-black text-emerald-500">500+</p>
                        <p className="text-[10px] font-bold text-white uppercase tracking-widest">Traducteurs Actifs</p>
                    </div>
                </div>
            </div>
        </section>

        {/* FOR YOU - IA SECTION */}
        <section>
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12">
                <div className="space-y-2 text-center md:text-left">
                    <div className="flex items-center gap-3 justify-center md:justify-start">
                        <div className="bg-emerald-500/10 p-2 rounded-lg"><Sparkles className="h-6 w-6 text-emerald-500" /></div>
                        <h2 className="text-3xl font-display font-black uppercase tracking-tighter text-emerald-500">Pour Toi</h2>
                    </div>
                    <p className="text-muted-foreground text-lg italic font-light max-w-xl">Des pépites sélectionnées par notre algorithme selon vos goûts et affinités culturelles.</p>
                </div>
                <Button asChild variant="outline" size="lg" className="rounded-full border-emerald-500/20 text-emerald-500 font-black h-12">
                    <Link href="/for-you">Voir toutes les recommandations</Link>
                </Button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {isLoading ? [...Array(5)].map((_, i) => <div key={i} className="aspect-[3/4] bg-muted animate-pulse rounded-xl" />) : popular.slice(0, 5).map(s => <StoryCard key={s.id} story={s} />)}
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
                    NexusHub n'est pas qu'une plateforme, c'est un tremplin. Que vous soyez un maître confirmé ou un nouveau visage du 9ème art, nous vous offrons les outils pour vivre de votre passion.
                </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
                {[
                    { label: "Visibilité", icon: Flame },
                    { label: "Monétisation", icon: Star },
                    { label: "Mentorat", icon: Users },
                    { label: "Certification", icon: Award }
                ].map((item, i) => (
                    <div key={i} className="flex flex-col items-center gap-3 p-6 bg-muted/30 rounded-3xl border border-border/50">
                        <div className="bg-primary/10 p-3 rounded-2xl"><item.icon className="h-6 w-6 text-primary" /></div>
                        <span className="font-bold text-xs uppercase tracking-widest">{item.label}</span>
                    </div>
                ))}
            </div>

            <Button asChild size="lg" className="h-16 px-12 rounded-full font-black text-xl shadow-2xl shadow-primary/20 gold-shimmer bg-primary text-black">
                <Link href="/submit">Soumettre mon Projet</Link>
            </Button>
        </section>
      </div>
    </div>
  );
}
