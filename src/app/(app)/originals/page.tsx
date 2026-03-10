'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { 
  Trophy, 
  Crown, 
  Star, 
  Zap, 
  Calendar, 
  Award, 
  ArrowRight, 
  Timer, 
  Flame, 
  Sparkles,
  Users,
  CheckCircle2,
  Film,
  Building2,
  Loader2,
  Info
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { useQuery } from '@tanstack/react-query';
import type { Story } from '@/lib/types';

export default function OriginalsPage() {
  const [timeLeft, setTimeLeft] = useState({ days: 12, hours: 5, minutes: 42, seconds: 18 });

  // Countdown timer logic
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetching real "Originals" from database with error handling for permissions/indexes
  const { data: winners = [], isLoading } = useQuery({
    queryKey: ['originals-winners'],
    queryFn: async () => {
      try {
        const storiesRef = collection(db, 'stories');
        const q = query(
          storiesRef, 
          where('isOriginal', '==', true),
          where('isPublished', '==', true),
          orderBy('views', 'desc'),
          limit(3)
        );
        const snap = await getDocs(q);
        return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Story));
      } catch (error: any) {
        console.warn("Firestore query failed, falling back to basic fetching:", error.message);
        // Fallback: simple query if composite index is missing or permissions error
        const storiesRef = collection(db, 'stories');
        const qFallback = query(storiesRef, limit(10));
        const snap = await getDocs(qFallback);
        return snap.docs
          .map(doc => ({ id: doc.id, ...doc.data() } as Story))
          .filter(s => s.isOriginal && s.isPublished)
          .sort((a, b) => b.views - a.views)
          .slice(0, 3);
      }
    }
  });

  return (
    <div className="flex flex-col bg-stone-950 min-h-screen">
      {/* 1. HERO BANNER */}
      <section className="relative py-24 overflow-hidden border-b border-primary/10">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.2),transparent_70%)]" />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]" />
        </div>

        <div className="container relative z-10 max-w-7xl mx-auto px-6 text-center space-y-8 animate-in fade-in slide-in-from-top-10 duration-1000">
          <div className="mx-auto w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20 shadow-[0_0_50px_rgba(212,168,67,0.3)] animate-pulse">
            <Crown className="h-12 w-12 text-primary" />
          </div>
          
          <div className="space-y-4">
            <h1 className="text-5xl md:text-8xl font-display font-black text-white leading-tight tracking-tighter gold-resplendant">
              NexusHub Originals
            </h1>
            <p className="text-xl md:text-2xl text-stone-300 max-w-3xl mx-auto font-light italic leading-relaxed">
              "Des œuvres exclusives produites en partenariat avec NexusHub. L'excellence de la narration visuelle africaine au service du monde."
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <Button asChild size="lg" className="h-16 px-12 rounded-full font-black text-xl gold-shimmer shadow-2xl shadow-primary/30 bg-primary text-black">
              <Link href="/submit">Soumettre ma candidature</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-16 px-12 rounded-full border-white/20 text-white font-bold hover:bg-white/10 backdrop-blur-md">
              <Link href="#winners">Voir le Palmarès</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* 2. ACTIVE CONTEST SECTION */}
      <section className="py-24 container max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-10">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Badge className="bg-emerald-500 text-white border-none uppercase tracking-[0.2em] font-black text-[10px] px-4 py-1">CONCOURS ACTIF</Badge>
                <div className="flex items-center gap-2 text-primary font-bold text-[10px] uppercase tracking-widest">
                  <Flame className="h-4 w-4 animate-bounce" /> 1,245 inscrits
                </div>
              </div>
              <h2 className="text-4xl md:text-6xl font-display font-black text-white leading-[0.9] tracking-tighter">
                Afrofuturisme <br/><span className="text-primary">2100</span>
              </h2>
              <p className="text-lg text-stone-400 font-light italic leading-relaxed max-w-xl border-l-4 border-primary/20 pl-6">
                "Imaginez l'Afrique du prochain siècle. Fusionnez technologies ancestrales et innovations cosmiques pour bâtir le récit du futur."
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="p-6 bg-white/5 border border-white/10 rounded-[2rem] shadow-xl">
                <Trophy className="h-8 w-8 text-primary mb-4" />
                <p className="text-[10px] uppercase font-black text-stone-500 tracking-widest mb-1">Grand Prix</p>
                <p className="text-2xl font-black text-white">5 000€ <span className="text-xs text-primary">+ 50k 🪙</span></p>
              </div>
              <div className="p-6 bg-white/5 border border-white/10 rounded-[2rem] shadow-xl">
                <Building2 className="h-8 w-8 text-emerald-500 mb-4" />
                <p className="text-[10px] uppercase font-black text-stone-500 tracking-widest mb-1">Partenariat</p>
                <p className="text-2xl font-black text-white">Contrat Pro</p>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-[10px] uppercase font-black text-stone-500 tracking-[0.3em] text-center lg:text-left">Clôture des soumissions dans :</p>
              <div className="grid grid-cols-4 gap-4">
                {[
                  { val: timeLeft.days, label: "Jours" },
                  { val: timeLeft.hours, label: "Heures" },
                  { val: timeLeft.minutes, label: "Min" },
                  { val: timeLeft.seconds, label: "Sec" },
                ].map((t, i) => (
                  <div key={i} className="bg-stone-900 border border-white/5 p-4 rounded-2xl text-center">
                    <p className="text-3xl font-black text-primary">{t.val.toString().padStart(2, '0')}</p>
                    <p className="text-[8px] font-bold text-stone-600 uppercase tracking-widest">{t.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="relative aspect-square rounded-[3.5rem] overflow-hidden border-8 border-stone-900 shadow-2xl group">
            <Image 
              src="https://res.cloudinary.com/demo/image/upload/v1/samples/hero-afrofuturism.jpg" 
              alt="Contest Concept" 
              fill 
              className="object-cover transition-transform duration-[5000ms] group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-12">
              <div className="space-y-2">
                <Badge className="bg-primary text-black font-black uppercase text-[8px] px-3">CONCOURS OFFICIEL</Badge>
                <p className="text-white font-display text-2xl font-bold leading-tight">"Votre univers, <br/> notre prochain Original."</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. PREVIOUS WINNERS SECTION */}
      <section id="winners" className="py-24 bg-stone-900/50 border-y border-white/5">
        <div className="container max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-lg"><Award className="h-6 w-6 text-primary" /></div>
                <h2 className="text-3xl font-display font-black text-white uppercase tracking-tighter">Lauréats Précédents</h2>
              </div>
              <p className="text-stone-500 font-light italic">"Découvrez les créateurs qui ont déjà marqué l'histoire du Hub."</p>
            </div>
            <Button variant="link" className="text-primary font-black text-[10px] uppercase tracking-widest gap-2">Voir toutes les archives <ArrowRight className="h-4 w-4" /></Button>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="bg-stone-900 h-96 animate-pulse rounded-[2.5rem]" />
              ))}
            </div>
          ) : winners.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {winners.map((winner) => (
                <Card key={winner.id} className="bg-stone-900 border-white/5 rounded-[2.5rem] overflow-hidden group hover:border-primary/30 transition-all duration-500 hover:shadow-2xl">
                  <div className="relative h-64 overflow-hidden">
                    <Image src={winner.coverImage.imageUrl} alt={winner.title} fill className="object-cover opacity-60 group-hover:scale-110 transition-transform duration-1000" />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-transparent to-transparent" />
                    <div className="absolute top-6 left-6">
                      <Badge className="bg-black/60 backdrop-blur-md text-white border-white/10 font-black text-[9px] uppercase tracking-widest px-3">Nexus Original</Badge>
                    </div>
                  </div>
                  <CardContent className="p-8 space-y-4">
                    <div className="space-y-1">
                      <h3 className="text-2xl font-display font-black text-white group-hover:text-primary transition-colors truncate">{winner.title}</h3>
                      <p className="text-xs text-stone-500 font-bold uppercase tracking-widest flex items-center gap-2">
                        <Users className="h-3 w-3 text-primary" /> par {winner.artistName}
                      </p>
                    </div>
                    <div className="pt-4 border-t border-white/5">
                      <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2">
                        <Sparkles className="h-3.5 w-3.5" /> Titre Certifié
                      </p>
                    </div>
                  </CardContent>
                  <CardFooter className="px-8 pb-8 pt-0">
                    <Button asChild variant="ghost" className="w-full rounded-xl bg-white/5 border border-white/10 text-white font-black hover:bg-primary hover:text-black">
                      <Link href={`/webtoon-hub/${winner.slug}`}>Lire l'œuvre</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-stone-900/30 rounded-[3rem] border-2 border-dashed border-white/5 space-y-4">
              <Info className="h-10 w-10 text-stone-700 mx-auto" />
              <p className="text-stone-500 italic">"Aucun Original n'a encore été couronné dans ces sables."</p>
            </div>
          )}
        </div>
      </section>

      {/* 4. CTA FOOTER */}
      <section className="py-24 text-center px-6">
        <div className="max-w-3xl mx-auto space-y-10">
          <div className="mx-auto w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center animate-bounce">
            <Zap className="h-12 w-12 text-primary" />
          </div>
          <div className="space-y-4">
            <h2 className="text-4xl md:text-6xl font-display font-black text-white tracking-tighter">Prêt à entrer <br/> dans l'histoire ?</h2>
            <p className="text-lg text-stone-400 max-w-xl mx-auto italic font-light leading-relaxed">
              "Chaque grand artiste a commencé par oser franchir le pas. Votre univers peut devenir la prochaine grande franchise africaine."
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Button asChild size="lg" className="h-16 px-12 rounded-full font-black text-xl shadow-2xl shadow-primary/20 gold-shimmer bg-primary text-black">
              <Link href="/submit">Déposer mon dossier</Link>
            </Button>
            <div className="flex items-center gap-2 text-stone-500 text-[10px] font-black uppercase tracking-widest">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Validation en 48h
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
