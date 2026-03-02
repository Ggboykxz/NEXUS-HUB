'use client';

import { useState, useEffect, useMemo } from 'react';
import { db, auth } from '@/lib/firebase';
import { collection, query, where, getDocs, limit, orderBy, documentId } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { StoryCard } from '@/components/story-card';
import { BookHeart, Sparkles, ArrowLeft, Heart, Zap, History, Globe, Smile, Filter, Users, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useTranslation } from '@/components/providers/language-provider';
import { Badge } from '@/components/ui/badge';
import type { Story, LibraryEntry } from '@/lib/types';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';

export default function ForYouPage() {
  const { t } = useTranslation();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeMood, setActiveTab] = useState('all');

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

  // 1. FETCH USER LIBRARY METADATA
  const { data: libraryMetadata, isLoading: loadingLibrary } = useQuery({
    queryKey: ['user-library-meta', currentUser?.uid],
    enabled: !!currentUser,
    queryFn: async () => {
      const libRef = collection(db, 'users', currentUser.uid, 'library');
      const snap = await getDocs(query(libRef, orderBy('lastReadAt', 'desc'), limit(20)));
      const entries = snap.docs.map(d => d.data() as LibraryEntry);
      
      if (entries.length === 0) return { storyIds: [], topGenre: '', artistIds: [] };

      const storyIds = entries.map(e => e.storyId);
      
      // Fetch full story data to get genres and artists
      const storiesRef = collection(db, 'stories');
      const storiesSnap = await getDocs(query(storiesRef, where(documentId(), 'in', storyIds.slice(0, 10))));
      const fullStories = storiesSnap.docs.map(d => d.data() as Story);

      // Analyze top genre
      const genreCounts: Record<string, number> = {};
      fullStories.forEach(s => {
        genreCounts[s.genreSlug] = (genreCounts[s.genreSlug] || 0) + 1;
      });
      const topGenre = Object.entries(genreCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '';

      // Analyze artists
      const artistIds = Array.from(new Set(fullStories.map(s => s.artistId)));

      return { storyIds, topGenre, artistIds };
    }
  });

  // 2. FETCH RECOMMENDATIONS BY GENRE
  const { data: genreRecs = [], isLoading: loadingGenre } = useQuery({
    queryKey: ['rec-genre', libraryMetadata?.topGenre, currentUser?.uid],
    enabled: !!libraryMetadata?.topGenre,
    queryFn: async () => {
      const q = query(
        collection(db, 'stories'), 
        where('genreSlug', '==', libraryMetadata!.topGenre),
        where('isPublished', '==', true),
        limit(15)
      );
      const snap = await getDocs(q);
      return snap.docs
        .map(d => ({ id: d.id, ...d.data() } as Story))
        .filter(s => !libraryMetadata?.storyIds.includes(s.id))
        .sort((a, b) => b.views - a.views);
    }
  });

  // 3. FETCH RECOMMENDATIONS BY ARTISTS
  const { data: artistRecs = [], isLoading: loadingArtists } = useQuery({
    queryKey: ['rec-artists', libraryMetadata?.artistIds, currentUser?.uid],
    enabled: !!libraryMetadata?.artistIds && libraryMetadata.artistIds.length > 0,
    queryFn: async () => {
      const q = query(
        collection(db, 'stories'), 
        where('artistId', 'in', libraryMetadata!.artistIds.slice(0, 10)),
        where('isPublished', '==', true),
        limit(15)
      );
      const snap = await getDocs(q);
      return snap.docs
        .map(d => ({ id: d.id, ...d.data() } as Story))
        .filter(s => !libraryMetadata?.storyIds.includes(s.id))
        .sort((a, b) => b.views - a.views);
    }
  });

  // 4. GLOBAL TRENDING (Fallback)
  const { data: globalTrending = [], isLoading: loadingGlobal } = useQuery({
    queryKey: ['global-trending'],
    queryFn: async () => {
      const q = query(collection(db, 'stories'), where('isPublished', '==', true), orderBy('views', 'desc'), limit(10));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as Story));
    }
  });

  return (
    <div className="container mx-auto max-w-7xl px-6 py-12">
      <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8 font-bold text-xs uppercase tracking-widest">
          <ArrowLeft className="h-4 w-4" /> Retour à l'accueil
      </Link>

      <header className="mb-12 relative p-12 rounded-[2.5rem] bg-primary/[0.03] border border-primary/10 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -z-10" />
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 text-center md:text-left">
            <div className="flex items-center gap-3 justify-center md:justify-start">
              <div className="bg-primary/10 p-2 rounded-lg">
                <BookHeart className="text-primary h-8 w-8" />
              </div>
              <Badge className="bg-primary text-black border-none uppercase tracking-[0.2em] font-black text-[10px] px-3">
                Algorithme Nexus v4
              </Badge>
            </div>
            <h1 className="text-4xl md:text-6xl font-display font-black tracking-tighter">
              {t('home.for_you_title')}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed italic">
              "L'IA NexusHub analyse vos lectures passées pour dénicher les récits qui résonnent avec votre âme."
            </p>
          </div>
        </div>
      </header>

      <div className="space-y-24">
        {/* SECTION 1: GENRE-BASED RECOMMENDATIONS */}
        {libraryMetadata?.topGenre && (
          <section className="space-y-8">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-2xl font-display font-black text-white uppercase tracking-tighter">
                  {t('home.because_you_liked')} <span className="text-primary">{libraryMetadata.topGenre}</span>
                </h2>
              </div>
            </div>
            
            {loadingGenre ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {[...Array(5)].map((_, i) => <div key={i} className="aspect-[3/4] bg-stone-900 animate-pulse rounded-2xl" />)}
              </div>
            ) : genreRecs.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 animate-in fade-in duration-700">
                {genreRecs.map(s => <StoryCard key={s.id} story={s} />)}
              </div>
            ) : (
              <p className="text-stone-600 italic text-sm text-center py-12">"Vous avez déjà exploré tout ce genre. De nouvelles pépites arrivent bientôt."</p>
            )}
          </section>
        )}

        {/* SECTION 2: ARTIST-BASED RECOMMENDATIONS */}
        {libraryMetadata?.artistIds && libraryMetadata.artistIds.length > 0 && (
          <section className="space-y-8">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/10">
                  <Users className="h-5 w-5 text-emerald-500" />
                </div>
                <h2 className="text-2xl font-display font-black text-white uppercase tracking-tighter">
                  {t('home.new_from_artists')}
                </h2>
              </div>
            </div>
            
            {loadingArtists ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {[...Array(5)].map((_, i) => <div key={i} className="aspect-[3/4] bg-stone-900 animate-pulse rounded-2xl" />)}
              </div>
            ) : artistRecs.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 animate-in fade-in duration-700">
                {artistRecs.map(s => <StoryCard key={s.id} story={s} />)}
              </div>
            ) : (
              <div className="text-center py-12 border-2 border-dashed border-white/5 rounded-[2.5rem] bg-white/[0.02]">
                <p className="text-stone-600 italic text-sm">"Pas de nouvelles œuvres pour vos auteurs favoris pour le moment."</p>
              </div>
            )}
          </section>
        )}

        {/* FALLBACK: TRENDING GLOBAL */}
        {!libraryMetadata?.topGenre && (
          <section className="space-y-8">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-orange-500/10">
                  <Zap className="h-5 w-5 text-orange-500" />
                </div>
                <h2 className="text-2xl font-display font-black text-white uppercase tracking-tighter">
                  Les Incontournables
                </h2>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {loadingGlobal ? (
                [...Array(5)].map((_, i) => <div key={i} className="aspect-[3/4] bg-stone-900 animate-pulse rounded-2xl" />)
              ) : (
                globalTrending.map(s => <StoryCard key={s.id} story={s} />)
              )}
            </div>
          </section>
        )}
      </div>
      
      <section className="mt-24 p-8 md:p-12 rounded-[3.5rem] bg-stone-900 text-white relative overflow-hidden border border-white/5 shadow-2xl">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl opacity-50" />
          <div className="max-w-2xl relative z-10 space-y-6">
              <div className="flex items-center gap-3">
                <Sparkles className="h-8 w-8 text-primary" />
                <h2 className="text-3xl font-bold font-display leading-tight">Affinité Esthétique</h2>
              </div>
              <p className="text-lg text-stone-400 leading-relaxed font-light italic">
                  "Notre algorithme analyse désormais l'esthétique visuelle et les thèmes culturels sous-jacents pour vous proposer des œuvres qui partagent la même âme artistique que vos lectures précédentes."
              </p>
          </div>
      </section>
    </div>
  );
}
