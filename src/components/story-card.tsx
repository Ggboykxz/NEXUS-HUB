'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { Story } from '@/lib/data';
import { artists, getStoryUrl, getChapterUrl } from '@/lib/data';
import { cn } from '@/lib/utils';
import { Crown, Heart, ListPlus, Play, PlusCircle, Award, PenSquare, Eye, Info, Sparkles, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';
import { format, differenceInDays } from 'date-fns';
import { fr } from 'date-fns/locale';
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

const formatStat = (num: number): string => {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(0)}k`;
  return num.toString();
};

export function StoryCard({ story, className, showUpdateDate }: StoryCardProps) {
  const [date, setDate] = useState('');
  const { toast } = useToast();

  const userPlaylists = allPlaylists.filter(p => p.authorId === 'reader-1');
  const artist = artists.find(a => a.id === story.artistId);

  // Check if story is "New" (less than 7 days) or "Trending" (mock logic based on likes)
  const isNew = differenceInDays(new Date(), new Date(story.updatedAt)) < 7;
  const isTrending = story.likes > 50000;

  useEffect(() => {
    if(showUpdateDate) {
        setDate(format(new Date(story.updatedAt), 'd MMM yyyy', { locale: fr }));
    }
  }, [story.updatedAt, showUpdateDate]);

  const handleHeartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    toast({ title: "Ajouté aux favoris !" });
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
      toast({ title: "Fonctionnalité bientôt disponible" });
  };

  const storyUrl = getStoryUrl(story);
  const firstChapterUrl = story.chapters.length > 0 ? getChapterUrl(story, story.chapters[0].slug) : storyUrl;

  return (
    <div className={cn("group relative transition-all duration-300 animate-in fade-in zoom-in-95", className)}>
      <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-stone-100 mb-4 shadow-sm transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1) group-hover:shadow-2xl group-hover:-translate-y-2">
        <Link href={storyUrl}>
            <Image
              src={story.coverImage.imageUrl}
              alt={`Couverture de ${story.title}`}
              fill
              className="object-cover transition-all duration-700 ease-in-out group-hover:scale-110 group-hover:blur-[3px]"
              data-ai-hint={story.coverImage.imageHint}
              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
            />
        </Link>
        
        {/* Status Badges - Hidden on hover to clear space */}
        <div className="absolute top-3 left-3 z-20 flex flex-col gap-1.5 transition-opacity duration-300 group-hover:opacity-0 pointer-events-none">
            {artist?.isMentor ? (
                <Badge variant="default" className="gap-1 pl-1.5 pr-2 py-0.5 bg-emerald-500 text-white backdrop-blur-md border-none shadow-lg text-[10px] uppercase font-bold tracking-wider">
                    <Award className="h-3 w-3" />
                    Pro
                </Badge>
            ) : (
                <Badge variant="outline" className="gap-1 pl-1.5 pr-2 py-0.5 bg-black/40 text-orange-400 backdrop-blur-md border-orange-500/50 shadow-lg text-[10px] uppercase font-bold tracking-wider">
                    <PenSquare className="h-3 w-3" />
                    Draft
                </Badge>
            )}
            
            {isNew && (
              <Badge className="gap-1 pl-1.5 pr-2 py-0.5 bg-cyan-500 text-white backdrop-blur-md border-none shadow-lg text-[10px] uppercase font-bold tracking-wider animate-pulse">
                <Sparkles className="h-3 w-3" />
                Nouveau
              </Badge>
            )}

            {isTrending && !isNew && (
              <Badge className="gap-1 pl-1.5 pr-2 py-0.5 bg-rose-500 text-white backdrop-blur-md border-none shadow-lg text-[10px] uppercase font-bold tracking-wider">
                <Zap className="h-3 w-3" />
                Tendance
              </Badge>
            )}
        </div>

        {story.isPremium && (
          <Badge variant="default" className="absolute top-3 right-3 z-20 gap-1 pl-2 pr-3 py-1 bg-primary/95 text-white backdrop-blur-md border-white/20 shadow-lg text-[10px] transition-opacity duration-300 group-hover:opacity-0 pointer-events-none">
            <Crown className="h-3.5 w-3.5" />
            PREMIUM
          </Badge>
        )}
        
        {/* Overlay Action Buttons & Synopsis */}
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/75 backdrop-blur-[4px] opacity-0 group-hover:opacity-100 transition-all duration-300 p-6 text-center">
            <div className="flex-1 flex flex-col justify-center">
                <p className="text-white/90 text-xs mb-8 line-clamp-5 transform -translate-y-4 group-hover:translate-y-0 transition-all duration-500 ease-out opacity-0 group-hover:opacity-100 font-light leading-relaxed italic">
                    {story.description}
                </p>
                
                <div className="flex flex-col items-center gap-6 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 delay-100 ease-out opacity-0 group-hover:opacity-100">
                    <div className="flex items-center justify-center gap-4">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="secondary"
                                    size="icon"
                                    className="rounded-full h-12 w-12 bg-white/10 text-white border-white/20 hover:bg-white/30 backdrop-blur-md transition-all active:scale-95 shadow-xl"
                                    onClick={(e) => { e.stopPropagation(); e.preventDefault(); }}
                                >
                                    <ListPlus className="h-6 w-6" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent onClick={(e) => { e.stopPropagation(); e.preventDefault(); }} align="center" className="w-56">
                                <DropdownMenuLabel>Playlist rapide</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {userPlaylists.map(playlist => (
                                    <DropdownMenuItem key={playlist.id} onClick={(e) => handleAddToPlaylist(e, playlist.name)}>
                                        {playlist.name}
                                    </DropdownMenuItem>
                                ))}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={handleCreatePlaylist}>
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Nouvelle playlist
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        
                        <Button asChild size="lg" className="h-16 w-16 rounded-full bg-primary text-primary-foreground shadow-2xl hover:scale-110 transition-transform active:scale-95 border-2 border-white/10">
                            <Link href={firstChapterUrl} onClick={(e) => e.stopPropagation()}>
                                <Play className="ml-1 h-8 w-8 fill-current" />
                            </Link>
                        </Button>

                        <Button 
                          variant="secondary" 
                          size="icon" 
                          className="rounded-full h-12 w-12 bg-white/10 text-white border-white/20 hover:bg-white/30 backdrop-blur-md transition-all active:scale-95 shadow-xl"
                          onClick={handleHeartClick}
                        >
                            <Heart className="h-6 w-6" />
                        </Button>
                    </div>
                    
                    <Button asChild variant="outline" className="w-full border-white/30 text-white hover:bg-primary hover:text-primary-foreground hover:border-primary backdrop-blur-md rounded-full h-11 text-[10px] uppercase tracking-[0.2em] font-bold transition-all active:scale-95 shadow-lg">
                        <Link href={storyUrl} onClick={(e) => e.stopPropagation()}>
                            <Info className="mr-2 h-4 w-4" />
                            Voir plus de détails
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
      </div>

      <div className="space-y-1.5 px-1">
        <Link href={storyUrl}>
            <h3 className="font-display font-bold text-lg text-foreground hover:text-primary transition-colors truncate">{story.title}</h3>
        </Link>
        <div className="flex items-center gap-2 text-sm text-muted-foreground font-light">
            <Link href={`/artiste/${story.artistSlug}`} className="hover:text-primary transition-colors flex items-center gap-1.5">
                <span className="font-medium">{story.artistName}</span>
                {artist?.isMentor ? <Award className="h-3.5 w-3.5 text-emerald-500" /> : <PenSquare className="h-3.5 w-3.5 text-orange-400" />}
            </Link>
        </div>
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
                    <Eye className="h-3 w-3 text-primary" />
                    {formatStat(story.views)}
                </div>
                <div className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
                    <Heart className="h-3 w-3 text-destructive" />
                    {formatStat(story.likes)}
                </div>
            </div>
            <Link href={`/genre/${story.genreSlug}`}>
                <Badge variant="outline" className="text-[9px] uppercase font-bold tracking-tighter px-2 py-0 h-5 border-primary/20 hover:bg-primary/10 hover:text-primary transition-colors">
                    {story.genre}
                </Badge>
            </Link>
        </div>
      </div>
    </div>
  );
}
