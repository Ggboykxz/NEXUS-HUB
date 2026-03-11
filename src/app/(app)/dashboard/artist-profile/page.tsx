'use client';

import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Award, Brush, Users, TrendingUp, Sparkles, 
  ChevronRight, Globe, Share2, Eye, Heart, 
  Zap, BrainCircuit, Landmark, Palette, Settings,
  ArrowUpRight, ShieldCheck, Star, MessageSquare, Coins
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, limit, orderBy, onSnapshot } from 'firebase/firestore';
import type { Story } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function ArtistPersonalProfilePage() {
  const { profile, currentUser, loading } = useAuth();
  const { toast } = useToast();
  const [myStories, setMyStories] = useState<Story[]>([]);
  const [loadingStories, setLoadingStories] = useState(true);
  const [totalImpact, setTotalImpact] = useState(0);

  useEffect(() => {
    if (!currentUser) return;

    // Fetch stories and calculate total impact (views)
    const q = query(
      collection(db, 'stories'),
      where('artistId', '==', currentUser.uid),
      orderBy('updatedAt', 'desc'),
      limit(10)
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      const stories = snap.docs.map(d => ({ id: d.id, ...d.data() } as Story));
      setMyStories(stories);
      
      const total = stories.reduce((acc, s) => acc + (s.views || 0), 0);
      setTotalImpact(total);
      setLoadingStories(false);
    }, (error) => {
      console.error("Error fetching artist stories:", error);
      // Fallback for missing index
      const fallbackQ = query(collection(db, 'stories'), where('artistId', '==', currentUser.uid));
      getDocs(fallbackQ).then(snap => {
        setMyStories(snap.docs.map(d => ({ id: d.id, ...d.data() } as Story)));
        setLoadingStories(false);
      });
    });

    return () => unsubscribe();
  }, [currentUser]);

  if (loading || !profile) return (
    <div className="min-h-screen flex items-center justify-center bg-stone-950">
      <div className="relative">
        <Zap className="h-12 w-12 animate-pulse text-primary" />
        <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
      </div>
    </div>
  );

  const stats = [
    { label: 'Fans Fidèles', val: profile.subscribersCount || 0, icon: Users, color: 'text-emerald-500' },
    { label: 'Impact Global', val: totalImpact > 1000 ? `${(totalImpact/1000).toFixed(1)}k` : totalImpact, icon: TrendingUp, color: 'text-primary' },
    { label: 'Niveau Artiste', val: profile.level || 1, icon: Award, color: 'text-blue-500' },
    { label: 'AfriCoins', val: profile.afriCoins || 0, icon: Coins, color: 'text-amber-500' },
  ];

  return (
    <div className="container mx-auto max-w-7xl px-6 py-12 space-y-12 animate-in fade-in duration-1000">
      {/* 1. CREATOR IDENTITY HERO */}
      <header className="relative p-12 rounded-[3.5rem] bg-stone-900/50 border border-white/5 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
          <Brush className="h-64 w-64 text-primary" />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
          <div className="relative shrink-0">
            <Avatar className="h-40 w-40 border-[6px] border-stone-950 ring-4 ring-primary/20 shadow-2xl">
              <AvatarImage src={profile.photoURL} className="object-cover" />
              <AvatarFallback className="bg-stone-800 text-primary text-4xl font-black">{profile.displayName.slice(0,2)}</AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-2 -right-2 bg-primary text-black p-2.5 rounded-full border-4 border-stone-900 shadow-xl">
              <ShieldCheck className="h-6 w-6 stroke-[3]" />
            </div>
          </div>

          <div className="flex-1 text-center md:text-left space-y-4">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                <h1 className="text-4xl md:text-6xl font-display font-black text-white tracking-tighter gold-resplendant leading-none">{profile.displayName}</h1>
                <Badge className="bg-emerald-500 text-white border-none uppercase text-[9px] font-black px-3 py-1">Artiste {profile.role?.split('_')[1] || 'Pro'}</Badge>
              </div>
              <p className="text-stone-500 font-mono text-sm">@{profile.slug}</p>
            </div>
            <p className="text-stone-400 italic font-light max-w-xl">"{profile.bio || "Le créateur n'a pas encore gravé sa biographie."}"</p>
          </div>

          <div className="flex flex-col gap-3 w-full md:w-auto">
            <Button asChild size="lg" className="rounded-2xl h-14 bg-primary text-black font-black px-8 gold-shimmer shadow-xl">
              <Link href={`/artiste/${profile.slug}`}>Aperçu Public <Globe className="ml-2 h-4 w-4" /></Link>
            </Button>
            <Button asChild variant="outline" className="rounded-2xl h-12 border-white/10 text-white hover:bg-white/5">
              <Link href="/settings"><Settings className="mr-2 h-4 w-4" /> Éditer le Profil</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* 2. CREATOR METRICS */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((s, i) => (
          <Card key={i} className="bg-stone-900/30 border-white/5 rounded-[2.5rem] p-8 text-center space-y-3 hover:bg-stone-900/50 transition-all shadow-xl">
            <div className={cn("p-3 rounded-2xl bg-white/5 w-fit mx-auto mb-2", s.color)}><s.icon className="h-6 w-6" /></div>
            <p className="text-[10px] uppercase font-black text-stone-500 tracking-[0.2em]">{s.label}</p>
            <p className="text-3xl font-black text-white">{s.val}</p>
          </Card>
        ))}
      </section>

      <div className="grid lg:grid-cols-3 gap-12">
        {/* 3. PORTFOLIO SNAPSHOT */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-2xl font-display font-black text-white uppercase tracking-tighter flex items-center gap-3">
              <Palette className="h-6 w-6 text-primary" /> Mes Légendes
            </h2>
            <Button asChild variant="ghost" className="text-primary font-black text-[10px] uppercase tracking-widest gap-2">
              <Link href="/dashboard/creations">Tout Gérer <ArrowUpRight className="h-3 w-3" /></Link>
            </Button>
          </div>

          <div className="space-y-4">
            {loadingStories ? (
              [...Array(3)].map((_, i) => <div key={i} className="h-24 bg-stone-900/50 animate-pulse rounded-3xl border border-white/5" />)
            ) : myStories.length > 0 ? (
              myStories.map((story) => (
                <Link key={story.id} href={`/dashboard/creations/${story.id}`}>
                  <div className="flex items-center gap-6 p-6 rounded-[2.5rem] bg-stone-900/30 border border-white/5 hover:border-primary/30 transition-all group shadow-lg">
                    <div className="relative h-20 w-14 rounded-xl overflow-hidden shadow-lg shrink-0 border border-white/10">
                      <Image src={story.coverImage.imageUrl} alt={story.title} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-lg text-white group-hover:text-primary transition-colors truncate">{story.title}</h4>
                      <div className="flex items-center gap-3 mt-1">
                        <Badge variant="outline" className="text-[8px] font-black uppercase border-white/5 text-stone-500">{story.genre}</Badge>
                        <span className="text-[10px] text-stone-600 font-bold flex items-center gap-1"><Eye className="h-3 w-3" /> {story.views > 1000 ? `${(story.views/1000).toFixed(1)}k` : story.views}</span>
                      </div>
                    </div>
                    <ChevronRight className="h-6 w-6 text-stone-800 group-hover:text-primary transition-all" />
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-center py-20 bg-stone-900/30 rounded-[3rem] border-2 border-dashed border-white/5 animate-in zoom-in-95">
                <p className="text-stone-500 italic mb-4">"Aucun manuscrit publié."</p>
                <Button asChild className="rounded-full px-8 bg-primary text-black font-black">
                  <Link href="/submit">Lancer un projet</Link>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* 4. CREATOR TOOLS & STATS */}
        <aside className="space-y-8">
          <Card className="bg-stone-950 border-none rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 p-6 opacity-5"><Zap className="h-32 w-32 text-primary" /></div>
            <h4 className="text-sm font-black uppercase text-primary mb-8 tracking-widest">Outils Créateurs</h4>
            <div className="grid gap-4">
              {[
                { label: 'AI Studio', icon: BrainCircuit, href: '/dashboard/ai-studio', color: 'text-primary bg-primary/10' },
                { label: 'World Building', icon: Landmark, href: '/dashboard/world-building', color: 'text-emerald-500 bg-emerald-500/10' },
                { label: 'Analyse Audience', icon: TrendingUp, href: '/dashboard/stats', color: 'text-blue-500 bg-blue-500/10' }
              ].map((tool, i) => (
                <Link key={i} href={tool.href} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group">
                  <div className={cn("p-2.5 rounded-xl group-hover:scale-110 transition-transform", tool.color)}><tool.icon className="h-5 w-5" /></div>
                  <span className="text-xs font-black uppercase tracking-wider">{tool.label}</span>
                  <ChevronRight className="h-4 w-4 ml-auto text-stone-700 group-hover:text-primary transition-colors" />
                </Link>
              ))}
            </div>
          </Card>

          <Card className="bg-primary/5 border border-primary/10 rounded-[2.5rem] p-8 space-y-6 shadow-xl">
            <h4 className="text-xs font-black uppercase text-primary tracking-widest flex items-center gap-2">
              <Star className="h-4 w-4" /> Nexus Insights
            </h4>
            <p className="text-[10px] text-stone-400 italic leading-relaxed font-light">
              "Vos fans sont plus actifs entre 18h et 21h (GMT). Programmez vos prochains chapitres durant ce créneau pour maximiser l'engagement."
            </p>
            <div className="p-4 bg-primary/10 rounded-xl border border-primary/20 flex items-center justify-between">
              <span className="text-[9px] font-black uppercase text-primary">Status : Certifié</span>
              <span className="text-xs font-black text-white">{profile.isCertified ? 'Actif' : 'En attente'}</span>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}
