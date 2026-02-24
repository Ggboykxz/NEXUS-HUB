'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

/**
 * Page de secours pour éviter les conflits de parallélisme Next.js.
 * Redirige systématiquement vers la route consolidée dans le groupe (app).
 */
export default function WebtoonRedirectionPage() {
  const router = useRouter();
  const params = useParams();

  useEffect(() => {
    if (params.slug && params.chapterSlug) {
      router.replace(`/webtoon/${params.slug}/${params.chapterSlug}`);
    } else {
      router.replace('/webtoon');
    }
  }, [router, params]);

  return (
    <div className="h-screen bg-black flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-muted-foreground font-display text-sm">Initialisation du Lecteur Magique...</p>
      </div>
    </div>
  );
}
