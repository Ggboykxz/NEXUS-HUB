'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Bouton flottant de retour en haut de page.
 * S'affiche uniquement après un certain seuil de défilement.
 */
export function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);

  // Gère la visibilité du bouton en fonction du scroll
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 400) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <div
      className={cn(
        "fixed bottom-8 right-8 z-50 transition-all duration-500",
        isVisible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-10 scale-90 pointer-events-none"
      )}
    >
      <Button
        onClick={scrollToTop}
        size="icon"
        className="h-12 w-12 rounded-full bg-primary/90 hover:bg-primary text-black shadow-2xl shadow-primary/20 hover:scale-110 active:scale-95 transition-all border border-primary/20 group"
        aria-label="Retour en haut"
      >
        <ChevronUp className="h-6 w-6 stroke-[3] transition-transform group-hover:-translate-y-1" />
      </Button>
    </div>
  );
}
