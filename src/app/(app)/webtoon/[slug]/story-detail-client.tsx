'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Play, Heart, MessageSquare, Share2, Star, Eye, Clock, 
  ChevronRight, Award, Zap, Crown, Flame, Plus, Check, Info,
  TrendingUp, CircleDollarSign, Headphones, Music, Share
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { StoryCard } from '@/components/story-card';
import { useAuthModal } from '@/components/providers/auth-modal-provider';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, deleteDoc, updateDoc, increment, serverTimestamp, onSnapshot } from 'firebase/firestore';
import type { Story, UserProfile, Chapter } from '@/lib/types';

interface StoryDetailClientProps {
  story: Story;
  artist: UserProfile | null;
  similarStories: Story[];
}

export default function StoryDetailClient({ story, artist, similarStories }: StoryDetailClientProps) {
  const { toast } = useToast();
  const { openAuthModal } = useAuthModal();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoadingFavorite, setIsLoadingFavorite] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Monitor favorite status from Firestore
  useEffect(() => {
    if (!currentUser || !story.id) {
      setIsFavorite(false);
      setIsLoadingFavorite(false);
      return;
    }

    const likeRef = doc(db, 'stories', story.id, 'likes', currentUser.uid);
    const unsub = onSnapshot(likeRef, (docSnap) => {
      setIsFavorite(docSnap.exists());
      setIsLoadingFavorite(false);
    });

    return () => unsub();
  }, [currentUser, story.id]);

  const handleFavorite = async () => {
    if (!currentUser) {
      openAuthModal('ajouter cette œuvre à vos favoris');
      return;
    }

    const likeRef = doc(db, 'stories', story.id, 'likes', currentUser.uid);
    const storyRef = doc(db, 'stories', story.id);

    try {
      if (isFavorite) {
        // UNLIKE logic
        await deleteDoc(likeRef);
        await updateDoc(storyRef, {
          likes: increment(-1)
        });
        toast({ title: "Retiré des favoris" });
      } else {
        // LIKE logic
        await setDoc(likeRef, {
          userId: currentUser.uid,
          userName: currentUser.displayName || 'Voyageur',
          likedAt: serverTimestamp()
        });
        await updateDoc(storyRef, {
          likes: increment(1)
        });
        toast({ title: "Ajouté aux favoris !" });
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast({ 
        title: "Erreur", 
        description: "Impossible de mettre à jour vos favoris.",
        variant: "destructive" 
      });
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background pb-20">
      {/* 1. IMMERSIVE HERO HEADER */}
      <header className="relative h-[65vh] md:h-[75vh] overflow-hidden">
        {/* Blurred Background */}
        <div className="absolute inset-0">
          <Image src={story.coverImage.imageUrl} alt="bg" fill className="object-cover opacity-20 blur-3xl scale-110" priority />
          <div className="absolute inset-0 bg-stone-950/60" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        </div>
        
        <div className="container max-w-7xl mx-auto px-6 h-full flex flex-col justify-end pb-16">
          <div className="flex flex-col md:flex-row gap-12 items-end">
            {/* Main Cover */}
            <div className="relative aspect-[3/4] w-56 md:w-80 rounded-[2.5rem] overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.5)] border-8 border-background shrink-0 -mb-8 md:-mb-24 animate-in slide-in-from-bottom-12 duration-1000">
              <Image src={story.coverImage.imageUrl} alt={story.title} fill className="object-cover" priority />
              {story.isPremium && (
                <div className="absolute top-6 right-6 bg-primary text-black p-2 rounded-xl shadow-2xl">
                  <Crown className="h-6 w-6 fill-current" />
                </div>
              )}
            </div>
            
            <div className="flex-1 space-y-8 pb-4 md:pb-12 animate-in fade-in slide-in-from-left-12 duration-1000 delay-200">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <Badge className="bg-primary text-black uppercase tracking-[0.2em] font-black text-[9px] px-4 py-1.5 border-none shadow-lg shadow-primary/10">ORIGINAL NEXUS</Badge>
                  <Badge variant="secondary" className="bg-white/5 text-stone-300 border-white/10 uppercase tracking-widest text-[9px] font-bold px-4 py-1.5">{story.genre}</Badge>
                  <Badge variant="outline" className="border-white/10 text-stone-500 uppercase text-[9px] font-black px-4 py-1.5 tracking-tighter">{story.status}</Badge>
                </div>
                
                <h1 className="text-5xl md:text-8xl font-display font-black text-white leading-[0.85] tracking-tighter drop-shadow-[0_0_20px_rgba(212,168,67,0.3)]">
                  {story.title}
                </h1>

                {artist && (
                  <Link href={`/artiste/${artist.slug}`} className="flex items-center gap-4 group w-fit bg-white/5 backdrop-blur-xl border border-white/10 p-2 pr-6 rounded-full hover:bg-white/10 transition-all">
                    <Avatar className="h-10 w-10 border-2 border-primary/30 group-hover:ring-4 ring-primary/20 transition-all">
                      <AvatarImage src={artist.photoURL} />
                      <AvatarFallback className="bg-primary/5 text-primary font-black">{artist.displayName.slice(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-[10px] text-stone-500 uppercase font-black tracking-widest leading-none">Auteur de légende</p>
                      <p className="text-sm text-white font-bold group-hover:text-primary transition-colors">{artist.displayName}</p>
                    </div>
                  </Link>
                )}
              </div>

              <div className="flex flex-wrap gap-4 items-center">
                <Button asChild size="lg" className="rounded-full px-12 h-16 font-black text-xl gold-shimmer shadow-[0_0_40px_rgba(212,168,67,0.4)] bg-primary text-black">
                  <Link href={`/webtoon-hub/${story.slug}/chapitre-1`}><Play className="mr-3 h-6 w-6 fill-current" /> Commencer la Quête</Link>
                </Button>
                <div className="flex items-center gap-3">
                  <Button 
                    onClick={handleFavorite} 
                    variant="outline" 
                    size="icon" 
                    className={cn(
                      "h-16 w-16 rounded-full border-white/10 text-white hover:bg-rose-500/10 hover:text-rose-500 transition-all backdrop-blur-md", 
                      isFavorite && "bg-rose-500/10 text-rose-500 border-rose-500/50 shadow-[0_0_20px_rgba(244,63,94,0.2)]"
                    )}
                  >
                    <Heart className={cn("h-7 w-7 transition-all duration-300", isFavorite && "fill-current scale-110")} />
                  </Button>
                  <Button variant="outline" size="icon" className="h-16 w-16 rounded-full border-white/10 text-white hover:bg-white/10 backdrop-blur-md">
                    <Share2 className="h-7 w-7" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 2. CONTENT & SIDEBAR */}
      <main className="container max-w-7xl mx-auto px-6 pt-32 md:pt-48 grid lg:grid-cols-3 gap-16">
        <div className="lg:col-span-2 space-y-16">
          {/* Synopsis */}
          <section className="space-y-8">
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 p-3 rounded-2xl">
                <Info className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-3xl font-display font-black text-white uppercase tracking-tighter">Le Récit</h2>
            </div>
            <p className="text-xl text-stone-400 leading-relaxed italic font-light border-l-4 border-primary/20 pl-8">
              "{story.description}"
            </p>
            <div className="flex flex-wrap gap-2 pt-4">
              {story.tags.map(tag => <Badge key={tag} className="bg-white/5 text-stone-500 border-white/10 uppercase text-[9px] font-black tracking-widest px-4 py-1.5 rounded-full hover:text-primary transition-colors cursor-pointer">#{tag}</Badge>)}
            </div>
          </section>

          {/* Chapters List */}
          <section className="space-y-8">
            <Tabs defaultValue="chapters" className="w-full">
              <TabsList className="bg-muted/50 p-1.5 rounded-2xl h-14 mb-10 border border-border/50 max-w-md">
                <TabsTrigger value="chapters" className="rounded-xl flex-1 gap-2 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-black">
                  <Clock className="h-4 w-4" /> {story.chapterCount} Épisodes
                </TabsTrigger>
                <TabsTrigger value="comments" className="rounded-xl flex-1 gap-2 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-black">
                  <MessageSquare className="h-4 w-4" /> Avis Fans
                </TabsTrigger>
              </TabsList>

              <TabsContent value="chapters" className="space-y-4 animate-in fade-in duration-700">
                {/* Fast Lane */}
                <Card className="bg-amber-500/10 border-amber-500/20 rounded-[2rem] overflow-hidden mb-8 group hover:border-amber-500/40 transition-all">
                  <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-6">
                      <div className="bg-amber-500 p-4 rounded-2xl shadow-[0_0_30px_rgba(245,158,11,0.3)] animate-pulse">
                        <Zap className="h-8 w-8 text-black fill-current" />
                      </div>
                      <div>
                        <h4 className="text-xl font-display font-black text-amber-500 uppercase tracking-tighter">Fast Lane Nexus</h4>
                        <p className="text-sm text-amber-500/70 italic">"Lisez l'épisode de la semaine prochaine dès maintenant !"</p>
                      </div>
                    </div>
                    <Button className="rounded-full bg-amber-500 text-black font-black hover:bg-amber-600 px-10 h-12 shadow-xl group-hover:scale-105 transition-transform">Débloquer (5 🪙)</Button>
                  </CardContent>
                </Card>

                <div className="space-y-3">
                  {story.chapters?.map((chap, i) => (
                    <Link key={chap.id} href={`/webtoon-hub/${story.slug}/${chap.slug}`} className="block group">
                      <div className="flex items-center gap-6 p-6 rounded-3xl bg-card/50 border border-white/5 hover:border-primary/30 transition-all hover:shadow-2xl hover:-translate-y-1">
                        <div className="h-16 w-16 bg-white/5 rounded-2xl flex items-center justify-center font-display font-black text-stone-600 group-hover:text-primary group-hover:bg-primary/10 transition-all text-2xl">
                          {chap.chapterNumber}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-xl text-white group-hover:text-primary transition-colors truncate">{chap.title}</h4>
                          <p className="text-[9px] text-stone-500 uppercase font-black tracking-[0.2em] mt-1">Saison 1 &bull; Publié le 12 Fév.</p>
                        </div>
                        {chap.isPremium ? (
                          <div className="bg-primary/10 p-3 rounded-full text-primary shadow-lg"><Crown className="h-5 w-5" /></div>
                        ) : (
                          <div className="bg-emerald-500/10 p-3 rounded-full text-emerald-500"><Check className="h-5 w-5" /></div>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </section>
        </div>

        {/* SIDEBAR */}
        <aside className="space-y-12">
          {/* Season Pass */}
          <Card className="border-none bg-stone-900 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform duration-1000"><CircleDollarSign className="h-32 w-32 text-primary" /></div>
            <div className="relative z-10 space-y-8">
              <div className="space-y-2">
                <h3 className="text-3xl font-display font-black text-white uppercase tracking-tighter leading-none">Pass Saison</h3>
                <p className="text-stone-500 text-sm italic font-light">"Soutenez l'auteur et débloquez tous les épisodes Premium."</p>
              </div>
              <div className="space-y-4">
                <Button className="w-full h-16 rounded-2xl bg-primary text-black font-black gold-shimmer text-xl shadow-xl shadow-primary/20">Acheter (50 🪙)</Button>
                <p className="text-center text-[10px] text-stone-600 uppercase font-black tracking-[0.3em]">Économie de 30% par épisode</p>
              </div>
            </div>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[2.5rem] text-center space-y-2">
              <Eye className="h-6 w-6 text-primary mx-auto mb-2" />
              <p className="text-3xl font-black text-white tracking-tighter">{(story.views/1000).toFixed(0)}k</p>
              <p className="text-[9px] uppercase font-black text-stone-600 tracking-widest">Lectures</p>
            </div>
            <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[2.5rem] text-center space-y-2">
              <Heart className="h-6 w-6 text-rose-500 mx-auto mb-2" />
              <p className="text-3xl font-black text-white tracking-tighter">{(story.likes/1000).toFixed(0)}k</p>
              <p className="text-[9px] uppercase font-black text-stone-600 tracking-widest">Fans</p>
            </div>
          </div>

          {/* Similar Content */}
          <section className="space-y-8">
            <h3 className="text-xl font-display font-black text-white uppercase tracking-tighter flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-primary" /> Dans le même univers
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {similarStories.map(s => <StoryCard key={s.id} story={s} />)}
            </div>
          </section>
        </aside>
      </main>
    </div>
  );
}