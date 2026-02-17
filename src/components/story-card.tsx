'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { Story } from '@/lib/data';
import { cn } from '@/lib/utils';
import { Crown, Heart, ListPlus, Play, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Skeleton } from './ui/skeleton';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';

interface StoryCardProps {
  story: Story;
  className?: string;
  showUpdateDate?: boolean;
}

export function StoryCard({ story, className, showUpdateDate }: StoryCardProps) {
  const [date, setDate] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    // This will only run on the client, after hydration
    if(showUpdateDate) {
        setDate(format(new Date(story.updatedAt), 'd MMM yyyy', { locale: fr }));
    }
  }, [story.updatedAt, showUpdateDate]);

  const chapterCount = story.chapters.length;

  const handleActionClick = (e: React.MouseEvent, message: string) => {
    e.stopPropagation();
    e.preventDefault();
    toast({
      title: message,
    });
  };


  return (
    <div className={cn("group", className)}>
      <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-stone-100 mb-5 shadow-sm transition-all duration-300 group-hover:shadow-xl">
        <Link href={`/stories/${story.id}`}>
            <Image
              src={story.coverImage.imageUrl}
              alt={`Couverture de ${story.title}`}
              fill
              className="object-cover transition-all duration-500 ease-in-out group-hover:scale-110 group-hover:blur-sm"
              data-ai-hint={story.coverImage.imageHint}
              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
            />
        </Link>
        {story.isPremium && (
          <Badge variant="default" className="absolute top-2 right-2 z-20 gap-1 pl-2 pr-2.5 bg-primary/90 text-white backdrop-blur-sm">
            <Crown className="h-3 w-3" />
            Premium
          </Badge>
        )}
        {/* Overlay */}
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-end text-center bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex w-full items-center justify-center gap-x-6">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-white hover:bg-white/20 hover:text-white"
                  onClick={(e) => handleActionClick(e, "Bientôt disponible: Playlists")}
                  aria-label="Ajouter à une playlist"
                >
                    <ListPlus className="h-6 w-6" />
                </Button>
                
                <Link href={`/read/${story.id}`} onClick={(e) => e.stopPropagation()} className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-white bg-white/20 text-white backdrop-blur-sm transition-all hover:scale-110 hover:bg-white/30" aria-label="Commencer la lecture">
                    <Play className="ml-1 h-8 w-8 fill-white" />
                </Link>

                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-white hover:bg-white/20 hover:text-white"
                  onClick={(e) => handleActionClick(e, "Ajouté aux favoris!")}
                  aria-label="Ajouter aux favoris"
                >
                    <Heart className="h-6 w-6" />
                </Button>
            </div>

            <Link href={`/stories/${story.id}`} className="w-full">
                <h3 className="font-display font-bold text-xl text-white drop-shadow-md">{story.title}</h3>
                <p className="text-white/80 text-xs line-clamp-2 mt-1">{story.description}</p>
                <div className="mt-2 flex items-center justify-center gap-2 text-sm font-medium text-white transition-colors group-hover:text-primary">
                    Voir plus
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
            </Link>
        </div>
      </div>
      <Link href={`/stories/${story.id}`}>
        <h3 className="font-display font-bold text-lg text-foreground mb-1 hover:text-primary transition-colors truncate fade-in">{story.title}</h3>
      </Link>
      <p className="text-sm text-foreground/60 dark:text-stone-400 mb-1 font-light transition-colors fade-in">par <Link href={`/artists/${story.artistId}`} className="hover:text-primary hover:underline transition-colors">{story.artistName}</Link></p>
      <p className="text-xs text-muted-foreground mb-3">{chapterCount} {chapterCount > 1 ? 'chapitres' : 'chapitre'}</p>
      {showUpdateDate ? (
        <div className="flex items-center justify-between text-xs">
            <Link href={`/stories?genre=${story.genre}`}>
                <Badge variant="outline" className="hover:bg-primary/10 hover:text-primary hover:border-primary/50 transition-colors">{story.genre}</Badge>
            </Link>
            {date ? <p className="text-muted-foreground">{date}</p> : <Skeleton className="w-16 h-4" />}
        </div>
      ) : (
          <Link href={`/stories?genre=${story.genre}`}>
              <Badge variant="outline" className="hover:bg-primary/10 hover:text-primary hover:border-primary/50 transition-colors">{story.genre}</Badge>
          </Link>
      )}
    </div>
  );
}
