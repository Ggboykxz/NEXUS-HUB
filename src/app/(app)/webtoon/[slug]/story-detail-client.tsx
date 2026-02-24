'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Play, Heart, MessageSquare, Share2, Star, Eye, Clock, 
  ChevronRight, Award, Zap, Crown, Flame, Plus, Check, Info,
  TrendingUp, CircleDollarSign
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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => setCurrentUser(user));
    return () => unsubscribe();
  }, []);

  const handleFavorite = () => {
    if (!currentUser) {
      openAuthModal('ajouter cette œuvre à vos favoris');
      return;
    }
    setIsFavorite(!isFavorite);
    toast({ title: isFavorite ? "Retiré des favoris" : "Ajouté aux favoris !" });
  };

  const handlePurchaseVIP = () => {
    if (!currentUser) {
      openAuthModal('acheter le Ticket VIP');
      return;
    }
    toast({ title: "Ticket VIP Activé !", description: "Vous avez désormais accès à toute la saison pour 50 AfriCoins." });
  };

  const handleFastLane = () => {
    if (!currentUser) {
      openAuthModal('utiliser le Fast Lane');
      return;
    }
    toast({ title: "Fast Lane Débloqué !", description: "Le prochain chapitre est accessible immédiatement (5 AfriCoins)." });
  };

  return (
    <div className="flex flex-col min-h-screen bg-background pb-20">
      {/* 1. HERO COVER HEADER */}
      <section className="relative h-[50vh] md:h-[60vh] overflow-hidden">
        <Image src={story.coverImage.imageUrl} alt={story.title} fill className="object-cover opacity-20 blur-2xl scale-110" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
        
        <div className="container max-w-7xl mx-auto px-6 h-full flex flex-col justify-end pb-12">
          <div className="flex flex-col md:flex-row gap-8 items-end">
            <div className="relative aspect-[3/4] w-48 md:w-64 rounded-3xl overflow-hidden shadow-2xl border-4 border-background shrink-0 -mb-6 md:-mb-12 animate-in slide-in-from-bottom-8 duration-700">
              <Image src={story.coverImage.imageUrl} alt={story.title} fill className="object-cover" priority />
              {story.isPremium && <Badge className="absolute top-4 right-4 bg-primary text-black font-black uppercase text-[10px] px-3 py-1">PREMIUM</Badge>}
            </div>
            
            <div className="flex-1 space-y-6 pb-2 md:pb-6 animate-in fade-in slide-in-from-left-8 duration-700 delay-150">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-none uppercase tracking-widest text-[10px] font-black px-3 py-1">{story.genre}</Badge>
                  <Badge variant="outline" className="border-border/50 text-muted-foreground uppercase text-[10px] font-bold px-3 py-1">{story.format}</Badge>
                  <Badge className="bg-emerald-500 text-white border-none text-[10px] font-black px-3 py-1">{story.status}</Badge>
                </div>
                <h1 className="text-4xl md:text-6xl font-display font-black leading-tight tracking-tighter">{story.title}</h1>
                {artist && (
                  <Link href={`/artiste/${artist.slug}`} className="flex items-center gap-3 group w-fit">
                    <Avatar className="h-8 w-8 border border-primary/30 group-hover:ring-2 ring-primary transition-all">
                      <AvatarImage src={artist.photoURL} />
                      <AvatarFallback>{artist.displayName.slice(0, 2)}</AvatarFallback>
                    </Avatar>
                    <span className="text-stone-400 font-bold group-hover:text-primary transition-colors">par {artist.displayName}</span>
                    {artist.isCertified && <Badge className="bg-emerald-500/10 text-emerald-500 border-none text-[8px] h-4">CERTIFIÉ PRO</Badge>}
                  </Link>
                )}
              </div>

              <div className="flex flex-wrap gap-4 items-center pt-2">
                <Button asChild size="lg" className="rounded-full px-10 h-14 font-black text-lg gold-shimmer shadow-2xl shadow-primary/20">
                  <Link href={`/webtoon-hub/${story.slug}/chapitre-1`}><Play className="mr-2 h-5 w-5 fill-current" /> Commencer à Lire</Link>
                </Button>
                <div className="flex items-center gap-2">
                  <Button onClick={handleFavorite} variant="outline" size="icon" className={cn("h-14 w-14 rounded-full border-border hover:bg-rose-500/10 hover:text-rose-500 transition-all", isFavorite && "bg-rose-500/10 text-rose-500 border-rose-500")}>
                    <Heart className={cn("h-6 w-6", isFavorite && "fill-current")} />
                  </Button>
                  <Button variant="outline" size="icon" className="h-14 w-14 rounded-full border-border hover:bg-primary/10 hover:text-primary transition-all">
                    <Share2 className="h-6 w-6" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. ADAPTIVE PRICING & OPTIONS */}
      <section className="container max-w-7xl mx-auto px-6 pt-24 md:pt-32">
        <div className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-12">
            <div className="space-y-6">
              <h2 className="text-2xl font-display font-black flex items-center gap-3">
                <Info className="h-6 w-6 text-primary" /> Résumé de l'aventure
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed italic font-light">
                "{story.description}"
              </p>
              <div className="flex flex-wrap gap-2">
                {story.tags.map(tag => <Badge key={tag} variant="secondary" className="bg-muted/50 text-stone-400 border-none text-[10px] font-bold px-3">#{tag}</Badge>)}
              </div>
            </div>

            <Tabs defaultValue="chapters" className="w-full">
              <TabsList className="bg-muted/50 p-1 rounded-2xl h-14 mb-8 border border-border/50">
                <TabsTrigger value="chapters" className="rounded-xl px-8 gap-2 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-black">
                  <Clock className="h-4 w-4" /> {story.chapterCount} Chapitres
                </TabsTrigger>
                <TabsTrigger value="comments" className="rounded-xl px-8 gap-2 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-black">
                  <MessageSquare className="h-4 w-4" /> Avis
                </TabsTrigger>
              </TabsList>

              <TabsContent value="chapters" className="space-y-4 animate-in fade-in duration-500">
                {/* Fast Lane Promotion */}
                <Card className="bg-amber-500/10 border-amber-500/20 rounded-2xl overflow-hidden mb-8">
                  <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                      <div className="bg-amber-500 p-3 rounded-xl"><Zap className="h-6 w-6 text-black" /></div>
                      <div>
                        <h4 className="font-black text-amber-500 uppercase tracking-tighter">Fast Lane Nexus</h4>
                        <p className="text-xs text-amber-500/70 italic">Débloquez le chapitre 15 (Sortie 24/02) dès maintenant !</p>
                      </div>
                    </div>
                    <Button onClick={handleFastLane} className="rounded-full bg-amber-500 text-black font-black hover:bg-amber-600 px-8">Accès Anticipé (5 🪙)</Button>
                  </CardContent>
                </Card>

                {story.chapters?.map((chap, i) => (
                  <Link key={chap.id} href={`/webtoon-hub/${story.slug}/${chap.slug}`} className="block group">
                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-border/50 hover:border-primary/30 transition-all hover:shadow-xl">
                      <div className="h-16 w-16 bg-muted rounded-xl flex items-center justify-center font-display font-black text-stone-500 group-hover:text-primary transition-colors text-xl">
                        {chap.chapterNumber}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-lg truncate group-hover:text-primary transition-colors">{chap.title}</h4>
                        <p className="text-xs text-muted-foreground uppercase tracking-widest font-black">Épisode de Saison 1</p>
                      </div>
                      {chap.isPremium ? (
                        <div className="bg-primary/10 p-2 rounded-full"><Crown className="h-4 w-4 text-primary" /></div>
                      ) : (
                        <div className="bg-emerald-500/10 p-2 rounded-full"><Check className="h-4 w-4 text-emerald-500" /></div>
                      )}
                    </div>
                  </Link>
                ))}
              </TabsContent>
            </Tabs>
          </div>

          {/* SIDEBAR: PRICING & STATS */}
          <aside className="space-y-8">
            <Card className="border-none bg-stone-900 rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-10"><CircleDollarSign className="h-24 w-24 text-primary" /></div>
              <h3 className="text-xl font-display font-black text-white mb-6 tracking-tight">Accès VIP Saison</h3>
              <p className="text-stone-400 text-sm italic font-light mb-8 leading-relaxed">"Soutenez l'artiste et débloquez tous les chapitres premium de la saison actuelle en un seul Ticket."</p>
              <div className="space-y-4">
                <Button onClick={handlePurchaseVIP} className="w-full h-14 rounded-2xl bg-primary text-black font-black gold-shimmer text-lg">Ticket VIP (50 🪙)</Button>
                <p className="text-center text-[10px] text-stone-600 uppercase font-black tracking-[0.2em]">Économisez 30 AfriCoins</p>
              </div>
            </Card>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 bg-muted/30 rounded-[2rem] border border-border/50 text-center space-y-1">
                <Eye className="h-5 w-5 text-primary mx-auto mb-2" />
                <p className="text-2xl font-black">{Math.floor(story.views / 1000)}k</p>
                <p className="text-[9px] uppercase font-black text-stone-500 tracking-widest">Lectures</p>
              </div>
              <div className="p-6 bg-muted/30 rounded-[2rem] border border-border/50 text-center space-y-1">
                <Heart className="h-5 w-5 text-rose-500 mx-auto mb-2" />
                <p className="text-2xl font-black">{Math.floor(story.likes / 1000)}k</p>
                <p className="text-[9px] uppercase font-black text-stone-500 tracking-widest">Favoris</p>
              </div>
            </div>

            <section className="space-y-6">
              <h3 className="text-lg font-display font-black px-2">Vous aimerez aussi</h3>
              <div className="grid grid-cols-2 gap-4">
                {similarStories.map(s => <StoryCard key={s.id} story={s} />)}
              </div>
            </section>
          </aside>
        </div>
      </section>
    </div>
  );
}
