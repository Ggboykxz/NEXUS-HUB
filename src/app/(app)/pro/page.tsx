'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { 
  CheckCircle2, Crown, Star, Zap, Rocket, ShieldCheck, 
  ChevronDown, MessageSquare, Heart, Coins, Gift, 
  Award, ArrowRight, Loader2, Sparkles 
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function ProProgramPage() {
  const [particles, setParticles] = useState<{id: number, top: string, left: string, dur: string, del: string, tx: string, ty: string}[]>([]);

  useEffect(() => {
    const newParticles = [...Array(20)].map((_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      dur: `${5 + Math.random() * 5}s`,
      del: `${Math.random() * 5}s`,
      tx: `${Math.random() * 150 - 75}px`,
      ty: `${Math.random() * -250}px`
    }));
    setParticles(newParticles);
  }, []);

  const tiers = [
    {
      id: 'standard',
      name: "Standard",
      price: "2,99€",
      period: "/mois",
      description: "L'essentiel pour une lecture fluide.",
      icon: Zap,
      color: "border-white/10 bg-white/5",
      benefits: [
        "Zéro publicité sur tout le site",
        "Accès anticipé (+1 chapitre)",
        "Badge 'Membre Pro' argent",
        "Soutien aux artistes"
      ],
      buttonText: "Souscrire Standard",
      popular: false
    },
    {
      id: 'premium',
      name: "Premium",
      price: "4,99€",
      period: "/mois",
      description: "L'expérience NexusHub ultime.",
      icon: Crown,
      color: "border-primary/30 bg-primary/[0.03]",
      benefits: [
        "Tout ce qui est dans Standard",
        "Accès anticipé (+3 chapitres)",
        "Accès aux Forums Privés",
        "50 AfriCoins offerts / mois",
        "Badge 'Elite' doré exclusif"
      ],
      buttonText: "Devenir Premium",
      popular: true
    },
    {
      id: 'supporter',
      name: "Supporter",
      price: "7,99€",
      period: "/mois",
      description: "Pour les mécènes de la culture.",
      icon: Heart,
      color: "border-emerald-500/20 bg-emerald-500/[0.02]",
      benefits: [
        "Tout ce qui est dans Premium",
        "150 AfriCoins offerts / mois",
        "-15% sur toute la boutique",
        "Votre nom dans les crédits",
        "Vote prioritaire sur les Originals"
      ],
      buttonText: "Devenir Supporter",
      popular: false
    }
  ];

  const testimonials = [
    {
      name: "Moussa Diop",
      role: "Lecteur Premium",
      content: "L'accès anticipé aux chapitres de Cyber-Reines change tout. Je ne peux plus m'en passer !",
      avatar: "https://picsum.photos/seed/moussa/100/100"
    },
    {
      name: "Sarah Lawson",
      role: "Mécène Supporter",
      content: "Soutenir les créateurs africains avec cet abonnement me rend fière. Les bonus en AfriCoins sont super avantageux.",
      avatar: "https://picsum.photos/seed/sarah/100/100"
    },
    {
      name: "Amadou K.",
      role: "Abonné Standard",
      content: "Zéro pub pour le prix d'un café ? C'est le meilleur investissement pour ma pause lecture.",
      avatar: "https://picsum.photos/seed/amadou/100/100"
    }
  ];

  return (
    <div className="flex flex-col bg-stone-950 min-h-screen text-white">
      {/* 1. HERO WITH GOLDEN PARTICLES */}
      <section className="relative py-24 md:py-32 overflow-hidden px-6">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,hsl(var(--primary)/0.2),transparent_70%)]" />
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {particles.map((p) => (
              <div 
                key={p.id} 
                className="particle bg-primary/20" 
                style={{
                  top: p.top,
                  left: p.left,
                  '--dur': p.dur,
                  '--del': p.del,
                  '--tx': p.tx,
                  '--ty': p.ty
                } as any} 
              />
            ))}
          </div>
        </div>

        <div className="container relative z-10 max-w-5xl mx-auto text-center space-y-8">
          <Badge variant="outline" className="mb-4 border-primary/20 text-primary px-4 py-1 text-[10px] font-black uppercase tracking-[0.3em]">Élite & Excellence</Badge>
          <h1 className="text-5xl md:text-8xl font-display font-black tracking-tighter leading-[0.9] gold-resplendant">
            Devenez <br/>NexusHub Pro
          </h1>
          <p className="text-xl md:text-2xl text-stone-300 max-w-2xl mx-auto font-light italic leading-relaxed">
            "Rejoignez le cercle restreint des passionnés qui façonnent l'avenir de la narration africaine mondiale."
          </p>
          <div className="flex justify-center gap-2 animate-bounce pt-8">
            <ChevronDown className="h-6 w-6 text-primary/50" />
          </div>
        </div>
      </section>

      {/* 2. PRICING GRID */}
      <section className="py-20 container max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {tiers.map((tier) => (
            <Card key={tier.id} className={cn(
              "relative flex flex-col h-full border-2 transition-all duration-500 hover:shadow-2xl rounded-[2.5rem] overflow-hidden group",
              tier.color,
              tier.popular ? "scale-105 z-10 border-primary shadow-[0_0_40px_rgba(212,168,67,0.15)]" : "hover:border-primary/20"
            )}>
              {tier.popular && (
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-primary to-transparent" />
              )}
              
              <CardHeader className="p-8 text-center space-y-4">
                {tier.popular && (
                  <Badge className="w-fit mx-auto bg-primary text-black font-black uppercase text-[8px] px-3 py-0.5 mb-2">Choix du Hub</Badge>
                )}
                <div className={cn(
                  "w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-2 transition-transform group-hover:scale-110",
                  tier.popular ? "bg-primary/20 text-primary" : "bg-white/5 text-stone-400"
                )}>
                  <tier.icon className="h-8 w-8" />
                </div>
                <div>
                  <CardTitle className="text-3xl font-display font-black text-white">{tier.name}</CardTitle>
                  <CardDescription className="text-stone-500 italic text-xs mt-1">{tier.description}</CardDescription>
                </div>
                <div className="pt-2">
                  <span className="text-5xl font-black text-white">{tier.price}</span>
                  <span className="text-stone-500 font-bold uppercase text-[10px] ml-1">{tier.period}</span>
                </div>
              </CardHeader>

              <CardContent className="flex-1 p-8 pt-0 space-y-6">
                <Separator className="bg-white/5" />
                <ul className="space-y-4">
                  {tier.benefits.map((benefit, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle2 className={cn("h-5 w-5 shrink-0 mt-0.5", tier.popular ? "text-primary" : "text-emerald-500")} />
                      <span className="text-sm text-stone-300 font-light leading-snug">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter className="p-8 pt-0">
                <Button className={cn(
                  "w-full h-14 rounded-2xl font-black text-base transition-all",
                  tier.popular ? "bg-primary text-black gold-shimmer shadow-xl" : "bg-white/5 text-white hover:bg-white/10"
                )}>
                  {tier.buttonText}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      {/* 3. TESTIMONIALS */}
      <section className="py-24 bg-primary/5 border-y border-primary/10">
        <div className="container max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-display font-black uppercase tracking-tight">Ils ont rejoint l'Élite</h2>
            <p className="text-stone-400 italic">"Parole de passionnés, au cœur de l'histoire."</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <div key={i} className="p-8 rounded-[2rem] bg-stone-900/50 border border-white/5 space-y-6">
                <p className="text-lg font-light italic leading-relaxed text-stone-300">"{t.content}"</p>
                <div className="flex items-center gap-4 pt-4 border-t border-white/5">
                  <Avatar className="h-12 w-12 border-2 border-primary/20">
                    <AvatarImage src={t.avatar} />
                    <AvatarFallback>{t.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-bold text-white text-sm">{t.name}</p>
                    <p className="text-[10px] uppercase font-black text-primary tracking-widest">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. FAQ SECTION */}
      <section className="py-24 container max-w-3xl mx-auto px-6">
        <div className="text-center mb-16 space-y-4">
          <div className="bg-primary/10 p-3 rounded-2xl w-fit mx-auto mb-4">
            <Award className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-3xl font-display font-black uppercase tracking-tight">Questions Fréquentes</h2>
          <p className="text-stone-500 italic">Tout savoir sur votre abonnement NexusHub Pro.</p>
        </div>

        <Accordion type="single" collapsible className="space-y-4">
          {[
            { q: "Puis-je annuler mon abonnement à tout moment ?", a: "Absolument. NexusHub Pro est sans engagement. Vous pouvez arrêter votre abonnement en un clic depuis vos paramètres, et vous conserverez vos avantages jusqu'à la fin de la période en cours." },
            { q: "Comment fonctionnent les AfriCoins mensuels ?", a: "Le jour de votre renouvellement, votre solde est automatiquement crédité de 50 ou 150 🪙 selon votre palier. Vous pouvez les utiliser pour débloquer des chapitres Premium ou faire des dons aux artistes." },
            { q: "Qu'est-ce que l'accès anticipé ?", a: "Il vous permet de lire les prochains épisodes de vos séries préférées avant tout le monde (jusqu'à 3 chapitres d'avance). C'est le moyen idéal pour rester en avance sur les théories de la communauté !" },
            { q: "Les artistes touchent-ils une part de mon abonnement ?", a: "Oui. NexusHub reverse une part importante des revenus Pro aux créateurs dont vous lisez les œuvres, via un fonds de soutien dédié à l'excellence créative." }
          ].map((item, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="border-white/5 bg-white/5 rounded-2xl px-6">
              <AccordionTrigger className="text-sm md:text-base font-bold text-stone-200 hover:text-primary transition-colors text-left py-6">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-stone-400 text-sm leading-relaxed pb-6 italic">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* 5. FINAL CTA */}
      <section className="py-24 text-center px-6 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] -z-10" />
        <div className="max-w-2xl mx-auto space-y-10">
          <div className="space-y-4">
            <h2 className="text-4xl md:text-6xl font-display font-black leading-tight">Prêt à changer de dimension ?</h2>
            <p className="text-stone-400 text-lg">Rejoignez les 12 000 membres Pro déjà actifs.</p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Button size="lg" className="rounded-full px-12 h-16 font-black text-xl shadow-2xl shadow-primary/30 bg-primary text-black gold-shimmer">
              Choisir mon Plan
            </Button>
            <div className="flex items-center gap-2 text-stone-500 text-[10px] font-black uppercase tracking-widest">
              <ShieldCheck className="h-4 w-4 text-emerald-500" /> Paiement Sécurisé SSL
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
