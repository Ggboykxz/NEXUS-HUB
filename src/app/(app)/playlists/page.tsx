'use client';

import { useState, useEffect } from 'react';
import { playlists as allPlaylists } from '@/lib/data';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ListMusic, PlusCircle, Globe, Lock } from 'lucide-react';

export default function MyPlaylistsPage() {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
    // Simulate getting logged in user
    setCurrentUserId(localStorage.getItem('userId'));
  }, []);

  const myPlaylists = allPlaylists.filter(p => p.authorId === currentUserId);

  if (!hasMounted) {
      return (
          <div className="container mx-auto max-w-7xl px-4 py-12 text-center">
              <p className="text-muted-foreground">Chargement...</p>
          </div>
      );
  }

  if (!currentUserId) {
      return (
          <div className="container mx-auto max-w-7xl px-4 py-12 text-center">
              <p className="text-muted-foreground">Veuillez vous connecter pour voir vos playlists.</p>
              <Button asChild className="mt-4">
                <Link href="/login">Se connecter</Link>
              </Button>
          </div>
      )
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-12">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
        <div>
            <div className="flex items-center gap-4 mb-2">
                <ListMusic className="w-10 h-10 text-primary" />
                <h1 className="text-4xl font-bold">Mes Playlists</h1>
            </div>
            <p className="text-lg text-muted-foreground">
                Organisez vos œuvres préférées dans des collections personnalisées.
            </p>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Nouvelle playlist
        </Button>
      </div>
      
      {myPlaylists.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {myPlaylists.map((playlist) => (
              <Link key={playlist.id} href={`/playlists/${playlist.id}`} className="block h-full">
                <Card className="flex flex-col h-full transition-all hover:shadow-lg hover:-translate-y-1">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      {playlist.isPublic ? <Globe className="w-5 h-5 text-muted-foreground" /> : <Lock className="w-5 h-5 text-muted-foreground" />}
                      <span>{playlist.name}</span>
                    </CardTitle>
                    <CardDescription>{playlist.storyIds.length} {playlist.storyIds.length > 1 ? 'œuvres' : 'œuvre'}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-sm text-muted-foreground line-clamp-2">{playlist.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 border border-dashed rounded-lg">
            <ListMusic className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">Vous n'avez pas encore de playlist</h3>
            <p className="mt-1 text-sm text-muted-foreground">
                Commencez à créer votre première collection d'œuvres.
            </p>
            <Button className="mt-6">
                <PlusCircle className="mr-2 h-4 w-4" />
                Créer une playlist
            </Button>
          </div>
        )}
    </div>
  );
}
