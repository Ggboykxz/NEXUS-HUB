
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Award, Star, Users, Trophy, Vote, CheckCircle2, ChevronRight, Flame, Sparkles, Heart, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { useQuery } from '@tanstack/react-query';

export default function NexusHubAwardsPage() {
  const [activeCategory, setActiveCategory] = useState('Meilleure Série');

  const categories = [
    "Meilleure Série",
    "Meilleur Scénario",
    "Révélation Draft",
    "Meilleur Design Afro",
    "Coup de Coeur Public"
  ];

  const { data: nominees = [], isLoading } = useQuery({
    queryKey: ['awards-nominees', activeCategory],
    queryFn: async () => {
      try {
        const q = query(
          collection(db, 'awardNominees'),
          where('category', '==', activeCategory),
          orderBy('votes', 'desc'),
          limit(12)
        );
        const snap = await getDocs(q);
        return snap.docs.map(d => ({ id: d.id, ...d.data() } as any));
      } catch (e) {
        // Fallback simple if index missing
        const qSimple = query(collection(db, 'awardNominees'), where('category', '==', activeCategory), limit(12));
        const snap = await getDocs(qSimple);
        return snap.docs.map(d => ({ id: d.id, ...d.data() } as any));
      }
    }
  });

  return (
    <div className="flex flex-col bg-stone-950 min-h-screen text-white">
      {/* 1. HERO GOLDEN */}
      <section className="relative py-24 px-6 overflow-hidden border-b border-primary/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,hsl(var(--primary)/0.2),transparent_70%)]" />
        <div className="container relative z-10 max-w-5xl mx-auto text-center space-y-8">
          <div className="mx-auto w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20 shadow-[0_0_50px_rgba(212,168,67,0.3)] animate-bounce">
            <Award className="h-12 w-12 text-primary" />
          </div>
          
          <h1 className="text-5xl md:text-8xl font-display font-black tracking-tighter leading-none gold-resplendant">
            Annual Awards
          </h1>
          
          <p className="text-xl text-stone-300 max-w-2xl mx-auto font-light italic leading-relaxed">
            "Le pouvoir est entre vos mains. Célébrez les récits qui ont marqué l'année et forgez les nouvelles légendes du Hub."
          </p>

          <div className="flex flex-wrap justify-center gap-4 bg-white/5 backdrop-blur-xl p-2 rounded-2xl border border-white/10 w-fit mx-auto">
            {categories.map((cat) => (
              <Button 
                key={cat}
                onClick={() => setActiveCategory(cat)}
                variant={activeCategory === cat ? 'default' : 'ghost'}
                className={cn(
                  "rounded-xl px-6 font-black text-[10px] uppercase tracking-widest h-10 transition-all",
                  activeCategory === cat ? "bg-primary text-black" : "text-stone-500 hover:text-white"
                )}
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* 2. NOMINEES GRID */}
      <section className="py-20 container max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-3xl font-display font-bold flex items-center gap-3">
            <Vote className="h-8 w-8 text-primary" /> Nommés : {activeCategory}
          </h2>
          <Badge className="bg-emerald-500 text-white border-none uppercase tracking-widest px-3 py-1">Fin des votes : 31 Déc.</Badge>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>
        ) : nominees.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {nominees.map((nom: any) => (
              <Card key={nom.id} className="bg-stone-900 border-white/5 rounded-[2.5rem] overflow-hidden group hover:border-primary/30 transition-all duration-500 hover:shadow-2xl">
                <div className="relative aspect-[3/4] overflow-hidden">
                  <Image src={nom.image || "https://picsum.photos/seed/nom/400/600"} alt={nom.title} fill className="object-cover group-hover:scale-110 transition-transform duration-1000" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-60" />
                  <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2 text-[10px] font-black text-primary border border-primary/20">
                    <Flame className="h-3 w-3 fill-current" /> {nom.votes?.toLocaleString() || 0} votes
                  </div>
                </div>
                <CardContent className="p-8 text-center space-y-4">
                  <div>
                    <h3 className="text-xl font-display font-black text-white group-hover:text-primary transition-colors truncate">{nom.title}</h3>
                    <p className="text-[10px] font-bold text-stone-500 uppercase tracking-widest mt-1">par {nom.artist}</p>
                  </div>
                  <Button className="w-full h-12 rounded-xl bg-white/5 border border-white/10 text-white font-black hover:bg-primary hover:text-black transition-all group-hover:gold-shimmer">
                    Voter pour cette oeuvre
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 border-2 border-dashed border-white/5 rounded-[3rem] bg-white/[0.02]">
            <p className="text-stone-500 italic">Aucun nommé dans cette catégorie pour le moment.</p>
          </div>
        )}
      </section>

      {/* 3. TROPHY PREVIEW */}
      <section className="py-24 bg-primary/5 border-y border-primary/10 relative overflow-hidden">
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
        <div className="container max-w-5xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
          <div className="relative aspect-square rounded-[3rem] overflow-hidden border-8 border-white/5 shadow-2xl">
            <Image src="https://picsum.photos/seed/trophy/800/800" alt="Official Trophy" fill className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-transparent flex items-end p-10">
              <p className="text-primary font-black uppercase tracking-[0.2em] text-xs">Le Trophée Officiel NexusHub</p>
            </div>
          </div>
          <div className="space-y-8">
            <h2 className="text-4xl font-display font-black leading-tight text-white">Plus qu'un vote, <br/> une reconnaissance.</h2>
            <div className="space-y-6">
              {[
                { icon: Star, title: "Légitimité", text: "Le seul prix panafricain basé 100% sur le vote de la communauté." },
                { icon: Users, title: "Visibilité", text: "Les gagnants bénéficient d'une campagne marketing mondiale." },
                { icon: Trophy, title: "Récompense", text: "Un trophée physique et une dotation de 50 000 AfriCoins." },
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="bg-white/10 p-3 rounded-2xl h-fit"><item.icon className="h-6 w-6 text-primary" /></div>
                  <div>
                    <h4 className="font-bold text-lg mb-1 text-white">{item.title}</h4>
                    <p className="text-stone-400 text-sm leading-relaxed font-light italic">"{item.text}"</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
