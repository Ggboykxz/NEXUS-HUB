'use client';

import { use, useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, limit, orderBy, doc, getDoc } from 'firebase/firestore';
import type { Story, UserProfile, Chapter } from '@/lib/types';
import StoryDetailClient from '../../webtoon/[slug]/story-detail-client';
import { Loader2 } from 'lucide-react';

/**
 * Page de détails des webtoons utilisant le SDK Client pour plus de simplicité.
 */
export default function WebtoonDetailPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = use(props.params);
  const [data, setData] = useState<{ story: Story; artist: UserProfile | null; similarStories: Story[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // 1. Récupérer l'histoire
        const q = query(collection(db, 'stories'), where('slug', '==', slug), where('isPublished', '==', true), limit(1));
        const snap = await getDocs(q);
        if (snap.empty) return setLoading(false);

        const storyDoc = snap.docs[0];
        const story = { id: storyDoc.id, ...storyDoc.data() } as Story;

        // 2. Récupérer l'artiste et les chapitres
        const [artistSnap, chaptersSnap, similarSnap] = await Promise.all([
          getDoc(doc(db, 'users', story.artistId)),
          getDocs(query(collection(db, 'stories', story.id, 'chapters'), where('status', '==', 'Publié'), orderBy('chapterNumber', 'asc'))),
          getDocs(query(collection(db, 'stories'), where('genreSlug', '==', story.genreSlug), where('isPublished', '==', true), limit(6)))
        ]);

        const artist = artistSnap.exists() ? (artistSnap.data() as UserProfile) : null;
        const chapters = chaptersSnap.docs.map(d => ({ id: d.id, ...d.data() } as Chapter));
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

  return <StoryDetailClient story={data.story} artist={data.artist} similarStories={data.similarStories} />;
}
