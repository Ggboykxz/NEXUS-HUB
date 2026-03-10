'use client';

import { use, useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, orderBy, getDocs, limit } from 'firebase/firestore';
import { notFound } from 'next/navigation';
import ReaderClient from './reader-client';
import type { Story, Chapter } from '@/lib/types';
import { Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Page de lecture convertie en Client Component pour une expérience interactive sans SDK Admin.
 */
export default function ReadPage(props: { params: Promise<{ storyId: string }> }) {
  const params = use(props.params);
  const [data, setData] = useState<{ story: Story; chapters: Chapter[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [indexError, setIndexError] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        setIndexError(false);
        // 1. Récupérer l'histoire
        const storyRef = doc(db, 'stories', params.storyId);
        const storySnap = await getDoc(storyRef);

        if (!storySnap.exists()) return setLoading(false);
        const storyData = { id: storySnap.id, ...storySnap.data() } as Story;

        // Sécurité : Ne pas afficher si banni
        if (storyData.isBanned) return setLoading(false);

        // 2. Récupérer les chapitres publiés
        const chaptersRef = collection(db, 'stories', params.storyId, 'chapters');
        let chapters: Chapter[] = [];
        
        try {
          // Tentative avec tri (nécessite un index composite)
          const q = query(chaptersRef, where('status', '==', 'Publié'), orderBy('chapterNumber', 'asc'));
          const chaptersSnap = await getDocs(q);
          chapters = chaptersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Chapter));
        } catch (e: any) {
          if (e.code === 'failed-precondition' || e.message.includes('index')) {
            console.warn("Firestore Index missing for chapters, falling back to unsorted query.");
            setIndexError(true);
            const fallbackQ = query(chaptersRef, where('status', '==', 'Publié'), limit(100));
            const chaptersSnap = await getDocs(fallbackQ);
            chapters = chaptersSnap.docs
              .map(doc => ({ id: doc.id, ...doc.data() } as Chapter))
              .sort((a, b) => a.chapterNumber - b.chapterNumber);
          } else {
            throw e;
          }
        }

        setData({ story: storyData, chapters });
      } catch (e) {
        console.error("Error loading reader data:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [params.storyId]);

  if (loading) {
    return (
      <div className="h-screen bg-stone-950 flex flex-col items-center justify-center gap-6">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-stone-500 font-display font-black uppercase tracking-[0.3em] text-[10px]">
          Ouverture des manuscrits sacrés...
        </p>
      </div>
    );
  }

  if (!data) {
    notFound();
  }

  return (
    <>
      {indexError && process.env.NODE_ENV === 'development' && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-[100] w-full max-w-md bg-amber-500 text-black p-4 rounded-2xl flex items-center justify-between gap-4 shadow-2xl animate-in slide-in-from-top-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p className="text-[10px] font-black uppercase">Mode Dégradé : Index en cours de création</p>
          </div>
          <Button variant="outline" size="sm" className="h-7 text-[8px] font-black uppercase border-black/20 hover:bg-black/10" asChild>
            <a href="https://console.firebase.google.com/v1/r/project/studio-7543974359-3b6f7/firestore/indexes" target="_blank" rel="noopener noreferrer">Gérer</a>
          </Button>
        </div>
      )}
      <ReaderClient story={data.story} chapters={data.chapters} />
    </>
  );
}
