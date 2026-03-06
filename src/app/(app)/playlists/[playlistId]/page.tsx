import { getAdminServices } from '@/lib/firebase-admin';
import { getCurrentUser } from '@/lib/auth-utils';
import { notFound } from 'next/navigation';
import { StoryCard } from '@/components/story-card';
import { ListMusic, Lock, Globe, Sparkles, Bookmark } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { Playlist, Story } from '@/lib/types';
import type { Metadata } from 'next';

interface PageProps {
  params: { playlistId: string };
}

// Increased revalidation time for playlists as they might be updated by users
export const revalidate = 60; // 1 minute

async function getPlaylistData(playlistId: string) {
  const { adminDb } = getAdminServices();
  // User is fetched to check for private playlist access
  const user = await getCurrentUser();

  const playlistSnap = await adminDb.collection('playlists').doc(playlistId).get();
  
  if (!playlistSnap.exists) return null;

  const playlist = { id: playlistSnap.id, ...playlistSnap.data() } as Playlist;

  // Security Gate: If the playlist is private, only the owner can see it.
  if (!playlist.isPublic && playlist.userId !== user?.uid) {
    return { playlist: null, stories: [] }; // Return null playlist to signify access denied
  }

  let stories: Story[] = [];
  if (playlist.storyIds && playlist.storyIds.length > 0) {
    // Firestore 'in' query is limited to 30 elements. Chunking is required for > 30.
    const storyIdsToFetch = playlist.storyIds.slice(0, 30);
    
    const storiesSnap = await adminDb.collection('stories').where('__name__', 'in', storyIdsToFetch).get();
    
    // Filter out non-existent or banned stories
    const storiesData = storiesSnap.docs
      .map(doc => ({ id: doc.id, ...doc.data() } as Story))
      .filter(story => story && !story.isBanned);

    // Preserve the order from the playlist array
    stories = storyIdsToFetch
      .map(id => storiesData.find(s => s.id === id))
      .filter(Boolean) as Story[];
  }

  return { playlist, stories };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const data = await getPlaylistData(params.playlistId);
  if (!data || !data.playlist) return { title: 'Playlist Introuvable' };

  const { playlist } = data;
  return {
    title: `Playlist : ${playlist.title}`,
    description: playlist.description || `Découvrez la sélection d'histoires incluses dans la playlist "${playlist.title}".`,
  };
}

export default async function PlaylistDetailPage({ params }: PageProps) {
  const data = await getPlaylistData(params.playlistId);

  // notFound() is for content that doesn't exist. 
  // Here, the playlist might exist but be private, so we show a specific message.
  if (!data) notFound(); 

  const { playlist, stories } = data;

  if (!playlist) { 
    // Custom component for access denied scenario
    return (
        <div className="container mx-auto max-w-4xl text-center py-24">
            <Lock className="h-16 w-16 mx-auto text-stone-600 mb-6"/>
            <h1 className="text-3xl font-display font-bold text-white">Playlist Privée</h1>
            <p className="text-stone-400 mt-2">Cette playlist est privée. Vous devez être le propriétaire pour la consulter.</p>
        </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl px-6 py-12 space-y-16">
      <header className="relative p-12 rounded-[3.5rem] bg-stone-950 border border-primary/10 overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.15),transparent_70%)]" />
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 relative z-10">
          <div className="space-y-6 text-center lg:text-left flex-1">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              <div className="bg-primary/10 p-2.5 rounded-2xl">
                <ListMusic className="h-6 w-6 text-primary" />
              </div>
              <Badge variant="secondary" className="bg-white/5 text-stone-400 border-none uppercase text-[9px] font-black tracking-widest px-3">
                Playlist
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
            
            <h1 className="text-4xl md:text-7xl font-display font-black text-white tracking-tighter leading-[0.9]">
              {playlist.title}
            </h1>
            
            {playlist.description && (
              <p className="text-xl text-stone-400 font-light italic leading-relaxed max-w-2xl border-l-4 border-primary/20 pl-8">
                "{playlist.description}"
              </p>
            )}

            <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-4">
              <Button size="lg" className="rounded-full px-10 h-14 font-black text-lg bg-primary text-black">
                Tout Lire
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
              <p className="text-stone-500 max-w-xs mx-auto italic font-light leading-relaxed">
                Cette playlist ne contient pas encore d'histoires. Explorez le catalogue pour l'enrichir.
              </p>
            </div>
            <Button asChild variant="outline" className="rounded-full px-12 h-14 border-primary text-primary hover:bg-primary hover:text-black font-black uppercase text-xs tracking-widest transition-all">
              <Link href="/">Explorer</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
