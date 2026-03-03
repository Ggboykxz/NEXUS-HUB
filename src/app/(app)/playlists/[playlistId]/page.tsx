import { adminDb } from '@/lib/firebase-admin';
import { notFound } from 'next/navigation';
import { StoryCard } from '@/components/story-card';
import { ListMusic, Lock, Globe, Sparkles, Bookmark } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { Playlist, Story } from '@/lib/types';

interface PageProps {
  params: Promise<{ playlistId: string }>;
}

async function getPlaylistData(playlistId: string) {
  const playlistSnap = await adminDb.collection('playlists').doc(playlistId).get();
  if (!playlistSnap.exists) return null;
  
  const playlist = { id: playlistSnap.id, ...playlistSnap.data() } as Playlist;
  
  let storiesList: Story[] = [];
  if (playlist.storyIds && playlist.storyIds.length > 0) {
    const storyIds = playlist.storyIds.slice(0, 30);
    const storiesSnap = await adminDb.collection('stories').where('id', 'in', storyIds).get();
    storiesList = storiesSnap.docs.map(d => ({ id: d.id, ...d.data() } as Story));
  }

  return { playlist, storiesList };
}

export default async function PlaylistDetailPage({ params }: PageProps) {
  const { playlistId } = await params;
  const data = await getPlaylistData(playlistId);

  if (!data) notFound();

  const { playlist, storiesList } = data;

  return (
    <div className="container mx-auto max-w-7xl px-6 py-12 space-y-16">
      {/* IMMERSIVE PLAYLIST HEADER */}
      <header className="relative p-12 rounded-[3.5rem] bg-stone-950 border border-primary/10 overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.15),transparent_70%)]" />
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 relative z-10">
          <div className="space-y-6 text-center lg:text-left flex-1">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              <div className="bg-primary/10 p-2.5 rounded-2xl">
                <ListMusic className="h-6 w-6 text-primary" />
              </div>
              <Badge variant="secondary" className="bg-white/5 text-stone-400 border-none uppercase text-[9px] font-black tracking-widest px-3">
                Playlist de voyageur
              </Badge>
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
              "{playlist.description || "Une sélection unique puisée dans les archives de NexusHub."}"
            </p>

            <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-4">
              <Button size="lg" className="rounded-full px-10 h-14 font-black text-lg gold-shimmer bg-primary text-black">
                Lire la Sélection
              </Button>
              <Button variant="outline" size="lg" className="rounded-full border-white/10 text-white h-14 px-8 backdrop-blur-md">
                Partager la Liste
              </Button>
            </div>
          </div>

          <div className="w-full md:w-auto shrink-0 bg-white/5 backdrop-blur-xl p-8 rounded-[3rem] border border-white/10 text-center space-y-2">
            <p className="text-5xl font-black text-primary leading-none">{storiesList.length}</p>
            <p className="text-[10px] font-black uppercase text-stone-500 tracking-widest">Épopées listées</p>
          </div>
        </div>
      </header>

      {/* STORIES GRID */}
      <div className="space-y-10">
        <div className="flex items-center gap-3 px-2">
          <div className="p-2 rounded-xl bg-primary/10">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <h2 className="text-2xl font-display font-black text-white uppercase tracking-tighter">Contenu du Sanctuaire</h2>
        </div>

        {storiesList.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-12">
            {storiesList.map((story) => (
              <StoryCard key={story.id} story={story} />
            ))}
          </div>
        ) : (
          <div className="text-center py-32 bg-stone-900/30 rounded-[3.5rem] border-2 border-dashed border-white/5 space-y-8">
            <div className="mx-auto w-24 h-24 bg-white/5 rounded-full flex items-center justify-center opacity-20">
              <Bookmark className="h-10 w-10 text-stone-500" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-display font-black text-white tracking-tighter">Une liste en attente</h3>
              <p className="text-stone-500 max-w-xs mx-auto italic font-light leading-relaxed">
                "Cette playlist ne contient pas encore d'œuvres. Explorez le catalogue pour enrichir votre sanctuaire."
              </p>
            </div>
            <Button asChild variant="outline" className="rounded-full px-12 h-14 border-primary text-primary hover:bg-primary hover:text-black font-black uppercase text-xs tracking-widest transition-all">
              <Link href="/stories">Parcourir le Catalogue</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
