<<<<<<< HEAD
'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/common/header';
import Footer from '@/components/common/footer';
=======
import HeaderFooterWrapper from '@/components/common/header-footer-wrapper';
>>>>>>> a10acb31bbc9e4fe276a89d9bb5f86248615ed14

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // Immersive mode logic: hide header/footer on reading pages
  // Reading routes follow the pattern /[webtoon|bd-africaine]/[slug]/[chapterSlug]
  // We check if the pathname has at least 3 segments
  const segments = pathname.split('/').filter(Boolean);
  const isReadingPage = segments.length >= 3 && (segments[0] === 'webtoon' || segments[0] === 'bd-africaine');

  return (
    <div className="relative flex min-h-screen flex-col bg-background">
<<<<<<< HEAD
      {!isReadingPage && <Header />}
      <main className="flex-1">{children}</main>
      {!isReadingPage && <Footer />}
=======
      <HeaderFooterWrapper>
        {children}
      </HeaderFooterWrapper>
>>>>>>> a10acb31bbc9e4fe276a89d9bb5f86248615ed14
    </div>
  );
}
