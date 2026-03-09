
'use client';

import { use, useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { notFound } from 'next/navigation';
import ReaderClient from './reader-client';
import type { Story, Chapter } from '@/lib/types';
import { Loader2 } from 'lucide-react';

/**
 * Page de lecture convertie en Client Component pour une expérience interactive sans SDK Admin.
 */
export default function ReadPage(props: { params: Promise<{ storyId: string }> }) {
  const params = use(props.params);
  const [data, setData] = useState<{ story: Story; chapters: Chapter[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // 1. Récupérer l'histoire
        const storyRef = doc(db, 'stories', params.storyId);
        const storySnap = await getDoc(storyRef);

        if (!storySnap.exists()) return setLoading(false);
        const storyData = { id: storySnap.id, ...storySnap.data() } as Story;

        // Sécurité : Ne pas afficher si banni
        if (storyData.isBanned) return setLoading(false);

        // 2. Récupérer les chapitres publiés
        const chaptersRef = collection(db, 'stories', params.storyId, 'chapters');
        const q = query(chaptersRef, where('status', '==', 'Publié'), orderBy('chapterNumber', 'asc'));
        const chaptersSnap = await getDocs(q);
        
        const chapters = chaptersSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Chapter));

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

  return <ReaderClient story={data.story} chapters={data.chapters} />;
}
