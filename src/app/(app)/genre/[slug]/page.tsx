
'use client';

import { use, useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { StoryCard } from '@/components/story-card';
import { Sparkles, Loader2, Filter } from 'lucide-react';
import { notFound } from 'next/navigation';
import type { Story } from '@/lib/types';
import { GENRES } from '@/lib/genres';
import { Badge } from '@/components/ui/badge';

/**
 * Page par genre convertie en Client Component.
 */
export default function GenrePage(props: { params: Promise<{ slug: string }> }) {
  const params = use(props.params);
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  
  const genre = GENRES.find(g => g.slug === params.slug);

  useEffect(() => {
    if (!genre) return;

    async function fetchStories() {
      try {
        const storiesRef = collection(db, 'stories');
        const q = query(
          storiesRef,
          where('genreSlug', '==', params.slug),
          where('isPublished', '==', true),
          orderBy('views', 'desc'),
          limit(40)
        );
        const snap = await getDocs(q);
        setStories(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Story)));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchStories();
  }, [params.slug, genre]);

  if (!genre) notFound();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-950">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl px-6 py-12 space-y-12">
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-8">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 p-3 rounded-2xl border border-primary/20">
              <Filter className="w-8 h-8 text-primary" />
            </div>
            <div>
                <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Exploration par Genre</p>
                <h1 className="text-4xl md:text-5xl font-bold font-display text-white tracking-tighter">{genre.name}</h1>
            </div>
          </div>
          <p className="text-lg text-stone-400 max-w-2xl italic font-light leading-relaxed">
            "{genre.description || `Explorez toutes les œuvres exclusives de NexusHub classées dans la catégorie ${genre.name}.`}"
          </p>
        </div>
        <Badge variant="secondary" className="bg-white/5 text-stone-500 border-none px-4 py-1.5 font-black uppercase text-[10px] tracking-widest">
          {stories.length} œuvres trouvées
        </Badge>
      </header>

      {stories.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-6 gap-y-12 animate-in fade-in duration-700">
          {stories.map((story) => (
            <StoryCard key={story.id} story={story} />
          ))}
        </div>
      ) : (
        <div className="text-center py-32 bg-stone-900/30 rounded-[3rem] border-2 border-dashed border-white/5 space-y-6">
            <Sparkles className="h-12 w-12 text-stone-700 mx-auto opacity-20" />
            <p className="text-stone-500 italic font-light">Il n'y a pas encore d'histoire publiée dans le genre "{genre.name}".<br/>Revenez plus tard !</p>
        </div>
      )}
    </div>
  );
}
