'use client';

import { useState } from 'react';
import { artists, stories as allStories } from '@/lib/data';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Globe, Book, Twitter, Instagram, Facebook, Bell } from 'lucide-react';
import { StoryCard } from '@/components/story-card';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function ArtistProfilePage({ params }: { params: { artistId: string } }) {
  const { toast } = useToast();
  const [isSubscribed, setIsSubscribed] = useState(false);

  const artist = artists.find((a) => a.id === params.artistId);

  if (!artist) {
    notFound();
  }

  const handleSubscribeClick = () => {
    setIsSubscribed(!isSubscribed);
    toast({
      title: isSubscribed ? "Abonnement annulé" : "Abonné !",
      description: `Vous ${isSubscribed ? "ne recevrez plus" : "recevrez désormais"} les notifications pour ${artist.name}.`,
    });
  };

  const artistStories = allStories.filter(story => story.artistId === artist.id);

  return (
    <div className="container mx-auto max-w-7xl px-4 py-12">
      <div className="md:flex gap-8">
        <div className="md:w-1/3 text-center md:text-left">
          <Avatar className="h-48 w-48 border-4 border-background ring-4 ring-primary mx-auto md:mx-0">
            <AvatarImage src={artist.avatar.imageUrl} alt={artist.name} data-ai-hint={artist.avatar.imageHint} />
            <AvatarFallback>{artist.name.charAt(0)}</AvatarFallback>
          </Avatar>
          
          <div className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-x-4 gap-y-2 mt-4">
            <h1 className="text-4xl font-bold">{artist.name}</h1>
            <Button
              onClick={handleSubscribeClick}
              variant={isSubscribed ? 'secondary' : 'default'}
              size="sm"
            >
              <Bell className={cn("mr-2 h-4 w-4", isSubscribed && "fill-current")} />
              {isSubscribed ? 'Abonné' : 'S\'abonner'}
            </Button>
          </div>
          
          <div className="flex gap-2 justify-center md:justify-start flex-wrap mt-6">
            {artist.links.personal && (
              <Button variant="outline" asChild>
                <a href={artist.links.personal} target="_blank" rel="noopener noreferrer">
                  <Globe className="mr-2 h-4 w-4" /> Site Perso
                </a>
              </Button>
            )}
            {artist.links.amazon && (
                <Button variant="outline" asChild>
                <a href={artist.links.amazon} target="_blank" rel="noopener noreferrer">
                  <Book className="mr-2 h-4 w-4" /> Amazon
                </a>
              </Button>
            )}
            {artist.links.twitter && (
              <Button variant="outline" size="icon" asChild>
                <a href={artist.links.twitter} target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                  <Twitter className="h-4 w-4" />
                </a>
              </Button>
            )}
            {artist.links.instagram && (
              <Button variant="outline" size="icon" asChild>
                <a href={artist.links.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                  <Instagram className="h-4 w-4" />
                </a>
              </Button>
            )}
            {artist.links.facebook && (
              <Button variant="outline" size="icon" asChild>
                <a href={artist.links.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                  <Facebook className="h-4 w-4" />
                </a>
              </Button>
            )}
          </div>
        </div>

        <div className="md:w-2/3 mt-8 md:mt-0">
          <h2 className="text-2xl font-bold font-display mb-2">Biographie</h2>
          <p className="text-lg text-foreground/80 leading-relaxed">{artist.bio}</p>
        </div>
      </div>

      <div className="mt-16">
        <h2 className="text-3xl font-bold font-display mb-6">Portfolio</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {artistStories.map((story) => (
            <StoryCard key={story.id} story={story} />
          ))}
        </div>
      </div>
    </div>
  );
}
