'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { 
  Trophy, Target, Users, Zap, Calendar, Award, 
  Banknote, ShieldCheck, ArrowRight, Sparkles, Star, 
  Globe, Building2, Handshake, Film, Gavel, Mic2, 
  PlayCircle, Clapperboard
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function OriginalsCompetitionPage() {
  const currentContest = {
    title: "Afrofuturisme 2100",
    theme: "Imaginez l'Afrique du prochain siècle : technologie, écologie et traditions fusionnées.",
    deadline: "30 Juin 2026",
    prize: "5 000€ + 50 000 🪙",
    status: "Inscriptions Ouvertes",
    sponsor: "Flutterwave"
  };

  const studioSeries = [
    { title: "Les Veilleurs d'Akoma", studio: "NexusHub Studios", type: "Original", icon: Film },
    { title: "Néo-Dakar 2088", studio: "Nexus x Kugali", type: "Co-production", icon: Handshake },
    { title: "L'Éveil du Shango", studio: "Nexus x Studio Tam", type: "Animation Pilot", icon: Clapperboard },
  ];

  return (
    <div className="flex flex-col bg-background min-h-screen">
      {/* HERO SECTION */}
      <section className="relative py-24 overflow-hidden border-b border-primary/10">
        <div className="absolute inset-0 bg-stone-950">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.2),transparent_70%)]" />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]" />
        </div>

        <div className="container relative z-10 max-w-7xl mx-auto px-6 text-center space-y-8">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 px-4 py-1.5 rounded-full animate-in fade-in slide-in-from-top-4 duration-700">
            <Trophy className="h-4 w-4 text-primary" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">NexusHub Originals</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-display font-black text-white leading-tight tracking-tighter gold-resplendant">
            NexusHub Studios <br/> & Productions
          </h1>
          
          <p className="text-xl text-stone-300 max-w-3xl mx-auto font-light italic leading-relaxed">
            "Nous ne nous contentons pas d'héberger des histoires. Nous les produisons. Découvrez nos séries Originales et nos adaptations en animation."
          </p>

          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <Button asChild size="lg" className="h-14 px-10 rounded-full font-black text-lg gold-shimmer shadow-2xl shadow-primary/20">
              <Link href="/submit">Postuler au Studio</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-14 px-10 rounded-full border-white/20 text-white hover:bg-white/10 backdrop-blur-md">
              <Link href="#productions">Voir nos Co-productions</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* NEXUSHUB STUDIOS WALL */}
      <section id="productions" className="py-20 container max-w-7xl mx-auto px-6">
        <div className="flex items-center gap-3 mb-12">
          <div className="bg-primary/10 p-2 rounded-lg"><Clapperboard className="h-6 w-6 text-primary" /></div>
          <h2 className="text-3xl font-display font-black uppercase tracking-tighter">En Production</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {studioSeries.map((s, i) => (
            <Card key={i} className="bg-stone-900 border-white/5 rounded-[2rem] overflow-hidden group hover:border-primary/30 transition-all duration-500">
              <div className="relative h-48 overflow-hidden">
                <Image src={`https://picsum.photos/seed/studio${i}/600/400`} alt={s.title} fill className="object-cover opacity-60 group-hover:scale-110 transition-transform duration-1000" />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-transparent to-transparent" />
                <Badge className="absolute top-4 left-4 bg-primary text-black font-black text-[8px] uppercase tracking-widest">{s.type}</Badge>
              </div>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="bg-white/5 p-2 rounded-xl"><s.icon className="h-4 w-4 text-primary" /></div>
                  <div>
                    <h4 className="font-bold text-white text-lg leading-tight">{s.title}</h4>
                    <p className="text-stone-500 text-xs font-medium">{s.studio}</p>
                  </div>
                </div>
                <Button variant="ghost" className="w-full text-xs font-black uppercase tracking-widest gap-2 hover:bg-white/5 text-primary">
                  Voir le Trailer <PlayCircle className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CURRENT COMPETITION */}
      <section className="py-20 container max-w-7xl mx-auto px-6 border-t border-white/5">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Badge className="bg-emerald-500 text-white border-none uppercase tracking-widest px-3 py-1">{currentContest.status}</Badge>
                <Badge variant="outline" className="border-primary/20 text-primary gap-2 flex items-center h-7 font-black text-[9px] uppercase">
                    <Handshake className="h-3 w-3" /> Propulsé par {currentContest.sponsor}
                </Badge>
              </div>
              <h2 className="text-4xl font-display font-bold">Le Concours : <span className="text-primary">{currentContest.title}</span></h2>
              <p className="text-lg text-muted-foreground leading-relaxed italic border-l-4 border-primary/20 pl-6">
                {currentContest.theme}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="p-6 bg-card border border-border/50 rounded-3xl shadow-sm">
                <Calendar className="h-6 w-6 text-primary mb-3" />
                <p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest mb-1">Date Limite</p>
                <p className="text-xl font-bold">{currentContest.deadline}</p>
              </div>
              <div className="p-6 bg-stone-900 border-none text-white rounded-3xl shadow-xl relative overflow-hidden">
                <Banknote className="h-6 w-6 text-primary mb-3" />
                <p className="text-[10px] uppercase font-black text-primary tracking-widest mb-1">Grand Prix</p>
                <p className="text-xl font-black">{currentContest.prize}</p>
                <div className="absolute -bottom-4 -right-4 opacity-10">
                    <Trophy className="h-20 w-20" />
                </div>
              </div>
            </div>
          </div>

          <div className="relative aspect-square rounded-[3rem] overflow-hidden border-8 border-background shadow-2xl">
            <Image 
                src="https://res.cloudinary.com/demo/image/upload/v1/samples/hero-afrofuturism.jpg" 
                alt="Originals Concept" 
                fill 
                className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-10">
                <div className="space-y-2">
                    <Badge className="bg-rose-600 text-white border-none text-[8px] font-black uppercase">Futur Adapté</Badge>
                    <p className="text-white font-display text-2xl font-bold">"L'avenir s'écrit maintenant."</p>
                </div>
            </div>
          </div>
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section className="py-24 text-center px-6 bg-primary/5">
        <div className="max-w-2xl mx-auto space-y-8">
            <div className="mx-auto w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center animate-bounce">
                <Award className="h-12 w-12 text-primary" />
            </div>
            <h2 className="text-4xl font-display font-black">Prêt à entrer dans l'histoire ?</h2>
            <p className="text-lg text-muted-foreground italic">"Chaque grand artiste a commencé par oser franchir le pas. Votre univers peut devenir la prochaine grande franchise africaine."</p>
            <Button asChild size="lg" className="h-16 px-12 rounded-full font-black text-xl shadow-2xl shadow-primary/20 gold-shimmer bg-primary text-black">
                <Link href="/submit">Soumettre mon Projet</Link>
            </Button>
        </div>
      </section>
    </div>
  );
}
