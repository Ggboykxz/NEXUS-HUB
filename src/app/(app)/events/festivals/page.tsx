
'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Globe, MapPin, Calendar, Users, Info, Search, Map, ChevronRight, Sparkles, Filter, Ticket, ExternalLink, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

const FESTIVALS_DATA = [
  {
    id: 1,
    name: "FIBD Angoulême",
    location: "Angoulême, France 🇫🇷",
    date: "29 Jan - 01 Fév 2026",
    month: "Janvier",
    type: "Mondial",
    description: "Le plus grand festival de bande dessinée au monde, un rendez-vous incontournable pour les auteurs africains en quête d'exportation.",
    image: "https://picsum.photos/seed/angouleme/800/400",
    regLink: "https://www.bdangouleme.com/",
    tags: ["Mondial", "B2B", "Elite"]
  },
  {
    id: 2,
    name: "FIBDA Alger",
    location: "Alger, Algérie 🇩🇿",
    date: "15 - 19 Mars 2026",
    month: "Mars",
    type: "Majeur",
    description: "Festival International de la Bande Dessinée d'Alger, carrefour majeur du 9ème art en Afrique du Nord et foyer de l'afro-manga.",
    image: "https://picsum.photos/seed/alger/800/400",
    regLink: "#",
    tags: ["Maghreb", "Cosplay", "Tradition"]
  },
  {
    id: 3,
    name: "Lagos Comic Con",
    location: "Lagos, Nigeria 🇳🇬",
    date: "10 - 12 Avril 2026",
    month: "Avril",
    type: "Pop Culture",
    description: "Le plus grand rassemblement de la culture geek en Afrique de l'Ouest. Un hub massif pour l'animation et le webtoon nigérian.",
    image: "https://picsum.photos/seed/lagoscc/800/400",
    regLink: "#",
    tags: ["Webtoon", "Gaming", "Nigeria"]
  },
  {
    id: 4,
    name: "Nairobi ComicCon",
    location: "Nairobi, Kenya 🇰🇪",
    date: "25 - 27 Août 2026",
    month: "Août",
    type: "Majeur",
    description: "Naiccon rassemble les créateurs de tout l'Est africain pour célébrer le gaming et la bande dessinée dans une ambiance électrique.",
    image: "https://picsum.photos/seed/nairobi/800/400",
    regLink: "#",
    tags: ["East Africa", "Tech", "Manga"]
  },
  {
    id: 5,
    name: "FESBBD Libreville",
    location: "Libreville, Gabon 🇬🇦",
    date: "12 - 15 Octobre 2026",
    month: "Octobre",
    type: "Local",
    description: "Le Festival Bulles de Libreville célèbre le talent gabonais et l'afrofuturisme au coeur de l'Afrique Centrale.",
    image: "https://picsum.photos/seed/libreville/800/400",
    regLink: "#",
    tags: ["Gabon", "Afrofuturisme", "Nexus-Partner"]
  }
];

const MONTHS = [
  "Tous", "Janvier", "Février", "Mars", "Avril", "Mai", "Juin", 
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
];

export default function FestivalCalendarPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMonth, setActiveMonth] = useState('Tous');

  const filteredFestivals = useMemo(() => {
    return FESTIVALS_DATA.filter(fest => {
      const matchesSearch = fest.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           fest.location.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesMonth = activeMonth === 'Tous' || fest.month === activeMonth;
      return matchesSearch && matchesMonth;
    });
  }, [searchQuery, activeMonth]);

  return (
    <div className="container mx-auto max-w-7xl px-6 py-12">
      {/* 1. HERO HEADER */}
      <header className="mb-16 relative p-12 rounded-[3rem] bg-stone-950 border border-primary/10 overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.15),transparent_70%)]" />
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 relative z-10">
          <div className="space-y-6 text-center lg:text-left flex-1">
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 rounded-full">
              <Map className="h-4 w-4 text-emerald-500" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">Guide Culturel Nexus</span>
            </div>
            <h1 className="text-4xl md:text-7xl font-display font-black text-white tracking-tighter leading-none">
              Calendrier des <br/><span className="gold-resplendant">Festivals 2026</span>
            </h1>
            <p className="text-lg text-stone-400 font-light italic max-w-xl leading-relaxed">
              "L'histoire s'écrit sur tablette, mais elle se vit en vrai. Trouvez le prochain rendez-vous majeur près de chez vous et accréditez-vous."
            </p>
            <div className="flex flex-wrap justify-center lg:justify-start gap-4 pt-4">
              <Button size="lg" className="rounded-full px-8 font-black bg-primary text-black gold-shimmer h-14 shadow-xl shadow-primary/20">
                Signaler un Festival
              </Button>
              <Button variant="outline" size="lg" className="rounded-full border-white/20 text-white font-bold h-14 px-8 hover:bg-white/10 backdrop-blur-md">
                Aide aux Déplacements
              </Button>
            </div>
          </div>

          <div className="w-full lg:w-80 bg-white/5 backdrop-blur-xl p-8 rounded-[3rem] border border-white/10 text-center space-y-6">
            <div className="h-16 w-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(212,168,67,0.2)]">
              <Sparkles className="h-8 w-8 text-primary animate-pulse" />
            </div>
            <div>
              <p className="text-xs font-black text-white uppercase tracking-widest mb-1">Partenaire Officiel</p>
              <p className="text-[10px] text-stone-500 font-bold uppercase">Accréditation Nexus Pro disponible</p>
            </div>
            <div className="flex flex-wrap justify-center gap-4 opacity-40 grayscale hover:grayscale-0 transition-all">
              <div className="h-8 w-8 bg-white/10 rounded-lg" title="Sponsor 1" />
              <div className="h-8 w-8 bg-white/10 rounded-lg" title="Sponsor 2" />
              <div className="h-8 w-8 bg-white/10 rounded-lg" title="Sponsor 3" />
            </div>
          </div>
        </div>
      </header>

      {/* 2. MONTH FILTER TABS */}
      <div className="mb-12 overflow-x-auto pb-4 scrollbar-hide">
        <div className="flex items-center gap-2 min-w-max bg-muted/30 p-1.5 rounded-2xl border border-border/50">
          {MONTHS.map((m) => (
            <button
              key={m}
              onClick={() => setActiveMonth(m)}
              className={cn(
                "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                activeMonth === m 
                  ? "bg-primary text-black shadow-lg shadow-primary/20" 
                  : "text-stone-500 hover:text-white hover:bg-white/5"
              )}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-[320px,1fr] gap-12">
        {/* 3. SEARCH & INFO SIDEBAR */}
        <aside className="space-y-10">
          <div className="space-y-4">
            <h4 className="text-[10px] uppercase font-black tracking-[0.3em] text-primary ml-1">Quête Géo-localisée</h4>
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-600 group-focus-within:text-primary transition-colors" />
              <Input 
                placeholder="Ville, pays ou festival..." 
                className="pl-11 h-14 rounded-2xl bg-white/5 border-white/5 focus:border-primary/50 transition-all text-sm font-medium"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <Card className="border-none bg-stone-900 text-white p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:rotate-12 transition-transform duration-1000">
              <Info className="h-32 w-32" />
            </div>
            <h4 className="text-sm font-black uppercase text-emerald-500 mb-4 tracking-widest flex items-center gap-2">
              <Sparkles className="h-4 w-4" /> Le Saviez-vous ?
            </h4>
            <p className="text-xs text-stone-400 leading-relaxed italic font-light">
              "NexusHub subventionne chaque année 10 artistes émergents du programme **Draft** pour qu'ils puissent exposer physiquement dans ces festivals majeurs."
            </p>
            <Button variant="link" className="p-0 h-auto text-primary text-[10px] font-black uppercase mt-6 group-hover:translate-x-1 transition-transform">
              Candidature Exposant <ChevronRight className="h-3 w-3 ml-1" />
            </Button>
          </Card>

          <div className="p-8 rounded-[2.5rem] border border-white/5 bg-primary/5 space-y-4">
            <h4 className="text-[10px] font-black uppercase text-primary tracking-widest">Type d'événements</h4>
            <div className="space-y-2">
              {['Majeur', 'Local', 'Pop Culture', 'Technique'].map(t => (
                <div key={t} className="flex items-center justify-between text-[10px] font-bold text-stone-500 uppercase">
                  <span>{t}</span>
                  <div className="h-1 w-1 rounded-full bg-stone-800" />
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* 4. FESTIVALS LISTING */}
        <div className="space-y-8 animate-in fade-in duration-700">
          {filteredFestivals.length > 0 ? filteredFestivals.map((fest) => (
            <Card key={fest.id} className="bg-card/50 border-border/50 rounded-[3rem] overflow-hidden group hover:border-primary/30 transition-all duration-500 flex flex-col md:flex-row hover:shadow-2xl hover:-translate-y-1">
              <div className="relative w-full md:w-72 h-56 md:h-auto overflow-hidden shrink-0">
                <Image src={fest.image} alt={fest.name} fill className="object-cover group-hover:scale-110 transition-transform duration-[3000ms]" />
                <div className="absolute inset-0 bg-gradient-to-r from-stone-950/40 via-transparent to-transparent" />
                <div className="absolute top-6 left-6 flex flex-col gap-2">
                  <Badge className="bg-primary text-black border-none text-[9px] font-black uppercase px-3 shadow-lg">{fest.month}</Badge>
                </div>
              </div>
              
              <CardContent className="p-8 md:p-10 flex-1 space-y-6 flex flex-col">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex gap-2">
                    {fest.tags.map(t => <Badge key={t} variant="secondary" className="bg-white/5 text-stone-400 border-white/5 text-[8px] font-bold uppercase tracking-widest px-2">{t}</Badge>)}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-black text-primary uppercase bg-primary/10 px-3 py-1 rounded-full">
                    <Calendar className="h-3.5 w-3.5" /> {fest.date}
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-3xl font-display font-black text-white group-hover:text-primary transition-colors tracking-tighter leading-none">{fest.name}</h3>
                  <div className="flex items-center gap-2 text-xs font-bold text-stone-300">
                    <MapPin className="h-4 w-4 text-rose-500" /> {fest.location}
                  </div>
                </div>

                <p className="text-muted-foreground text-sm leading-relaxed font-light italic border-l-2 border-primary/20 pl-6 flex-1">
                  "{fest.description}"
                </p>

                <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div className="flex items-center -space-x-3">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="h-8 w-8 rounded-full border-2 border-stone-950 bg-stone-800 overflow-hidden shadow-lg">
                        <Image src={`https://picsum.photos/seed/user${i+fest.id}/100/100`} alt="attendee" width={32} height={32} />
                      </div>
                    ))}
                    <div className="h-8 w-8 rounded-full border-2 border-stone-950 bg-primary/10 flex items-center justify-center text-[8px] font-black text-primary">+120</div>
                  </div>
                  
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <Button asChild variant="outline" className="flex-1 sm:flex-none rounded-xl h-11 border-white/10 text-white hover:bg-white/5 font-bold text-[10px] uppercase gap-2">
                      <a href={fest.regLink} target="_blank" rel="noopener noreferrer"><Ticket className="h-3.5 w-3.5" /> Site Officiel</a>
                    </Button>
                    <Button className="flex-1 sm:flex-none rounded-xl h-11 bg-primary text-black font-black text-[10px] uppercase tracking-widest gold-shimmer px-8">
                      Accréditation <ArrowRight className="ml-2 h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )) : (
            <div className="text-center py-32 bg-stone-900/30 rounded-[3rem] border-2 border-dashed border-white/5 space-y-6">
              <div className="mx-auto w-24 h-24 bg-white/5 rounded-full flex items-center justify-center opacity-20">
                <Calendar className="h-12 w-12 text-stone-500" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-display font-black text-white">Le désert culturel...</h3>
                <p className="text-stone-500 italic font-light max-w-xs mx-auto">"Aucun festival majeur n'est répertorié pour {activeMonth === 'Tous' ? 'cette période' : activeMonth}."</p>
              </div>
              <Button onClick={() => { setSearchQuery(''); setActiveMonth('Tous'); }} variant="outline" className="rounded-full border-primary text-primary">Réinitialiser les filtres</Button>
            </div>
          )}
        </div>
      </div>

      {/* 5. CTA BOTTOM */}
      <section className="mt-24 p-12 rounded-[3.5rem] bg-stone-900 text-white relative overflow-hidden border border-white/5 shadow-2xl">
        <div className="absolute top-0 right-0 p-12 opacity-5"><Globe className="h-64 w-64 text-primary" /></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="space-y-6 max-w-xl">
            <h2 className="text-4xl font-display font-black gold-resplendant leading-tight">Votre Festival n'est <br/> pas listé ?</h2>
            <p className="text-stone-400 text-lg font-light italic">
              "Aidez-nous à bâtir la plus grande base de données culturelle du 9ème art africain. Signalez un événement pour lui donner une visibilité mondiale."
            </p>
          </div>
          <Button size="lg" className="rounded-full px-12 h-16 font-black text-xl bg-white text-black hover:bg-stone-200 shadow-2xl group">
            Ajouter un événement <ChevronRight className="ml-2 h-6 w-6 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </section>
    </div>
  );
}
