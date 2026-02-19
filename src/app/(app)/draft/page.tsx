'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PenSquare, Users, MessageSquare, Rocket, Sparkles, BookOpen, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function DraftProgramPage() {
  const features = [
    {
      icon: Rocket,
      title: "Publication Instantanée",
      description: "Pas de barrière à l'entrée. Partagez votre premier chapitre en quelques minutes seulement."
    },
    {
      icon: MessageSquare,
      title: "Feedback Communautaire",
      description: "Recevez des retours directs de la part des lecteurs pour améliorer votre récit et votre style."
    },
    {
      icon: Users,
      title: "Bâtissez votre Audience",
      description: "Commencez à créer une base de fans fidèles avant même de passer au niveau professionnel."
    },
    {
      icon: Sparkles,
      title: "Tremplin vers le Pro",
      description: "Les meilleures séries Draft sont régulièrement repérées par nos mentors pour rejoindre le programme Pro."
    }
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative py-24 bg-stone-900 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,hsl(var(--accent)/0.1),transparent_60%)]" />
        <div className="container relative z-10 mx-auto max-w-7xl px-6 text-center">
          <Badge variant="outline" className="mb-6 border-orange-500/50 text-orange-400 px-4 py-1 text-xs font-bold uppercase tracking-widest">
            Espace Créativité Libre
          </Badge>
          <h1 className="text-5xl md:text-7xl font-display font-black text-white mb-6 tracking-tighter">
            NexusHub <span className="text-orange-500">Draft</span>
          </h1>
          <p className="text-xl text-stone-400 max-w-3xl mx-auto mb-10 leading-relaxed font-light italic">
            "Le terrain de jeu des nouveaux talents. Osez, créez, et laissez le public découvrir votre univers sans attendre."
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" className="h-14 px-8 rounded-full font-bold text-lg bg-orange-600 hover:bg-orange-700">
              <Link href="/submit">Lancer mon Projet</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-14 px-8 rounded-full border-white/20 text-white hover:bg-white/10">
              <Link href="/stories?type=public">Explorer le Draft</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-background">
        <div className="container mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-dashed border-2 hover:border-orange-500/50 transition-all duration-300">
                <CardHeader>
                  <div className="bg-orange-500/10 p-4 rounded-2xl w-fit mb-4">
                    <feature.icon className="h-8 w-8 text-orange-500" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pathway Section */}
      <section className="py-24 bg-stone-50 dark:bg-stone-900/50">
        <div className="container mx-auto max-w-5xl px-6">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 space-y-6">
              <h2 className="text-4xl font-display font-bold">Du Draft au <span className="text-primary text-glow">Pro</span></h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Le parcours Draft est conçu comme une académie à ciel ouvert. En publiant régulièrement et en interagissant avec votre communauté, vous gagnez des points de réputation. 
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="bg-primary/20 p-1 rounded-full mt-1"><ChevronRight className="h-4 w-4 text-primary" /></div>
                  <p className="font-medium">Atteignez 1000 abonnés pour débloquer le badge 'Espoir'.</p>
                </li>
                <li className="flex items-start gap-3">
                  <div className="bg-primary/20 p-1 rounded-full mt-1"><ChevronRight className="h-4 w-4 text-primary" /></div>
                  <p className="font-medium">Participez aux concours mensuels pour gagner des AfriCoins.</p>
                </li>
                <li className="flex items-start gap-3">
                  <div className="bg-primary/20 p-1 rounded-full mt-1"><ChevronRight className="h-4 w-4 text-primary" /></div>
                  <p className="font-medium">Soumettez votre portfolio à l'équipe Pro dès que vous vous sentez prêt.</p>
                </li>
              </ul>
              <Button asChild className="rounded-full px-8">
                <Link href="/submit">Commencer l'Aventure</Link>
              </Button>
            </div>
            <div className="w-full md:w-1/3 aspect-[3/4] relative rounded-3xl overflow-hidden shadow-2xl border-8 border-background">
              <Image 
                src="https://images.unsplash.com/photo-1544256718-3bcf237f3974?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080" 
                alt="Artiste Draft" 
                fill 
                className="object-cover" 
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
