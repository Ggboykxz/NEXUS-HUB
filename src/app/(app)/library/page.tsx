
'use client';

import { useState, useEffect } from 'react';
import { stories, type Story } from '@/lib/data';
import { StoryCard } from '@/components/story-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookMarked, Heart, History, Clock, Library as LibraryIcon, Play, Trash2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, query, orderBy, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { LibraryEntry } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';

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

  // Fetch Library Progress
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
      <div className="container mx-auto max-w-7xl px-6 py-24 text-center">
        <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground font-display font-bold animate-pulse uppercase tracking-widest text-xs">Synchronisation stellaire...</p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="container mx-auto max-w-7xl px-6 py-24 text-center">
        <LibraryIcon className="h-16 w-16 text-muted-foreground mx-auto mb-6 opacity-20" />
        <h1 className="text-4xl font-display font-black mb-4">Votre Sanctuaire Personnel</h1>
        <p className="text-muted-foreground max-w-md mx-auto mb-8 font-light italic">Connectez-vous pour retrouver vos lectures en cours, vos favoris et vos abonnements cross-device.</p>
        <div className="flex gap-4 justify-center">
          <Button asChild size="lg" className="h-14 px-10 rounded-full font-black"><Link href="/login">Se connecter</Link></Button>
          <Button asChild variant="outline" size="lg" className="h-14 px-10 rounded-full font-bold border-white/20"><Link href="/signup">Créer un compte</Link></Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl px-6 py-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div className="flex items-center gap-5">
          <div className="bg-primary/10 p-4 rounded-3xl border border-primary/20 shadow-xl shadow-primary/5">
            <LibraryIcon className="h-10 w-10 text-primary" />
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-display font-black tracking-tighter">Ma Bibliothèque</h1>
            <p className="text-muted-foreground font-light italic">Gérez vos progressions et bâtissez votre légende.</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Badge variant="secondary" className="h-8 px-4 rounded-full bg-white/5 border-white/10 text-stone-300 font-black text-[10px] uppercase tracking-widest">{progressList.length} Œuvres suivies</Badge>
        </div>
      </div>

      <Tabs defaultValue="progress" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-xl mb-12 h-14 bg-muted/50 p-1.5 rounded-2xl">
          <TabsTrigger value="progress" className="gap-2 text-sm font-bold rounded-xl data-[state=active]:bg-primary data-[state=active]:text-black"><History className="h-4 w-4" /> En cours</TabsTrigger>
          <TabsTrigger value="favorites" className="gap-2 text-sm font-bold rounded-xl data-[state=active]:bg-rose-500 data-[state=active]:text-white"><Heart className="h-4 w-4" /> Favoris</TabsTrigger>
          <TabsTrigger value="following" className="gap-2 text-sm font-bold rounded-xl data-[state=active]:bg-emerald-500 data-[state=active]:text-white"><BookMarked className="h-4 w-4" /> Abonnements</TabsTrigger>
        </TabsList>

        <TabsContent value="progress" className="space-y-6 animate-in fade-in duration-700">
          {progressList.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {progressList.map((entry) => (
                <div key={entry.storyId} className="group relative bg-card/50 backdrop-blur-md border border-border/50 rounded-2xl p-5 flex flex-col md:flex-row items-center gap-6 hover:border-primary/30 transition-all hover:shadow-2xl">
                  <div className="relative h-32 w-24 rounded-xl overflow-hidden shadow-xl shrink-0">
                    <Image src={entry.storyCover} alt={entry.storyTitle} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Play className="h-8 w-8 text-primary fill-current" />
                    </div>
                  </div>
                  
                  <div className="flex-1 w-full min-w-0 space-y-4">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-2">
                      <div>
                        <h3 className="text-xl font-display font-black group-hover:text-primary transition-colors">{entry.storyTitle}</h3>
                        <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mt-1">Dernière lecture : Chap. {entry.lastReadChapterTitle}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button asChild size="sm" className="rounded-full font-black px-6 shadow-lg shadow-primary/20"><Link href={`/webtoon/${entry.lastReadChapterSlug}`}>Reprendre <ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
                        <Button onClick={() => removeMutation.mutate(entry.storyId)} variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-destructive h-9 w-9"><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-[10px] uppercase font-black tracking-widest">
                        <span className="text-stone-500">Progression Totale</span>
                        <span className="text-primary text-glow">{entry.progress}%</span>
                      </div>
                      <div className="h-2 w-full bg-muted/50 rounded-full overflow-hidden border border-white/5">
                        <div className="h-full bg-gradient-to-r from-primary/50 to-primary shadow-[0_0_10px_hsl(var(--primary))] transition-all duration-1000" style={{ width: `${entry.progress}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState message="Votre voyage n'a pas encore commencé." />
          )}
        </TabsContent>

        <TabsContent value="favorites" className="animate-in fade-in duration-700">
          <EmptyState message="Aucun favori pour le moment. Laissez votre cœur guider vos lectures." />
        </TabsContent>

        <TabsContent value="following" className="animate-in fade-in duration-700">
          <EmptyState message="Vous ne suivez aucun artiste. Soyez le premier à soutenir un créateur !" />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-32 bg-muted/10 rounded-[3rem] border-2 border-dashed border-border/50 animate-in zoom-in-95 duration-700">
      <Clock className="h-16 w-16 text-muted-foreground/20 mx-auto mb-6" />
      <p className="text-muted-foreground font-light italic mb-8 max-w-xs mx-auto">{message}</p>
      <Button asChild variant="outline" className="rounded-full px-10 h-12 border-primary text-primary hover:bg-primary hover:text-black font-black">
        <Link href="/stories">Explorer le Catalogue</Link>
      </Button>
    </div>
  );
}
