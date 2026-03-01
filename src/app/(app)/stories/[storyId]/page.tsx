'use client';

import { use, useEffect, useState } from 'react';
import { notFound, useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import type { Story } from '@/lib/types';
import { Loader2 } from 'lucide-react';

/**
 * Page de redirection intelligente par ID.
 * Résout l'ID d'une histoire vers son URL SEO finale selon son format (BD vs Webtoon).
 */
export default function StoryIdRedirectPage(props: { params: Promise<{ storyId: string }> }) {
  const { storyId } = use(props.params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function resolveStory() {
      try {
        const storySnap = await getDoc(doc(db, 'stories', storyId));
        
        if (!storySnap.exists()) {
          setError(true);
          setLoading(false);
          return;
        }

        const story = { id: storySnap.id, ...storySnap.data() } as Story;
        
        // Déterminer l'URL cible selon le format pour rediriger vers le bon groupe de routes
        const targetUrl = story.format === 'BD' 
          ? `/bd-africaine/${story.slug}` 
          : `/webtoon-hub/${story.slug}`;

        router.replace(targetUrl);
      } catch (err) {
        console.error("Resolution error:", err);
        setError(true);
        setLoading(false);
      }
    }

    resolveStory();
  }, [storyId, router]);

  if (error) {
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
