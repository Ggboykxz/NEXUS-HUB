'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Globe, MapPin, Calendar, Users, Info, Search, Map, ChevronRight, Sparkles, Filter } from 'lucide-react';
import Image from 'next/image';

export default function FestivalCalendarPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const festivals = [
    {
      id: 1,
      name: "Dakar Comic Con",
      location: "Dakar, Sénégal 🇸🇳",
      date: "15-18 Août 2026",
      type: "Majeur",
      description: "Le plus grand rassemblement de pop culture d'Afrique de l'Ouest.",
      image: "https://picsum.photos/seed/dakar/800/400"
    },
    {
      id: 2,
      name: "Festival Bulles du Gabon",
      location: "Libreville, Gabon 🇬🇦",
      date: "10 Septembre 2026",
      type: "Local",
      description: "Célébration du 9ème art gabonais et de l'afrofuturisme.",
      image: "https://picsum.photos/seed/gabon/800/400"
    },
    {
      id: 3,
      name: "Lagos Animation Festival",
      location: "Lagos, Nigeria 🇳🇬",
      date: "5 Novembre 2026",
      type: "Technique",
      description: "Workshop, conférences et projections de webtoons nigérians.",
      image: "https://picsum.photos/seed/lagos/800/400"
    }
  ];

  return (
    <div className="container mx-auto max-w-7xl px-6 py-12">
      <header className="mb-16 relative p-12 rounded-[3rem] bg-stone-950 border border-primary/10 overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.1),transparent_70%)]" />
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 relative z-10">
          <div className="space-y-6 text-center lg:text-left flex-1">
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 rounded-full">
              <Map className="h-4 w-4 text-emerald-500" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">Guide Culturel Nexus</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-display font-black text-white tracking-tighter leading-none">
              Calendrier des <br/><span className="gold-resplendant">Festivals</span>
            </h1>
            <p className="text-lg text-stone-400 font-light italic max-w-xl">
              "L'histoire s'écrit sur papier, mais elle se vit en vrai. Trouvez le prochain rendez-vous BD près de chez vous."
            </p>
            <div className="flex flex-wrap justify-center lg:justify-start gap-4 pt-4">
              <Button size="lg" className="rounded-full px-8 font-black bg-primary text-black gold-shimmer">Signaler un Festival</Button>
              <Button variant="outline" size="lg" className="rounded-full border-white/20 text-white hover:bg-white/10 backdrop-blur-md">Mode Carte</Button>
            </div>
          </div>

          <div className="w-full lg:w-80 bg-white/5 backdrop-blur-xl p-8 rounded-[2rem] border border-white/10 text-center space-y-4">
            <Sparkles className="h-8 w-8 text-primary mx-auto" />
            <p className="text-xs font-bold text-stone-300 uppercase tracking-widest">Partenaires Officiels</p>
            <div className="flex flex-wrap justify-center gap-4 opacity-40 grayscale">
              <div className="h-8 w-8 bg-white rounded-full" />
              <div className="h-8 w-8 bg-white rounded-full" />
              <div className="h-8 w-8 bg-white rounded-full" />
            </div>
          </div>
        </div>
      </header>

      <div className="grid lg:grid-cols-3 gap-12">
        {/* FILTERS */}
        <aside className="space-y-10">
          <div className="space-y-4">
            <h4 className="text-[10px] uppercase font-black tracking-[0.3em] text-primary">Recherche Géographique</h4>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Chercher une ville ou un pays..." 
                className="pl-9 h-12 rounded-2xl bg-muted/30 border-none text-sm font-medium"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-[10px] uppercase font-black tracking-[0.3em] text-primary">Par Saison</h4>
            <div className="grid grid-cols-2 gap-2">
              {['Hiver 26', 'Printemps 26', 'Été 26', 'Automne 26'].map(s => (
                <Button key={s} variant="outline" className="rounded-xl h-10 text-[9px] font-black uppercase border-white/5 bg-white/5 hover:bg-primary hover:text-black transition-all">{s}</Button>
              ))}
            </div>
          </div>

          <Card className="border-none bg-stone-900 text-white p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-5"><Info className="h-24 w-24" /></div>
            <h4 className="text-sm font-black uppercase text-emerald-500 mb-4 tracking-widest">Le saviez-vous ?</h4>
            <p className="text-xs text-stone-400 leading-relaxed italic font-light">"NexusHub sponsorise chaque année 10 artistes émergents pour qu'ils puissent exposer physiquement dans ces festivals."</p>
            <Button variant="link" className="p-0 h-auto text-primary text-[10px] font-black uppercase mt-4">En savoir plus <ChevronRight className="h-3 w-3" /></Button>
          </Card>
        </aside>

        {/* LIST */}
        <div className="lg:col-span-2 space-y-8">
          {festivals.map((fest) => (
            <Card key={fest.id} className="bg-card/50 border-border/50 rounded-[2.5rem] overflow-hidden group hover:border-primary/30 transition-all duration-500 flex flex-col md:flex-row">
              <div className="relative w-full md:w-64 h-48 md:h-auto overflow-hidden">
                <Image src={fest.image} alt={fest.name} fill className="object-cover group-hover:scale-110 transition-transform duration-1000" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-transparent" />
              </div>
              <CardContent className="p-8 flex-1 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-none text-[9px] font-black uppercase tracking-widest">{fest.type}</Badge>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase">
                    <Calendar className="h-3 w-3 text-primary" /> {fest.date}
                  </div>
                </div>
                <h3 className="text-2xl font-display font-black group-hover:text-primary transition-colors">{fest.name}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed font-light italic">"{fest.description}"</p>
                <div className="pt-4 border-t border-border/50 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                    <MapPin className="h-4 w-4 text-rose-500" /> {fest.location}
                  </div>
                  <Button variant="ghost" size="sm" className="h-9 rounded-full text-[10px] font-black uppercase tracking-widest gap-2 hover:bg-primary/10 hover:text-primary transition-all">
                    Voir la fiche <ChevronRight className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
