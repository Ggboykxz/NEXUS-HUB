'use client';

import { useState, useEffect } from 'react';
import { StoryCard } from '@/components/story-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookMarked, Heart, History, Clock, Library as LibraryIcon, Play, Trash2, ArrowRight, Flame, Sparkles, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, query, orderBy, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { LibraryEntry } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export default function LibraryPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const { data: progressList = [], isLoading: isLoadingLib } = useQuery({
    queryKey: ['library-progress', currentUser?.uid],
    enabled: !!currentUser,
    queryFn: async () => {
      const q = query(collection(db, 'users', currentUser!.uid, 'library'), orderBy('lastReadAt', 'desc'));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ ...d.data() } as LibraryEntry));
    }
  });

  const removeMutation = useMutation({
    mutationFn: async (storyId: string) => {
      await deleteDoc(doc(db, 'users', currentUser!.uid, 'library', storyId));
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['library-progress'] })
  });

  if (loading || isLoadingLib) {
    return (
      <div className="container mx-auto max-w-7xl px-6 py-32 text-center space-y-4">
        <div className="h-16 w-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4 shadow-[0_0_30px_rgba(212,168,67,0.3)]" />
        <p className="text-stone-500 font-display font-black animate-pulse uppercase tracking-[0.3em] text-[10px]">Ouverture de votre sanctuaire...</p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="container mx-auto max-w-7xl px-6 py-24 text-center space-y-8">
        <div className="mx-auto w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20 shadow-2xl">
          <LibraryIcon className="h-10 w-10 text-primary opacity-40" />
        </div>
        <div className="space-y-4">
          <h1 className="text-4xl md:text-6xl font-display font-black text-white tracking-tighter">Votre Sanctuaire</h1>
          <p className="text-stone-400 max-w-md mx-auto font-light italic leading-relaxed">"Connectez-vous pour retrouver vos lectures en cours, vos favoris et bâtir votre propre légende."</p>
        </div>
        <div className="flex flex-wrap gap-4 justify-center">
          <Button asChild size="lg" className="h-16 px-12 rounded-full font-black text-lg bg-primary text-black gold-shimmer">
            <Link href="/login">Se connecter</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="h-16 px-12 rounded-full font-bold border-white/10 text-white hover:bg-white/5">
            <Link href="/signup">Créer un compte</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto px-6 py-12 space-y-16">
      {/* 1. LIBRARY HEADER */}
      <header className="relative p-12 rounded-[3rem] bg-stone-950 border border-primary/10 overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.15),transparent_70%)]" />
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 relative z-10">
          <div className="space-y-6 text-center lg:text-left flex-1">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 px-4 py-1.5 rounded-full">
              <LibraryIcon className="h-4 w-4 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Archives Personnelles</span>
            </div>
            <h1 className="text-4xl md:text-7xl font-display font-black text-white tracking-tighter leading-none">
              Ma <br/><span className="gold-resplendant">Bibliothèque</span>
            </h1>
            <p className="text-lg text-stone-400 font-light italic max-w-xl">
              "Votre voyage à travers les sables du temps. Gérez vos progressions et retrouvez vos séries préférées."
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 w-full lg:w-auto shrink-0">
            <div className="bg-white/5 backdrop-blur-md p-6 rounded-[2rem] border border-white/10 text-center space-y-1">
              <p className="text-3xl font-black text-primary">{progressList.length}</p>
              <p className="text-[10px] uppercase font-bold text-stone-500 tracking-widest">Œuvres suivies</p>
            </div>
            <div className="bg-white/5 backdrop-blur-md p-6 rounded-[2rem] border border-white/10 text-center space-y-1">
              <p className="text-3xl font-black text-emerald-500">75%</p>
              <p className="text-[10px] uppercase font-bold text-stone-500 tracking-widest">Complétion</p>
            </div>
          </div>
        </div>
      </header>

      {/* 2. TABS CONTENT */}
      <Tabs defaultValue="progress" className="w-full">
        <div className="flex justify-center mb-16">
          <TabsList className="grid w-full grid-cols-3 bg-muted/50 p-1.5 rounded-2xl h-14 border border-border/50 max-w-2xl">
            <TabsTrigger value="progress" className="rounded-xl flex-1 gap-2 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-black">
              <History className="h-4 w-4" /> En cours
            </TabsTrigger>
            <TabsTrigger value="favorites" className="rounded-xl flex-1 gap-2 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-rose-500 data-[state=active]:text-white">
              <Heart className="h-4 w-4" /> Favoris
            </TabsTrigger>
            <TabsTrigger value="following" className="rounded-xl flex-1 gap-2 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
              <BookMarked className="h-4 w-4" /> Abonnements
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="progress" className="space-y-6 animate-in fade-in duration-700">
          {progressList.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              {progressList.map((entry) => (
                <div key={entry.storyId} className="group relative bg-stone-900/50 backdrop-blur-md border border-white/5 rounded-[2.5rem] p-8 flex flex-col md:flex-row items-center gap-8 hover:border-primary/30 transition-all hover:shadow-2xl">
                  <div className="relative h-40 w-28 rounded-2xl overflow-hidden shadow-2xl shrink-0 border-2 border-white/5">
                    <Image src={entry.storyCover} alt={entry.storyTitle} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Play className="h-10 w-10 text-primary fill-current" />
                    </div>
                  </div>
                  
                  <div className="flex-1 w-full min-w-0 space-y-6">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div>
                        <h3 className="text-3xl font-display font-black text-white group-hover:text-primary transition-colors tracking-tight">{entry.storyTitle}</h3>
                        <div className="flex items-center gap-3 mt-2">
                          <Badge variant="outline" className="bg-primary/5 border-primary/20 text-primary text-[8px] font-black uppercase px-3 tracking-widest">
                            Chapitre {entry.lastReadChapterTitle}
                          </Badge>
                          <span className="text-[10px] text-stone-500 font-bold uppercase tracking-tighter">Lu il y a 2 jours</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Button asChild size="lg" className="rounded-full font-black px-10 bg-primary text-black gold-shimmer h-12 shadow-xl shadow-primary/20">
                          <Link href={`/read/${entry.storyId}`}>Reprendre <ArrowRight className="ml-2 h-5 w-5" /></Link>
                        </Button>
                        <Button onClick={() => removeMutation.mutate(entry.storyId)} variant="ghost" size="icon" className="rounded-full text-stone-600 hover:text-rose-500 h-12 w-12 bg-white/5 hover:bg-rose-500/10 transition-all">
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-[10px] uppercase font-black tracking-widest">
                        <span className="text-stone-500">Progression Globale</span>
                        <span className="text-primary gold-resplendant">{entry.progress}%</span>
                      </div>
                      <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                        <div className="h-full bg-gradient-to-r from-primary/50 to-primary shadow-[0_0_15px_hsl(var(--primary)/0.5)] transition-all duration-1000" style={{ width: `${entry.progress}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState message="Votre voyage n'a pas encore commencé. Les sables attendent vos pas." icon={History} />
          )}
        </TabsContent>

        <TabsContent value="favorites" className="animate-in fade-in duration-700">
          <EmptyState message="Aucun favori pour le moment. Laissez votre cœur guider vos lectures." icon={Heart} />
        </TabsContent>

        <TabsContent value="following" className="animate-in fade-in duration-700">
          <EmptyState message="Vous ne suivez aucun artiste. Soyez le premier à soutenir un créateur !" icon={Star} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function EmptyState({ message, icon: Icon }: { message: string, icon: any }) {
  return (
    <div className="text-center py-32 bg-stone-900/30 rounded-[3.5rem] border-2 border-dashed border-white/5 animate-in zoom-in-95 duration-700 space-y-8">
      <div className="mx-auto w-24 h-24 bg-white/5 rounded-full flex items-center justify-center opacity-20">
        <Icon className="h-10 w-10 text-stone-500" />
      </div>
      <p className="text-stone-500 font-light italic mb-8 max-w-xs mx-auto leading-relaxed">{message}</p>
      <Button asChild variant="outline" className="rounded-full px-12 h-14 border-primary text-primary hover:bg-primary hover:text-black font-black uppercase text-xs tracking-widest transition-all">
        <Link href="/stories">Explorer le Catalogue</Link>
      </Button>
    </div>
  );
}
