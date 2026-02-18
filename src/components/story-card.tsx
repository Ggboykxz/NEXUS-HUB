'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { Story } from '@/lib/data';
import { artists, getStoryUrl, getChapterUrl } from '@/lib/data';
import { cn } from '@/lib/utils';
import { Crown, Heart, ListPlus, Play, ArrowRight, PlusCircle, Award, PenSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Skeleton } from './ui/skeleton';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { playlists as allPlaylists } from '@/lib/data';

interface StoryCardProps {
  story: Story;
  className?: string;
  showUpdateDate?: boolean;
}

export function StoryCard({ story, className, showUpdateDate }: StoryCardProps) {
  const [date, setDate] = useState('');
  const { toast } = useToast();

  const userPlaylists = allPlaylists.filter(p => p.authorId === 'reader-1');
  const artist = artists.find(a => a.id === story.artistId);

  useEffect(() => {
    if(showUpdateDate) {
        setDate(format(new Date(story.updatedAt), 'd MMM yyyy', { locale: fr }));
    }
  }, [story.updatedAt, showUpdateDate]);

  const chapterCount = story.chapters.length;

  const handleHeartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
  };

  const handleAddToPlaylist = (e: React.MouseEvent, playlistName: string) => {
    e.stopPropagation();
    e.preventDefault();
    toast({
        title: `Ajouté à la playlist "${playlistName}" !`,
        description: `"${story.title}" a bien été ajouté.`
    });
  };

  const handleCreatePlaylist = (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
  };

  const storyUrl = getStoryUrl(story);
  const firstChapterUrl = story.chapters.length > 0 ? getChapterUrl(story, story.chapters[0].slug) : storyUrl;

  return (
    <div className={cn("group transition-all duration-300 will-change-transform", className)}>
      <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-stone-100 mb-5 shadow-sm transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1) group-hover:shadow-xl group-hover:-translate-y-1">
        <Link href={storyUrl}>
            <Image
              src={story.coverImage.imageUrl}
              alt={`Couverture de ${story.title}`}
              fill
              className="object-cover transition-all duration-700 ease-in-out group-hover:scale-110 group-hover:blur-[2px]"
              data-ai-hint={story.coverImage.imageHint}
              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
            />
        </Link>
        {story.isPremium && (
          <Badge variant="default" className="absolute top-2 right-2 z-20 gap-1 pl-2 pr-2.5 bg-primary/90 text-white backdrop-blur-sm border-white/20">
            <Crown className="h-3 w-3" />
            Premium
          </Badge>
        )}
        {/* Overlay with high performance transitions */}
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-end text-center bg-gradient-to-t from-black/90 via-black/40 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-all duration-300 cubic-bezier(0.16, 1, 0.3, 1)">
            
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex w-full items-center justify-center gap-x-6 scale-90 group-hover:scale-100 transition-transform duration-300 delay-75">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-white hover:bg-white/20 hover:text-white transition-colors"
                            onClick={(e) => { e.stopPropagation(); e.preventDefault(); }}
                            aria-label="Ajouter à une playlist"
                        >
                            <ListPlus className="h-6 w-6" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent onClick={(e) => { e.stopPropagation(); e.preventDefault(); }} align="end">
                        <DropdownMenuLabel>Ajouter à la playlist</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {userPlaylists.map(playlist => (
                            <DropdownMenuItem key={playlist.id} onClick={(e) => handleAddToPlaylist(e, playlist.name)}>
                                {playlist.name}
                            </DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleCreatePlaylist}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Créer une playlist
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
                
                <Link href={firstChapterUrl} onClick={(e) => e.stopPropagation()} className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-white bg-white/20 text-white backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:bg-white/30" aria-label="Commencer la lecture">
                    <Play className="ml-1 h-8 w-8 fill-white" />
                </Link>

                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-white hover:bg-white/20 hover:text-white transition-colors"
                  onClick={handleHeartClick}
                  aria-label="Ajouter aux favoris"
                >
                    <Heart className="h-6 w-6" />
                </Button>
            </div>

            <Link href={storyUrl} className="w-full translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-100">
                <h3 className="font-display font-bold text-xl text-white drop-shadow-md mb-1">{story.title}</h3>
                <p className="text-white/80 text-xs line-clamp-2 mb-3">{story.description}</p>
                <div className="inline-flex items-center justify-center rounded-full border border-white/40 bg-white/10 px-4 py-1.5 text-[10px] uppercase tracking-widest text-white backdrop-blur-sm transition-all duration-300 hover:bg-primary hover:text-primary-foreground hover:border-primary">
                    Découvrir
                    <ArrowRight className="ml-1.5 h-3 w-3" />
                </div>
            </Link>
        </div>
      </div>
      <Link href={storyUrl}>
        <h3 className="font-display font-bold text-lg text-foreground mb-1 hover:text-primary transition-colors truncate">{story.title}</h3>
      </Link>
      <div className="text-sm text-foreground/60 dark:text-stone-400 mb-1 font-light flex items-center gap-1.5">
        par{' '}
        <Link href={`/artiste/${story.artistSlug}`} className="hover:text-primary hover:underline transition-colors inline-flex items-center gap-1">
          <span className="font-medium">{story.artistName}</span>
          {artist?.isMentor ? (
            <Award className="h-3.5 w-3.5 text-primary" title="Artiste Pro" />
          ) : (
            <PenSquare className="h-3.5 w-3.5 text-muted-foreground/80" title="Artiste Draft" />
          )}
        </Link>
      </div>
      <p className="text-xs text-muted-foreground mb-3">{chapterCount} {chapterCount > 1 ? 'chapitres' : 'chapitre'}</p>
      <div className="flex items-center justify-between text-xs">
          <Link href={`/genre/${story.genreSlug}`}>
              <Badge variant="outline" className="rounded-full px-3 py-0.5 hover:bg-primary/10 hover:text-primary hover:border-primary/50 transition-all duration-300">
                {story.genre}
              </Badge>
          </Link>
          {showUpdateDate && (
            date ? <p className="text-muted-foreground font-light">{date}</p> : <Skeleton className="w-16 h-4" />
          )}
      </div>
    </div>
  );
}
