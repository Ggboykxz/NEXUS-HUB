'use client';

import { usePathname } from 'next/navigation';
import Header from './header';
import Footer from './footer';
import { ReactNode } from 'react';

/**
 * Gère l'affichage conditionnel du Header et du Footer.
 * Affiche désormais le Header sur toutes les pages, mais garde le Footer masqué 
 * sur les pages de lecture pour une immersion totale en fin de chapitre.
 */
export default function HeaderFooterWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  // Détection des pages de lecture : 3 segments ou plus (ex: /webtoon/[slug]/[chapter])
  const segments = pathname.split('/').filter(Boolean);
  const isReaderPage = segments.length >= 3 && (segments[0] === 'webtoon' || segments[0] === 'bd-africaine');

  return (
    <>
      <Header />
      <main className="flex-1 flex flex-col">{children}</main>
      {!isReaderPage && <Footer />}
    </>
  );
}
