'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Template d'application épuré.
 * La logique défectueuse `useAuth` qui provoquait une redirection 404 a été entièrement supprimée.
 * Ce composant gère désormais uniquement les transitions de page et les effets visuels globaux,
 * comme prévu initialement.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Effet pour faire défiler vers le haut de la page lors d'un changement de route.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  // La logique `useAuth` a été retirée. La validation de session et de profil
  // est désormais gérée de manière plus robuste et contextuelle au sein des layouts
  // et des pages spécifiques (ex: /profile/me), éliminant la race condition.

  return (
    <div key={pathname}>
      {children}
    </div>
  );
}
