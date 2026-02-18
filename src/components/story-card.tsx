'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { Story } from '@/lib/data';
import { artists, getStoryUrl, getChapterUrl } from '@/lib/data';
import { cn } from '@/lib/utils';
import { Crown, Heart, ListPlus, Play, ArrowRight, PlusCircle, Award, PenSquare, Eye } from 'lucide-react';
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
    <div className={cn("group transition-all duration-300 animate-in fade-in zoom-in-95", className)}>
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
        {story.isPremium && (
          <Badge variant="default" className="absolute top-3 right-3 z-20 gap-1 pl-2 pr-3 py-1 bg-primary/95 text-white backdrop-blur-md border-white/20 shadow-lg">
            <Crown className="h-3.5 w-3.5" />
            NexusHub Pro
          </Badge>
        )}
        
        {/* Overlay Action Buttons & Synopsis */}
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 p-4">
            <p className="text-white/90 text-[11px] text-center mb-6 line-clamp-4 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 ease-out opacity-0 group-hover:opacity-100 font-light leading-relaxed italic">
                {story.description}
            </p>
            
            <div className="flex items-center justify-center gap-4 scale-90 group-hover:scale-100 transition-transform duration-300">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="secondary"
                            size="icon"
                            className="rounded-full h-12 w-12 bg-white/20 text-white border-white/20 hover:bg-white/40 backdrop-blur-md"
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
                
                <Button asChild size="lg" className="h-16 w-16 rounded-full bg-primary text-primary-foreground shadow-xl hover:scale-110 transition-transform">
                    <Link href={firstChapterUrl} onClick={(e) => e.stopPropagation()}>
                        <Play className="ml-1 h-8 w-8 fill-current" />
                    </Link>
                </Button>

                <Button 
                  variant="secondary" 
                  size="icon" 
                  className="rounded-full h-12 w-12 bg-white/20 text-white border-white/20 hover:bg-white/40 backdrop-blur-md"
                  onClick={handleHeartClick}
                >
                    <Heart className="h-6 w-6" />
                </Button>
            </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <Link href={storyUrl}>
            <h3 className="font-display font-bold text-lg text-foreground hover:text-primary transition-colors truncate">{story.title}</h3>
        </Link>
        <div className="flex items-center gap-2 text-sm text-muted-foreground font-light">
            <Link href={`/artiste/${story.artistSlug}`} className="hover:text-primary transition-colors flex items-center gap-1.5">
                <span className="font-medium">{story.artistName}</span>
                {artist?.isMentor ? <Award className="h-3.5 w-3.5 text-primary" /> : <PenSquare className="h-3.5 w-3.5" />}
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