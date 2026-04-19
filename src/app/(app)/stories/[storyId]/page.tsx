'use client';

import { useEffect } from 'react';
import { notFound, useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import type { Story } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

/**
 * Page de redirection intelligente par ID.
 * Résout l'ID d'une histoire vers son URL SEO finale selon son format (BD vs Webtoon).
 */
export default function StoryIdRedirectPage({ params }: { params: { storyId: string } }) {
  const { storyId } = params;
  const router = useRouter();

  const { data: story, isLoading, isError } = useQuery<Story | null>({
    queryKey: ['story-redirect', storyId],
    queryFn: async () => {
      const storySnap = await getDoc(doc(db, 'stories', storyId));
      if (!storySnap.exists()) {
        return null;
      }
      return { id: storySnap.id, ...storySnap.data() } as Story;
    },
  });

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (isError || !story) {
      notFound();
      return;
    }

    // Determine the target URL based on the format to redirect to the correct route group
    const targetUrl = story.format === 'BD' 
      ? `/bd-africaine/${story.slug}` 
      : `/webtoon-hub/${story.slug}`;

    router.replace(targetUrl);
  }, [story, isLoading, isError, router]);

  if (isError) {
    notFound();
  }

  return (
    <div className="flex h-[60vh] items-center justify-center bg-stone-950">
        <div className="text-center space-y-6">
            <div className="relative">
              <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
              <div className="absolute inset-0 blur-xl bg-primary/20 animate-pulse rounded-full" />
            </div>
            <div className="space-y-2">
              <p className="text-stone-500 font-display font-black uppercase tracking-[0.3em] text-[10px]">
                Nexus Resolution System
              </p>
              <p className="text-stone-600 text-[9px] uppercase font-bold italic">
                Localisation de la légende dans les archives...
              </p>
            </div>
        </div>
    </div>
  );
}
