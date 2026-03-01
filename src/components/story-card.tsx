'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { Story, UserProfile, Playlist } from '@/lib/types';
import { getStoryUrl } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Crown, Heart, ListPlus, Play, Award, PenSquare, Eye, Info, Clock, Handshake, Check, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
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
import { doc, getDoc, collection, query, where, getDocs, setDoc, deleteDoc, serverTimestamp, onSnapshot, increment, updateDoc } from 'firebase/firestore';
import { useQueryClient } from '@tanstack/react-query';

interface StoryCardProps {
  story: Story;
  className?: string;
  showUpdateDate?: boolean;
  progress?: number;
}

const DEFAULT_BLUR = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==";

const formatStat = (num: number): string => {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(0)}k`;
  return num.toString();
};

export function StoryCard({ story, className, progress }: StoryCardProps) {
  const [relativeDate, setRelativeDate] = useState('');
  const [artistInfo, setArtistInfo] = useState<UserProfile | null>(null);
  const [userPlaylists, setUserPlaylists] = useState<Playlist[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isTogglingFav, setIsTogglingFav] = useState(false);
  
  const { toast } = useToast();
  const { openAuthModal } = useAuthModal();
  const queryClient = useQueryClient();

  const updatedAtDate = story.updatedAt instanceof Date 
    ? story.updatedAt 
    : typeof story.updatedAt === 'string' 
      ? new Date(story.updatedAt)
      : (story.updatedAt as any)?.toDate?.() || new Date();

  useEffect(() => {
    try {
      setRelativeDate(formatDistanceToNow(updatedAtDate, { addSuffix: true, locale: fr }));
    } catch (e) {
      setRelativeDate('Récemment');
    }
    
    const fetchArtist = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', story.artistId));
        if (userDoc.exists()) {
          setArtistInfo(userDoc.data() as UserProfile);
        }
      } catch (e) {
        console.error("Error fetching artist info:", e);
      }
    };
    fetchArtist();

    if (auth.currentUser) {
      // Fetch user playlists for the dropdown
      const fetchPlaylists = async () => {
        const q = query(collection(db, 'playlists'), where('ownerId', '==', auth.currentUser?.uid));
        const snap = await getDocs(q);
        setUserPlaylists(snap.docs.map(d => ({ id: d.id, ...d.data() } as any)));
      };
      fetchPlaylists();

      // Monitor favorite status
      const favRef = doc(db, 'users', auth.currentUser.uid, 'favorites', story.id);
      const unsubFav = onSnapshot(favRef, (snap) => {
        setIsFavorite(snap.exists());
      });

      return () => unsubFav();
    }
  }, [story.id, story.updatedAt, story.artistId]);

  const handleHeartClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (!auth.currentUser) {
      openAuthModal('ajouter cette œuvre à vos favoris');
      return;
    }

    if (isTogglingFav) return;

    setIsTogglingFav(true);
    const favRef = doc(db, 'users', auth.currentUser.uid, 'favorites', story.id);
    const storyRef = doc(db, 'stories', story.id);

    try {
      if (isFavorite) {
        await deleteDoc(favRef);
        await updateDoc(storyRef, { likes: increment(-1) });
        toast({ title: "Retiré des favoris" });
      } else {
        await setDoc(favRef, {
          storyId: story.id,
          addedAt: serverTimestamp()
        });
        await updateDoc(storyRef, { likes: increment(1) });
        toast({ title: "Ajouté aux favoris !" });
      }
      // Invalidate library queries to refresh the list if we are on the library page
      queryClient.invalidateQueries({ queryKey: ['library-favorites'] });
    } catch (error) {
      console.error("Favorite toggle error:", error);
      toast({ title: "Erreur", description: "Action impossible pour le moment.", variant: "destructive" });
    } finally {
      setIsTogglingFav(false);
    }
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
  const coverUrl = story.coverImage.imageUrl;

  return (
    <div className={cn("group relative transition-all duration-300 animate-in fade-in zoom-in-95", className)}>
      <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-stone-100 mb-2 shadow-sm transition-all duration-500 group-hover:shadow-xl group-hover:-translate-y-1">
        <Link href={storyUrl} aria-label={`Voir les détails de ${story.title}`}>
            <Image
              src={coverUrl}
              alt={story.title}
              fill
              className="object-cover transition-all duration-700 ease-in-out group-hover:scale-110 group-hover:blur-[2px]"
              sizes="(max-width: 768px) 40vw, (max-width: 1024px) 25vw, 15vw"
              placeholder="blur"
              blurDataURL={story.coverImage.blurHash || DEFAULT_BLUR}
            />
        </Link>
        
        <div className="absolute top-2 left-2 z-20 flex flex-col gap-1 transition-opacity duration-300 group-hover:opacity-0 pointer-events-none">
            {story.sponsoredBy ? (
                <Badge className="gap-1 px-1.5 py-0.5 bg-black/60 text-emerald-400 backdrop-blur-md border-emerald-500/30 shadow-lg text-[7px] uppercase font-black tracking-widest">
                    <Handshake className="h-2 w-2" />
                    Par {story.sponsoredBy.name}
                </Badge>
            ) : (
                artistInfo?.role?.includes('pro') ? (
                    <Badge variant="default" className="gap-1 px-1 py-0.5 bg-emerald-500 text-white backdrop-blur-md border-none shadow-lg text-[7px] uppercase font-bold tracking-wider">
                        <Award className="h-2 w-2" />
                        Pro
                    </Badge>
                ) : (
                    <Badge variant="outline" className="gap-1 px-1 py-0.5 bg-black/40 text-orange-400 backdrop-blur-md border-orange-500/50 shadow-lg text-[7px] uppercase font-bold tracking-wider">
                        <PenSquare className="h-2 w-2" />
                        Draft
                    </Badge>
                )
            )}
        </div>

        {story.isPremium && (
          <Badge variant="default" className="absolute top-2 right-2 z-20 gap-1 px-1 py-0.5 bg-primary/95 text-white backdrop-blur-md border-white/20 shadow-lg text-[7px] transition-opacity duration-300 group-hover:opacity-0 pointer-events-none">
            <Crown className="h-2 w-2" />
            PREMIUM
          </Badge>
        )}

        {/* Reading Progress Bar */}
        {progress !== undefined && progress > 0 && progress < 100 && (
          <div className="absolute bottom-0 left-0 w-full h-[3px] bg-black/40 z-20 transition-opacity duration-300 group-hover:opacity-0">
            <div 
              className="h-full bg-primary shadow-[0_0_10px_hsl(var(--primary))]" 
              style={{ width: `${progress}%` }} 
            />
          </div>
        )}

        {/* Completion Badge */}
        {progress === 100 && (
          <Badge className="absolute bottom-2 right-2 z-20 bg-emerald-500 text-white border-none text-[8px] font-black uppercase px-2 py-0.5 shadow-lg transition-opacity duration-300 group-hover:opacity-0">
            ✓ Terminé
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
                                >
                                    <ListPlus className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="center" className="w-40">
                                <DropdownMenuLabel className="text-[10px]">Playlist rapide</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {userPlaylists.length > 0 ? userPlaylists.map(p => (
                                    <DropdownMenuItem key={p.id} className="text-[10px]" onClick={(e) => handleAddToPlaylist(e, p.title)}>
                                        {p.title}
                                    </DropdownMenuItem>
                                )) : (
                                  <DropdownMenuItem disabled className="text-[10px]">Aucune playlist</DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                        
                        <Button asChild size="lg" className="h-10 w-10 rounded-full bg-primary text-primary-foreground shadow-xl hover:scale-110 transition-transform active:scale-95 border border-white/10">
                            <Link href={storyUrl} onClick={(e) => e.stopPropagation()}>
                                <Play className="ml-0.5 h-5 w-5 fill-current" />
                            </Link>
                        </Button>

                        <Button 
                          variant="secondary" 
                          size="icon" 
                          className={cn(
                            "rounded-full h-7 w-7 transition-all active:scale-95 shadow-lg",
                            isFavorite ? "bg-rose-500 text-white border-rose-500" : "bg-white/10 text-white border-white/20 hover:bg-white/30 backdrop-blur-md"
                          )}
                          disabled={isTogglingFav}
                          onClick={handleHeartClick}
                        >
                            {isTogglingFav ? <Loader2 className="h-3 w-3 animate-spin" /> : <Heart className={cn("h-4 w-4", isFavorite && "fill-current")} />}
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
            <Link href={artistInfo?.slug ? `/artiste/${artistInfo.slug}` : '#'} className="hover:text-primary transition-colors flex items-center gap-1">
                <span className="font-medium truncate max-w-[80px]">{artistInfo?.displayName || 'Artiste'}</span>
                {artistInfo?.role?.includes('pro') ? <Award className="h-2.5 w-2.5 text-emerald-500" /> : <PenSquare className="h-2.5 w-2.5 text-orange-400" />}
            </Link>
        </div>
        <div className="flex items-center justify-between mt-1 pt-1 border-t border-border/50">
            <div className="flex items-center gap-1.5">
                <div className="flex items-center gap-0.5 text-[8px] uppercase font-bold tracking-widest text-muted-foreground">
                    <Eye className="h-2 text-primary" />
                    {formatStat(story.views)}
                </div>
                <div className="flex items-center gap-0.5 text-[8px] uppercase font-bold tracking-widest text-muted-foreground">
                    <Heart className={cn("h-2", isFavorite ? "text-rose-500" : "text-destructive")} />
                    {formatStat(story.likes)}
                </div>
            </div>
            <Badge variant="outline" className="text-[7px] uppercase font-bold tracking-tighter px-1 py-0 h-3 border-primary/20">
                {story.format}
            </Badge>
        </div>
      </div>
    </div>
  );
}
