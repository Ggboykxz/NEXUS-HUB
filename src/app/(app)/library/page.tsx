'use client';

import { useState, useEffect } from 'react';
import { stories, type Story } from '@/lib/data';
import { StoryCard } from '@/components/story-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookMarked, Heart, History, Clock, Library as LibraryIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function LibraryPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(localStorage.getItem('isLoggedIn') === 'true');
  }, []);

  // Simuler des listes pour l'utilisateur connecté
  const followedStories = stories.slice(0, 3);
  const favoriteStories = stories.slice(2, 5);
  const historyStories = stories.slice(1, 6);

  if (!isLoggedIn) {
    return (
      <div className="container mx-auto max-w-7xl px-6 py-24 text-center">
        <LibraryIcon className="h-16 w-16 text-muted-foreground mx-auto mb-6 opacity-20" />
        <h1 className="text-3xl font-bold mb-4">Votre Bibliothèque Personnelle</h1>
        <p className="text-muted-foreground max-w-md mx-auto mb-8">
          Connectez-vous pour retrouver vos lectures en cours, vos favoris et vos abonnements.
        </p>
        <div className="flex gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/login">Se connecter</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/signup">Créer un compte</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl px-6 py-12">
      <div className="flex items-center gap-4 mb-12">
        <div className="bg-primary/10 p-3 rounded-2xl">
          <LibraryIcon className="h-10 w-10 text-primary" />
        </div>
        <div>
          <h1 className="text-4xl font-bold font-display">Ma Bibliothèque</h1>
          <p className="text-muted-foreground">Gérez vos lectures et soutenez vos artistes favoris.</p>
        </div>
      </div>

      <Tabs defaultValue="following" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-2xl mb-12 h-12">
          <TabsTrigger value="following" className="gap-2 text-base">
            <BookMarked className="h-4 w-4" /> Suivis
          </TabsTrigger>
          <TabsTrigger value="favorites" className="gap-2 text-base">
            <Heart className="h-4 w-4" /> Favoris
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2 text-base">
            <History className="h-4 w-4" /> Historique
          </TabsTrigger>
        </TabsList>

        <TabsContent value="following" className="animate-in fade-in duration-500">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-12">
            {followedStories.map(story => (
              <StoryCard key={story.id} story={story} />
            ))}
          </div>
          {followedStories.length === 0 && <EmptyState message="Vous ne suivez aucune œuvre pour le moment." />}
        </TabsContent>

        <TabsContent value="favorites" className="animate-in fade-in duration-500">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-12">
            {favoriteStories.map(story => (
              <StoryCard key={story.id} story={story} />
            ))}
          </div>
          {favoriteStories.length === 0 && <EmptyState message="Vous n'avez pas encore ajouté de favoris." />}
        </TabsContent>

        <TabsContent value="history" className="animate-in fade-in duration-500">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-12">
            {historyStories.map(story => (
              <StoryCard key={story.id} story={story} showUpdateDate />
            ))}
          </div>
          {historyStories.length === 0 && <EmptyState message="Votre historique est vide." />}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-24 border-2 border-dashed rounded-3xl">
      <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
      <p className="text-muted-foreground mb-6">{message}</p>
      <Button asChild variant="outline">
        <Link href="/stories">Parcourir le catalogue</Link>
      </Button>
    </div>
  );
}
