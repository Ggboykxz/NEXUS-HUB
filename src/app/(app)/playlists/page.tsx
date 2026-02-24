'use client';

import { useState, useEffect } from 'react';
import { playlists as allPlaylists } from '@/lib/data';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ListMusic, PlusCircle, Globe, Lock } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { useToast } from '@/hooks/use-toast';
import { useAuthModal } from '@/components/providers/auth-modal-provider';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

export default function MyPlaylistsPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { openAuthModal } = useAuthModal();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const myPlaylists = allPlaylists.filter(p => p.authorId === currentUser?.uid);

  const handleCreatePlaylist = () => {
    toast({
      title: "Playlist créée !",
      description: "Votre nouvelle playlist a été créée avec succès (simulation).",
    });
  };

  if (loading) {
      return (
          <div className="container mx-auto max-w-7xl px-4 py-12 text-center">
              <p className="text-muted-foreground">Chargement des playlists...</p>
          </div>
      );
  }

  if (!currentUser) {
      return (
          <div className="container mx-auto max-w-7xl px-4 py-24 text-center">
              <ListMusic className="h-16 w-16 text-muted-foreground mx-auto mb-6 opacity-20" />
              <h1 className="text-3xl font-bold mb-4">Vos Playlists</h1>
              <p className="text-muted-foreground max-w-md mx-auto mb-8">
                Créez des collections d'œuvres personnalisées et organisez votre bibliothèque. Connectez-vous pour commencer.
              </p>
              <div className="flex gap-4 justify-center">
                <Button onClick={() => openAuthModal('gérer vos playlists')} size="lg">
                  Se connecter
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/signup">Créer un compte</Link>
                </Button>
              </div>
          </div>
      )
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-12">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
        <div>
            <div className="flex items-center gap-4 mb-2">
                <ListMusic className="w-10 h-10 text-primary" />
                <h1 className="text-4xl font-bold font-display">Mes Playlists</h1>
            </div>
            <p className="text-lg text-muted-foreground">
                Organisez vos œuvres préférées dans des collections personnalisées.
            </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Nouvelle playlist
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Créer une nouvelle playlist</DialogTitle>
              <DialogDescription>
                Donnez un nom et une description à votre nouvelle collection d'œuvres.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="space-y-2">
                <Label htmlFor="playlist-name">Nom de la playlist</Label>
                <Input id="playlist-name" placeholder="Ex: Mes lectures du soir" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="playlist-description">Description</Label>
                <Textarea id="playlist-description" placeholder="Une courte description de votre playlist (optionnel)" />
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="playlist-public" />
                <Label htmlFor="playlist-public">Rendre la playlist publique</Label>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" onClick={handleCreatePlaylist}>
                  Créer la playlist
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
            <Dialog>
              <DialogTrigger asChild>
                <Button className="mt-6">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Créer une playlist
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Créer une nouvelle playlist</DialogTitle>
                  <DialogDescription>
                    Donnez un nom et une description à votre nouvelle collection d'œuvres.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-6 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="playlist-name-empty">Nom de la playlist</Label>
                    <Input id="playlist-name-empty" placeholder="Ex: Mes lectures du soir" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="playlist-description-empty">Description</Label>
                    <Textarea id="playlist-description-empty" placeholder="Une courte description de votre playlist (optionnel)" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="playlist-public-empty" />
                    <Label htmlFor="playlist-public-empty">Rendre la playlist publique</Label>
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" onClick={handleCreatePlaylist}>
                      Créer la playlist
                    </Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        )}
    </div>
  );
}