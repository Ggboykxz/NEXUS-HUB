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
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, getDocs, setDoc, deleteDoc, serverTimestamp, onSnapshot, increment, updateDoc } from 'firebase/firestore';
import { useQueryClient } from '@tanstack/react-query';
import { getCoverThumbnail, getAvatarThumbnail } from '@/lib/image-utils';

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
      const fetchPlaylists = async () => {
        const q = query(collection(db, 'playlists'), where('ownerId', '==', auth.currentUser?.uid));
        const snap = await getDocs(q);
        setUserPlaylists(snap.docs.map(d => ({ id: d.id, ...d.data() } as any)));
      };
      fetchPlaylists();

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
  // Utilise l'URL optimisée avec ratio 2:3 forcé
  const coverUrl = getCoverThumbnail(story.coverImage.imageUrl);

  return (
    <div className={cn("group relative transition-all duration-500 animate-in fade-in zoom-in-95", className)}>
      {/* Aspect Ratio 2:3 strictly enforced */}
      <div className="relative aspect-[2/3] overflow-hidden rounded-2xl bg-stone-900 mb-3 shadow-sm transition-all duration-700 ease-in-out hover:shadow-[0_0_30px_hsl(var(--primary)/0.3)] border border-white/5 hover:border-primary/30">
        <Link href={storyUrl} aria-label={`Voir les détails de ${story.title}`} prefetch={true}>
            <Image
              src={coverUrl}
              alt={story.title}
              fill
              className="object-cover transition-transform duration-700 ease-in-out group-hover:scale-110"
              sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 20vw"
              placeholder="blur"
              blurDataURL={story.coverImage.blurHash || DEFAULT_BLUR}
            />
        </Link>
        
        <div className="absolute top-3 left-3 z-20 flex flex-col gap-1.5 transition-opacity duration-300 group-hover:opacity-0 pointer-events-none">
            {story.sponsoredBy ? (
                <Badge className="gap-1 px-2 py-0.5 bg-black/60 text-emerald-400 backdrop-blur-md border-emerald-500/30 shadow-lg text-[8px] uppercase font-black tracking-widest">
                    <Handshake className="h-2.5 w-2.5" />
                    Par {story.sponsoredBy.name}
                </Badge>
            ) : (
                artistInfo?.role?.includes('pro') ? (
                    <Badge variant="default" className="gap-1 px-2 py-0.5 bg-emerald-500 text-white backdrop-blur-md border-none shadow-lg text-[8px] uppercase font-bold tracking-wider">
                        <Award className="h-2.5 w-2.5" />
                        Pro
                    </Badge>
                ) : (
                    <Badge variant="outline" className="gap-1 px-2 py-0.5 bg-black/40 text-orange-400 backdrop-blur-md border-orange-500/50 shadow-lg text-[8px] uppercase font-bold tracking-wider">
                        <PenSquare className="h-2.5 w-2.5" />
                        Draft
                    </Badge>
                )
            )}
        </div>

        {story.isPremium && (
          <Badge variant="default" className="absolute top-3 right-3 z-20 gap-1 px-2 py-0.5 bg-primary/95 text-white backdrop-blur-md border-white/20 shadow-lg text-[8px] transition-opacity duration-300 group-hover:opacity-0 pointer-events-none">
            <Crown className="h-2.5 w-2.5" />
            PREMIUM
          </Badge>
        )}

        {progress !== undefined && progress > 0 && progress < 100 && (
          <div className="absolute bottom-0 left-0 w-full h-[4px] bg-black/40 z-20 transition-opacity duration-300 group-hover:opacity-0">
            <div 
              className="h-full bg-primary shadow-[0_0_10px_hsl(var(--primary))]" 
              style={{ width: `${progress}%` }} 
            />
          </div>
        )}

        {progress === 100 && (
          <Badge className="absolute bottom-3 right-3 z-20 bg-emerald-500 text-white border-none text-[9px] font-black uppercase px-2.5 py-1 shadow-lg transition-opacity duration-300 group-hover:opacity-0">
            ✓ Terminé
          </Badge>
        )}
        
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/95 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-5">
            <div className="transform translate-y-12 group-hover:translate-y-0 transition-transform duration-500 ease-out space-y-4">
                <Badge className="bg-primary/20 text-primary border border-primary/20 text-[9px] font-black uppercase px-2.5 py-0.5 w-fit backdrop-blur-md">
                    {story.genre}
                </Badge>
                
                <p className="text-white/90 text-[11px] line-clamp-2 leading-relaxed italic font-light mb-2">
                    {story.description}
                </p>
                
                <div className="flex items-center gap-2">
                    <Button asChild className="flex-1 h-11 rounded-xl bg-primary text-black font-black uppercase text-xs gold-shimmer shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform">
                        <Link href={storyUrl} onClick={(e) => e.stopPropagation()} prefetch={true}>
                            <Play className="mr-2 h-4 w-4 fill-current" />
                            Lire
                        </Link>
                    </Button>
                    
                    <div className="flex gap-2">
                      <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                              <Button
                                  variant="secondary"
                                  size="icon"
                                  className="rounded-xl h-11 w-11 bg-white/10 text-white border border-white/10 hover:bg-white/20 backdrop-blur-md transition-all active:scale-95 shadow-lg"
                                  onClick={(e) => { e.stopPropagation(); e.preventDefault(); }}
                              >
                                  <ListPlus className="h-5 w-5" />
                              </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="center" className="w-40 rounded-xl border-white/10 bg-stone-900/95 backdrop-blur-xl">
                              <DropdownMenuLabel className="text-[10px] uppercase font-black tracking-widest text-stone-500">Ajouter à...</DropdownMenuLabel>
                              <DropdownMenuSeparator className="bg-white/5" />
                              {userPlaylists.length > 0 ? userPlaylists.map(p => (
                                  <DropdownMenuItem key={p.id} className="text-[10px] font-bold cursor-pointer" onClick={(e) => handleAddToPlaylist(e, p.title)}>
                                      {p.title}
                                  </DropdownMenuItem>
                              )) : (
                                <DropdownMenuItem disabled className="text-[10px] italic">Aucune playlist</DropdownMenuItem>
                              )}
                          </DropdownMenuContent>
                      </DropdownMenu>
                      
                      <Button 
                        variant="secondary" 
                        size="icon" 
                        className={cn(
                          "rounded-xl h-11 w-11 transition-all active:scale-95 shadow-lg border",
                          isFavorite ? "bg-rose-500 text-white border-rose-500 shadow-rose-500/20" : "bg-white/10 text-white border-white/10 hover:bg-white/20 backdrop-blur-md"
                        )}
                        disabled={isTogglingFav}
                        onClick={handleHeartClick}
                      >
                          {isTogglingFav ? <Loader2 className="h-4 w-4 animate-spin" /> : <Heart className={cn("h-5 w-5", isFavorite && "fill-current")} />}
                      </Button>
                    </div>
                </div>
            </div>
        </div>
      </div>

      <div className="space-y-1 px-1">
        <div className="flex items-center justify-between gap-2">
          <Link href={storyUrl} className="min-w-0" prefetch={true}>
              <h3 className="font-display font-black text-xs text-foreground group-hover:text-primary transition-colors truncate tracking-tight">{story.title}</h3>
          </Link>
          {relativeDate && (
            <span className="text-[8px] text-stone-500 whitespace-nowrap flex items-center gap-1 uppercase tracking-tighter font-bold">
              <Clock className="h-2.5 w-2.5" /> {relativeDate}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-1 text-[10px] transition-all duration-500 delay-300 opacity-60 group-hover:opacity-100 group-hover:translate-x-1">
            <Link href={artistInfo?.slug ? `/artiste/${artistInfo.slug}` : '#'} className="hover:text-primary transition-colors flex items-center gap-1" prefetch={true}>
                <span className="font-bold truncate max-w-[100px] text-stone-400 group-hover:text-stone-300">{artistInfo?.displayName || 'Artiste'}</span>
                {artistInfo?.role?.includes('pro') ? <Award className="h-2.5 w-2.5 text-emerald-500" /> : <PenSquare className="h-2.5 w-2.5 text-orange-400" />}
            </Link>
        </div>

        <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-stone-500">
                    <Eye className="h-3 w-3 text-primary" />
                    {formatStat(story.views)}
                </div>
                <div className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-stone-500">
                    <Heart className={cn("h-3 w-3", isFavorite ? "text-rose-500 fill-rose-500" : "text-stone-600")} />
                    {formatStat(story.likes)}
                </div>
            </div>
            <Badge variant="outline" className="text-[8px] uppercase font-black tracking-[0.1em] px-2 py-0 h-4 border-white/5 text-stone-600">
                {story.format}
            </Badge>
        </div>
      </div>
    </div>
  );
}
