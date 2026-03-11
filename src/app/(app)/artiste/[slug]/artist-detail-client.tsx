'use client';

import { useState, useEffect } from 'react';
import type { UserProfile, Story } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { 
  BookOpen, Heart, Users, Award, ShieldCheck, 
  Share2, MessageSquare, Zap, Star, Globe, 
  ChevronRight, TrendingUp, Flame, LayoutGrid, Plus, Eye, Layers
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { StoryCard } from '@/components/story-card';
import { useToast } from '@/hooks/use-toast';
import { auth, db } from '@/lib/firebase';
import { doc, onSnapshot, updateDoc, increment, serverTimestamp, setDoc, deleteDoc } from 'firebase/firestore';
import { getBannerOptimized, getAvatarThumbnail } from '@/lib/image-utils';

export default function ArtistDetailClient({ artist, artistStories }: { artist: UserProfile; artistStories: Story[] }) {
  const { toast } = useToast();
  const [isFollowing, setIsFollowing] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const unsubAuth = auth.onAuthStateChanged(user => {
      setCurrentUser(user);
      if (user) {
        const subRef = doc(db, 'users', user.uid, 'subscriptions', artist.uid);
        return onSnapshot(subRef, (snap) => setIsFollowing(snap.exists()));
      }
    });
    return () => unsubAuth();
  }, [artist.uid]);

  const handleFollow = async () => {
    if (!currentUser) {
      toast({ title: "Connexion requise", variant: "destructive" });
      return;
    }

    const subRef = doc(db, 'users', currentUser.uid, 'subscriptions', artist.uid);
    const artistRef = doc(db, 'users', artist.uid);

    try {
      if (isFollowing) {
        await deleteDoc(subRef);
        await updateDoc(artistRef, { subscribersCount: increment(-1) });
        toast({ title: "Abonnement retiré" });
      } else {
        await setDoc(subRef, {
          artistId: artist.uid,
          artistName: artist.displayName,
          subscribedAt: serverTimestamp()
        });
        await updateDoc(artistRef, { subscribersCount: increment(1) });
        toast({ title: "Vous suivez maintenant cet artiste !" });
      }
    } catch (e) {
      toast({ title: "Erreur", variant: "destructive" });
    }
  };

  const optimizedBanner = getBannerOptimized(artist.bannerURL || "https://picsum.photos/seed/artist-banner/1200/600");
  const optimizedAvatar = getAvatarThumbnail(artist.photoURL);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* 1. ARTIST HERO BANNER */}
      <header className="relative group">
        <div className="relative h-72 md:h-96 w-full overflow-hidden bg-stone-900">
          <Image 
            src={optimizedBanner} 
            alt="Artist Banner" 
            fill 
            className="object-cover opacity-40 transition-transform duration-[15000ms] group-hover:scale-110"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-stone-950/20 to-black/40" />
        </div>

        <div className="container max-w-7xl mx-auto px-6 relative -mt-32 md:-mt-48 z-10">
          <div className="flex flex-col md:flex-row items-end gap-10 md:gap-16">
            <div className="relative shrink-0 mx-auto md:mx-0 group/avatar">
              <Avatar className="h-48 w-48 md:h-64 md:w-64 border-[10px] border-background ring-4 ring-primary/20 shadow-[0_0_60px_rgba(212,168,67,0.3)] transition-transform duration-700 hover:scale-105">
                <AvatarImage src={optimizedAvatar} alt={artist.displayName} className="object-cover" />
                <AvatarFallback className="bg-stone-900 text-primary text-6xl font-black">{artist.displayName.slice(0, 2)}</AvatarFallback>
              </Avatar>
              {artist.isCertified && (
                <div className="absolute bottom-4 right-4 bg-primary text-black p-3 rounded-full border-4 border-background shadow-2xl animate-bounce">
                  <ShieldCheck className="h-8 w-8 stroke-[3]" />
                </div>
              )}
            </div>

            <div className="flex-1 text-center md:text-left pb-6 md:pb-12 space-y-8 w-full">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                  <h1 className="text-5xl md:text-8xl font-display font-black text-white tracking-tighter gold-resplendant drop-shadow-2xl">{artist.displayName}</h1>
                  <Badge className="bg-emerald-500 text-white uppercase tracking-[0.2em] font-black text-[10px] px-4 py-1.5 shadow-lg shadow-emerald-500/20">Artiste Pro</Badge>
                </div>
                <p className="text-stone-300 font-light italic text-xl leading-relaxed max-w-3xl mx-auto md:mx-0 border-l-4 border-primary/20 pl-8">
                  "{artist.bio || "Le créateur donne vie aux légendes à travers chaque trait de son stylet."}"
                </p>
              </div>

              <div className="flex flex-wrap justify-center md:justify-start gap-4">
                <Button 
                  onClick={handleFollow}
                  size="lg" 
                  className={cn(
                    "rounded-full px-12 h-16 font-black text-xl shadow-2xl transition-all active:scale-95",
                    isFollowing ? "bg-white/5 text-white border-white/10" : "bg-primary text-black gold-shimmer shadow-primary/20"
                  )}
                >
                  {isFollowing ? 'Abonné' : 'Suivre l\'Artiste'}
                </Button>
                <Button variant="outline" size="lg" className="h-16 w-16 rounded-full border-white/10 text-white hover:bg-white/5 backdrop-blur-md">
                  <Share2 className="h-7 w-7" />
                </Button>
                <Button variant="outline" size="lg" className="h-16 w-16 rounded-full border-white/10 text-white hover:bg-white/5 backdrop-blur-md">
                  <MessageSquare className="h-7 w-7" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 2. ARTIST STATS & IMPACT */}
      <section className="container max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: 'Fans Totaux', val: artist.subscribersCount || 0, icon: Users, color: 'text-emerald-500' },
            { label: 'Lectures', val: '1.2M', icon: Eye, color: 'text-primary' },
            { label: 'Engagement', val: 'Top 1%', icon: TrendingUp, color: 'text-orange-500' },
            { label: 'Séries', val: artistStories.length, icon: Layers, color: 'text-blue-500' },
          ].map((stat, i) => (
            <Card key={i} className="bg-stone-900/30 border-white/5 rounded-[2.5rem] p-10 hover:bg-stone-900/50 transition-all text-center space-y-3 shadow-xl">
              <div className={cn("bg-white/5 p-3 rounded-2xl w-fit mx-auto mb-4 shadow-inner", stat.color)}><stat.icon className="h-8 w-8" /></div>
              <p className="text-[10px] uppercase font-black text-stone-500 tracking-[0.3em]">{stat.label}</p>
              <p className="text-4xl font-black text-white tracking-tighter">{stat.val}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* 3. PORTFOLIO GRID */}
      <main className="container max-w-7xl mx-auto px-6">
        <div className="space-y-12">
          <div className="flex items-center justify-between border-b border-white/5 pb-8 px-2">
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 p-3 rounded-2xl"><BookOpen className="h-8 w-8 text-primary" /></div>
              <h2 className="text-3xl md:text-4xl font-display font-black text-white uppercase tracking-tighter">Archives Créatives</h2>
            </div>
            <Badge variant="outline" className="text-stone-500 border-white/10 px-4 py-1.5 uppercase font-black text-[10px] tracking-widest">{artistStories.length} Œuvres</Badge>
          </div>

          {artistStories.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-8 gap-y-16 animate-in fade-in duration-1000">
              {artistStories.map(story => (
                <StoryCard key={story.id} story={story} />
              ))}
            </div>
          ) : (
            <div className="text-center py-32 bg-stone-900/30 rounded-[3rem] border-2 border-dashed border-white/5 space-y-8 shadow-inner">
              <div className="mx-auto w-24 h-24 bg-white/5 rounded-full flex items-center justify-center opacity-20"><Zap className="h-12 w-12 text-stone-500" /></div>
              <div className="space-y-2">
                <h3 className="text-2xl font-display font-black text-white uppercase tracking-tighter">L'Atelier est discret</h3>
                <p className="text-stone-500 italic font-light max-w-xs mx-auto leading-relaxed">"Cet artiste prépare ses prochaines légendes dans l'ombre du Hub."</p>
              </div>
            </div>
          )}
        </div>

        {/* 4. DONATIONS & SUPPORT (SIMULATED) */}
        <section className="mt-32 p-12 md:p-20 rounded-[4rem] bg-stone-900 text-white relative overflow-hidden shadow-2xl border border-white/5">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-[120px] opacity-50" />
          <div className="relative z-10 grid lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-10">
              <div className="space-y-6">
                <Badge className="bg-primary text-black uppercase tracking-[0.2em] font-black text-[10px] px-4 py-1">SOUTIEN DIRECT</Badge>
                <h2 className="text-4xl md:text-6xl font-display font-black leading-[0.9] tracking-tighter gold-resplendant">Propulsez son <br/> prochain chef-d'œuvre</h2>
                <p className="text-stone-400 text-xl font-light leading-relaxed italic border-l-4 border-primary/20 pl-8">
                  "Vos AfriCoins permettent aux artistes de se consacrer pleinement à la création. 100% des dons directs sont reversés à l'auteur."
                </p>
              </div>
              <div className="flex flex-wrap gap-4">
                {[10, 50, 100, 500].map(amount => (
                  <Button key={amount} variant="outline" className="h-16 px-8 rounded-2xl border-white/10 text-xl font-black bg-white/5 hover:bg-primary hover:text-black transition-all gap-2">
                    {amount} <span className="text-primary group-hover:text-black">🪙</span>
                  </Button>
                ))}
              </div>
            </div>
            <div className="relative aspect-video rounded-[3rem] overflow-hidden border-8 border-white/5 shadow-2xl group bg-stone-800">
              <Image src="https://res.cloudinary.com/demo/image/upload/v1/samples/people/artist-working.jpg" alt="Atelier" fill className="object-cover opacity-60 transition-transform duration-[5000ms] group-hover:scale-110" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center p-8 bg-black/40 backdrop-blur-xl border border-white/10 rounded-[2rem] scale-90 md:scale-100">
                  <Star className="h-12 w-12 text-primary mx-auto mb-4 fill-current animate-pulse" />
                  <p className="text-xs font-black uppercase tracking-widest text-white">Donateur du mois : Voyageur_42</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
