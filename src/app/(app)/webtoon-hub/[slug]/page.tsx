'use client';

import { use, useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, limit, orderBy, doc, getDoc } from 'firebase/firestore';
import type { Story, UserProfile, Chapter } from '@/lib/types';
import StoryDetailClient from '../../webtoon/[slug]/story-detail-client';
import { Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Page de détails des webtoons utilisant le SDK Client pour plus de simplicité.
 */
export default function WebtoonDetailPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = use(props.params);
  const [data, setData] = useState<{ story: Story; artist: UserProfile | null; similarStories: Story[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [indexError, setIndexError] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        setIndexError(false);
        // 1. Récupérer l'histoire
        const q = query(collection(db, 'stories'), where('slug', '==', slug), where('isPublished', '==', true), limit(1));
        const snap = await getDocs(q);
        if (snap.empty) return setLoading(false);

        const storyDoc = snap.docs[0];
        const story = { id: storyDoc.id, ...storyDoc.data() } as Story;

        // 2. Récupérer l'artiste et les chapitres
        let chapters: Chapter[] = [];
        const artistRef = doc(db, 'users', story.artistId);
        const chaptersRef = collection(db, 'stories', story.id, 'chapters');
        
        const [artistSnap, chaptersSnapResult] = await Promise.allSettled([
          getDoc(artistRef),
          getDocs(query(chaptersRef, where('status', '==', 'Publié'), orderBy('chapterNumber', 'asc')))
        ]);

        const artist = artistSnap.status === 'fulfilled' && artistSnap.value.exists() ? (artistSnap.value.data() as UserProfile) : null;
        
        if (chaptersSnapResult.status === 'fulfilled') {
          chapters = chaptersSnapResult.value.docs.map(d => ({ id: d.id, ...d.data() } as Chapter));
        } else {
          // Fallback if index missing
          console.warn("Chapters index missing, using unsorted fallback.");
          setIndexError(true);
          const fallbackSnap = await getDocs(query(chaptersRef, where('status', '==', 'Publié'), limit(100)));
          chapters = fallbackSnap.docs
            .map(d => ({ id: d.id, ...d.data() } as Chapter))
            .sort((a, b) => a.chapterNumber - b.chapterNumber);
        }

        const similarSnap = await getDocs(query(collection(db, 'stories'), where('genreSlug', '==', story.genreSlug), where('isPublished', '==', true), limit(6)));
        const similarStories = similarSnap.docs.map(d => ({ id: d.id, ...d.data() } as Story)).filter(s => s.id !== story.id);

        setData({ story: { ...story, chapters }, artist, similarStories });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [slug]);

  if (loading) return <div className="h-screen flex items-center justify-center bg-stone-950"><Loader2 className="animate-spin text-primary h-12 w-12" /></div>;
  if (!data) return <div className="h-screen flex items-center justify-center text-stone-500">Histoire introuvable</div>;

  return (
    <>
      {indexError && process.env.NODE_ENV === 'development' && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            <p className="text-xs text-amber-200 font-medium">Mode Dégradé : Index Firestore requis pour le tri des chapitres.</p>
          </div>
          <Button variant="outline" size="sm" className="h-8 text-[9px] font-black uppercase" asChild>
            <a href="https://console.firebase.google.com/v1/r/project/studio-7543974359-3b6f7/firestore/indexes" target="_blank" rel="noopener noreferrer">Créer l'Index</a>
          </Button>
        </div>
      )}
      <StoryDetailClient story={data.story} artist={data.artist} similarStories={data.similarStories} />
    </>
  );
}
