'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Award, Zap, TrendingUp, Globe, ShieldCheck, Heart, ArrowRight, Star } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function ProProgramPage() {
  const benefits = [
    {
      icon: Zap,
      title: "Monétisation Premium",
      description: "Accédez au système d'AfriCoins et commencez à générer des revenus réels grâce à vos lecteurs."
    },
    {
      icon: Globe,
      title: "Visibilité Mondiale",
      description: "Mise en avant prioritaire sur la page d'accueil et dans les recommandations personnalisées."
    },
    {
      icon: TrendingUp,
      title: "Statistiques Avancées",
      description: "Des outils d'analyse précis pour comprendre votre audience et optimiser vos publications."
    },
    {
      icon: ShieldCheck,
      title: "Certification Officielle",
      description: "Le badge 'Certifié Pro' qui garantit la qualité et le sérieux de votre travail auprès des éditeurs."
    }
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative py-24 bg-stone-950 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,hsl(var(--primary)/0.15),transparent_70%)]" />
        <div className="container relative z-10 mx-auto max-w-7xl px-6 text-center">
          <Badge className="mb-6 bg-emerald-500 text-white border-none px-4 py-1 text-xs font-bold uppercase tracking-widest">
            Programme d'Excellence
          </Badge>
          <h1 className="text-5xl md:text-7xl font-display font-black text-white mb-6 tracking-tighter">
            NexusHub <span className="text-primary">Pro</span>
          </h1>
          <p className="text-xl text-stone-400 max-w-3xl mx-auto mb-10 leading-relaxed font-light italic">
            "Le sommet de la narration visuelle africaine. Un espace exclusif pour les créateurs qui repoussent les limites de l'art et du récit."
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" className="h-14 px-8 rounded-full font-bold text-lg shadow-xl shadow-primary/20">
              <Link href="/submit">Postuler au Programme</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-14 px-8 rounded-full border-white/20 text-white hover:bg-white/10 backdrop-blur-md">
              <Link href="/mentorship">Découvrir le Mentorat</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="py-24 bg-background">
        <div className="container mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Pourquoi devenir Pro ?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Rejoindre le programme Pro, c'est transformer votre passion en une carrière durable.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index} className="border-2 hover:border-primary/50 transition-all duration-300 group">
                <CardHeader>
                  <div className="bg-primary/10 p-4 rounded-2xl w-fit mb-4 group-hover:bg-primary/20 transition-colors">
                    <benefit.icon className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{benefit.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-24 bg-primary/5 border-y border-primary/10">
        <div className="container mx-auto max-w-4xl px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-background rounded-full border border-primary/20 mb-8 shadow-sm">
            <Star className="h-4 w-4 text-primary fill-current" />
            <span className="text-xs font-bold uppercase tracking-widest">Inclusion & Prestige</span>
          </div>
          <h2 className="text-4xl font-display font-bold mb-6">Prêt à entrer dans la légende ?</h2>
          <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
            Le processus de sélection est rigoureux pour maintenir l'excellence du Hub. Nous recherchons de l'originalité, une maîtrise technique et une vision africaine forte.
          </p>
          <Button asChild size="lg" className="h-14 px-12 rounded-full font-bold text-lg">
            <Link href="/submit">Démarrer ma Candidature <ArrowRight className="ml-2 h-5 w-5" /></Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
