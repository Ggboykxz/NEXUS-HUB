
'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Trophy, Target, Users, Zap, Calendar, Award, Banknote, ShieldCheck, ArrowRight, Sparkles, Star, Globe } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function OriginalsCompetitionPage() {
  const currentContest = {
    title: "Afrofuturisme 2100",
    theme: "Imaginez l'Afrique du prochain siècle : technologie, écologie et traditions fusionnées.",
    deadline: "30 Juin 2026",
    prize: "5 000€ + 50 000 🪙",
    status: "Inscriptions Ouvertes"
  };

  const upcomingThemes = [
    { title: "Mythologies Africaines", date: "Septembre 2026", icon: Sparkles, color: "text-amber-500 bg-amber-500/10" },
    { title: "Héroïnes du Quotidien", date: "Décembre 2026", icon: Star, color: "text-rose-500 bg-rose-500/10" },
    { title: "Cyberpunk Lagos", date: "Mars 2027", icon: Zap, color: "text-cyan-500 bg-cyan-500/10" }
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
            Entrez dans la <br/> Légende Originals
          </h1>
          
          <p className="text-xl text-stone-300 max-w-3xl mx-auto font-light italic leading-relaxed">
            "Le concours trimestriel qui transforme les créateurs en icônes. Gagnez en visibilité, remportez des prix prestigieux et rejoignez l'élite de la narration africaine."
          </p>

          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <Button asChild size="lg" className="h-14 px-10 rounded-full font-black text-lg gold-shimmer shadow-2xl shadow-primary/20">
              <Link href="/submit">Participer au Concours</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-14 px-10 rounded-full border-white/20 text-white hover:bg-white/10 backdrop-blur-md">
              <Link href="#rules">Consulter le Règlement</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CURRENT COMPETITION */}
      <section className="py-20 container max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <Badge className="bg-emerald-500 text-white border-none uppercase tracking-widest px-3 py-1">{currentContest.status}</Badge>
              <h2 className="text-4xl font-display font-bold">Thème Actuel : <span className="text-primary">{currentContest.title}</span></h2>
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

            <Button asChild variant="link" className="p-0 h-auto text-primary font-bold group">
                <Link href="/blog/guide-originals" className="flex items-center gap-2">
                    Comment gagner ? Lire notre guide <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
            </Button>
          </div>

          <div className="relative aspect-square rounded-[3rem] overflow-hidden border-8 border-background shadow-2xl">
            <Image 
                src="https://res.cloudinary.com/demo/image/upload/v1/samples/hero-afrofuturism.jpg" 
                alt="Originals Concept" 
                fill 
                className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-10">
                <p className="text-white font-display text-2xl font-bold">"L'avenir s'écrit maintenant."</p>
            </div>
          </div>
        </div>
      </section>

      {/* PRIZES & JURY */}
      <section className="py-24 bg-stone-950 text-white">
        <div className="container max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl font-display font-black tracking-tight">Le Prestige NexusHub</h2>
            <p className="text-stone-400 max-w-2xl mx-auto font-light">Une dotation hybride conçue pour soutenir votre carrière d'artiste professionnel.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-white/5 border-white/10 hover:border-primary/30 transition-all group p-8 rounded-[2.5rem]">
              <div className="bg-primary/20 p-4 rounded-2xl w-fit mb-6 group-hover:scale-110 transition-transform">
                <Banknote className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-white text-2xl mb-4">Cash & Mobile Money</CardTitle>
              <CardContent className="p-0 text-stone-400 text-sm leading-relaxed">
                Les prix cash sont versés en USD/EUR par transfert bancaire ou Mobile Money (Orange Money, Wave, MTN), garantissant une accessibilité immédiate.
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10 hover:border-emerald-500/30 transition-all group p-8 rounded-[2.5rem]">
              <div className="bg-emerald-500/20 p-4 rounded-2xl w-fit mb-6 group-hover:scale-110 transition-transform">
                <Users className="h-8 w-8 text-emerald-500" />
              </div>
              <CardTitle className="text-white text-2xl mb-4">Jury International</CardTitle>
              <CardContent className="p-0 text-stone-400 text-sm leading-relaxed">
                Un panel d'éditeurs africains et internationaux (France, USA, Corée) analyse vos œuvres pour détecter les futurs blockbusters mondiaux.
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10 hover:border-amber-500/30 transition-all group p-8 rounded-[2.5rem]">
              <div className="bg-amber-500/20 p-4 rounded-2xl w-fit mb-6 group-hover:scale-110 transition-transform">
                <Globe className="h-8 w-8 text-amber-500" />
              </div>
              <CardTitle className="text-white text-2xl mb-4">Promotion Maximale</CardTitle>
              <CardContent className="p-0 text-stone-400 text-sm leading-relaxed">
                Le gagnant intègre la sélection "Originals" : campagne marketing dédiée, traduction prioritaire et mise en avant permanente sur le Hub.
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* UPCOMING THEMES */}
      <section className="py-24 container max-w-7xl mx-auto px-6">
        <h3 className="text-2xl font-display font-bold mb-12 flex items-center gap-3">
            <Zap className="text-primary h-6 w-6" /> Calendrier de la Saison
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {upcomingThemes.map((theme, i) => (
                <div key={i} className="flex items-center gap-5 p-6 bg-muted/30 rounded-3xl border border-border/50 group hover:bg-muted/50 transition-all">
                    <div className={cn("p-4 rounded-2xl shrink-0 transition-transform group-hover:scale-110", theme.color)}>
                        <theme.icon className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">{theme.date}</p>
                        <h4 className="text-xl font-bold font-display">{theme.title}</h4>
                    </div>
                </div>
            ))}
        </div>
      </section>

      {/* RULES & LEGAL */}
      <section id="rules" className="py-20 bg-primary/5 border-y border-primary/10">
        <div className="container max-w-4xl mx-auto px-6">
            <div className="flex items-center gap-4 mb-8">
                <ShieldCheck className="h-10 w-10 text-primary" />
                <h2 className="text-3xl font-bold font-display">Éthique & Propriété</h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-10">
                <div className="space-y-4">
                    <h4 className="font-bold text-lg">Vos Droits sont Sacrés</h4>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                        L'artiste conserve 100% de la propriété intellectuelle de son œuvre. NexusHub obtient uniquement une licence de diffusion exclusive de 2 ans pour les œuvres gagnantes.
                    </p>
                </div>
                <div className="space-y-4">
                    <h4 className="font-bold text-lg">Inclusion & Équité</h4>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                        La compétition est ouverte à tous les pays d'Afrique. Le jury s'engage à respecter les sensibilités culturelles et à encourager l'originalité pure.
                    </p>
                </div>
            </div>
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section className="py-24 text-center px-6">
        <div className="max-w-2xl mx-auto space-y-8">
            <div className="mx-auto w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center animate-bounce">
                <Award className="h-12 w-12 text-primary" />
            </div>
            <h2 className="text-4xl font-display font-black">Prêt à changer votre destin ?</h2>
            <p className="text-lg text-muted-foreground italic">"Chaque grand artiste a commencé par oser franchir le pas."</p>
            <Button asChild size="lg" className="h-16 px-12 rounded-full font-black text-xl shadow-2xl shadow-primary/20">
                <Link href="/submit">Soumettre mon Projet</Link>
            </Button>
        </div>
      </section>
    </div>
  );
}
