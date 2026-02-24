'use client';

import { useState, useEffect } from 'react';
import { db, auth } from '@/lib/firebase';
import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { StoryCard } from '@/components/story-card';
import { BookHeart, Sparkles, ArrowLeft, Heart, Zap, History, Globe, Smile, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useTranslation } from '@/components/providers/language-provider';
import { Badge } from '@/components/ui/badge';
import type { Story, UserProfile } from '@/lib/types';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';

export default function ForYouPage() {
  const { t } = useTranslation();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeMood, setActiveMood] = useState('all');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => setCurrentUser(user));
    return () => unsubscribe();
  }, []);

  const moods = [
    { id: 'all', label: 'Tout', icon: Sparkles },
    { id: 'epic', label: 'Épique', icon: Zap },
    { id: 'happy', label: 'Joyeux', icon: Smile },
    { id: 'dark', label: 'Sombre', icon: History },
    { id: 'short', label: 'Court', icon: BookHeart },
  ];

  const { data: recommendations = [], isLoading } = useQuery({
    queryKey: ['recommendations', currentUser?.uid, activeMood],
    queryFn: async () => {
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

      const storiesRef = collection(db, 'stories');
      let q;
      
      // Simulation filtrage mood & afrofuturisme intelligent
      if (activeMood === 'epic') {
        q = query(storiesRef, where('genreSlug', 'in', ['action', 'mythologie']), limit(15));
      } else if (activeMood === 'short') {
        q = query(storiesRef, where('format', '==', 'One-shot'), limit(15));
      } else if (preferredGenres.length > 0) {
        q = query(storiesRef, where('genreSlug', 'in', preferredGenres), limit(15));
      } else {
        q = query(storiesRef, where('isPublished', '==', true), orderBy('views', 'desc'), limit(15));
      }

      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as Story));
    },
  });

  return (
    <div className="container mx-auto max-w-7xl px-6 py-12">
      <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8 font-bold text-xs uppercase tracking-widest">
          <ArrowLeft className="h-4 w-4" /> Retour à l'accueil
      </Link>

      <header className="mb-12 relative p-12 rounded-[2.5rem] bg-primary/[0.03] border border-primary/10 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -z-10" />
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 text-center md:text-left">
            <div className="flex items-center gap-3 justify-center md:justify-start">
              <div className="bg-primary/10 p-2 rounded-lg">
                <BookHeart className="text-primary h-8 w-8" />
              </div>
              <Badge className="bg-primary text-black border-none uppercase tracking-[0.2em] font-black text-[10px] px-3">
                Algorithme Nexus
              </Badge>
            </div>
            <h1 className="text-4xl md:text-6xl font-display font-black tracking-tighter">
              {t('home.for_you_title')}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed italic">
              "L'IA NexusHub apprend de vos lectures pour dénicher les récits qui résonnent avec votre âme."
            </p>
          </div>
        </div>
      </header>

      {/* MOOD SELECTOR */}
      <div className="mb-12 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-4 w-4 text-primary" />
          <h3 className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">L'Explorateur de Mood</h3>
        </div>
        <div className="flex flex-wrap gap-3">
          {moods.map((mood) => (
            <Button
              key={mood.id}
              onClick={() => setActiveMood(mood.id)}
              variant={activeMood === mood.id ? 'default' : 'outline'}
              className={cn(
                "rounded-2xl gap-2 h-12 px-6 font-bold transition-all",
                activeMood === mood.id ? "bg-primary text-black shadow-xl" : "hover:bg-primary/10"
              )}
            >
              <mood.icon className="h-4 w-4" />
              {mood.label}
            </Button>
          ))}
        </div>
      </div>

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
            <p className="text-muted-foreground italic">Aucune recommandation disponible pour ce mood.</p>
        </div>
      )}
      
      <section className="mt-24 p-8 md:p-12 rounded-[2.5rem] bg-stone-900 text-white relative overflow-hidden border border-white/5 shadow-2xl">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl opacity-50" />
          <div className="max-w-2xl relative z-10 space-y-6">
              <div className="flex items-center gap-3">
                <Sparkles className="h-8 w-8 text-primary" />
                <h2 className="text-3xl font-bold font-display leading-tight">Affinité Esthétique</h2>
              </div>
              <p className="text-lg text-stone-400 leading-relaxed font-light italic">
                  "Notre nouvelle IA Afrofuturisme analyse désormais l'esthétique visuelle et les thèmes culturels sous-jacents pour vous proposer des œuvres qui partagent la même âme artistique."
              </p>
          </div>
      </section>
    </div>
  );
}
