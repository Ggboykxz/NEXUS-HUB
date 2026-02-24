'use client';

import Header from '@/components/common/header';
import Footer from '@/components/common/footer';
import { usePathname } from 'next/navigation';

/**
 * Layout pour les pages principales de l'application.
 * Masque dynamiquement le footer sur les pages de lecture pour l'immersion.
 */
export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  
  // Détection des pages de lecture : /webtoon/[slug]/[chapter] ou /bd-africaine/[slug]/[chapter]
  const segments = pathname.split('/').filter(Boolean);
  const isReaderPage = segments.length >= 3 && (segments[0] === 'webtoon' || segments[0] === 'bd-africaine');

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      {!isReaderPage && <Footer />}
    </div>
  );
}
