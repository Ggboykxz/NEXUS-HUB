'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { Story } from '@/lib/data';
import { getStoryUrl, getChapterUrl } from '@/lib/data';
import { cn } from '@/lib/utils';
import { Crown, Heart, ListPlus, Play, Award, PenSquare, Eye, Info, Sparkles, Zap, CalendarDays, Flame, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';
import { format, differenceInDays, formatDistanceToNow } from 'date-fns';
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
import { useAuthModal } from './providers/auth-modal-provider';
import { db, auth } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';

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
  const [relativeDate, setRelativeDate] = useState('');
  const [artistInfo, setArtistInfo] = useState<any>(null);
  const [userPlaylists, setUserPlaylists] = useState<any[]>([]);
  const { toast } = useToast();
  const { openAuthModal } = useAuthModal();

  const isNew = differenceInDays(new Date(), new Date(story.updatedAt)) < 14;
  const isTrending = story.likes > 50000;
  const isHotAfro = story.genreSlug === 'afrofuturisme' && story.views > 500000;

  useEffect(() => {
    // Relative date calculation after hydration
    setRelativeDate(formatDistanceToNow(new Date(story.updatedAt), { addSuffix: true, locale: fr }));
    
    if(showUpdateDate) {
        setDate(format(new Date(story.updatedAt), 'd MMM yyyy', { locale: fr }));
    }

    // Fetch Artist Info from Firestore
    const fetchArtist = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', story.artistId));
        if (userDoc.exists()) {
          setArtistInfo(userDoc.data());
        }
      } catch (e) {
        console.error("Error fetching artist info:", e);
      }
    };
    fetchArtist();

    // Fetch User Playlists if logged in
    if (auth.currentUser) {
      const fetchPlaylists = async () => {
        const q = query(collection(db, 'playlists'), where('authorId', '==', auth.currentUser?.uid));
        const snap = await getDocs(q);
        setUserPlaylists(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      };
      fetchPlaylists();
    }
  }, [story.updatedAt, story.artistId, showUpdateDate]);

  const handleHeartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!auth.currentUser) {
      openAuthModal('ajouter cette œuvre à vos favoris');
      return;
    }
    toast({ title: "Ajouté aux favoris !" });
  };

  const handleAddToPlaylist = (e: React.MouseEvent, playlistName: string) => {
    e.stopPropagation();
    e.preventDefault();
    if (!auth.currentUser) {
      openAuthModal('organiser vos lectures dans des playlists');
      return;
    }
    toast({
        title: `Ajouté à la playlist "${playlistName}" !`,
        description: `"${story.title}" a bien été ajouté.`
    });
  };

  const storyUrl = getStoryUrl(story);
  const hasChapters = story.chapters && story.chapters.length > 0;
  const firstChapterUrl = hasChapters ? getChapterUrl(story, story.chapters[0].slug) : storyUrl;

  return (
    <div className={cn("group relative transition-all duration-300 animate-in fade-in zoom-in-95", className)}>
      <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-stone-100 mb-2 shadow-sm transition-all duration-500 group-hover:shadow-xl group-hover:-translate-y-1">
        <Link href={storyUrl} aria-label={`Voir les détails de ${story.title}`}>
            <Image
              src={story.coverImage.imageUrl}
              alt={`Couverture de ${story.title}`}
              fill
              className="object-cover transition-all duration-700 ease-in-out group-hover:scale-110 group-hover:blur-[2px]"
              data-ai-hint={story.coverImage.imageHint}
              sizes="(max-width: 768px) 40vw, (max-width: 1024px) 25vw, 15vw"
            />
        </Link>
        
        <div className="absolute top-2 left-2 z-20 flex flex-col gap-1 transition-opacity duration-300 group-hover:opacity-0 pointer-events-none">
            {artistInfo?.role?.includes('pro') ? (
                <Badge variant="default" className="gap-1 px-1 py-0.5 bg-emerald-500 text-white backdrop-blur-md border-none shadow-lg text-[7px] uppercase font-bold tracking-wider">
                    <Award className="h-2 w-2" />
                    Pro
                </Badge>
            ) : (
                <Badge variant="outline" className="gap-1 px-1 py-0.5 bg-black/40 text-orange-400 backdrop-blur-md border-orange-500/50 shadow-lg text-[7px] uppercase font-bold tracking-wider">
                    <PenSquare className="h-2 w-2" />
                    Draft
                </Badge>
            )}
            
            {isHotAfro && (
              <Badge className="gap-1 px-1 py-0.5 bg-orange-600 text-white backdrop-blur-md border-none shadow-lg text-[7px] uppercase font-bold tracking-wider animate-pulse">
                <Flame className="h-2 w-2" />
                Hot
              </Badge>
            )}

            {isNew && !isHotAfro && (
              <Badge className="gap-1 px-1 py-0.5 bg-cyan-500 text-white backdrop-blur-md border-none shadow-lg text-[7px] uppercase font-bold tracking-wider">
                <Sparkles className="h-2 w-2" />
                Nouveau
              </Badge>
            )}
        </div>

        {story.isPremium && (
          <Badge variant="default" className="absolute top-2 right-2 z-20 gap-1 px-1 py-0.5 bg-primary/95 text-white backdrop-blur-md border-white/20 shadow-lg text-[7px] transition-opacity duration-300 group-hover:opacity-0 pointer-events-none">
            <Crown className="h-2 w-2" />
            PREMIUM
          </Badge>
        )}
        
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/75 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 p-3 text-center">
            <div className="flex-1 flex flex-col justify-center">
                <p className="text-white/90 text-[9px] mb-4 line-clamp-3 transform -translate-y-2 group-hover:translate-y-0 transition-all duration-500 ease-out opacity-0 group-hover:opacity-100 font-light leading-relaxed italic">
                    {story.description}
                </p>
                
                <div className="flex flex-col items-center gap-3 transform translate-y-2 group-hover:translate-y-0 transition-all duration-500 delay-75 ease-out opacity-0 group-hover:opacity-100">
                    <div className="flex items-center justify-center gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="secondary"
                                    size="icon"
                                    className="rounded-full h-7 w-7 bg-white/10 text-white border-white/20 hover:bg-white/30 backdrop-blur-md transition-all active:scale-95 shadow-lg"
                                    onClick={(e) => { e.stopPropagation(); e.preventDefault(); }}
                                    aria-label="Ajouter à une playlist"
                                >
                                    <ListPlus className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent onClick={(e) => { e.stopPropagation(); e.preventDefault(); }} align="center" className="w-40">
                                <DropdownMenuLabel className="text-[10px]">Playlist rapide</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {userPlaylists.length > 0 ? userPlaylists.map(playlist => (
                                    <DropdownMenuItem key={playlist.id} className="text-[10px]" onClick={(e) => handleAddToPlaylist(e, playlist.name)}>
                                        {playlist.name}
                                    </DropdownMenuItem>
                                )) : (
                                  <DropdownMenuItem disabled className="text-[10px]">Aucune playlist</DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                        
                        {hasChapters ? (
                            <Button asChild size="lg" className="h-10 w-10 rounded-full bg-primary text-primary-foreground shadow-xl hover:scale-110 transition-transform active:scale-95 border border-white/10" aria-label={`Lire ${story.title}`}>
                                <Link href={firstChapterUrl} onClick={(e) => e.stopPropagation()}>
                                    <Play className="ml-0.5 h-5 w-5 fill-current" />
                                </Link>
                            </Button>
                        ) : (
                            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center border border-white/10 opacity-50" title="Bientôt disponible">
                                <CalendarDays className="h-5 w-5 text-white" />
                            </div>
                        )}

                        <Button 
                          variant="secondary" 
                          size="icon" 
                          className="rounded-full h-7 w-7 bg-white/10 text-white border-white/20 hover:bg-white/30 backdrop-blur-md transition-all active:scale-95 shadow-lg"
                          onClick={handleHeartClick}
                          aria-label="Ajouter aux favoris"
                        >
                            <Heart className="h-4 w-4" />
                        </Button>
                    </div>
                    
                    <Button asChild variant="outline" className="w-full border-white/30 text-white hover:bg-primary hover:text-primary-foreground hover:border-primary backdrop-blur-md rounded-full h-7 text-[8px] uppercase tracking-[0.1em] font-bold transition-all active:scale-95 shadow-md">
                        <Link href={storyUrl} onClick={(e) => e.stopPropagation()}>
                            <Info className="mr-1 h-3 w-3" />
                            Détails
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
      </div>

      <div className="space-y-0.5 px-0.5">
        <div className="flex items-center justify-between gap-2">
          <Link href={storyUrl} className="min-w-0">
              <h3 className="font-display font-bold text-xs text-foreground hover:text-primary transition-colors truncate">{story.title}</h3>
          </Link>
          {relativeDate && (
            <span className="text-[7px] text-muted-foreground whitespace-nowrap flex items-center gap-0.5 uppercase tracking-tighter">
              <Clock className="h-2 w-2" /> {relativeDate}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-light">
            <Link href={`/artiste/${artistInfo?.slug}`} className="hover:text-primary transition-colors flex items-center gap-1">
                <span className="font-medium truncate max-w-[80px]">{artistInfo?.displayName || story.artistName}</span>
                {artistInfo?.role?.includes('pro') ? <Award className="h-2.5 w-2.5 text-emerald-500" /> : <PenSquare className="h-2.5 w-2.5 text-orange-400" />}
            </Link>
        </div>
        <div className="flex items-center justify-between mt-1 pt-1 border-t border-border/50">
            <div className="flex items-center gap-1.5">
                <div className="flex items-center gap-0.5 text-[8px] uppercase font-bold tracking-widest text-muted-foreground">
                    <Eye className="h-2 w-2 text-primary" />
                    {formatStat(story.views)}
                </div>
                <div className="flex items-center gap-0.5 text-[8px] uppercase font-bold tracking-widest text-muted-foreground">
                    <Heart className="h-2 w-2 text-destructive" />
                    {formatStat(story.likes)}
                </div>
            </div>
            <Badge variant="outline" className="text-[7px] uppercase font-bold tracking-tighter px-1 py-0 h-3 border-primary/20">
                {story.format === 'Webtoon' ? 'Série' : story.format}
            </Badge>
        </div>
        {showUpdateDate && date && (
          <p className="text-[8px] text-primary/60 font-bold mt-1 uppercase tracking-widest">Mis à jour le {date}</p>
        )}
      </div>
    </div>
  );
}
