'use client';

import { usePathname } from 'next/navigation';
import Header from './header';
import Footer from './footer';
import { ReactNode } from 'react';

/**
 * Ce composant gère l'affichage conditionnel du Header et du Footer.
 * Il masque ces éléments sur les pages de lecture (Reader) pour une immersion totale.
 */
export default function HeaderFooterWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  // Détection des pages de lecture :
  // 1. Ancienne route /read/[id]
  // 2. Nouvelles routes SEO /webtoon/[slug]/[chapterSlug] ou /bd-africaine/[slug]/[chapterSlug]
  const isReaderPage = 
    pathname.startsWith('/read/') || 
    (pathname.split('/').length > 3 && (pathname.startsWith('/webtoon/') || pathname.startsWith('/bd-africaine/')));

  if (isReaderPage) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
