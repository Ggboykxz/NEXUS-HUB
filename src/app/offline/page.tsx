'use client';

import { WifiOff, Home, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

/**
 * Page de secours affichée lorsque l'utilisateur est hors ligne.
 */
export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center p-6 text-center">
      {/* Animation visuelle */}
      <div className="relative mb-12">
        <div className="bg-primary/10 p-10 rounded-full animate-pulse">
          <WifiOff className="h-16 w-16 text-primary" />
        </div>
        <div className="absolute -bottom-2 -right-2 bg-stone-900 border border-primary/20 p-3 rounded-2xl shadow-2xl">
          <RefreshCw className="h-6 w-6 text-primary animate-spin" />
        </div>
      </div>

      {/* Message principal */}
      <div className="space-y-6 max-w-md">
        <h1 className="text-4xl md:text-5xl font-display font-black text-white tracking-tighter">
          Hors Connexion
        </h1>
        <p className="text-stone-400 text-lg font-light italic leading-relaxed">
          "Les sables du temps se sont arrêtés. Vous êtes hors ligne, mais vos lectures déjà chargées restent accessibles dans votre sanctuaire."
        </p>
      </div>

      {/* Actions de secours */}
      <div className="mt-12 flex flex-col sm:flex-row gap-4">
        <Button asChild size="lg" className="h-14 px-10 rounded-full font-black text-lg bg-primary text-black gold-shimmer shadow-xl shadow-primary/20">
          <Link href="/">
            <Home className="mr-2 h-5 w-5" />
            Retour à l'accueil
          </Link>
        </Button>
        <Button 
          variant="outline" 
          size="lg" 
          className="h-14 px-10 rounded-full border-white/10 text-white font-bold hover:bg-white/5"
          onClick={() => window.location.reload()}
        >
          <RefreshCw className="mr-2 h-5 w-5" />
          Réessayer
        </Button>
      </div>

      {/* Footer technique */}
      <div className="mt-20 pt-8 border-t border-white/5 w-full max-w-xs">
        <p className="text-[10px] text-stone-600 font-black uppercase tracking-[0.3em]">Nexus Offline Mode</p>
      </div>
    </div>
  );
}
