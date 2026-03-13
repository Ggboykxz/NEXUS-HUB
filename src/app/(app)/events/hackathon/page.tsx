'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { Timer, Trophy, Star, Users, LayoutGrid, CheckCircle2, Zap, Cloud, Globe, ArrowRight, Award } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export default function HackathonPage() {
  const [timeLeft, setTimeLeft] = useState({ h: 23, m: 59, s: 59 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.s > 0) return { ...prev, s: prev.s - 1 };
        if (prev.m > 0) return { h: prev.h, m: prev.m - 1, s: 59 };
        if (prev.h > 0) return { h: prev.h - 1, m: 59, s: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col bg-stone-950 min-h-screen text-white">
      {/* 1. HERO & TIMER */}
      <section className="relative py-24 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,hsl(var(--primary)/0.2),transparent_70%)]" />
        <div className="container relative z-10 max-w-5xl mx-auto text-center space-y-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 px-4 py-1.5 rounded-full">
            <Timer className="h-4 w-4 text-primary" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Challenge Mondial</span>
          </div>
          
          <h1 className="text-5xl md:text-8xl font-display font-black leading-none tracking-tighter gold-resplendant">
            24h NexusHub
          </h1>
          
          <p className="text-xl md:text-2xl text-stone-300 max-w-3xl mx-auto font-light italic leading-relaxed">
            "Une page. 24 heures. Le monde entier pour vous regarder créer votre chef-d'œuvre."
          </p>

          <div className="grid grid-cols-3 gap-4 md:gap-8 max-w-2xl mx-auto">
            {[
              { val: timeLeft.h, label: "Heures" },
              { val: timeLeft.m, label: "Minutes" },
              { val: timeLeft.s, label: "Secondes" },
            ].map((t, i) => (
              <div key={i} className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 md:p-8 rounded-[2rem] shadow-2xl">
                <p className="text-4xl md:text-6xl font-black text-primary mb-1">{t.val.toString().padStart(2, '0')}</p>
                <p className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">{t.label}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" className="h-16 px-12 rounded-full font-black text-xl bg-primary text-black gold-shimmer shadow-2xl shadow-primary/30">S'inscrire au Défi</Button>
            <Button variant="outline" size="lg" className="h-16 px-12 rounded-full border-white/20 text-white font-bold hover:bg-white/10 backdrop-blur-md">Règlement Complet</Button>
          </div>
        </div>
      </section>

      {/* 2. PRIZES & RULES */}
      <section className="py-20 container max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12">
        <div className="space-y-10">
          <h2 className="text-4xl font-display font-bold flex items-center gap-4"><Trophy className="h-10 w-10 text-primary" /> Dotation du Défi</h2>
          <div className="space-y-6">
            {[
              { title: "Grand Prix du Jury", val: "1 000€ + Publication Pro", color: "text-amber-500" },
              { title: "Prix du Public", val: "500€ + Badge Elite", color: "text-rose-500" },
              { title: "Mention Spéciale Lore", val: "250€ + Outils IA", color: "text-cyan-500" },
            ].map((p, i) => (
              <Card key={i} className="bg-white/5 border-white/10 rounded-3xl p-6 group hover:border-primary/30 transition-all">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-[10px] font-black uppercase text-stone-500 tracking-widest mb-1">{p.title}</p>
                    <p className={cn("text-2xl font-black", p.color)}>{p.val}</p>
                  </div>
                  <Award className="h-8 w-8 opacity-20 group-hover:opacity-100 transition-opacity" />
                </div>
              </Card>
            ))}
          </div>
        </div>

        <Card className="bg-stone-900 border-none rounded-[3rem] p-10 md:p-16 flex flex-col justify-center">
          <h3 className="text-3xl font-display font-bold mb-8">Les Règles d'Or</h3>
          <ul className="space-y-6">
            {[
              "Format unique : Une planche de 1 à 6 cases.",
              "Thème imposé dévoilé au coup d'envoi.",
              "Création 100% originale obligatoire.",
              "Soumission numérique via l'Atelier Nexus.",
              "Utilisation de l'IA autorisée uniquement pour l'assistance narrative."
            ].map((rule, i) => (
              <li key={i} className="flex items-start gap-4">
                <CheckCircle2 className="h-6 w-6 text-emerald-500 shrink-0 mt-1" />
                <p className="text-stone-300 text-lg font-light italic">"{rule}"</p>
              </li>
            ))}
          </ul>
        </Card>
      </section>

      {/* 3. SUBMISSION PREVIEW */}
      <section className="py-24 bg-white/[0.02] border-y border-white/5">
        <div className="container max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16">
            <div className="space-y-4">
              <h2 className="text-4xl font-display font-black tracking-tight">Dernières Soumissions</h2>
              <p className="text-stone-400 font-light italic">"Déjà 145 artistes ont rendu leur copie."</p>
            </div>
            <Button variant="link" className="text-primary font-bold uppercase tracking-widest gap-2">Voir tout le mur <ArrowRight className="h-4 w-4" /></Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="aspect-[3/4] relative rounded-3xl overflow-hidden group border border-white/5">
                <Image src={`https://picsum.photos/seed/hack${i}/600/800`} alt="Submission" fill className="object-cover group-hover:scale-110 transition-transform duration-1000" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
                <div className="absolute bottom-6 left-6 flex items-center gap-2">
                  <Avatar className="h-8 w-8 border border-white/20"><AvatarImage src={`https://picsum.photos/seed/u${i}/100/100`} /></Avatar>
                  <span className="text-[10px] font-black text-white uppercase truncate">Artiste_{i}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
