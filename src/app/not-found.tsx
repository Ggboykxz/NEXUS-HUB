'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Compass, Home, BookOpen, Search, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { StoryCard } from '@/components/story-card';
import type { Story } from '@/lib/types';

/**
 * Page 404 personnalisée pour NexusHub.
 * S'affiche lorsqu'un utilisateur accède à une route inexistante.
 */
export default function NotFound() {
  const [recommendations, setRecommendations] = useState<Story[]>([]);

  useEffect(() => {
    async function fetchRecommendations() {
      try {
        const q = query(
          collection(db, 'stories'),
          where('isPublished', '==', true),
          orderBy('views', 'desc'),
          limit(4)
        );
        const snap = await getDocs(q);
        const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Story));
        setRecommendations(data);
      } catch (e) {
        console.error("Error fetching recommendations for 404:", e);
      }
    }
    fetchRecommendations();
  }, []);

  return (
    <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center p-6 py-20 text-center relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,hsl(var(--primary)/0.1),transparent_70%)]" />
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-primary" />
      
      <div className="relative z-10 space-y-12 animate-in fade-in zoom-in duration-700 w-full max-w-6xl">
        <div className="space-y-8">
          <div className="mx-auto w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20 shadow-[0_0_30px_rgba(212,168,67,0.2)]">
            <Compass className="h-12 w-12 text-primary animate-[spin_10s_linear_infinite]" />
          </div>
          
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-display font-black text-white leading-tight drop-shadow-[0_0_20px_rgba(212,168,67,0.4)] tracking-tighter">
              404 – Égaré ?
            </h1>
            <p className="text-xl text-stone-300 font-light max-w-lg mx-auto leading-relaxed italic">
              "Le voyageur qui ne pose pas de questions ne trouvera jamais son chemin." <br/>
              Cette page semble s'être volatilisée dans les sables du temps.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button asChild size="lg" className="h-14 px-10 rounded-full font-black text-lg shadow-xl shadow-primary/20 bg-primary text-black hover:bg-primary/90 transition-all active:scale-95">
              <Link href="/">
                <Home className="mr-2 h-5 w-5" />
                Retour à l'accueil
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-14 px-10 rounded-full border-white/20 text-white font-bold bg-white/5 hover:bg-white/10 backdrop-blur-md transition-all active:scale-95">
              <Link href="/stories">
                <BookOpen className="mr-2 h-5 w-5" />
                Explorer le catalogue
              </Link>
            </Button>
          </div>

          <div className="pt-4">
            <Link href="/search" className="text-stone-500 hover:text-primary transition-colors flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest">
              <Search className="h-4 w-4" /> Utiliser le moteur de recherche
            </Link>
          </div>
        </div>

        {recommendations.length > 0 && (
          <div className="pt-16 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-3">
                <div className="h-px w-12 bg-primary/30" />
                <h2 className="text-xl font-display font-black text-white uppercase tracking-widest flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" /> Vous aimerez peut-être
                </h2>
                <div className="h-px w-12 bg-primary/30" />
              </div>
              <p className="text-[10px] text-stone-500 font-bold uppercase tracking-[0.2em]">Pépites puisées dans les archives du Hub</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {recommendations.map((story) => (
                <StoryCard key={story.id} story={story} />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 opacity-30">
        <p className="text-[10px] text-stone-700 uppercase font-black tracking-[0.5em]">NexusHub Navigation System</p>
      </div>
    </div>
  );
}