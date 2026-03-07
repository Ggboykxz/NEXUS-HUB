'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Languages, Globe, Star, Clock, CheckCircle2, ChevronRight, Zap, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';

export default function TranslationsDashboardPage() {
  const { profile, loading } = useAuth();

  if (loading) return null;

  return (
    <div className="container mx-auto max-w-7xl px-6 py-12 space-y-12">
      <header className="relative p-12 rounded-[3rem] bg-stone-950 border border-emerald-500/10 overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.1),transparent_70%)]" />
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 relative z-10">
          <div className="space-y-6 text-center lg:text-left flex-1">
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 rounded-full">
              <Languages className="h-4 w-4 text-emerald-500" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">Atelier de Traduction</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-display font-black text-white tracking-tighter leading-none">
              Portail des <br/><span className="text-emerald-500">Linguistes</span>
            </h1>
            <p className="text-lg text-stone-400 font-light italic max-w-xl">
              "Votre expertise connecte les cultures. Gérez vos missions de traduction et gagnez des AfriCoins en exportant nos légendes."
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 w-full lg:w-auto shrink-0">
            <div className="bg-white/5 backdrop-blur-md p-6 rounded-[2rem] border border-white/10 text-center space-y-1">
              <p className="text-3xl font-black text-primary">{profile?.afriCoins || 0}</p>
              <p className="text-[10px] uppercase font-bold text-stone-500 tracking-widest">Gains 🪙</p>
            </div>
            <div className="bg-white/5 backdrop-blur-md p-6 rounded-[2rem] border border-white/10 text-center space-y-1">
              <p className="text-3xl font-black text-emerald-500">0</p>
              <p className="text-[10px] uppercase font-bold text-stone-500 tracking-widest">Missions</p>
            </div>
          </div>
        </div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="col-span-2 bg-card/50 border-border/50 rounded-[2.5rem] p-10 flex flex-col items-center justify-center text-center space-y-6">
          <div className="bg-white/5 p-8 rounded-full">
            <Sparkles className="h-12 w-12 text-stone-700" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-display font-black text-white uppercase tracking-tighter">Tableau de bord vierge</h3>
            <p className="text-stone-500 italic max-w-sm mx-auto">"Vous n'avez pas encore de missions en cours. Explorez les annonces pour commencer à traduire."</p>
          </div>
          <Button asChild className="rounded-full px-10 h-14 bg-emerald-600 text-white font-black gold-shimmer">
            <Link href="/translators">Trouver une mission</Link>
          </Button>
        </Card>

        <aside className="space-y-8">
          <Card className="bg-stone-900 border-none rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 p-6 opacity-5"><Zap className="h-32 w-32 text-primary" /></div>
            <h4 className="text-sm font-black uppercase text-primary mb-6 tracking-widest flex items-center gap-2">
              <Star className="h-4 w-4" /> Vos Langues
            </h4>
            <div className="flex flex-wrap gap-2">
              {profile?.translatorLanguages?.map((lang: string) => (
                <Badge key={lang} className="bg-white/5 text-stone-300 border-white/10 uppercase text-[10px] px-3">{lang}</Badge>
              )) || <p className="text-xs text-stone-500 italic">Aucune langue configurée.</p>}
            </div>
          </Card>

          <Card className="bg-primary/5 border border-primary/10 rounded-[2.5rem] p-8">
            <h4 className="text-xs font-black uppercase text-primary mb-4 tracking-widest">Conseil du Hub</h4>
            <p className="text-xs text-stone-400 leading-relaxed italic font-light">
              "Utilisez le Studio de Traduction IA pour obtenir une première base de travail et concentrez-vous sur l'adaptation des nuances culturelles."
            </p>
          </Card>
        </aside>
      </section>
    </div>
  );
}
