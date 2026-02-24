'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Languages, Award, Coins, Heart, MessageSquare, 
  ChevronRight, Sparkles, Star, Globe, History, 
  ShieldCheck, ArrowRight, Zap, Flame, LayoutGrid,
  CheckCircle2, BookOpen, Users, Building2
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export default function TranslatorsProgramPage() {
  const tiers = [
    {
      title: "🌱 Contributeur",
      condition: "1er chapitre traduit",
      reward: "+10 🪙 / chapitre",
      benefits: ["Badge Apprenti", "Accès Studio IA"],
      color: "border-blue-500/20 bg-blue-500/[0.02]"
    },
    {
      title: "🏆 Certifié Nexus",
      condition: "50 chapitres validés",
      reward: "+25 🪙 / chapitre",
      benefits: ["Priorité Missions Pro", "Signature officielle"],
      color: "border-emerald-500/20 bg-emerald-500/[0.02]"
    },
    {
      title: "👑 Maître Linguiste",
      condition: "Expertise Dialectale",
      reward: "Tarif Libre + Bonus IP",
      benefits: ["Consultant World-Building", "Rôle Sage Forum"],
      color: "border-primary/20 bg-primary/[0.02]"
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* 1. HERO SECTION */}
      <section className="relative py-24 bg-stone-950 overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.15),transparent_70%)]" />
        <div className="container relative z-10 mx-auto max-w-7xl px-6 text-center space-y-8">
          <Badge variant="outline" className="mb-4 border-emerald-500/20 text-emerald-500 px-4 py-1 text-[10px] font-black uppercase tracking-[0.3em]">Ambassadeurs de l'Ombre</Badge>
          <h1 className="text-5xl md:text-8xl font-display font-black text-white tracking-tighter leading-none gold-resplendant">
            Traduisez, <br/>Connectez, <span className="text-emerald-500">Gagnez.</span>
          </h1>
          <p className="text-xl text-stone-400 max-w-3xl mx-auto font-light italic leading-relaxed">
            "NexusHub est le pont entre les cultures. Rejoignez notre programme de traducteurs certifiés, aidez les artistes à s'exporter et soyez rémunéré en AfriCoins pour chaque bulle traduite."
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <Button size="lg" className="rounded-full px-12 h-16 font-black text-xl bg-emerald-500 hover:bg-emerald-600 text-white shadow-2xl shadow-emerald-500/20">Postuler au Programme</Button>
            <Button variant="outline" size="lg" className="rounded-full border-white/20 text-white font-bold h-16 px-10 hover:bg-white/10 backdrop-blur-md">Comment ça marche ?</Button>
          </div>
        </div>
      </section>

      {/* 2. PROGRESSION TIERS */}
      <section className="py-24 container max-w-7xl mx-auto px-6">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl font-display font-black uppercase tracking-tight">Le Parcours du Traducteur</h2>
          <p className="text-muted-foreground text-lg italic font-light">Gagnez en influence et augmentez vos récompenses au fil des mots.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {tiers.map((tier, i) => (
            <Card key={i} className={cn("relative overflow-hidden border-2 transition-all hover:shadow-2xl rounded-[2.5rem]", tier.color)}>
              <CardHeader className="p-8 pb-4">
                <CardTitle className="text-2xl font-black font-display">{tier.title}</CardTitle>
                <CardDescription className="text-xs font-bold text-stone-500 italic mt-1">{tier.condition}</CardDescription>
              </CardHeader>
              <CardContent className="p-8 pt-4 space-y-8">
                <div className="space-y-3">
                  <p className="text-[10px] uppercase font-black text-stone-400 tracking-widest">Rémunération de base</p>
                  <p className="text-3xl font-black text-primary">{tier.reward}</p>
                </div>
                <div className="space-y-3">
                  <p className="text-[10px] uppercase font-black text-stone-400 tracking-widest">Avantages exclusifs</p>
                  <ul className="space-y-2">
                    {tier.benefits.map((b, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-foreground/80">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" /> {b}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* 3. TOOLS & IA SECTION */}
      <section className="py-24 bg-stone-900 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[120px]" />
        <div className="container max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-4xl font-display font-black leading-tight gold-resplendant">L'IA au service <br/> du Traducteur</h2>
              <p className="text-stone-400 text-lg leading-relaxed font-light italic">
                "Notre IA propriétaire ne se contente pas de traduire ; elle suggère des équivalents culturels pour les proverbes et expressions idiomatiques africaines. Gagnez du temps et concentrez-vous sur l'émotion."
              </p>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="bg-white/5 p-3 rounded-2xl w-fit"><Sparkles className="h-6 w-6 text-primary" /></div>
                <h4 className="font-bold">Traduction Nuancée</h4>
                <p className="text-[10px] text-stone-500">IA formée sur les dialectes locaux pour éviter les faux-sens culturels.</p>
              </div>
              <div className="space-y-2">
                <div className="bg-white/5 p-3 rounded-2xl w-fit"><Zap className="h-6 w-6 text-emerald-500" /></div>
                <h4 className="font-bold">Extraction Auto</h4>
                <p className="text-[10px] text-stone-500">L'IA détecte et extrait les dialogues directement depuis les planches.</p>
              </div>
            </div>
          </div>
          <div className="relative aspect-video rounded-[3rem] overflow-hidden border-8 border-white/5 shadow-2xl">
            <Image src="https://picsum.photos/seed/translation-tool/800/600" alt="Tool UI" fill className="object-cover opacity-60" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Badge className="bg-primary text-black font-black uppercase text-xs px-6 py-2">Outils Artistiques 2.0</Badge>
            </div>
          </div>
        </div>
      </section>

      {/* 4. MISSION WALL */}
      <section className="py-24 container max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16">
          <div className="space-y-4">
            <h2 className="text-4xl font-display font-black uppercase tracking-tight">Missions Ouvertes</h2>
            <p className="text-muted-foreground italic">"Des artistes attendent votre expertise pour conquérir le monde."</p>
          </div>
          <Button variant="link" className="text-primary font-bold uppercase tracking-widest gap-2">Voir tout le mur des missions <ArrowRight className="h-4 w-4" /></Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { title: "Chroniques d'Orisha", from: "FR", to: "SW, YO", status: "Urgent", reward: "500 🪙" },
            { title: "Cyber-Reines", from: "FR", to: "EN, HA", status: "Ouvert", reward: "350 🪙" },
            { title: "L'Empire Mandingue", from: "FR", to: "AM", status: "Ouvert", reward: "420 🪙" },
          ].map((m, i) => (
            <Card key={i} className="bg-card/50 border-border/50 rounded-3xl hover:border-primary/30 transition-all group p-6">
              <div className="flex justify-between items-start mb-6">
                <Badge className={cn("bg-stone-100 text-stone-600 border-none px-3 uppercase text-[8px] font-black tracking-widest", m.status === 'Urgent' && "bg-rose-100 text-rose-600")}>{m.status}</Badge>
                <div className="bg-primary/10 p-2.5 rounded-xl text-primary font-black text-sm">{m.reward}</div>
              </div>
              <h4 className="text-xl font-display font-black mb-2 truncate">{m.title}</h4>
              <div className="flex items-center gap-3 text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-6 pt-4 border-t border-border/50">
                <Globe className="h-3 w-3 text-primary" /> {m.from} <ArrowRight className="h-3 w-3" /> {m.to}
              </div>
              <Button className="w-full rounded-xl bg-white/5 border border-white/10 text-foreground font-black group-hover:bg-primary group-hover:text-black transition-all">Postuler à la mission</Button>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
