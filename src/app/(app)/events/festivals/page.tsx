'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Globe, MapPin, Calendar, Users, Info, Search, Map, ChevronRight, Sparkles, Filter, Ticket, ExternalLink, ArrowRight, Loader2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { db } from '@/lib/firebase';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';
import { useQuery } from '@tanstack/react-query';

const MONTHS = [
  "Tous", "Janvier", "Février", "Mars", "Avril", "Mai", "Juin", 
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
];

export default function FestivalCalendarPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMonth, setActiveMonth] = useState('Tous');

  const { data: festivals = [], isLoading } = useQuery({
    queryKey: ['festivals-list'],
    queryFn: async () => {
      const q = query(collection(db, 'festivals'), orderBy('startDate', 'asc'));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as any));
    }
  });

  const filteredFestivals = useMemo(() => {
    return festivals.filter(fest => {
      const matchesSearch = fest.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           fest.location.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesMonth = activeMonth === 'Tous' || fest.month === activeMonth;
      return matchesSearch && matchesMonth;
    });
  }, [festivals, searchQuery, activeMonth]);

  return (
    <div className="container mx-auto max-w-7xl px-6 py-12">
      <header className="mb-16 relative p-12 rounded-[3rem] bg-stone-950 border border-primary/10 overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.15),transparent_70%)]" />
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 relative z-10">
          <div className="space-y-6 text-center lg:text-left flex-1">
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 rounded-full">
              <Map className="h-4 w-4 text-emerald-500" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">Guide Culturel Nexus</span>
            </div>
            <h1 className="text-4xl md:text-7xl font-display font-black text-white tracking-tighter leading-none">
              Calendrier des <br/><span className="gold-resplendant">Festivals</span>
            </h1>
            <p className="text-lg text-stone-400 font-light italic max-w-xl leading-relaxed">
              "L'histoire s'écrit sur tablette, mais elle se vit en vrai. Trouvez le prochain rendez-vous majeur près de chez vous."
            </p>
          </div>

          <div className="w-full lg:w-80 bg-white/5 backdrop-blur-xl p-8 rounded-[3rem] border border-white/10 text-center space-y-6">
            <div className="h-16 w-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(212,168,67,0.2)]">
              <Sparkles className="h-8 w-8 text-primary animate-pulse" />
            </div>
            <div>
              <p className="text-xs font-black text-white uppercase tracking-widest mb-1">Partenaire Officiel</p>
              <p className="text-[10px] text-stone-500 font-bold uppercase">Accréditation Nexus Pro disponible</p>
            </div>
          </div>
        </div>
      </header>

      <div className="mb-12 overflow-x-auto pb-4 scrollbar-hide">
        <div className="flex items-center gap-2 min-w-max bg-muted/30 p-1.5 rounded-2xl border border-border/50">
          {MONTHS.map((m) => (
            <button
              key={m}
              onClick={() => setActiveMonth(m)}
              className={cn(
                "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                activeMonth === m 
                  ? "bg-primary text-black shadow-lg" 
                  : "text-stone-500 hover:text-white hover:bg-white/5"
              )}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-[320px,1fr] gap-12">
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
            <h4 className="text-sm font-black uppercase text-emerald-500 mb-4 tracking-widest flex items-center gap-2">
              <Sparkles className="h-4 w-4" /> Le Saviez-vous ?
            </h4>
            <p className="text-xs text-stone-400 leading-relaxed italic font-light">
              "NexusHub subventionne chaque année les artistes du programme **Draft** pour qu'ils puissent exposer physiquement."
            </p>
          </Card>
        </aside>

        <div className="space-y-8 animate-in fade-in duration-700">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-stone-500 font-bold uppercase text-[10px] tracking-widest">Ouverture du calendrier...</p>
            </div>
          ) : filteredFestivals.length > 0 ? filteredFestivals.map((fest) => (
            <Card key={fest.id} className="bg-card/50 border-border/50 rounded-[3rem] overflow-hidden group hover:border-primary/30 transition-all duration-500 flex flex-col md:flex-row hover:shadow-2xl">
              <div className="relative w-full md:w-72 h-56 md:h-auto overflow-hidden shrink-0">
                <Image src={fest.image || "https://picsum.photos/seed/fest/800/400"} alt={fest.name} fill className="object-cover group-hover:scale-110 transition-transform duration-[3000ms]" />
                <div className="absolute top-6 left-6">
                  <Badge className="bg-primary text-black border-none text-[9px] font-black uppercase px-3 shadow-lg">{fest.month}</Badge>
                </div>
              </div>
              
              <CardContent className="p-8 md:p-10 flex-1 space-y-6 flex flex-col">
                <div className="flex flex-wrap items-center justify-between gap-4">
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
                  <Button asChild className="flex-1 sm:flex-none rounded-xl h-11 bg-primary text-black font-black text-[10px] uppercase tracking-widest gold-shimmer px-8">
                    <Link href={fest.regLink || "#"}>Accréditation <ArrowRight className="ml-2 h-3.5 w-3.5" /></Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )) : (
            <div className="text-center py-32 bg-stone-900/30 rounded-[3rem] border-2 border-dashed border-white/5 space-y-6">
              <div className="mx-auto w-24 h-24 bg-white/5 rounded-full flex items-center justify-center opacity-20">
                <Calendar className="h-12 w-12 text-stone-500" />
              </div>
              <p className="text-stone-500 italic font-light max-w-xs mx-auto">"Aucun festival majeur n'est répertorié pour cette période."</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
