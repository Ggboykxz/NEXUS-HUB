'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/common/header';
import Footer from '@/components/common/footer';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

/**
 * Layout pour les pages principales de l'application.
 * Masque dynamiquement le footer sur les pages de lecture pour l'immersion.
 * Ajoute une transition fluide lors de l'entrée sur chaque page et une barre de chargement.
 */
export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const [isNavigating, setIsNavigating] = useState(false);

  // Déclenche la barre de chargement lors du changement de route
  useEffect(() => {
    setIsNavigating(true);
    const timer = setTimeout(() => setIsNavigating(false), 400);
    return () => clearTimeout(timer);
  }, [pathname]);

  // Détection des pages de lecture : /webtoon/[slug]/[chapter] ou /bd-africaine/[slug]/[chapter]
  const segments = pathname.split('/').filter(Boolean);
  const isReaderPage = segments.length >= 3 && (segments[0] === 'webtoon' || segments[0] === 'bd-africaine');

  return (
    <div className="flex flex-col min-h-screen">
      {/* Barre de chargement dorée au sommet */}
      <div 
        className={cn(
          "fixed top-0 left-0 h-[3px] bg-primary z-[100] transition-all duration-500 ease-in-out shadow-[0_0_10px_rgba(212,168,67,0.5)]",
          isNavigating ? "w-full opacity-100" : "w-0 opacity-0"
        )} 
      />

      <Header />
      <main className="flex-1 flex flex-col">
        {/* Transition de page déclenchée par le changement de key (pathname) */}
        <div 
          key={pathname} 
          className="animate-in fade-in duration-300 slide-in-from-bottom-2 flex-1 flex flex-col"
        >
          {children}
        </div>
      </main>
      {!isReaderPage && <Footer />}
    </div>
  );
}
