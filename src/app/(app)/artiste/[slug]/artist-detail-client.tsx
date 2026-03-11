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
  ChevronRight, TrendingUp, Flame, LayoutGrid, Plus, Eye, Layers,
  Music, Headphones, CircleDollarSign, Wand2, Sparkles, Send
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { StoryCard } from '@/components/story-card';
import { useToast } from '@/hooks/use-toast';
import { auth, db } from '@/lib/firebase';
import { doc, onSnapshot, updateDoc, increment, serverTimestamp, setDoc, deleteDoc } from 'firebase/firestore';
import { getBannerOptimized, getAvatarThumbnail } from '@/lib/image-utils';
import { Separator } from '@/components/ui/separator';

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
    <div className="min-h-screen bg-background pb-32">
      {/* 1. ARTIST CINEMATIC HERO */}
      <header className="relative group min-h-[60vh] flex flex-col justify-end">
        <div className="absolute inset-0 z-0">
          <Image 
            src={optimizedBanner} 
            alt="Artist Banner" 
            fill 
            className="object-cover opacity-40 transition-transform duration-[20000ms] group-hover:scale-110"
            priority
          />
          <div className="absolute inset-0 bg-stone-950/40 backdrop-blur-[2px]" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-stone-950/20 to-transparent" />
        </div>

        <div className="container max-w-7xl mx-auto px-6 relative z-10 pb-16">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-10 md:gap-16">
            <div className="relative shrink-0 group/avatar">
              <Avatar className="h-48 w-48 md:h-72 md:w-72 border-[12px] border-background ring-4 ring-primary/20 shadow-[0_0_80px_rgba(212,168,67,0.4)] transition-transform duration-700 hover:scale-105">
                <AvatarImage src={optimizedAvatar} alt={artist.displayName} className="object-cover" />
                <AvatarFallback className="bg-stone-900 text-primary text-7xl font-black">{artist.displayName.slice(0, 2)}</AvatarFallback>
              </Avatar>
              {artist.isCertified && (
                <div className="absolute bottom-6 right-6 bg-primary text-black p-4 rounded-full border-4 border-background shadow-2xl animate-in zoom-in duration-500 delay-300">
                  <ShieldCheck className="h-10 w-10 stroke-[3]" />
                </div>
              )}
            </div>

            <div className="flex-1 text-center md:text-left space-y-10 w-full pb-4">
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                  <h1 className="text-5xl md:text-9xl font-display font-black text-white tracking-tighter gold-resplendant leading-none drop-shadow-2xl">{artist.displayName}</h1>
                  <Badge className="bg-emerald-500 text-white uppercase tracking-[0.3em] font-black text-[11px] px-5 py-2 shadow-2xl shadow-emerald-500/20">Artiste Pro Certifié</Badge>
                </div>
                <p className="text-stone-300 font-light italic text-2xl leading-relaxed max-w-4xl mx-auto md:mx-0 border-l-8 border-primary/20 pl-10">
                  "{artist.bio || "Le créateur donne vie aux légendes à travers chaque trait de son stylet. Explorateur des mythes du Hub."}"
                </p>
              </div>

              <div className="flex flex-wrap justify-center md:justify-start gap-5">
                <Button 
                  onClick={handleFollow}
                  size="lg" 
                  className={cn(
                    "rounded-full px-16 h-20 font-black text-2xl shadow-2xl transition-all active:scale-95",
                    isFollowing ? "bg-white/5 text-white border-white/10" : "bg-primary text-black gold-shimmer shadow-primary/20"
                  )}
                >
                  {isFollowing ? 'Abonné' : 'Suivre l\'Artiste'}
                </Button>
                <div className="flex gap-3">
                  <Button variant="outline" size="icon" className="h-20 w-20 rounded-full border-white/10 text-white hover:bg-white/10 backdrop-blur-md">
                    <Share2 className="h-8 w-8" />
                  </Button>
                  <Button variant="outline" size="icon" className="h-20 w-20 rounded-full border-white/10 text-white hover:bg-white/10 backdrop-blur-md">
                    <MessageSquare className="h-8 w-8" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 2. ARTIST IMPACT & METRICS */}
      <section className="container max-w-7xl mx-auto px-6 py-24">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { label: 'Fans Totaux', val: artist.subscribersCount || 0, icon: Users, color: 'text-emerald-500', trend: '+12%' },
            { label: 'Lectures Totales', val: '1.2M', icon: Eye, color: 'text-primary', trend: '+5%' },
            { label: 'Engagement', val: 'Elite', icon: TrendingUp, color: 'text-orange-500', trend: 'Top 1%' },
            { label: 'Séries Actives', val: artistStories.length, icon: Layers, color: 'text-blue-500', trend: 'Live' },
          ].map((stat, i) => (
            <Card key={i} className="bg-stone-900/30 border-white/5 rounded-[3rem] p-12 hover:bg-stone-900/50 transition-all text-center space-y-4 shadow-2xl group overflow-hidden relative">
              <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-5 transition-opacity"><stat.icon className="h-24 w-24" /></div>
              <div className={cn("bg-white/5 p-4 rounded-2xl w-fit mx-auto mb-4 shadow-inner", stat.color)}><stat.icon className="h-8 w-8" /></div>
              <div>
                <p className="text-[10px] uppercase font-black text-stone-500 tracking-[0.3em] mb-1">{stat.label}</p>
                <p className="text-5xl font-black text-white tracking-tighter">{stat.val}</p>
              </div>
              <Badge variant="outline" className="border-white/5 bg-white/5 text-[9px] font-black uppercase text-emerald-500 px-3">{stat.trend}</Badge>
            </Card>
          ))}
        </div>
      </section>

      {/* 3. PORTFOLIO & ARCHIVES */}
      <main className="container max-w-7xl mx-auto px-6 space-y-32">
        <div className="space-y-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-white/5 pb-12 px-2 gap-8">
            <div className="flex items-center gap-6">
              <div className="bg-primary/10 p-5 rounded-3xl shadow-inner"><BookOpen className="h-10 w-10 text-primary" /></div>
              <div>
                <h2 className="text-4xl md:text-6xl font-display font-black text-white uppercase tracking-tighter leading-none">Bibliothèque <br/><span className="gold-resplendant">Créative</span></h2>
                <p className="text-stone-500 italic font-light mt-2">"Explorez les mondes forgés par cet artiste."</p>
              </div>
            </div>
            <Badge variant="outline" className="text-stone-500 border-white/10 px-6 py-2 uppercase font-black text-[11px] tracking-[0.2em] rounded-full h-fit">{artistStories.length} Œuvres Publiées</Badge>
          </div>

          {artistStories.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-10 gap-y-20 animate-in fade-in duration-1000">
              {artistStories.map(story => (
                <StoryCard key={story.id} story={story} className="scale-105 hover:scale-110 transition-transform duration-500" />
              ))}
            </div>
          ) : (
            <div className="text-center py-48 bg-stone-900/30 rounded-[4rem] border-4 border-dashed border-white/5 space-y-10 shadow-inner group">
              <div className="mx-auto w-32 h-32 bg-white/5 rounded-full flex items-center justify-center opacity-20 group-hover:opacity-100 group-hover:bg-primary/10 transition-all duration-700">
                <Wand2 className="h-16 w-16 text-stone-500 group-hover:text-primary transition-colors" />
              </div>
              <div className="space-y-4">
                <h3 className="text-3xl font-display font-black text-white uppercase tracking-tighter">L'Atelier est en Effervescence</h3>
                <p className="text-stone-500 italic font-light max-w-sm mx-auto leading-relaxed text-lg">"Cet artiste prépare ses prochaines légendes dans le sanctuaire du Hub. Restez à l'écoute."</p>
              </div>
              <Button onClick={handleFollow} className="rounded-full px-10 h-12 bg-white/5 text-white border border-white/10 hover:bg-primary hover:text-black font-black uppercase text-[10px] tracking-widest transition-all">S'abonner pour les alertes</Button>
            </div>
          )}
        </div>

        {/* 4. DONATIONS & MECENAT SECTION */}
        <section className="relative p-12 md:p-24 rounded-[5rem] bg-stone-900 text-white overflow-hidden shadow-2xl border border-primary/10">
          <div className="absolute -top-48 -right-48 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px] opacity-50" />
          <div className="absolute top-0 left-0 p-12 opacity-5 pointer-events-none"><CircleDollarSign className="h-96 w-96 text-primary" /></div>
          
          <div className="relative z-10 grid lg:grid-cols-2 gap-24 items-center">
            <div className="space-y-12">
              <div className="space-y-8">
                <div className="flex items-center gap-3">
                  <Badge className="bg-primary text-black uppercase tracking-[0.3em] font-black text-[10px] px-5 py-1.5 shadow-xl">MÉCÉNAT DIRECT</Badge>
                  <div className="flex items-center gap-2 text-primary font-bold text-[10px] uppercase tracking-widest">
                    <Sparkles className="h-4 w-4 animate-pulse" /> 100% à l'auteur
                  </div>
                </div>
                <h2 className="text-5xl md:text-8xl font-display font-black leading-[0.85] tracking-tighter gold-resplendant">Propulsez le <br/> Prochain Chef-d'œuvre</h2>
                <p className="text-stone-400 text-2xl font-light leading-relaxed italic border-l-8 border-primary/20 pl-10 py-2">
                  "Vos AfriCoins permettent aux artistes de se consacrer pleinement à la création. Chaque don est une pierre posée sur l'édifice de notre culture."
                </p>
              </div>

              <div className="space-y-6">
                <p className="text-[10px] font-black uppercase text-stone-500 tracking-[0.4em] ml-2">Sélectionnez un montant</p>
                <div className="flex flex-wrap gap-4">
                  {[10, 50, 100, 500, 1000].map(amount => (
                    <Button key={amount} variant="outline" className="h-20 px-10 rounded-3xl border-white/10 text-2xl font-black bg-white/5 hover:bg-primary hover:text-black transition-all gap-3 shadow-xl group">
                      {amount} <span className="text-primary group-hover:text-black transition-colors">🪙</span>
                    </Button>
                  ))}
                </div>
                <div className="pt-6">
                  <Button className="w-full md:w-auto px-16 h-20 rounded-full bg-primary text-black font-black text-2xl gold-shimmer shadow-2xl shadow-primary/30">
                    <Send className="mr-4 h-8 w-8" /> Soutenir l'Artiste
                  </Button>
                </div>
              </div>
            </div>

            <div className="relative aspect-square rounded-[4rem] overflow-hidden border-[15px] border-stone-800 shadow-[0_0_100px_rgba(0,0,0,0.8)] group bg-stone-800">
              <Image 
                src="https://res.cloudinary.com/demo/image/upload/v1/samples/people/artist-working.jpg" 
                alt="Artist Atelier" 
                fill 
                className="object-cover opacity-60 transition-transform duration-[8000ms] group-hover:scale-110" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
              <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center space-y-6">
                <div className="p-8 bg-black/40 backdrop-blur-2xl border border-white/10 rounded-[3rem] scale-90 md:scale-100 shadow-2xl transform group-hover:-translate-y-4 transition-transform duration-700">
                  <Star className="h-16 w-16 text-primary mx-auto mb-6 fill-current animate-pulse" />
                  <h4 className="text-xl font-display font-black text-white uppercase tracking-widest mb-2">Grand Mécène</h4>
                  <p className="text-[10px] font-black uppercase text-stone-500 tracking-widest">Donateur du mois : <span className="text-white">Voyageur_42</span></p>
                </div>
                <Badge className="bg-emerald-500 text-white px-6 py-2 rounded-full font-black uppercase text-[10px] tracking-[0.3em]">REJOINDRE LES ANNALES</Badge>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
