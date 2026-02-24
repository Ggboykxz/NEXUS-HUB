'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Zap, Trophy, Calendar, Award, PlayCircle, Timer, Globe, Users, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function EventsHubPage() {
  const mainEvents = [
    {
      id: 'live',
      title: "NexusHub Live",
      description: "Sessions de dessin en direct avec les maîtres du continent. Apprenez, échangez et vibrez.",
      icon: PlayCircle,
      href: "/events/live",
      status: "En direct",
      color: "text-rose-500 bg-rose-500/10",
      image: "https://picsum.photos/seed/livehub/800/400"
    },
    {
      id: 'hackathon',
      title: "24h NexusHub",
      description: "Le hackathon créatif mondial. Une page de BD en 24 heures pour prouver votre talent.",
      icon: Timer,
      href: "/events/hackathon",
      status: "Bientôt",
      color: "text-amber-500 bg-amber-500/10",
      image: "https://picsum.photos/seed/hackathonhub/800/400"
    },
    {
      id: 'festivals',
      title: "Festivals BD Afrique",
      description: "Le calendrier complet des rendez-vous physiques. Dakar, Libreville, Lagos : ne manquez rien.",
      icon: Calendar,
      href: "/events/festivals",
      status: "Calendrier",
      color: "text-emerald-500 bg-emerald-500/10",
      image: "https://picsum.photos/seed/festivalhub/800/400"
    },
    {
      id: 'awards',
      title: "Prix NexusHub",
      description: "Récompenser l'excellence. Votez pour vos œuvres et artistes préférés de l'année.",
      icon: Award,
      href: "/events/awards",
      status: "Votes ouverts",
      color: "text-primary bg-primary/10",
      image: "https://picsum.photos/seed/awardshub/800/400"
    }
  ];

  return (
    <div className="flex flex-col bg-background min-h-screen">
      {/* Hero */}
      <section className="relative py-24 bg-stone-950 overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.15),transparent_70%)]" />
        <div className="container relative z-10 mx-auto max-w-7xl px-6 text-center space-y-8">
          <Badge variant="outline" className="mb-4 border-primary/20 text-primary px-4 py-1 text-[10px] font-black uppercase tracking-[0.3em]">Culture & Interaction</Badge>
          <h1 className="text-5xl md:text-7xl font-display font-black text-white tracking-tighter leading-none gold-resplendant">
            Le Coeur Battant <br/> du 9ème Art
          </h1>
          <p className="text-xl text-stone-400 max-w-3xl mx-auto font-light italic">
            "Vivez la création en direct, relevez des défis épiques et célébrez la richesse de la bande dessinée africaine mondiale."
          </p>
        </div>
      </section>

      {/* Main Grid */}
      <section className="py-20 container max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-8">
          {mainEvents.map((event) => (
            <Link key={event.id} href={event.href} className="group">
              <Card className="bg-card/50 border-border/50 rounded-[2.5rem] overflow-hidden hover:border-primary/30 transition-all duration-500 hover:shadow-2xl h-full flex flex-col">
                <div className="relative h-64 overflow-hidden">
                  <Image src={event.image} alt={event.title} fill className="object-cover group-hover:scale-105 transition-transform duration-1000" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <Badge className={cn("absolute top-6 left-6 border-none text-white", event.id === 'live' ? 'bg-rose-600 animate-pulse' : 'bg-black/60 backdrop-blur-md')}>
                    {event.status}
                  </Badge>
                </div>
                <CardContent className="p-10 flex-1 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className={cn("p-3 rounded-2xl w-fit", event.color)}>
                      <event.icon className="h-8 w-8" />
                    </div>
                    <h3 className="text-3xl font-display font-black">{event.title}</h3>
                    <p className="text-muted-foreground leading-relaxed italic">{event.description}</p>
                  </div>
                  <div className="pt-8 border-t border-border/50 mt-8 flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary">Explorer la section</span>
                    <ArrowRight className="h-5 w-5 text-primary group-hover:translate-x-2 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Community Teaser */}
      <section className="pb-24 px-6">
        <div className="container max-w-7xl mx-auto">
          <Card className="bg-stone-900 border-none rounded-[3rem] p-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-12 opacity-5"><Users className="h-64 w-64 text-primary" /></div>
            <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h2 className="text-4xl font-display font-black text-white">Une communauté active</h2>
                <p className="text-stone-400 text-lg leading-relaxed font-light">
                  Rejoignez des milliers de fans lors de nos événements saisonniers. Plus de 500 prix ont déjà été distribués aux créateurs les plus méritants.
                </p>
                <div className="flex flex-wrap gap-4">
                  <div className="bg-white/5 border border-white/10 px-6 py-3 rounded-2xl text-center">
                    <p className="text-2xl font-black text-primary">12k+</p>
                    <p className="text-[10px] text-stone-500 uppercase font-bold">Participants Live</p>
                  </div>
                  <div className="bg-white/5 border border-white/10 px-6 py-3 rounded-2xl text-center">
                    <p className="text-2xl font-black text-emerald-500">85</p>
                    <p className="text-[10px] text-stone-500 uppercase font-bold">Festivals Listés</p>
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <Button size="lg" className="rounded-full px-12 h-16 font-black text-lg shadow-xl shadow-primary/20 gold-shimmer bg-primary text-black">
                  Créer mon événement
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
