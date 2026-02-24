'use client';

import { useState, useEffect } from 'react';
import { db, auth } from '@/lib/firebase';
import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { StoryCard } from '@/components/story-card';
import { BookHeart, Sparkles, ArrowLeft, Heart, Zap, History, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useTranslation } from '@/components/providers/language-provider';
import { Badge } from '@/components/ui/badge';
import type { Story, UserProfile } from '@/lib/types';
import { useQuery } from '@tanstack/react-query';

export default function ForYouPage() {
  const { t } = useTranslation();
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => setCurrentUser(user));
    return () => unsubscribe();
  }, []);

  const { data: recommendations = [], isLoading } = useQuery({
    queryKey: ['recommendations', currentUser?.uid],
    queryFn: async () => {
      // 1. Fetch User Profile for stats
      let preferredGenres: string[] = [];
      if (currentUser) {
        const userDoc = await getDocs(query(collection(db, 'users'), where('uid', '==', currentUser.uid)));
        if (!userDoc.empty) {
          const userData = userDoc.docs[0].data() as UserProfile;
          if (userData.readingStats?.preferredGenres) {
            preferredGenres = Object.entries(userData.readingStats.preferredGenres)
              .sort(([, a], [, b]) => b - a)
              .map(([genre]) => genre)
              .slice(0, 3);
          }
        }
      }

      // 2. Fetch based on genres or fallback to popular
      const storiesRef = collection(db, 'stories');
      let q;
      
      if (preferredGenres.length > 0) {
        q = query(
          storiesRef, 
          where('genreSlug', 'in', preferredGenres),
          where('isPublished', '==', true),
          limit(15)
        );
      } else {
        q = query(
          storiesRef,
          where('isPublished', '==', true),
          orderBy('views', 'desc'),
          limit(15)
        );
      }

      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as Story));
    },
    enabled: true,
  });

  return (
    <div className="container mx-auto max-w-7xl px-6 py-12">
      <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8 font-bold text-xs uppercase tracking-widest">
          <ArrowLeft className="h-4 w-4" /> Retour à l'accueil
      </Link>

      <header className="mb-16 relative p-12 rounded-[2.5rem] bg-primary/[0.03] border border-primary/10 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -z-10" />
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 text-center md:text-left">
            <div className="flex items-center gap-3 justify-center md:justify-start">
              <div className="bg-primary/10 p-2 rounded-lg">
                <BookHeart className="text-primary h-8 w-8" />
              </div>
              <Badge className="bg-primary text-white border-none uppercase tracking-[0.2em] font-black text-[10px]">
                Algorithme Nexus
              </Badge>
            </div>
            <h1 className="text-4xl md:text-6xl font-display font-black tracking-tighter">
              {t('home.for_you_title')}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed italic">
              {currentUser 
                ? "Basé sur vos genres préférés et votre proximité culturelle. Une sélection qui résonne avec votre âme de lecteur." 
                : "Les chefs-d'œuvre incontournables sélectionnés pour vous faire découvrir la richesse du Hub."}
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4">
            <div className="flex flex-col items-center gap-2 p-4 bg-background/50 rounded-2xl border border-border/50">
              <Zap className="h-5 w-5 text-primary" />
              <span className="text-[10px] font-bold uppercase tracking-tighter">Tendances AI</span>
            </div>
            <div className="flex flex-col items-center gap-2 p-4 bg-background/50 rounded-2xl border border-border/50">
              <Globe className="h-5 w-5 text-emerald-500" />
              <span className="text-[10px] font-bold uppercase tracking-tighter">Proximité</span>
            </div>
          </div>
        </div>
      </header>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-12">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="aspect-[3/4] bg-muted animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-12 animate-in fade-in duration-700">
          {recommendations.map((story) => (
            <StoryCard key={story.id} story={story} />
          ))}
        </div>
      )}

      {recommendations.length === 0 && !isLoading && (
        <div className="text-center py-32 bg-muted/10 rounded-3xl border-2 border-dashed border-border/50">
            <p className="text-muted-foreground italic">Aucune recommandation disponible pour le moment.</p>
        </div>
      )}
      
      <section className="mt-24 p-8 md:p-12 rounded-[2.5rem] bg-stone-900 text-white relative overflow-hidden border border-white/5">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl opacity-50" />
          <div className="max-w-2xl relative z-10 space-y-6">
              <div className="flex items-center gap-3">
                <Sparkles className="h-8 w-8 text-primary" />
                <h2 className="text-3xl font-bold font-display leading-tight">Affinez votre profil</h2>
              </div>
              <p className="text-lg text-stone-400 leading-relaxed font-light">
                  Plus vous lisez sur NexusHub, plus notre IA apprend à connaître vos sensibilités culturelles. Chaque minute passée sur une œuvre Yoruba ou une aventure Gabonaise affine votre futur voyage créatif.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <Button asChild size="lg" className="rounded-full px-8 font-black">
                    <Link href="/stories">Explorer tout le catalogue</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="rounded-full px-8 border-white/20 text-white hover:bg-white/10">
                    <Link href="/rankings">Voir les classements</Link>
                </Button>
              </div>
          </div>
      </section>
    </div>
  );
}
