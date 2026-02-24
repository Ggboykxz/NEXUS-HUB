'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, Sparkles, MessageSquare, Heart, Search, 
  PlusCircle, Trophy, Flame, ChevronRight, Filter, Globe, Lock
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export default function ReadingClubsPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const featuredClub = {
    id: 'c1',
    name: "Le Sanctuaire d'Orisha",
    description: "Club officiel dédié aux Chroniques d'Orisha. Discussions de théories, fan arts et décryptage chapitre par chapitre.",
    coverImage: "https://picsum.photos/seed/club-orisha/800/400",
    memberCount: 1245,
    lastActivity: "Il y a 5 minutes",
    tags: ["Officiel", "Mythologie", "Spoiler-Safe"]
  };

  const categories = [
    { name: "Tous", icon: Globe },
    { name: "Mythologie", icon: Sparkles },
    { name: "Afrofuturisme", icon: Flame },
    { name: "Action", icon: Zap },
    { name: "Privés", icon: Lock }
  ];

  const clubs = [
    { id: 'c2', name: "Cyber-Reines Fans", members: 850, activity: "Hier", type: "user", category: "Afrofuturisme" },
    { id: 'c3', name: "L'Empire Mandingue : Lore", members: 420, activity: "2h", type: "user", category: "Histoire" },
    { id: 'c4', name: "Dessinateurs du Gabon", members: 120, activity: "10 min", type: "user", category: "Artistique" },
    { id: 'c5', name: "Théories Kasaï", members: 2100, activity: "Maintenant", type: "official", category: "Action" }
  ];

  return (
    <div className="container mx-auto max-w-7xl px-6 py-12">
      {/* 1. HERO HEADER */}
      <header className="mb-16 relative p-12 rounded-[3rem] bg-stone-950 border border-primary/10 overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.1),transparent_70%)]" />
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 relative z-10">
          <div className="space-y-6 text-center lg:text-left flex-1">
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 rounded-full">
              <Users className="h-4 w-4 text-emerald-500" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">Clubs de Lecture Nexus</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-display font-black text-white tracking-tighter leading-none">
              L'Expérience <br/><span className="gold-resplendant">Collective</span>
            </h1>
            <p className="text-lg text-stone-400 font-light italic max-w-xl">
              "Ne lisez plus seul. Rejoignez des cercles de passionnés, participez aux débats de chapitre et votez pour l'avenir de vos héros."
            </p>
            <div className="flex flex-wrap justify-center lg:justify-start gap-4 pt-4">
              <Button size="lg" className="rounded-full px-8 font-black bg-primary text-black gold-shimmer">
                <PlusCircle className="mr-2 h-5 w-5" /> Créer un Club
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-full border-white/20 text-white hover:bg-white/10 backdrop-blur-md">
                <Link href="#how-it-works">Comment ça marche ?</Link>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 w-full lg:w-auto shrink-0">
            <div className="bg-white/5 backdrop-blur-md p-6 rounded-[2rem] border border-white/10 text-center space-y-1">
              <p className="text-3xl font-black text-primary">450</p>
              <p className="text-[10px] uppercase font-bold text-stone-500 tracking-widest">Clubs Actifs</p>
            </div>
            <div className="bg-white/5 backdrop-blur-md p-6 rounded-[2rem] border border-white/10 text-center space-y-1">
              <p className="text-3xl font-black text-emerald-500">12k</p>
              <p className="text-[10px] uppercase font-bold text-stone-500 tracking-widest">Débats / jour</p>
            </div>
          </div>
        </div>
      </header>

      {/* 2. FEATURED CLUB OF THE MONTH */}
      <section className="mb-20">
        <div className="flex items-center gap-3 mb-8">
            <Trophy className="h-6 w-6 text-amber-500" />
            <h2 className="text-2xl font-display font-black uppercase tracking-tighter">Club du Mois</h2>
        </div>
        <Card className="bg-stone-900 border-none rounded-[2.5rem] overflow-hidden relative shadow-2xl group">
            <div className="grid md:grid-cols-2">
                <div className="relative h-64 md:h-auto overflow-hidden">
                    <Image src={featuredClub.coverImage} alt={featuredClub.name} fill className="object-cover group-hover:scale-105 transition-transform duration-1000" />
                    <div className="absolute inset-0 bg-gradient-to-r from-stone-900 via-stone-900/40 to-transparent hidden md:block" />
                </div>
                <CardContent className="p-8 md:p-12 space-y-6 relative z-10">
                    <div className="flex flex-wrap gap-2">
                        {featuredClub.tags.map(t => <Badge key={t} className="bg-white/10 text-stone-300 border-white/5">{t}</Badge>)}
                    </div>
                    <h3 className="text-3xl md:text-5xl font-display font-black text-white gold-resplendant">{featuredClub.name}</h3>
                    <p className="text-stone-400 font-light italic leading-relaxed">{featuredClub.description}</p>
                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                        <div className="flex items-center gap-4">
                            <div className="flex -space-x-3">
                                {[1,2,3,4,5].map(i => <Avatar key={i} className="h-10 w-10 border-4 border-stone-900 shadow-xl"><AvatarImage src={`https://picsum.photos/seed/u${i}/100/100`} /></Avatar>)}
                            </div>
                            <p className="text-xs font-black text-emerald-500 uppercase tracking-widest">{featuredClub.memberCount} passionnés</p>
                        </div>
                        <Button className="rounded-full px-8 bg-primary text-black font-black">Rejoindre le Cercle</Button>
                    </div>
                </CardContent>
            </div>
        </Card>
      </section>

      {/* 3. CLUBS DIRECTORY */}
      <section className="space-y-10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2 bg-muted/50 p-1.5 rounded-2xl border border-border/50">
                {categories.map((cat) => (
                    <Button key={cat.name} variant="ghost" size="sm" className="rounded-xl text-[10px] font-black uppercase tracking-tighter gap-2">
                        <cat.icon className="h-3.5 w-3.5" /> {cat.name}
                    </Button>
                ))}
            </div>
            <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-500" />
                <Input 
                    placeholder="Chercher un club..." 
                    className="pl-9 h-11 rounded-xl bg-muted/30 border-none text-sm font-medium"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {clubs.map((club) => (
                <Link key={club.id} href={`/clubs/${club.id}`} className="block group">
                    <Card className="h-full bg-card/50 border-border/50 rounded-3xl hover:shadow-2xl hover:border-primary/30 transition-all duration-500 overflow-hidden">
                        <div className="h-32 bg-stone-900 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-black/40" />
                            <Image src={`https://picsum.photos/seed/club${club.id}/400/200`} alt={club.name} fill className="object-cover opacity-40 group-hover:scale-110 transition-transform duration-700" />
                        </div>
                        <CardContent className="p-6 relative">
                            <Avatar className="h-16 w-16 border-4 border-background absolute -top-8 left-6 shadow-2xl">
                                <AvatarImage src={`https://picsum.photos/seed/logo${club.id}/100/100`} />
                                <AvatarFallback>C</AvatarFallback>
                            </Avatar>
                            <div className="pt-8 space-y-3">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-xl font-bold font-display group-hover:text-primary transition-colors truncate">{club.name}</h4>
                                    {club.type === 'official' && <Badge className="bg-primary/10 text-primary text-[8px] h-4">PRO</Badge>}
                                </div>
                                <p className="text-xs text-muted-foreground flex items-center gap-2">
                                    <Users className="h-3 w-3" /> {club.members} membres
                                </p>
                                <div className="flex items-center justify-between pt-4">
                                    <span className="text-[10px] font-black uppercase text-stone-500 tracking-tighter flex items-center gap-1.5">
                                        <MessageSquare className="h-3 w-3 text-primary" /> {club.activity}
                                    </span>
                                    <Button variant="ghost" size="sm" className="h-8 rounded-full text-[10px] font-black uppercase tracking-widest gap-1 hover:bg-primary/10 hover:text-primary">
                                        Voir <ChevronRight className="h-3 w-3" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </Link>
            ))}
        </div>
      </section>

      {/* 4. CTA FOOTER */}
      <section className="mt-24 p-12 rounded-[3rem] bg-emerald-500/5 border border-emerald-500/10 text-center space-y-8">
          <div className="bg-white rounded-full p-4 w-fit mx-auto shadow-xl">
            <Users className="h-8 w-8 text-emerald-500" />
          </div>
          <div className="max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl font-display font-black">Ne restez plus dans l'ombre</h2>
            <p className="text-stone-400 italic">"Créez votre propre club de lecture en quelques secondes et animez votre communauté de fans."</p>
            <Button size="lg" className="rounded-full px-12 h-14 bg-emerald-500 hover:bg-emerald-600 text-white font-black shadow-xl shadow-emerald-500/20">
                Lancer mon Club
            </Button>
          </div>
      </section>
    </div>
  );
}

function Zap(props: any) {
    return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/></svg>
}
