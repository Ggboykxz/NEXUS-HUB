'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Page de redirection pour consolider /webtoons vers /webtoon.
 * La redirection principale est gérée dans next.config.ts (301 permanent).
 */
export default function WebtoonsRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/webtoon');
  }, [router]);

  return (
    <div className="container mx-auto max-w-7xl px-4 py-24 text-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-muted-foreground font-display">Redirection vers l'univers Webtoon...</p>
      </div>
    </div>
  );
}
