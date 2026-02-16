'use client';

import { use, useState, useEffect } from 'react';
import { readers, stories } from '@/lib/data';
import { notFound } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { StoryCard } from '@/components/story-card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Ban } from 'lucide-react';

export default function ProfilePage({ params: propsParams }: { params: { readerId: string } }) {
  const params = use(propsParams);
  const reader = readers.find((r) => r.id === params.readerId);
  const { toast } = useToast();
  const [isArtist, setIsArtist] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);

  useEffect(() => {
    // This logic runs only on the client, after hydration
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const accountType = localStorage.getItem('accountType');
    setIsArtist(loggedIn && accountType === 'artist');
  }, []);


  if (!reader) {
    notFound();
  }

  const handleBlockClick = () => {
    setIsBlocked(!isBlocked);
    toast({
        title: isBlocked ? 'Lecteur débloqué' : 'Lecteur bloqué',
        description: `${reader.name} a été ${isBlocked ? 'débloqué' : 'bloqué'} et ne pourra plus commenter vos œuvres.`,
        variant: isBlocked ? 'default' : 'destructive',
    });
  }

  // Simulate reading history and recommendations
  const readingHistory = stories.slice(2, 7);
  const recommendations = stories.slice(0, 5).reverse();

  return (
    <div className="container mx-auto max-w-5xl px-4 py-12">
      <div className="flex flex-col items-center text-center">
        <Avatar className="h-40 w-40 border-4 border-background ring-4 ring-primary">
          <AvatarImage src={reader.avatar.imageUrl} alt={reader.name} data-ai-hint={reader.avatar.imageHint} />
          <AvatarFallback>{reader.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <h1 className="text-4xl font-bold mt-4">{reader.name}</h1>
        <p className="text-lg text-muted-foreground mt-1">Lecteur / Lectrice</p>
        
        {isArtist && (
             <Button 
                variant={isBlocked ? 'destructive' : 'outline'} 
                size="sm" 
                className="mt-4"
                onClick={handleBlockClick}
            >
                <Ban className="mr-2 h-4 w-4" />
                {isBlocked ? 'Débloquer ce lecteur' : 'Bloquer ce lecteur'}
            </Button>
        )}
        
        <p className="text-md text-foreground/80 leading-relaxed mt-6 max-w-2xl">{reader.bio}</p>
      </div>

      <Separator className="my-12" />

      <div className="mt-8">
        <h2 className="text-3xl font-bold font-display mb-8 text-center">Historique de lecture</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-12">
          {readingHistory.map((story) => (
            <StoryCard key={story.id} story={story} />
          ))}
        </div>
      </div>
      
      <Separator className="my-12" />

      <div className="mt-8">
        <h2 className="text-3xl font-bold font-display mb-8 text-center">Recommandations pour vous</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-12">
          {recommendations.map((story) => (
            <StoryCard key={story.id} story={story} />
          ))}
        </div>
      </div>
    </div>
  );
}
