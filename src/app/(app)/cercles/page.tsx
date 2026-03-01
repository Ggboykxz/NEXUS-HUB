'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Loader2 } from 'lucide-react';

/**
 * Page de redirection pour les Cercles vers les Clubs de Lecture.
 */
export default function CerclesRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirection après un court délai pour laisser lire la notice
    const timer = setTimeout(() => {
      router.replace('/clubs');
    }, 2000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="container mx-auto max-w-7xl px-6 py-32 flex flex-col items-center justify-center text-center space-y-8 animate-in fade-in duration-700">
      <div className="bg-emerald-500/10 p-6 rounded-full border border-emerald-500/20 shadow-2xl">
        <Users className="h-16 w-16 text-emerald-500" />
      </div>
      
      <div className="space-y-4">
        <h1 className="text-4xl font-display font-black text-white uppercase tracking-tighter">Évolution Community</h1>
        <p className="text-stone-400 text-lg italic font-light max-w-md mx-auto">
          "Les Cercles ont été fusionnés avec les **Clubs de Lecture** pour une expérience plus riche et connectée."
        </p>
      </div>

      <div className="flex flex-col items-center gap-4 pt-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-[10px] text-stone-600 font-black uppercase tracking-[0.3em]">Redirection vers le nouveau Hub...</p>
      </div>
    </div>
  );
}
