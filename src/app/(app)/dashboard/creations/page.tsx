'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  PlusCircle, 
  Brush, 
  TrendingUp, 
  Globe, 
  Layers, 
  Eye, 
  Clock, 
  Loader2, 
  ChevronRight,
  Calendar,
  AlertCircle,
  Trash2,
  AlertTriangle,
  Zap
} from 'lucide-react';
import { db, auth } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Story } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
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

export default function CreationsDashboardPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const { data: myStories = [], isLoading: fetchingStories } = useQuery({
    queryKey: ['my-creations', currentUser?.uid],
    enabled: !!currentUser,
    queryFn: async () => {
      const q = query(
        collection(db, 'stories'),
        where('artistId', '==', currentUser.uid),
        orderBy('updatedAt', 'desc')
      );
      const snap = await getDocs(q);
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Story));
    }
  });

  const deleteStoryMutation = useMutation({
    mutationFn: async (storyId: string) => {
      await deleteDoc(doc(db, 'stories', storyId));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-creations'] });
      toast({ title: "Légende supprimée", description: "L'œuvre a été retirée des archives." });
    },
    onError: () => {
      toast({ title: "Erreur", description: "Impossible de supprimer l'œuvre.", variant: "destructive" });
    }
  });

  if (authLoading || fetchingStories) {
    return (
      <div className="container mx-auto max-w-7xl px-6 py-32 flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-stone-500 font-display font-black uppercase tracking-widest text-[10px]">Ouverture de l'Atelier...</p>
      </div>
    );
  }

  if (!currentUser) return null;

  return (
    <div className="container mx-auto max-w-7xl px-6 py-12 space-y-12">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
        <div className="space-y-2">
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 p-3 rounded-2xl">
              <Brush className="w-10 h-10 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold font-display tracking-tighter text-white">Mon Atelier</h1>
              <p className="text-stone-500 italic font-light">Gérez vos mondes et suivez votre impact culturel.</p>
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <Button asChild variant="outline" className="flex-1 md:flex-none rounded-xl border-white/10 hover:bg-white/5 h-12">
            <Link href="/dashboard/stats">
              <TrendingUp className="mr-2 h-4 w-4 text-primary" />
              Statistiques
            </Link>
          </Button>
          <Button asChild className="flex-1 md:flex-none rounded-xl h-12 bg-primary text-black font-black gold-shimmer shadow-xl shadow-primary/20">
            <Link href="/submit">
              <PlusCircle className="mr-2 h-5 w-5" />
              Nouveau Projet
            </Link>
          </Button>
        </div>
      </div>

      {/* STORIES GRID */}
      {myStories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in duration-700">
          {myStories.map((story) => {
            const updatedAt = story.updatedAt instanceof Date 
              ? story.updatedAt 
              : (story.updatedAt as any)?.toDate?.() || new Date(story.updatedAt as string);
            
            return (
              <Card key={story.id} className="bg-card/50 border-border/50 rounded-[2.5rem] overflow-hidden group hover:border-primary/30 transition-all duration-500 hover:shadow-2xl flex flex-col">
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={story.coverImage.imageUrl}
                    alt={story.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-1000"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/20 to-transparent" />
                  
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    <Badge className="bg-black/60 backdrop-blur-md border-white/10 text-[8px] font-black uppercase tracking-widest px-3">
                      {story.format}
                    </Badge>
                    {story.isPublished ? (
                      <Badge className="bg-emerald-500 text-white border-none text-[8px] font-black uppercase px-3 shadow-lg">En ligne</Badge>
                    ) : (
                      <Badge className="bg-amber-500 text-black border-none text-[8px] font-black uppercase px-3 shadow-lg">Brouillon</Badge>
                    )}
                  </div>

                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="icon" className="h-10 w-10 rounded-xl bg-rose-600/80 backdrop-blur-md border border-white/10 hover:bg-rose-600">
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-stone-900 border-white/5 text-white rounded-3xl">
                        <AlertDialogHeader>
                          <div className="mx-auto bg-rose-500/10 p-3 rounded-2xl w-fit mb-4">
                            <AlertTriangle className="h-6 w-6 text-rose-500" />
                          </div>
                          <AlertDialogTitle className="text-center font-display font-black">Supprimer "{story.title}" ?</AlertDialogTitle>
                          <AlertDialogDescription className="text-center italic text-stone-400">
                            "Cette action effacera définitivement l'œuvre, tous ses chapitres et ses statistiques. Les légendes perdues ne reviennent jamais."
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="sm:justify-center gap-3">
                          <AlertDialogCancel className="rounded-xl border-white/10 bg-white/5 text-white">Conserver le récit</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => deleteStoryMutation.mutate(story.id)}
                            className="rounded-xl bg-rose-600 font-black h-12 px-8"
                          >
                            Confirmer la suppression
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>

                <CardHeader className="p-8 pb-4">
                  <CardTitle className="text-2xl font-display font-black group-hover:text-primary transition-colors line-clamp-1">{story.title}</CardTitle>
                  <CardDescription className="text-stone-500 italic font-light text-xs mt-1">
                    Mis à jour {formatDistanceToNow(updatedAt, { addSuffix: true, locale: fr })}
                  </CardDescription>
                </CardHeader>

                <CardContent className="px-8 pb-6 flex-grow space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-1">
                      <p className="text-[9px] text-stone-500 uppercase font-black tracking-widest flex items-center gap-1.5">
                        <Layers className="h-3 w-3 text-primary" /> Chapitres
                      </p>
                      <p className="text-xl font-black text-white">{story.chapterCount || 0}</p>
                    </div>
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-1">
                      <p className="text-[9px] text-stone-500 uppercase font-black tracking-widest flex items-center gap-1.5">
                        <Eye className="h-3 w-3 text-emerald-500" /> Lectures
                      </p>
                      <p className="text-xl font-black text-white">{(story.views / 1000).toFixed(1)}k</p>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="p-8 pt-0 flex flex-col gap-3">
                  <Button asChild className="w-full rounded-xl bg-white text-black font-black hover:bg-stone-200 transition-all">
                    <Link href={`/dashboard/creations/${story.id}`}>
                      Gérer l'Atelier <ChevronRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="ghost" className="w-full text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/10">
                    <Link href={`/dashboard/creations/${story.id}`}>
                      <PlusCircle className="mr-2 h-4 w-4" /> Ajouter un chapitre
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-32 bg-stone-900/30 rounded-[3.5rem] border-2 border-dashed border-white/5 animate-in zoom-in-95 duration-700 space-y-8">
          <div className="mx-auto w-24 h-24 bg-white/5 rounded-full flex items-center justify-center opacity-20">
            <Brush className="h-10 w-10 text-stone-500" />
          </div>
          <div className="space-y-2">
            <h3 className="text-3xl font-display font-black text-white tracking-tighter">L'Ardoise est Vierge</h3>
            <p className="text-stone-500 max-w-sm mx-auto italic font-light leading-relaxed">
              "Chaque grande épopée commence par une intention. Il est temps de graver votre première légende dans les archives de NexusHub."
            </p>
          </div>
          <Button asChild size="lg" className="rounded-full px-12 h-16 font-black text-xl bg-primary text-black gold-shimmer shadow-2xl shadow-primary/20">
            <Link href="/submit">Lancer mon Premier Projet</Link>
          </Button>
        </div>
      )}

      {/* QUICK TIPS SECTION */}
      <section className="p-8 rounded-[3rem] bg-emerald-500/[0.02] border border-emerald-500/10 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-6">
          <div className="bg-emerald-500/10 p-4 rounded-2xl">
            <Zap className="h-8 w-8 text-emerald-500" />
          </div>
          <div>
            <h4 className="text-lg font-bold text-white font-display">Conseil de l'Éditeur</h4>
            <p className="text-stone-500 text-sm italic">"Les œuvres avec au moins 3 chapitres publiés ont 45% de chances supplémentaires d'être recommandées par l'IA."</p>
          </div>
        </div>
        <Button variant="link" className="text-emerald-500 font-bold uppercase tracking-widest text-[10px]">Voir plus de conseils <ChevronRight className="h-3 w-3" /></Button>
      </section>
    </div>
  );
}
