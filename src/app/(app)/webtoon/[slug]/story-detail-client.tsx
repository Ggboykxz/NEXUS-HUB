'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Play, Heart, MessageSquare, Share2, Star, Eye, Clock, 
  ChevronRight, Award, Zap, Crown, Flame, Check, Info,
  TrendingUp, CircleDollarSign, Headphones, Music, Share, Flag, AlertTriangle, Loader2, Globe, Layers, BookOpen, User
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { ToastAction } from '@/components/ui/toast';
import { useAuthModal } from '@/components/providers/auth-modal-provider';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, deleteDoc, updateDoc, increment, serverTimestamp, onSnapshot, collection, addDoc, query, where, getDocs, limit } from 'firebase/firestore';
import type { Story, UserProfile, Chapter, LibraryEntry } from '@/lib/types';
import { getStoryUrl } from '@/lib/types';
import { useQuery } from '@tanstack/react-query';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslation } from '@/components/providers/language-provider';

interface StoryDetailClientProps {
  story: Story;
  artist: UserProfile | null;
  similarStories: Story[];
}

export default function StoryDetailClient({ story, artist, similarStories }: StoryDetailClientProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { openAuthModal } = useAuthModal();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [libraryEntry, setLibraryEntry] = useState<LibraryEntry | null>(null);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [reportReason, setReportReason] = useState('Contenu offensant');
  const [isReporting, setIsReporting] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!currentUser || !story.id) {
      setIsFavorite(false);
      setLibraryEntry(null);
      return;
    }

    const favRef = doc(db, 'users', currentUser.uid, 'favorites', story.id);
    const unsubFav = onSnapshot(favRef, (docSnap) => {
      setIsFavorite(docSnap.exists());
    });

    const libraryRef = doc(db, 'users', currentUser.uid, 'library', story.id);
    const unsubLib = onSnapshot(libraryRef, (docSnap) => {
      if (docSnap.exists()) {
        setLibraryEntry(docSnap.data() as LibraryEntry);
      } else {
        setLibraryEntry(null);
      }
    });

    return () => {
      unsubFav();
      unsubLib();
    };
  }, [currentUser, story.id]);

  const { data: universeStories = [] } = useQuery({
    queryKey: ['universe-stories', story.universeId],
    enabled: !!story.universeId,
    queryFn: async () => {
      const q = query(
        collection(db, 'stories'),
        where('universeId', '==', story.universeId),
        limit(10)
      );
      const snap = await getDocs(q);
      return snap.docs
        .map(d => ({ id: d.id, ...d.data() } as Story))
        .filter(s => s.id !== story.id);
    }
  });

  const handleFavorite = async () => {
    if (!currentUser) {
      openAuthModal('ajouter cette œuvre à vos favoris');
      return;
    }

    const favRef = doc(db, 'users', currentUser.uid, 'favorites', story.id);
    const storyRef = doc(db, 'stories', story.id);

    try {
      if (isFavorite) {
        await deleteDoc(favRef);
        await updateDoc(storyRef, { likes: increment(-1) });
        toast({ title: "Retiré des favoris" });
      } else {
        await setDoc(favRef, {
          storyId: story.id,
          addedAt: serverTimestamp()
        });
        await updateDoc(storyRef, { likes: increment(1) });
        toast({ title: "Ajouté aux favoris !" });
      }
    } catch (error) {
      toast({ title: "Erreur", variant: "destructive" });
    }
  };

  const handleReportStory = async () => {
    if (!currentUser) {
      openAuthModal('signaler une œuvre');
      return;
    }

    setIsReporting(true);
    try {
      await addDoc(collection(db, 'reports'), {
        type: 'story',
        targetId: story.id,
        targetTitle: story.title,
        reporterId: currentUser.uid,
        reason: reportReason,
        status: 'pending',
        createdAt: serverTimestamp()
      });
      toast({ title: "Signalement envoyé", description: "Merci pour votre vigilance." });
      setIsReportDialogOpen(false);
    } catch (e) {
      toast({ title: "Erreur lors du signalement", variant: "destructive" });
    } finally {
      setIsReporting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-stone-950 pb-32">
      {/* 1. CINEMATIC HERO SECTION */}
      <header className="relative h-[70vh] md:h-[85vh] overflow-hidden">
        <div className="absolute inset-0">
          <Image src={story.coverImage.imageUrl} alt="backdrop" fill className="object-cover opacity-30 blur-2xl scale-110" priority />
          <div className="absolute inset-0 bg-stone-950/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/20 to-transparent" />
        </div>
        
        <div className="container max-w-7xl mx-auto px-6 h-full flex flex-col justify-end pb-20 md:pb-32">
          <div className="flex flex-col md:flex-row gap-12 lg:gap-20 items-end md:items-center">
            {/* Massive floating cover */}
            <div className="relative aspect-[2/3] w-64 md:w-96 rounded-[3rem] overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.8)] border-[10px] border-stone-900 shrink-0 transform -rotate-2 hover:rotate-0 transition-transform duration-700 animate-in slide-in-from-bottom-12 duration-1000">
              <Image src={story.coverImage.imageUrl} alt={story.title} fill className="object-cover" priority />
              {libraryEntry && (
                <div className="absolute bottom-0 left-0 w-full h-3 bg-black/60 z-20">
                  <div className="h-full bg-primary shadow-[0_0_20px_hsl(var(--primary))]" style={{ width: `${libraryEntry.progress}%` }} />
                </div>
              )}
            </div>
            
            <div className="flex-1 space-y-10 animate-in fade-in slide-in-from-left-12 duration-1000 delay-200">
              <div className="space-y-6">
                <div className="flex flex-wrap items-center gap-3">
                  <Badge className="bg-primary text-black uppercase tracking-[0.3em] font-black text-[10px] px-5 py-2 border-none shadow-2xl">ORIGINAL NEXUS</Badge>
                  <Badge variant="outline" className="bg-white/5 text-stone-300 border-white/10 uppercase tracking-widest text-[9px] font-bold px-4 py-2 backdrop-blur-xl">{story.genre}</Badge>
                  {story.isPremium && <Badge className="bg-amber-500 text-black uppercase text-[9px] font-black px-4 py-2 border-none shadow-xl shadow-amber-500/20"><Crown className="h-3 w-3 mr-1.5 inline" /> PREMIUM</Badge>}
                </div>
                <h1 className="text-5xl md:text-9xl font-display font-black text-white leading-[0.8] tracking-tighter drop-shadow-[0_0_30px_rgba(212,168,67,0.4)]">{story.title}</h1>
                <div className="flex items-center gap-6 pt-2">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border-2 border-primary/30">
                      <AvatarImage src={artist?.photoURL} />
                      <AvatarFallback className="bg-stone-900 text-primary font-black">{story.artistName[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-[10px] text-stone-500 uppercase font-black tracking-widest leading-none mb-1">Un récit par</p>
                      <Link href={`/artiste/${story.artistSlug}`} className="text-base font-bold text-white hover:text-primary transition-colors leading-none">{story.artistName}</Link>
                    </div>
                  </div>
                  <Separator orientation="vertical" className="h-8 bg-white/10" />
                  <div className="flex gap-6">
                    <div className="text-center">
                      <p className="text-xl font-black text-white">{(story.views/1000).toFixed(1)}k</p>
                      <p className="text-[8px] uppercase font-black text-stone-600 tracking-widest">Lectures</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-black text-white">{(story.likes/1000).toFixed(1)}k</p>
                      <p className="text-[8px] uppercase font-black text-stone-600 tracking-widest">Favoris</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 items-center">
                <Button asChild size="lg" className="rounded-full px-12 h-20 font-black text-2xl gold-shimmer shadow-[0_0_50px_rgba(212,168,67,0.5)] bg-primary text-black hover:scale-105 transition-transform active:scale-95">
                  <Link href={`/read/${story.id}/${libraryEntry?.lastReadChapterSlug || 'chapitre-1'}`}>
                    <Play className="mr-4 h-8 w-8 fill-current" /> 
                    {libraryEntry ? (
                      libraryEntry.progress === 100 ? "Relire" : `Reprendre Ep. ${libraryEntry.lastReadChapterTitle}`
                    ) : "Lancer la Quête"}
                  </Link>
                </Button>
                <div className="flex items-center gap-3">
                  <Button onClick={handleFavorite} variant="outline" size="icon" className={cn("h-20 w-20 rounded-full border-white/10 text-white hover:bg-rose-500/10 hover:text-rose-500 transition-all backdrop-blur-md", isFavorite && "bg-rose-500/10 text-rose-500 border-rose-500/50 shadow-[0_0_20px_rgba(244,63,94,0.2)]")}>
                    <Heart className={cn("h-8 w-8 transition-all duration-500", isFavorite && "fill-current scale-110")} />
                  </Button>
                  <Button variant="outline" size="icon" className="h-20 w-20 rounded-full border-white/10 text-white hover:bg-white/10 backdrop-blur-md"><Share2 className="h-8 w-8" /></Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container max-w-7xl mx-auto px-6 space-y-32">
        {/* 2. STORY & SIDEBAR GRID */}
        <div className="grid lg:grid-cols-3 gap-20">
          <div className="lg:col-span-2 space-y-24">
            <section className="space-y-10">
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 p-4 rounded-3xl shadow-inner"><Info className="h-8 w-8 text-primary" /></div>
                <h2 className="text-4xl font-display font-black text-white uppercase tracking-tighter">Le Grimoire</h2>
              </div>
              <p className="text-2xl text-stone-400 leading-relaxed italic font-light border-l-8 border-primary/20 pl-10 py-4">"{story.description}"</p>
              
              <div className="flex flex-wrap gap-3">
                {story.tags?.map(tag => (
                  <Badge key={tag} variant="secondary" className="bg-white/5 text-stone-500 hover:text-primary transition-colors cursor-pointer border-white/5 uppercase font-black text-[9px] px-4 py-1.5 rounded-xl">#{tag}</Badge>
                ))}
              </div>
            </section>

            <section className="space-y-12">
              <Tabs defaultValue="chapters" className="w-full">
                <TabsList className="bg-muted/50 p-2 rounded-[2rem] h-16 mb-12 border border-border/50 max-w-md shadow-inner">
                  <TabsTrigger value="chapters" className="rounded-[1.5rem] flex-1 gap-2 font-black text-[11px] uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-black">
                    <Layers className="h-4 w-4" /> {story.chapterCount} Épisodes
                  </TabsTrigger>
                  <TabsTrigger value="comments" className="rounded-[1.5rem] flex-1 gap-2 font-black text-[11px] uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-black">
                    <MessageSquare className="h-4 w-4" /> Avis Fans
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="chapters" className="space-y-6 animate-in fade-in duration-700">
                  <div className="grid grid-cols-1 gap-4">
                    {story.chapters?.map((chap) => (
                      <Link key={chap.id} href={`/read/${story.id}/${chap.slug}`} className="group">
                        <div className={cn(
                          "flex items-center gap-8 p-8 rounded-[3rem] border transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 relative overflow-hidden",
                          libraryEntry?.lastReadChapterId === chap.id ? "bg-primary/[0.03] border-primary/30" : "bg-white/[0.02] border-white/5 hover:border-primary/20"
                        )}>
                          <div className={cn(
                            "h-20 w-20 rounded-[1.5rem] flex items-center justify-center font-display font-black transition-all text-3xl shadow-inner",
                            libraryEntry?.lastReadChapterId === chap.id ? "bg-primary text-black" : "bg-stone-900 text-stone-700 group-hover:text-primary group-hover:bg-primary/10"
                          )}>
                            {chap.chapterNumber}
                          </div>
                          <div className="flex-1 min-w-0 space-y-2">
                            <h4 className="font-bold text-2xl text-white group-hover:text-primary transition-colors truncate">{chap.title}</h4>
                            <div className="flex items-center gap-4">
                              <p className="text-[10px] text-stone-600 uppercase font-black tracking-widest flex items-center gap-2"><Clock className="h-3.5 w-3.5" /> Mis en ligne récemment</p>
                              {chap.isPremium && <Badge className="bg-amber-500 text-black border-none text-[8px] font-black uppercase px-3 h-5">PREMIUM</Badge>}
                            </div>
                          </div>
                          <ChevronRight className="h-8 w-8 text-stone-800 group-hover:text-primary group-hover:translate-x-2 transition-all" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </section>
          </div>

          <aside className="space-y-12">
            {/* SUPPORT CARD */}
            <Card className="bg-stone-900 border-none rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl group">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:rotate-12 transition-transform duration-1000"><CircleDollarSign className="h-48 w-48 text-primary" /></div>
              <h4 className="text-[10px] font-black uppercase text-primary mb-8 tracking-[0.3em] flex items-center gap-2">
                <Zap className="h-4 w-4 fill-current" /> Propulser l'auteur
              </h4>
              <div className="space-y-8 relative z-10">
                <p className="text-sm text-stone-400 font-light italic leading-relaxed">"Chaque don en AfriCoins permet à l'artiste de se concentrer sur la prochaine légende."</p>
                <div className="grid grid-cols-2 gap-3">
                  {[10, 50, 100, 500].map(amt => (
                    <Button key={amt} variant="outline" className="h-14 rounded-2xl border-white/5 bg-white/5 hover:bg-primary hover:text-black font-black transition-all">
                      {amt} 🪙
                    </Button>
                  ))}
                </div>
                <Button className="w-full h-16 rounded-2xl bg-primary text-black font-black text-lg gold-shimmer shadow-xl">Soutenir Directement</Button>
              </div>
            </Card>

            {/* CREATIVE TEAM */}
            <Card className="bg-white/[0.02] border-white/5 rounded-[3rem] p-10 space-y-8">
              <h4 className="text-[10px] font-black uppercase text-stone-500 tracking-[0.3em]">Équipe Créative</h4>
              <div className="space-y-6">
                <div className="flex items-center gap-4 group">
                  <Avatar className="h-14 w-14 border-2 border-primary/20 group-hover:border-primary transition-all">
                    <AvatarImage src={artist?.photoURL} />
                    <AvatarFallback className="bg-stone-900 text-primary font-black">A</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-bold text-white text-base group-hover:text-primary transition-colors">{story.artistName}</p>
                    <p className="text-[10px] uppercase font-black text-stone-600 tracking-widest">Auteur & Dessinateur</p>
                  </div>
                </div>
                {/* Fallback collaborators */}
                <div className="flex items-center gap-4 opacity-40 grayscale group cursor-not-allowed">
                  <div className="h-14 w-14 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center"><User className="h-6 w-6" /></div>
                  <div>
                    <p className="font-bold text-white text-sm italic">Poste à pourvoir</p>
                    <p className="text-[9px] uppercase font-bold text-stone-600 tracking-tighter">Coloriste / Traducteur</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* SECURITY/REPORT */}
            <div className="pt-8 flex justify-center">
              <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" className="text-[9px] font-black uppercase text-stone-700 hover:text-rose-500 transition-colors tracking-widest gap-2">
                    <Flag className="h-3.5 w-3.5" /> Signaler un contenu inapproprié
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-stone-900 border-white/10 text-white rounded-[2rem]">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-rose-500" /> Signaler l'œuvre</DialogTitle>
                    <DialogDescription className="text-stone-400 italic">Pourquoi souhaitez-vous signaler cette légende ?</DialogDescription>
                  </DialogHeader>
                  <div className="py-6">
                    <Select value={reportReason} onValueChange={setReportReason}>
                      <SelectTrigger className="h-12 bg-white/5 border-white/10 rounded-xl text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-stone-900 border-white/10">
                        <SelectItem value="Contenu offensant">Contenu offensant</SelectItem>
                        <SelectItem value="Plagiat">Plagiat</SelectItem>
                        <SelectItem value="Qualité technique">Qualité technique</SelectItem>
                        <SelectItem value="Autre">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleReportStory} disabled={isReporting} className="w-full h-12 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black">
                      {isReporting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirmer le signalement"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </aside>
        </div>

        {/* 3. SIMILAR STORIES / RECOMMENDATIONS */}
        {similarStories.length > 0 && (
          <section className="space-y-12 border-t border-white/5 pt-24">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-emerald-500/10 p-4 rounded-3xl shadow-inner"><Sparkles className="h-8 w-8 text-emerald-500" /></div>
                <h2 className="text-4xl font-display font-black text-white uppercase tracking-tighter">Dans la même veine</h2>
              </div>
              <Button asChild variant="link" className="text-emerald-500 font-black uppercase text-[10px] tracking-widest">
                <Link href="/stories">Tout Explorer <ChevronRight className="h-3 w-3 ml-1" /></Link>
              </Button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-8 gap-y-16">
              {similarStories.map(s => (
                <div key={s.id} className="group cursor-pointer space-y-4">
                  <div className="relative aspect-[3/4] rounded-3xl overflow-hidden shadow-xl border border-white/10 group-hover:border-primary/50 transition-all duration-500">
                    <Image src={s.coverImage.imageUrl} alt={s.title} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                    <Link href={getStoryUrl(s)} className="absolute inset-0 z-10" />
                  </div>
                  <div className="px-1">
                    <h4 className="font-bold text-sm text-white group-hover:text-primary transition-colors truncate">{s.title}</h4>
                    <p className="text-[9px] text-stone-500 font-bold uppercase tracking-widest">{s.genre}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
