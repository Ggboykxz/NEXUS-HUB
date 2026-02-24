'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, Lock, PlusCircle, MessageSquare, BookOpen, 
  ChevronRight, Sparkles, Star, Globe, History, 
  ShieldCheck, ArrowRight, Zap, Flame, LayoutGrid
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export default function ReadingCerclesPage() {
  const cercles = [
    { 
      id: 'c1', 
      name: 'Les Veilleurs d\'Orisha', 
      desc: 'Groupe privé de décryptage des mythes Yoruba.', 
      members: 12, 
      isPrivate: true,
      lastActive: 'Il y a 5 min',
      story: 'Chroniques d\'Orisha'
    },
    { 
      id: 'c2', 
      name: 'Nexus Gabon Fans', 
      desc: 'Célébrer la BD Gabonaise entre potes.', 
      members: 45, 
      isPrivate: false,
      lastActive: 'En ligne',
      story: 'Bulles du Gabon'
    },
    { 
      id: 'c3', 
      name: 'Cyberpunk Explorers', 
      desc: 'Lecture synchronisée du dimanche soir.', 
      members: 8, 
      isPrivate: true,
      lastActive: 'Hier',
      story: 'Néo-Dakar 2088'
    }
  ];

  return (
    <div className="container mx-auto max-w-7xl px-6 py-12">
      {/* 1. HERO CERCLLES */}
      <header className="mb-16 relative p-12 rounded-[3rem] bg-stone-950 border border-emerald-500/10 overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--emerald-500)/0.1),transparent_70%)] opacity-30" />
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 relative z-10">
          <div className="space-y-6 text-center lg:text-left flex-1">
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 rounded-full">
              <Users className="h-4 w-4 text-emerald-500" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">Cercles de Lecture Privés</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-display font-black text-white tracking-tighter leading-none">
              Lisez <br/><span className="text-emerald-500">Ensemble</span>
            </h1>
            <p className="text-lg text-stone-400 font-light italic max-w-xl">
              "Ne lisez plus jamais seul. Créez votre sanctuaire de lecture, invitez vos amis et vivez l'histoire en même temps."
            </p>
            <div className="flex flex-wrap justify-center lg:justify-start gap-4 pt-4">
              <Button size="lg" className="rounded-full px-8 font-black bg-emerald-500 hover:bg-emerald-600 text-white shadow-xl shadow-emerald-500/20">
                <PlusCircle className="mr-2 h-5 w-5" /> Créer un Cercle
              </Button>
              <Button variant="outline" size="lg" className="rounded-full border-white/20 text-white hover:bg-white/10 backdrop-blur-md">
                Comment ça marche ?
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 w-full lg:w-auto shrink-0">
            <div className="bg-white/5 backdrop-blur-md p-6 rounded-[2rem] border border-white/10 text-center space-y-1">
              <p className="text-3xl font-black text-emerald-500">1.2k</p>
              <p className="text-[10px] uppercase font-bold text-stone-500 tracking-widest">Cercles Créés</p>
            </div>
            <div className="bg-white/5 backdrop-blur-md p-6 rounded-[2rem] border border-white/10 text-center space-y-1">
              <p className="text-3xl font-black text-emerald-500">100%</p>
              <p className="text-[10px] uppercase font-bold text-stone-500 tracking-widest">Confidentialité</p>
            </div>
          </div>
        </div>
      </header>

      {/* 2. DIRECTORY */}
      <section className="space-y-10">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-display font-black uppercase tracking-tighter">Vos Cercles Actifs</h2>
          <Badge variant="outline" className="text-[9px] uppercase font-black px-3 py-1">Mode Immersion</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cercles.map((c) => (
            <Card key={c.id} className="bg-card/50 border-border/50 rounded-3xl hover:border-emerald-500/30 transition-all duration-500 overflow-hidden group">
              <CardHeader className="p-6 pb-2">
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-emerald-500/10 p-3 rounded-2xl text-emerald-500 group-hover:scale-110 transition-transform">
                    <Users className="h-6 w-6" />
                  </div>
                  {c.isPrivate ? <Lock className="h-4 w-4 text-stone-600" /> : <Globe className="h-4 w-4 text-emerald-500" />}
                </div>
                <CardTitle className="text-xl font-display font-black group-hover:text-emerald-500 transition-colors">{c.name}</CardTitle>
                <CardDescription className="text-xs italic font-light line-clamp-2 mt-2">"{c.desc}"</CardDescription>
              </CardHeader>
              <CardContent className="p-6 pt-4 space-y-4">
                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl border border-border/50">
                  <div className="relative h-10 w-7 rounded-md overflow-hidden shrink-0">
                    <Image src={`https://picsum.photos/seed/${c.id}/100/150`} alt="Cover" fill className="object-cover" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[8px] uppercase font-black text-emerald-500 tracking-widest">En cours de lecture</p>
                    <p className="text-xs font-bold truncate text-foreground">{c.story}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {[1,2,3].map(i => <Avatar key={i} className="h-7 w-7 border-2 border-background shadow-md"><AvatarImage src={`https://picsum.photos/seed/u${i}/100/100`} /></Avatar>)}
                    <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center text-[8px] font-black border-2 border-background">+{c.members - 3}</div>
                  </div>
                  <span className="text-[9px] font-black uppercase text-stone-500">{c.lastActive}</span>
                </div>
              </CardContent>
              <CardFooter className="p-6 pt-0">
                <Button className="w-full h-11 rounded-xl bg-white/5 border border-white/10 text-white font-black hover:bg-emerald-500 hover:text-white transition-all">
                  Entrer dans le salon <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}

          {/* CREATE PLACEHOLDER */}
          <div className="border-2 border-dashed border-emerald-500/20 rounded-3xl p-8 flex flex-col items-center justify-center text-center space-y-4 hover:border-emerald-500/50 transition-all cursor-pointer group bg-emerald-500/[0.02]">
            <div className="bg-emerald-500/10 p-5 rounded-full text-emerald-500 group-hover:scale-110 transition-transform">
              <PlusCircle className="h-8 w-8" />
            </div>
            <div>
              <h4 className="font-display font-black text-lg">Nouveau Cercle</h4>
              <p className="text-xs text-stone-500 italic max-w-[180px] mx-auto">Lancez une aventure collective avec vos abonnés.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SOCIAL VISION */}
      <section className="mt-24 p-12 rounded-[3rem] bg-stone-900 text-white relative overflow-hidden border border-white/5">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl opacity-50" />
        <div className="relative z-10 grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl font-display font-black gold-resplendant leading-tight">La Culture <br/> est un Partage</h2>
              <p className="text-stone-400 text-lg font-light leading-relaxed italic">
                "NexusHub Profils 2.0 ne se limite pas à la lecture. Nous bâtissons des ponts entre les esprits. Suivez des lecteurs qui ont vos goûts, découvrez leurs bibliothèques et progressez ensemble dans les mythes du continent."
              </p>
            </div>
            <div className="grid grid-cols-2 gap-6">
              {[
                { icon: ShieldCheck, title: 'Salons Privés', text: 'Zéro distraction, juste vous et vos amis.' },
                { icon: Zap, text: 'Points de Karma collectifs.', title: 'Succès de Groupe' }
              ].map((item, i) => (
                <div key={i} className="space-y-2">
                  <div className="bg-white/5 p-2 rounded-lg w-fit"><item.icon className="h-5 w-5 text-emerald-500" /></div>
                  <h4 className="font-bold text-sm">{item.title}</h4>
                  <p className="text-[10px] text-stone-500 leading-snug">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative aspect-square rounded-[3rem] overflow-hidden border-8 border-white/5 shadow-2xl">
            <Image src="https://picsum.photos/seed/social-hub/800/800" alt="Social Hub" fill className="object-cover opacity-60" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center p-8 bg-black/40 backdrop-blur-xl border border-white/10 rounded-[2rem] max-w-xs scale-90 md:scale-100">
                <Users className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
                <p className="text-xs font-black uppercase tracking-widest text-white">Rejoignez 50k Passionnés</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
