
'use client';

import { use, useEffect, useState } from 'react';
import { db, auth } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, documentId, getDocs } from 'firebase/firestore';
import { notFound } from 'next/navigation';
import { StoryCard } from '@/components/story-card';
import { ListMusic, Lock, Globe, Sparkles, Bookmark, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { Playlist, Story } from '@/lib/types';
import { onAuthStateChanged } from 'firebase/auth';

/**
 * Page détail de playlist convertie en Client Component.
 */
export default function PlaylistDetailPage(props: { params: Promise<{ playlistId: string }> }) {
  const params = use(props.params);
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      try {
        const playlistRef = doc(db, 'playlists', params.playlistId);
        const playlistSnap = await getDoc(playlistRef);
        
        if (!playlistSnap.exists()) {
          setLoading(false);
          return;
        }

        const data = { id: playlistSnap.id, ...playlistSnap.data() } as Playlist;

        // Vérification de sécurité
        if (!data.isPublic && data.ownerId !== user?.uid) {
          setAccessDenied(true);
          setLoading(false);
          return;
        }

        setPlaylist(data);

        // Récupérer les histoires
        if (data.storyIds && data.storyIds.length > 0) {
          const storiesRef = collection(db, 'stories');
          const q = query(storiesRef, where(documentId(), 'in', data.storyIds.slice(0, 30)));
          const storiesSnap = await getDocs(q);
          const fetchedStories = storiesSnap.docs.map(d => ({ id: d.id, ...d.data() } as Story));
          
          // Respecter l'ordre
          const orderedStories = data.storyIds
            .map(id => fetchedStories.find(s => s.id === id))
            .filter(Boolean) as Story[];
            
          setStories(orderedStories);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubAuth();
  }, [params.playlistId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-950">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="container mx-auto max-w-4xl text-center py-32 space-y-6">
        <div className="bg-white/5 p-6 rounded-full w-fit mx-auto border border-white/10">
          <Lock className="h-12 w-12 text-stone-700" />
        </div>
        <h1 className="text-3xl font-display font-black text-white uppercase tracking-tighter">Collection Privée</h1>
        <p className="text-stone-500 italic max-w-sm mx-auto">"Ce sanctuaire est réservé à son propriétaire. Explorez les collections publiques du Hub."</p>
        <Button asChild variant="outline" className="rounded-full border-primary text-primary">
          <Link href="/playlists">Retour aux Playlists</Link>
        </Button>
      </div>
    );
  }

  if (!playlist) notFound();

  return (
    <div className="container mx-auto max-w-7xl px-6 py-12 space-y-16 animate-in fade-in duration-1000">
      <header className="relative p-12 rounded-[3.5rem] bg-stone-950 border border-primary/10 overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.15),transparent_70%)]" />
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 relative z-10">
          <div className="space-y-6 text-center lg:text-left flex-1">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              <div className="bg-primary/10 p-2.5 rounded-2xl">
                <ListMusic className="h-6 w-6 text-primary" />
              </div>
              {playlist.isPublic ? (
                <Badge className="bg-emerald-500/10 text-emerald-500 border-none text-[8px] font-black uppercase px-3 gap-1.5">
                  <Globe className="h-3 w-3" /> Publique
                </Badge>
              ) : (
                <Badge className="bg-stone-800 text-stone-500 border-none text-[8px] font-black uppercase px-3 gap-1.5">
                  <Lock className="h-3 w-3" /> Privée
                </Badge>
              )}
            </div>
            
            <h1 className="text-4xl md:text-7xl font-display font-black text-white tracking-tighter leading-[0.9] gold-resplendant">
              {playlist.title}
            </h1>
            
            <p className="text-xl text-stone-400 font-light italic leading-relaxed max-w-2xl border-l-4 border-primary/20 pl-8">
              "{playlist.description || "Une sélection de récits soigneusement archivés."}"
            </p>

            <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-4">
              <Button size="lg" className="rounded-full px-10 h-14 font-black text-lg bg-primary text-black gold-shimmer">
                Lancer la Lecture
              </Button>
            </div>
          </div>

          <div className="w-full md:w-auto shrink-0 bg-white/5 backdrop-blur-xl p-8 rounded-[3rem] border border-white/10 text-center space-y-2">
            <p className="text-5xl font-black text-primary leading-none">{stories.length}</p>
            <p className="text-[10px] font-black uppercase text-stone-500 tracking-widest">Histoires</p>
          </div>
        </div>
      </header>

      <div className="space-y-10">
        <div className="flex items-center gap-3 px-2">
          <div className="p-2 rounded-xl bg-primary/10">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <h2 className="text-2xl font-display font-black text-white uppercase tracking-tighter">Contenu de la Playlist</h2>
        </div>

        {stories.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-6 gap-y-12">
            {stories.map((story) => (
              <StoryCard key={story.id} story={story} />
            ))}
          </div>
        ) : (
          <div className="text-center py-32 bg-stone-900/30 rounded-[3.5rem] border-2 border-dashed border-white/5 space-y-8">
            <div className="mx-auto w-24 h-24 bg-white/5 rounded-full flex items-center justify-center opacity-20">
              <Bookmark className="h-10 w-10 text-stone-500" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-display font-black text-white tracking-tighter">Playlist Vide</h3>
              <p className="text-stone-500 max-xs mx-auto italic font-light">Cette collection ne contient pas encore d'histoires.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
