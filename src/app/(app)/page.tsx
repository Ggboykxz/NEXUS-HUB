'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { StoryCard } from '@/components/story-card';
import { db, auth } from '@/lib/firebase';
import { collection, query, where, orderBy, limit, getDocs, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import type { Story, UserProfile, LibraryEntry } from '@/lib/types';
import { useQuery } from '@tanstack/react-query';
import Header from '@/components/common/header';
import Footer from '@/components/common/footer';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/components/providers/language-provider';
import { useAuth } from '@/hooks/use-auth';
import { onAuthStateChanged } from 'firebase/auth';
import {
  Play, TrendingUp, Sparkles, ChevronRight, BrainCircuit,
  Headphones, Film, Star, Flame, Gift, History,
  Users, Zap, Globe, Coins, Mic2, MessageSquare, CheckCircle2,
  Heart, Trophy, Handshake, BookOpen, Settings, X
} from 'lucide-react';

export default function RootHomePage() {
  const { currentUser, profile } = useAuth();
  const [heroLoaded, setHeroLoaded] = useState(false);

  const { data: popular = [], isLoading } = useQuery<Story[]>({
    queryKey: ['stories', 'popular'],
    queryFn: async () => {
      try {
        const storiesRef = collection(db, 'stories');
        let q;
        try {
          q = query(storiesRef, where('isPublished', '==', true), orderBy('views', 'desc'), limit(15));
          const snap = await getDocs(q);
          return snap.docs.map(d => ({ id: d.id, ...d.data() } as Story));
        } catch (e) {
          q = query(storiesRef, limit(15));
          const snap = await getDocs(q);
          return snap.docs.map(d => ({ id: d.id, ...d.data() } as Story)).filter(s => s.isPublished);
        }
      } catch (error) {
        console.error("Error fetching popular stories: ", error);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000,
  });

  return (
    <div className="flex flex-col bg-stone-950 min-h-screen">
      {currentUser ? (
        <UserHomeView profile={profile} currentUser={currentUser} popular={popular} isLoadingPopular={isLoading} />
      ) : (
        <LandingView popular={popular} isLoading={isLoading} heroLoaded={heroLoaded} setHeroLoaded={setHeroLoaded} />
      )}
    </div>
  );
}

function StoryGridSkeleton({ count = 5 }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="aspect-[3/4] w-full bg-stone-900 animate-pulse rounded-2xl border border-white/5" />
          <Skeleton className="h-4 w-3/4 bg-stone-900" />
          <Skeleton className="h-3 w-1/2 bg-stone-900/50" />
        </div>
      ))}
    </div>
  );
}

function UserHomeView({ profile, currentUser, popular, isLoadingPopular }: { profile: UserProfile | null, currentUser: any, popular: Story[], isLoadingPopular: boolean }) {
  const { t } = useTranslation();
  const [onboardingVisible, setOnboardingVisible] = useState(false);

  useEffect(() => {
    if (profile && !profile.onboardingCompleted) {
      const createdAtDate = (profile.createdAt as any)?.toDate
        ? (profile.createdAt as any).toDate()
        : profile.createdAt ? new Date(profile.createdAt as string) : new Date();

      const hoursSinceCreation = (new Date().getTime() - createdAtDate.getTime()) / (1000 * 60 * 60);

      if (hoursSinceCreation < 48) {
        setOnboardingVisible(true);
      }
    }
  }, [profile]);

  const handleDismissOnboarding = async () => {
    setOnboardingVisible(false);
    if (currentUser) {
      try {
        await updateDoc(doc(db, 'users', currentUser.uid), {
          onboardingCompleted: true,
          updatedAt: serverTimestamp()
        });
      } catch (error) {
        console.error("Error updating user onboarding status: ", error);
      }
    }
  };

  const { data: library = [], isLoading: isLoadingLibrary } = useQuery({
    queryKey: ['user-library-home', currentUser?.uid],
    enabled: !!currentUser,
    queryFn: async () => {
      try {
        const q = query(
          collection(db, 'users', currentUser.uid, 'library'),
          orderBy('lastReadAt', 'desc'),
          limit(3)
        );
        const snap = await getDocs(q);
        return snap.docs.map(d => d.data() as LibraryEntry);
      } catch (error) {
        console.error("Error fetching user library: ", error);
        return [];
      }
    }
  });

  const featured = popular.length > 0 ? popular[0] : null;

  return (
    <div className="container max-w-7xl mx-auto px-6 py-8 space-y-20 animate-in fade-in duration-1000">
      <section className="relative w-full overflow-hidden">
        <div className="relative w-full aspect-[16/9] md:aspect-[21/8] rounded-[2.5rem] overflow-hidden shadow-2xl border border-primary/10 bg-stone-950">
          {isLoadingPopular ? (
            <Skeleton className="w-full h-full bg-stone-900 animate-pulse" />
          ) : featured ? (
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
                      <Link href={`/read/${featured.id}`}><Play className="mr-2 h-5 w-5 fill-current" /> {t('common.read')}</Link>
                    </Button>
                    <Button asChild variant="outline" size="lg" className="rounded-full border-white/20 text-white hover:bg-white/10 backdrop-blur-md h-14 px-8">
                      <Link href={`/read/${featured.id}`}><Headphones className="mr-2 h-5 w-5" /> Mode Sonore</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </section>

      {onboardingVisible && (
        <section className="animate-in slide-in-from-top-10 duration-700">
          <Card className="bg-stone-900 border-primary/20 rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 p-8 opacity-5"><Sparkles className="h-64 w-64 text-primary" /></div>
            <button
              onClick={handleDismissOnboarding}
              className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 text-stone-500 hover:text-white transition-all z-20"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="relative z-10 space-y-10">
              <div className="space-y-4 text-center md:text-left max-w-xl">
                <Badge className="bg-primary text-black uppercase text-[10px] font-black tracking-widest px-4 py-1">NOUVEAU VOYAGEUR</Badge>
                <h2 className="text-3xl md:text-5xl font-display font-black text-white tracking-tighter">Bienvenue au Hub, {profile?.displayName}!</h2>
                <p className="text-stone-400 text-lg font-light italic max-w-2xl mx-auto md:mx-0">
                  "Votre quête commence ici. Voici quelques étapes pour maîtriser l'univers du Nexus."
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { icon: BookOpen, label: "Explorer le catalogue", sub: "Dénichez votre prochaine épopée", href: "/stories", color: "text-primary" },
                  { icon: Settings, label: "Configurer mon profil", sub: "Affirmez votre identité numérique", href: "/settings", color: "text-emerald-500" },
                  { icon: Coins, label: "Découvrir les AfriCoins", sub: "Comprendre l'économie du Hub", href: "/africoins", color: "text-amber-500" }
                ].map((item, i) => (
                  <Link key={i} href={item.href} className="group">
                    <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem] hover:border-primary/50 transition-all h-full space-y-4">
                      <div className={cn("p-3 rounded-2xl bg-white/5 group-hover:scale-110 transition-transform", item.color)}>
                        <item.icon className="h-6 w-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white flex items-center gap-2">{item.label} <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-all" /></h4>
                        <p className="text-[10px] text-stone-500 uppercase font-black tracking-widest mt-1">{item.sub}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </Card>
        </section>
      )}

      <section className="space-y-8">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <BrainCircuit className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-2xl font-display font-black text-white uppercase tracking-tighter">{t('home.for_you_title')}</h2>
          </div>
          <Badge variant="outline" className="border-primary/20 text-primary text-[8px] font-black uppercase px-3">Algorithme Nexus v4</Badge>
        </div>

        {isLoadingPopular ? (
          <StoryGridSkeleton />
        ) : popular.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {popular.slice(0, 5).map(s => <StoryCard key={s.id} story={s} />)}
          </div>
        ) : (
          <div className="text-center py-12 border-2 border-dashed border-white/5 rounded-[2.5rem]">
            <p className="text-stone-500 italic">"Explorez le catalogue pour obtenir des recommandations."</p>
          </div>
        )}
      </section>

      <section className="space-y-8">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-orange-500/10">
              <History className="h-5 w-5 text-orange-500" />
            </div>
            <h2 className="text-2xl font-display font-black text-white uppercase tracking-tighter">Continuer la lecture</h2>
          </div>
          <Link href="/library" className="text-[10px] font-black text-stone-500 uppercase hover:text-primary transition-colors">{t('nav.library')}</Link>
        </div>

        {isLoadingLibrary ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-stone-900 border border-white/5 rounded-[2.5rem] p-5 flex items-center gap-5">
                <Skeleton className="h-24 w-16 rounded-xl bg-stone-800 shrink-0" />
                <div className="flex-1 min-w-0 space-y-3">
                  <Skeleton className="h-4 w-3/4 bg-stone-800" />
                  <Skeleton className="h-2 w-full bg-stone-800" />
                  <Skeleton className="h-6 w-full bg-stone-800 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : library.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {library.map((entry) => (
              <div key={entry.storyId} className="bg-stone-900 border border-white/5 rounded-[2.5rem] p-5 flex items-center gap-5 hover:border-primary/20 transition-all group shadow-xl">
                <div className="relative h-24 w-16 rounded-xl overflow-hidden shadow-lg shrink-0">
                  <Image src={entry.storyCover} alt={entry.storyTitle} fill className="object-cover group-hover:scale-110 transition-transform" sizes="(max-width: 640px) 25vw, 100px" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="h-6 w-6 text-primary fill-current" />
                  </div>
                </div>
                <div className="flex-1 min-w-0 space-y-2">
                  <h3 className="text-sm font-bold text-white truncate">{entry.storyTitle}</h3>
                  <p className="text-[9px] text-stone-500 font-bold uppercase tracking-widest">Épisode {entry.lastReadChapterTitle}</p>
                  <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${entry.progress}%` }} />
                  </div>
                  <Button asChild size="sm" variant="ghost" className="h-7 w-full rounded-lg text-[9px] font-black uppercase bg-white/5 hover:bg-primary hover:text-black">
                    <Link href={`/read/${entry.storyId}`}>{t('common.read')}</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white/5 rounded-[2.5rem] border-2 border-dashed border-white/10">
            <p className="text-stone-500 italic text-sm">"Vos lectures récentes apparaîtront ici."</p>
          </div>
        )}
      </section>
    </div>
  );
}

function LandingView({ popular, isLoading, heroLoaded, setHeroLoaded }: any) {
  const { t } = useTranslation();
  const [heroIndex, setHeroIndex] = useState(0);

  useEffect(() => {
    if (popular.length === 0) return;
    const interval = setInterval(() => {
      setHeroLoaded(false);
      setHeroIndex((prev: number) => (prev + 1) % Math.min(5, popular.length));
    }, 8000);
    return () => clearInterval(interval);
  }, [popular, setHeroLoaded]);

  const featured = popular[heroIndex];

  return (
    <div className="flex flex-col gap-24">
      <section className="relative w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-stone-950 via-transparent to-stone-950 z-10 pointer-events-none" />
        <div className="relative w-full min-h-[85vh] flex items-end">
          {isLoading ? (
            <div className="absolute inset-0">
              <Skeleton className="w-full h-full min-h-[85vh] bg-stone-900 animate-pulse rounded-none" />
              <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-950/60 to-transparent" />
            </div>
          ) : featured ? (
            <div className="absolute inset-0 transition-opacity duration-1000">
              <Image
                key={featured.id}
                src={featured.coverImage.imageUrl}
                alt={featured.title}
                fill
                className={cn(
                  'object-cover transition-all duration-[3000ms]',
                  heroLoaded ? 'opacity-35 scale-100' : 'opacity-0 scale-105'
                )}
                priority={true}
                fetchPriority="high"
                onLoad={() => setHeroLoaded(true)}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-950/60 to-transparent" />
            </div>
          ) : null}

          <div className="relative z-20 container max-w-7xl mx-auto px-6 pb-24">
            <div className="max-w-3xl space-y-8">
              {isLoading ? (
                <div className="space-y-6">
                  <Skeleton className="h-4 w-24 bg-stone-800" />
                  <Skeleton className="h-20 w-full bg-stone-800" />
                  <Skeleton className="h-20 w-3/4 bg-stone-800" />
                </div>
              ) : featured ? (
                <div key={featured.id} className="animate-in fade-in slide-in-from-left-8 duration-1000">
                  <div className="space-y-4">
                    <Badge className="bg-primary text-black mb-2 uppercase tracking-widest font-black text-[10px] px-4 py-1">NexusHub Originals</Badge>
                    <h1 className="text-5xl md:text-8xl font-display font-black text-white leading-[0.85] tracking-tighter mb-6">
                      {featured.title}
                    </h1>
                    <p className="text-stone-300 text-lg md:text-2xl font-light italic leading-relaxed max-w-xl">
                      "{featured.description}"
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-4 pt-8">
                    <Button asChild size="lg" className="h-16 px-12 rounded-full font-black text-xl shadow-2xl shadow-primary/30 bg-primary text-black gold-shimmer">
                      <Link href={`/read/${featured.id}`}>{t('home.start_adventure')}</Link>
                    </Button>
                    <Button asChild variant="outline" size="lg" className="h-16 px-12 rounded-full font-bold border-white/15 text-white hover:bg-white/10 backdrop-blur-md">
                      <Link href="/signup">{t('home.free_signup')}</Link>
                    </Button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <div className="container max-w-7xl mx-auto px-6 space-y-24">
        <section>
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-lg"><TrendingUp className="h-6 w-6 text-primary" /></div>
              <h2 className="text-3xl font-display font-black text-white uppercase tracking-tighter">{t('home.trending')}</h2>
            </div>
            <Link href="/rankings" className="text-primary text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:underline">{t('home.popular')} <ChevronRight className="h-3 w-3" /></Link>
          </div>

          {isLoading ? (
            <StoryGridSkeleton count={5} />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {popular.slice(0, 5).map((story: Story) => (
                <StoryCard key={story.id} story={story} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
