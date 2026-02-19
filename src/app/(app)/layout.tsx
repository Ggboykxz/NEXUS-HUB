'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/common/header';
import Footer from '@/components/common/footer';

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
      {!isReadingPage && <Header />}
      <main className="flex-1">{children}</main>
      {!isReadingPage && <Footer />}
    </div>
  );
}
