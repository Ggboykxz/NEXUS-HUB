'use client';

import { use } from 'react';
import { playlists, stories } from '@/lib/data';
import { notFound } from 'next/navigation';
import { StoryCard } from '@/components/story-card';
import { ListMusic, Lock, Globe } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function PlaylistPage({ params }: { params: { playlistId: string } }) {
  const { playlistId } = use(params);
  const playlist = playlists.find((p) => p.id === playlistId);

  if (!playlist) {
    notFound();
  }

  const playlistStories = stories.filter(story => playlist.storyIds.includes(story.id));

  return (
    <div className="container mx-auto max-w-7xl px-4 py-12">
      <div className="flex items-start gap-4 mb-8">
        <ListMusic className="w-10 h-10 text-primary mt-1" />
        <div>
            <h1 className="text-4xl font-bold">{playlist.name}</h1>
            <div className="flex items-center gap-2 mt-2">
                {playlist.isPublic ? (
                    <Badge variant="secondary"><Globe className="h-3 w-3 mr-1.5" />Publique</Badge>
                ) : (
                    <Badge variant="outline"><Lock className="h-3 w-3 mr-1.5" />Privée</Badge>
                )}
            </div>
        </div>
      </div>
      <p className="text-lg text-muted-foreground mb-12 max-w-3xl">
        {playlist.description}
      </p>

      {playlistStories.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-12">
          {playlistStories.map((story) => (
            <StoryCard key={story.id} story={story} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-muted-foreground">Cette playlist est vide pour le moment.</p>
        </div>
      )}
    </div>
  );
}
