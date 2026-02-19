'use client';

import { usePathname } from 'next/navigation';
import Header from './header';
import Footer from './footer';
import { ReactNode } from 'react';

/**
 * Gère l'affichage conditionnel du Header et du Footer.
 * Masque ces éléments sur les pages de lecture pour une immersion totale.
 */
export default function HeaderFooterWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  // Détection des pages de lecture : 3 segments ou plus (ex: /webtoon/[slug]/[chapter])
  const segments = pathname.split('/').filter(Boolean);
  const isReaderPage = segments.length >= 3 && (segments[0] === 'webtoon' || segments[0] === 'bd-africaine');

  if (isReaderPage) {
    return <main className="flex-1 flex flex-col">{children}</main>;
  }

  return (
    <>
      <Header />
      <main className="flex-1 flex flex-col">{children}</main>
      <Footer />
    </>
  );
}
