'use client';

import { Button } from '@/components/ui/button';
import { Compass, Home, BookOpen, Search } from 'lucide-react';
import Link from 'next/link';

/**
 * Page 404 personnalisée pour NexusHub.
 * S'affiche lorsqu'un utilisateur accède à une route inexistante.
 */
export default function NotFound() {
  return (
    <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
      {/* Éléments de design en arrière-plan */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,hsl(var(--primary)/0.1),transparent_70%)]" />
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-primary" />
      
      <div className="relative z-10 space-y-8 animate-in fade-in zoom-in duration-700">
        <div className="mx-auto w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20 shadow-[0_0_30px_rgba(212,168,67,0.2)]">
          <Compass className="h-12 w-12 text-primary animate-[spin_10s_linear_infinite]" />
        </div>
        
        <div className="space-y-4">
          <h1 className="text-5xl md:text-7xl font-display font-black text-white leading-tight drop-shadow-[0_0_20px_rgba(212,168,67,0.4)]">
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

        <div className="pt-12">
          <Link href="/search" className="text-stone-500 hover:text-primary transition-colors flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest">
            <Search className="h-4 w-4" /> Utiliser le moteur de recherche
          </Link>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <p className="text-[10px] text-stone-700 uppercase font-black tracking-[0.5em]">NexusHub Navigation System</p>
      </div>
    </div>
  );
}
