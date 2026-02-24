'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Rocket, MessageSquare, Users, Sparkles, ChevronRight, Target, Coins, Award, ArrowUpRight, Star } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export default function DraftProgramPage() {
  const tiers = [
    {
      id: 'emergent',
      level: 'Niveau 1',
      title: '🌱 Émergent',
      condition: 'Inscription + 1 œuvre',
      benefits: ['Publication libre', 'Badge Émergent', 'Accès Forums'],
      revenue: '15%',
      color: 'border-emerald-500/20 bg-emerald-500/[0.02]',
      icon: Rocket
    },
    {
      id: 'draft',
      level: 'Niveau 2',
      title: '⭐ Draft',
      condition: '500 vues + 3 chapitres',
      benefits: ['Priorité listing', 'Analytics basiques', 'Accès Mentorat'],
      revenue: '30%',
      color: 'border-orange-500/20 bg-orange-500/[0.02]',
      icon: Star
    },
    {
      id: 'pro',
      level: 'Niveau 3',
      title: '🏆 Pro',
      condition: '5k vues + Avis éditorial',
      benefits: ['Badge Pro', 'Monétisation Premium', 'Outils IA Pro'],
      revenue: '60%',
      color: 'border-primary/30 bg-primary/[0.02]',
      icon: Award
    },
    {
      id: 'elite',
      level: 'Niveau 4',
      title: '👑 Elite',
      condition: '50k vues + Contrat NexusHub',
      benefits: ['Œuvres Originales', 'Avances sur revenus', 'Marketing dédié'],
      revenue: '70%',
      color: 'border-purple-500/20 bg-purple-500/[0.02]',
      icon: Sparkles
    }
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative py-24 bg-stone-950 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,hsl(var(--accent)/0.1),transparent_60%)]" />
        <div className="container relative z-10 mx-auto max-w-7xl px-6 text-center">
          <Badge variant="outline" className="mb-6 border-orange-500/50 text-orange-400 px-4 py-1 text-xs font-bold uppercase tracking-widest">
            Académie Créative Panafricaine
          </Badge>
          <h1 className="text-5xl md:text-7xl font-display font-black text-white mb-6 tracking-tighter">
            Devenez une <span className="text-orange-500">Légende</span>
          </h1>
          <p className="text-xl text-stone-400 max-w-3xl mx-auto mb-10 leading-relaxed font-light italic">
            "Le parcours de l'artiste NexusHub est un voyage en 4 étapes pour transformer votre passion en une carrière professionnelle mondiale."
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" className="h-14 px-8 rounded-full font-bold text-lg bg-orange-600 hover:bg-orange-700">
              <Link href="/submit">Lancer mon Projet</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-14 px-8 rounded-full border-white/20 text-white hover:bg-white/10">
              <Link href="/mentorship">Voir le Mentorat</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Progression Grid */}
      <section className="py-24 bg-background">
        <div className="container mx-auto max-w-7xl px-6">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl font-display font-black tracking-tight">Le Parcours de l'Artiste</h2>
            <p className="text-muted-foreground text-lg font-light">Gagnez en expérience, augmentez vos revenus et bâtissez votre empire.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {tiers.map((tier) => (
              <Card key={tier.id} className={cn("relative overflow-hidden border-2 transition-all hover:shadow-2xl", tier.color)}>
                <div className="absolute top-4 right-4 opacity-10">
                    <tier.icon className="h-16 w-16" />
                </div>
                <CardHeader className="pb-4">
                  <span className="text-[10px] uppercase font-black text-muted-foreground tracking-widest mb-1">{tier.level}</span>
                  <CardTitle className="text-2xl font-black font-display">{tier.title}</CardTitle>
                  <CardDescription className="text-xs font-bold text-primary italic">{tier.condition}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <p className="text-[10px] uppercase font-black text-stone-500 tracking-tighter">Avantages Clés</p>
                    <ul className="space-y-2">
                      {tier.benefits.map((benefit, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="pt-4 border-t border-white/10">
                    <div className="flex justify-between items-end">
                        <div>
                            <p className="text-[10px] uppercase font-black text-stone-500 tracking-tighter">Part de Revenus</p>
                            <p className="text-3xl font-black text-foreground">{tier.revenue}</p>
                        </div>
                        <Badge variant="secondary" className="bg-primary/10 text-primary border-none">🪙 AfriCoins</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Detail */}
      <section className="py-24 bg-stone-900 text-white">
        <div className="container mx-auto max-w-5xl px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <h2 className="text-4xl font-display font-black leading-tight">Pourquoi franchir les paliers ?</h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                    <div className="bg-orange-500/20 p-3 rounded-2xl h-fit"><Coins className="text-orange-500 h-6 w-6" /></div>
                    <div>
                        <h4 className="font-bold text-lg mb-1">Redistribution Équitable</h4>
                        <p className="text-stone-400 text-sm leading-relaxed">Plus vous progressez, plus nous réduisons nos frais de plateforme. À l'Elite, vous gardez 70% de vos gains en AfriCoins.</p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <div className="bg-primary/20 p-3 rounded-2xl h-fit"><Users className="text-primary h-6 w-6" /></div>
                    <div>
                        <h4 className="font-bold text-lg mb-1">Accès Mentors Pro</h4>
                        <p className="text-stone-400 text-sm leading-relaxed">Dès le niveau 2, vous pouvez demander des retours critiques à nos artistes Pro pour accélérer votre progression technique.</p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <div className="bg-emerald-500/20 p-3 rounded-2xl h-fit"><Award className="text-emerald-500 h-6 w-6" /></div>
                    <div>
                        <h4 className="font-bold text-lg mb-1">Label de Qualité</h4>
                        <p className="text-stone-400 text-sm leading-relaxed">Les badges Pro et Elite sont des gages de confiance pour les éditeurs physiques internationaux avec qui nous collaborons.</p>
                    </div>
                </div>
              </div>
            </div>
            <div className="relative aspect-square rounded-[3rem] overflow-hidden border-8 border-white/5 shadow-2xl">
                <Image src="https://picsum.photos/seed/artist-progression/800/800" alt="Artist Path" fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-8">
                    <p className="text-primary font-bold italic">"Du premier croquis à la gloire continentale."</p>
                </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
