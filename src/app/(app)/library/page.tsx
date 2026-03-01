'use client';

import { useState, useEffect } from 'react';
import { StoryCard } from '@/components/story-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookMarked, Heart, History, Clock, Library as LibraryIcon, 
  Play, Trash2, ArrowRight, Flame, Sparkles, Star, Loader2,
  XCircle, Eraser, AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { 
  collection, query, orderBy, getDocs, doc, deleteDoc, 
  where, documentId, writeBatch, limit 
} from 'firebase/firestore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { LibraryEntry, Story } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function LibraryPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // --- FETCH PROGRESS (READING HISTORY) ---
  const { data: progressList = [], isLoading: isLoadingLib } = useQuery({
    queryKey: ['library-progress', currentUser?.uid],
    enabled: !!currentUser,
    queryFn: async () => {
      const q = query(
        collection(db, 'users', currentUser!.uid, 'library'), 
        orderBy('lastReadAt', 'desc'),
        limit(50)
      );
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ ...d.data() } as LibraryEntry));
    }
  });

  // --- FETCH FAVORITES ---
  const { data: favoriteStories = [], isLoading: isLoadingFavs } = useQuery({
    queryKey: ['library-favorites', currentUser?.uid],
    enabled: !!currentUser,
    queryFn: async () => {
      const favsRef = collection(db, 'users', currentUser!.uid, 'favorites');
      const favsSnap = await getDocs(favsRef);
      const favIds = favsSnap.docs.map(d => d.id);

      if (favIds.length === 0) return [];

      const chunks = [];
      for (let i = 0; i < favIds.length; i += 30) {
        chunks.push(favIds.slice(i, i + 30));
      }

      const storiesRef = collection(db, 'stories');
      const results: Story[] = [];

      for (const chunk of chunks) {
        const q = query(storiesRef, where(documentId(), 'in', chunk));
        const snap = await getDocs(q);
        results.push(...snap.docs.map(d => ({ id: d.id, ...d.data() } as Story)));
      }

      return results;
    }
  });

  const removeProgressMutation = useMutation({
    mutationFn: async (storyId: string) => {
      await deleteDoc(doc(db, 'users', currentUser!.uid, 'library', storyId));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library-progress'] });
      toast({ title: "Entrée supprimée" });
    }
  });

  const clearHistoryMutation = useMutation({
    mutationFn: async () => {
      if (!currentUser) return;
      const libRef = collection(db, 'users', currentUser.uid, 'library');
      const q = query(libRef, where('progress', '<', 5));
      const snap = await getDocs(q);
      
      if (snap.empty) {
        toast({ title: "Historique propre", description: "Aucune lecture peu avancée à supprimer." });
        return;
      }

      const batch = writeBatch(db);
      snap.docs.forEach(d => batch.delete(d.ref));
      await batch.commit();
      
      return snap.size;
    },
    onSuccess: (count) => {
      if (count && count > 0) {
        queryClient.invalidateQueries({ queryKey: ['library-progress'] });
        toast({ title: "Historique nettoyé", description: `${count} entrées supprimées.` });
      }
    }
  });

  const clearFavoritesMutation = useMutation({
    mutationFn: async () => {
      const favsRef = collection(db, 'users', currentUser!.uid, 'favorites');
      const snap = await getDocs(favsRef);
      const batch = writeBatch(db);
      snap.docs.forEach(d => batch.delete(d.ref));
      await batch.commit();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library-favorites'] });
      toast({ title: "Favoris vidés", description: "Votre liste de favoris a été réinitialisée." });
    }
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
              <p className="text-3xl font-black text-primary">{progressList.length + favoriteStories.length}</p>
              <p className="text-[10px] uppercase font-bold text-stone-500 tracking-widest">Épopées listées</p>
            </div>
            <div className="bg-white/5 backdrop-blur-md p-6 rounded-[2rem] border border-white/10 text-center space-y-1">
              <p className="text-3xl font-black text-emerald-500">{favoriteStories.length}</p>
              <p className="text-[10px] uppercase font-bold text-stone-500 tracking-widest">Favoris</p>
            </div>
          </div>
        </div>
      </header>

      {/* 2. TABS CONTENT */}
      <Tabs defaultValue="progress" className="w-full">
        <div className="flex justify-center mb-16">
          <TabsList className="grid w-full grid-cols-3 bg-muted/50 p-1.5 rounded-2xl h-14 border border-border/50 max-w-2xl">
            <TabsTrigger value="progress" className="rounded-xl flex-1 gap-2 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-black">
              <History className="h-4 w-4" /> Historique
            </TabsTrigger>
            <TabsTrigger value="favorites" className="rounded-xl flex-1 gap-2 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-rose-500 data-[state=active]:text-white">
              <Heart className="h-4 w-4" /> Favoris
            </TabsTrigger>
            <TabsTrigger value="following" className="rounded-xl flex-1 gap-2 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
              <BookMarked className="h-4 w-4" /> Abonnements
            </TabsTrigger>
          </TabsList>
        </div>

        {/* PROGRESS TAB (HISTORY) */}
        <TabsContent value="progress" className="space-y-10 animate-in fade-in duration-700">
          <div className="flex justify-between items-center px-2">
            <h3 className="text-xl font-display font-black text-white uppercase tracking-widest flex items-center gap-3">
              <History className="h-5 w-5 text-primary" /> Lectures Récentes
            </h3>
            <Button 
              onClick={() => clearHistoryMutation.mutate()} 
              disabled={clearHistoryMutation.isPending || progressList.length === 0}
              variant="ghost" 
              size="sm" 
              className="text-stone-500 hover:text-orange-500 font-black text-[9px] uppercase tracking-[0.2em] gap-2"
            >
              {clearHistoryMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Eraser className="h-3 w-3" />}
              Nettoyer l'historique
            </Button>
          </div>

          {progressList.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              {progressList.map((entry) => {
                const date = entry.lastReadAt ? (entry.lastReadAt as any).toDate?.() || new Date(entry.lastReadAt as string) : new Date();
                return (
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
                              Dernier chapitre : Ch.{entry.lastReadChapterTitle}
                            </Badge>
                            <span className="text-[10px] text-stone-500 font-bold uppercase tracking-tighter flex items-center gap-1.5">
                              <Clock className="h-3 w-3" />
                              {formatDistanceToNow(date, { addSuffix: true, locale: fr })}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Button asChild size="lg" className="rounded-full font-black px-10 bg-primary text-black gold-shimmer h-12 shadow-xl shadow-primary/20">
                            <Link href={`/read/${entry.storyId}`}>Reprendre <ArrowRight className="ml-2 h-5 w-5" /></Link>
                          </Button>
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="rounded-full text-stone-600 hover:text-rose-500 h-12 w-12 bg-white/5 hover:bg-rose-500/10 transition-all">
                                <Trash2 className="h-5 w-5" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-stone-900 border-white/5 text-white rounded-3xl">
                              <AlertDialogHeader>
                                <div className="mx-auto bg-rose-500/10 p-3 rounded-2xl w-fit mb-4">
                                  <AlertTriangle className="h-6 w-6 text-rose-500" />
                                </div>
                                <AlertDialogTitle className="text-center text-xl font-display font-black uppercase tracking-tight">Retirer de la bibliothèque ?</AlertDialogTitle>
                                <AlertDialogDescription className="text-center text-stone-400 italic">
                                  "Votre progression sur cette œuvre sera perdue dans les sables du temps. Êtes-vous certain de vouloir continuer ?"
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter className="sm:justify-center gap-3 mt-6">
                                <AlertDialogCancel className="rounded-xl border-white/10 bg-white/5 text-white hover:bg-white/10 h-12 px-8">Annuler</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => removeProgressMutation.mutate(entry.storyId)}
                                  className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black h-12 px-8"
                                >
                                  Confirmer le retrait
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
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
                );
              })}
            </div>
          ) : (
            <EmptyState message="Votre voyage n'a pas encore commencé. Les sables attendent vos pas." icon={History} />
          )}
        </TabsContent>

        {/* FAVORITES TAB */}
        <TabsContent value="favorites" className="space-y-10 animate-in fade-in duration-700">
          {favoriteStories.length > 0 ? (
            <>
              <div className="flex justify-between items-center px-2">
                <h3 className="text-xl font-display font-black text-white uppercase tracking-widest flex items-center gap-3">
                  <Star className="h-5 w-5 text-primary" /> Sélection Sacrée
                </h3>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      disabled={clearFavoritesMutation.isPending}
                      variant="ghost" 
                      size="sm" 
                      className="text-stone-500 hover:text-rose-500 font-black text-[9px] uppercase tracking-[0.2em] gap-2"
                    >
                      {clearFavoritesMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <XCircle className="h-3 w-3" />}
                      Vider les favoris
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-stone-900 border-white/5 text-white rounded-3xl">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-center font-display font-black">Réinitialiser les Favoris ?</AlertDialogTitle>
                      <AlertDialogDescription className="text-center italic">"Toutes vos œuvres préférées seront décochées de votre sanctuaire."</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="sm:justify-center">
                      <AlertDialogCancel className="rounded-xl border-white/10 bg-white/5 text-white">Annuler</AlertDialogCancel>
                      <AlertDialogAction onClick={() => clearFavoritesMutation.mutate()} className="rounded-xl bg-rose-600 text-white font-black">Tout vider</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-12">
                {favoriteStories.map((story) => (
                  <StoryCard key={story.id} story={story} />
                ))}
              </div>
            </>
          ) : (
            <EmptyState message="Aucun favori pour le moment. Laissez votre cœur guider vos lectures." icon={Heart} />
          )}
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
