'use client';

import { useState, useEffect, use, useRef } from 'react';
import { db, auth } from '@/lib/firebase';
import { doc, getDoc, collection, getDocs, query, orderBy, setDoc, serverTimestamp, addDoc, increment, limit, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  Book, Layers, Heart, MessageSquare, ChevronRight, ChevronLeft, Bookmark, Settings, Star, Coins, Eye, Award, Check, Share2, Loader2, Headphones, Music, Volume2, VolumeX, Info, Zap
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { getOptimizedImage } from '@/lib/image-utils';
import type { Story, UserProfile, Chapter } from '@/lib/types';
import { getStoryUrl } from '@/lib/types';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthModal } from '@/components/providers/auth-modal-provider';
import { Textarea } from '@/components/ui/textarea';

// #region Page Components

function ReaderHeader({ story, chapter, onModeChange, activeMode, onSettingsToggle, onBookmark, isBookmarked }: any) {
  const storyUrl = getStoryUrl(story);
  return (
    <nav className="fixed top-0 left-0 right-0 h-14 bg-background/95 border-b border-border z-50 flex items-center justify-between px-5 backdrop-blur-xl">
      <div className="flex items-center gap-4 flex-1">
        <Link href="/" className="font-display font-black text-lg tracking-tighter text-foreground gold-resplendant">NexusHub<span className="text-primary">.</span></Link>
        <div className="w-px h-5 bg-border hidden md:block" />
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href={storyUrl} className="hover:text-primary transition-colors hidden sm:block font-medium truncate max-w-[120px]">{story.title}</Link>
          <ChevronRight className="h-4 w-4 hidden sm:block" />
          <span className="text-primary font-semibold whitespace-nowrap">Ep. {chapter?.chapterNumber || 1}</span>
        </div>
      </div>

      <div className="hidden lg:flex items-center gap-2 absolute left-1/2 -translate-x-1/2">
        <Button size="icon" variant="outline" className="w-8 h-8 rounded-full"><ChevronLeft className="h-4 w-4" /></Button>
        <Select defaultValue={chapter?.id}>
          <SelectTrigger className="w-[180px] h-8 text-[10px] uppercase font-black tracking-widest rounded-xl">
            <SelectValue placeholder="Épisodes" />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-primary/10">
            {story.chapters?.map((chap: Chapter) => (
              <SelectItem key={chap.id} value={chap.id} className="text-xs font-bold">
                Épisode {chap.chapterNumber}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button size="icon" variant="outline" className="w-8 h-8 rounded-full"><ChevronRight className="h-4 w-4" /></Button>
      </div>

      <div className="flex items-center gap-2 flex-1 justify-end">
        <div className="hidden sm:flex bg-muted/50 border border-border/50 rounded-xl p-0.5">
          <Button onClick={() => onModeChange('scroll')} size="sm" variant={activeMode === 'scroll' ? 'default' : 'ghost'} className="h-7 text-[9px] font-black uppercase px-3 gap-1.5 rounded-lg">
            <Layers className="h-3 w-3" /> Webtoon
          </Button>
          <Button onClick={() => onModeChange('pages')} size="sm" variant={activeMode === 'pages' ? 'default' : 'ghost'} className="h-7 text-[9px] font-black uppercase px-3 gap-1.5 rounded-lg">
            < Book className="h-3 w-3" /> BD
          </Button>
        </div>
        <Button onClick={onBookmark} size="sm" variant="outline" className={cn("h-8 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest gap-1.5 transition-all", isBookmarked && "bg-primary/10 border-primary text-primary")}>
          <Bookmark className={cn("h-3.5 w-3.5", isBookmarked && "fill-current")} />
          <span className="hidden md:inline">{isBookmarked ? 'Sauvegardé' : 'Sauvegarder'}</span>
        </Button>
        <Button onClick={onSettingsToggle} size="icon" variant="outline" className="h-8 w-8 rounded-full">
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </nav>
  );
}

function ProgressBar({ progress }: { progress: number }) {
  return (
    <div className="fixed top-14 left-0 right-0 h-0.5 bg-foreground/5 z-50">
      <div
        className="h-full bg-gradient-to-r from-primary/50 via-primary to-accent transition-all duration-75 ease-linear"
        style={{ width: `${progress}%` }}
      >
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-accent shadow-[0_0_8px_hsl(var(--accent))] shadow-accent/50" />
      </div>
    </div>
  )
}

function ReaderSidebar({ story, artist, currentUser, openAuthModal }: { story: Story, artist: UserProfile | null, currentUser: any, openAuthModal: any }) {
  const [activeTab, setActiveTab] = useState('chapters');
  const currentChapterId = story.chapters?.[0]?.id;

  const TabButton = ({ id, label, icon: Icon }: { id: string, label: string, icon: any }) => (
    <Button
      variant="ghost"
      onClick={() => setActiveTab(id)}
      className={cn(
        "flex-1 rounded-none border-b-2 h-12 text-[10px] font-black uppercase tracking-[0.2em] gap-2",
        activeTab === id ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-muted-foreground'
      )}
    >
      <Icon className="h-3 w-3" />
      <span className="hidden xl:inline">{label}</span>
    </Button>
  );

  return (
    <aside className="w-[320px] bg-stone-950 border-l border-white/5 h-[calc(100vh-56px)] sticky top-14 flex-shrink-0 hidden lg:flex flex-col shadow-2xl">
      <div className="flex border-b border-white/5 sticky top-0 bg-stone-950 z-10">
        <TabButton id="chapters" label="Épisodes" icon={Layers} />
        <TabButton id="comments" label="Avis" icon={MessageSquare} />
        <TabButton id="artist" label="Créateur" icon={Award} />
      </div>
      <ScrollArea className="flex-1">
        {activeTab === 'chapters' && <ChaptersTab story={story} />}
        {activeTab === 'comments' && (
          <CommentsTab 
            storyId={story.id} 
            chapterId={currentChapterId || ''} 
            currentUser={currentUser}
            openAuthModal={openAuthModal}
          />
        )}
        {activeTab === 'artist' && <ArtistTab artist={artist} />}
      </ScrollArea>
    </aside>
  );
}

function ChaptersTab({ story }: { story: Story }) {
  const { toast } = useToast();
  const storyUrl = getStoryUrl(story);
  return (
    <div className="p-6 space-y-8">
      <div className="flex gap-4 items-start pb-6 border-b border-white/5">
        <Link href={storyUrl} className="shrink-0">
            <Image src={story.coverImage.imageUrl} alt={story.title} width={64} height={96} className="rounded-xl object-cover shadow-lg border border-white/10 hover:border-primary transition-all" />
        </Link>
        <div className="min-w-0">
          <Link href={storyUrl}>
            <h3 className="font-display font-black text-sm text-white mb-1 hover:text-primary transition-colors truncate">{story.title}</h3>
          </Link>
          <p className="text-[10px] text-primary font-black uppercase tracking-widest flex items-center gap-1.5 mb-3">
            <Award className="h-3 w-3" /> {story.artistName}
          </p>
          <div className="flex flex-wrap gap-3 text-[10px] font-bold text-stone-500 uppercase tracking-tighter">
            <span className="flex items-center gap-1"><Eye className="h-3 w-3 text-primary"/> {(story.views/1000).toFixed(0)}k</span>
            <span className="flex items-center gap-1"><Heart className="h-3 w-3 text-rose-500"/> {(story.likes/1000).toFixed(0)}k</span>
          </div>
        </div>
      </div>

      <div className="bg-primary/5 border border-primary/10 rounded-2xl p-5 space-y-4">
        <h4 className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-2"><Coins className="h-4 w-4"/> Soutien direct</h4>
        <div className="grid grid-cols-2 gap-2">
          {[10, 50].map(amount => (
            <Button key={amount} size="sm" variant="outline" className="h-9 text-[10px] font-black border-white/5 bg-white/5 hover:bg-primary hover:text-black transition-all">{amount} 🪙</Button>
          ))}
        </div>
        <Button size="sm" className="w-full h-10 rounded-xl font-black text-[10px] uppercase gold-shimmer" onClick={() => toast({ title: '🪙 Merci pour votre soutien !' })}>Donner des AfriCoins</Button>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-[10px] uppercase font-black tracking-widest text-stone-500">Index des chapitres</label>
          <Badge variant="outline" className="text-[9px] font-black border-white/10 text-stone-600">{story.chapterCount} total</Badge>
        </div>
        <div className="flex flex-col gap-2">
          {story.chapters?.map((chap, index) => (
            <Link key={chap.id} href="#" className={cn(
              "flex items-center gap-3 p-3 rounded-2xl transition-all border-2 border-transparent",
              index === 0 ? "bg-primary/10 border-primary/20" : "hover:bg-white/5"
            )}>
              <div className={cn(
                "w-8 h-8 flex items-center justify-center rounded-xl font-display font-black text-xs shrink-0 transition-all",
                index === 0 ? "bg-primary text-black" : "bg-white/5 text-stone-600"
              )}>{chap.chapterNumber}</div>
              <div className="min-w-0">
                <p className={cn("text-xs font-bold truncate", index === 0 ? "text-white" : "text-stone-400")}>{chap.title}</p>
                <p className="text-[9px] text-stone-600 uppercase font-black tracking-widest">Épisode gratuit</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function ArtistTab({ artist }: { artist: UserProfile | null }) {
  const { toast } = useToast();
  const [isFollowing, setIsFollowing] = useState(false);

  if (!artist) return <div className="p-8 text-center text-xs italic text-stone-500">Chargement de l'artiste...</div>;

  return (
    <div className="p-6">
      <Card className="bg-stone-900 border-none rounded-[2rem] p-6 text-center shadow-xl space-y-6">
        <Link href={`/artiste/${artist.slug}`} className="relative inline-block group">
          <Avatar className="w-20 h-20 mx-auto border-4 border-primary ring-4 ring-primary/10 shadow-2xl transition-transform group-hover:scale-105 duration-500">
            <AvatarImage src={artist.photoURL} alt={artist.displayName} />
            <AvatarFallback className="bg-primary/10 text-primary font-black text-xl">{artist.displayName.slice(0, 1)}</AvatarFallback>
          </Avatar>
          {artist.isCertified && (
            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center border-4 border-stone-900 shadow-xl">
              <Check className="w-3.5 h-3.5 text-white" />
            </div>
          )}
        </Link>
        
        <div>
            <Link href={`/artiste/${artist.slug}`}>
                <h3 className="font-display font-black text-lg text-white mb-1 hover:text-primary transition-colors">{artist.displayName}</h3>
            </Link>
            <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest border-emerald-500/30 text-emerald-500 px-3">Artiste Certifié</Badge>
        </div>

        <div className="grid grid-cols-2 gap-4 py-4 border-y border-white/5">
          <div>
            <p className="font-black text-xl text-white">{(artist.subscribersCount / 1000).toFixed(1)}k</p>
            <p className="text-[9px] uppercase font-bold tracking-widest text-stone-500">Fans</p>
          </div>
          <div>
            <p className="font-black text-xl text-white">42</p>
            <p className="text-[9px] uppercase font-bold tracking-widest text-stone-500">Œuvres</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button size="sm" className="flex-1 h-10 rounded-xl font-black text-[10px] uppercase tracking-widest" onClick={() => setIsFollowing(!isFollowing)}>
            <Star className={cn("h-3.5 w-3.5 mr-1.5", isFollowing && "fill-current")} /> {isFollowing ? 'Suivi' : 'Suivre'}
          </Button>
          <Button size="sm" variant="outline" className="h-10 w-10 rounded-xl border-white/10" onClick={() => toast({ title: '❤️ Merci !' })}>
            <Heart className="h-4 w-4 text-rose-500" />
          </Button>
        </div>
      </Card>
    </div>
  )
}

function CommentsTab({ storyId, chapterId, currentUser, openAuthModal }: { storyId: string, chapterId: string, currentUser: any, openAuthModal: any }) {
  const { toast } = useToast();
  const [commentText, setCommentText] = useState('');
  const queryClient = useQueryClient();

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['comments', storyId, chapterId],
    queryFn: async () => {
      const q = query(
        collection(db, 'stories', storyId, 'chapters', chapterId, 'comments'),
        orderBy('createdAt', 'desc'),
        limit(20)
      );
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as any));
    },
    enabled: !!chapterId
  });

  const submitMutation = useMutation({
    mutationFn: async (text: string) => {
      if (!currentUser) {
        openAuthModal('poster un commentaire');
        throw new Error('Auth required');
      }
      const ref = collection(db, 'stories', storyId, 'chapters', chapterId, 'comments');
      await addDoc(ref, {
        authorId: currentUser.uid,
        authorName: currentUser.displayName || 'Anonyme',
        authorAvatar: currentUser.photoURL || '',
        content: text,
        likes: 0,
        isHidden: false,
        isEdited: false,
        createdAt: serverTimestamp()
      });
    },
    onSuccess: () => {
      setCommentText('');
      queryClient.invalidateQueries({ queryKey: ['comments', storyId, chapterId] });
      toast({ title: "Commentaire publié !" });
    }
  });

  const likeMutation = useMutation({
    mutationFn: async (commentId: string) => {
      const ref = doc(db, 'stories', storyId, 'chapters', chapterId, 'comments', commentId);
      await updateDoc(ref, { likes: increment(1) });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', storyId, chapterId] });
    }
  });

  return (
    <div className="p-6 space-y-8">
      <div className="space-y-4">
        <h4 className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-2">
          <MessageSquare className="h-4 w-4"/> Partagez votre avis
        </h4>
        <div className="space-y-3">
          <Textarea 
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Qu'avez-vous pensé de cet épisode ?" 
            className="min-h-[100px] bg-white/5 border-white/10 rounded-2xl p-4 text-xs font-light"
          />
          <Button 
            disabled={!commentText.trim() || submitMutation.isPending}
            onClick={() => submitMutation.mutate(commentText)}
            className="w-full h-10 rounded-xl font-black text-[10px] uppercase gold-shimmer"
          >
            {submitMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Publier"}
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {isLoading ? (
          <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-stone-700" /></div>
        ) : comments.length > 0 ? (
          comments.map((c: any) => (
            <div key={c.id} className="space-y-3 animate-in fade-in duration-500">
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8 border border-white/10">
                  <AvatarImage src={c.authorAvatar} />
                  <AvatarFallback>{c.authorName.slice(0,1)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white truncate">{c.authorName}</p>
                  <p className="text-[8px] text-stone-500 uppercase font-black">Il y a un instant</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 gap-1 px-2 rounded-lg text-stone-500 hover:text-rose-500"
                  onClick={() => likeMutation.mutate(c.id)}
                >
                  <Heart className="h-3 w-3" />
                  <span className="text-[10px] font-bold">{c.likes}</span>
                </Button>
              </div>
              <p className="text-xs text-stone-400 leading-relaxed pl-11">{c.content}</p>
            </div>
          ))
        ) : (
          <p className="text-center text-[10px] text-stone-600 italic py-8">Soyez le premier à commenter cet épisode !</p>
        )}
      </div>
    </div>
  );
}

function FloatingTools({ onLike, onComment, onBookmark, onShare, isBookmarked, isLiked, commentsCount }: any) {
  return (
    <div className="fixed top-1/2 -translate-y-1/2 right-6 lg:right-[340px] z-40 flex flex-col gap-3 group animate-in slide-in-from-right-4 duration-1000 delay-500">
      <Button onClick={onLike} variant="outline" size="icon" className={cn("h-12 w-12 rounded-full border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl transition-all hover:scale-110", isLiked && "text-rose-500 border-rose-500/50 bg-rose-500/10")}>
        <Heart className={cn("h-5 w-5", isLiked && "fill-current")} />
      </Button>
      <Button onClick={onComment} variant="outline" size="icon" className="h-12 w-12 rounded-full border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl transition-all hover:scale-110 relative">
        <MessageSquare className="h-5 w-5" />
        <Badge className="absolute -top-2 -right-2 bg-primary text-black font-black text-[8px] h-5 w-5 flex items-center justify-center p-0 rounded-full">{commentsCount}</Badge>
      </Button>
      <Button onClick={onBookmark} variant="outline" size="icon" className={cn("h-12 w-12 rounded-full border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl transition-all hover:scale-110", isBookmarked && "text-primary border-primary/50 bg-primary/10")}>
        <Bookmark className={cn("h-5 w-5", isBookmarked && "fill-current")} />
      </Button>
      <Button onClick={onShare} variant="outline" size="icon" className="h-12 w-12 rounded-full border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl transition-all hover:scale-110">
        <Share2 className="h-5 w-5" />
      </Button>
    </div>
  )
}

// #endregion

export default function ReadPage(props: { params: Promise<{ storyId: string }> }) {
  const { storyId } = use(props.params);
  const { toast } = useToast();
  const { openAuthModal } = useAuthModal();

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeMode, setActiveMode] = useState<'scroll' | 'pages'>('scroll');
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Firestore Data Fetching via React Query
  const { data: story, isLoading: loadingStory } = useQuery<Story>({
    queryKey: ['reader-story', storyId],
    queryFn: async () => {
      const snap = await getDoc(doc(db, 'stories', storyId));
      if (!snap.exists()) throw new Error('Not Found');
      const data = snap.data();
      
      const chaptersSnap = await getDocs(query(collection(db, 'stories', storyId, 'chapters'), orderBy('chapterNumber', 'asc')));
      const chapters = chaptersSnap.docs.map(d => ({ id: d.id, ...d.data() } as Chapter));
      
      return { id: snap.id, ...data, chapters } as Story;
    }
  });

  const { data: artist } = useQuery<UserProfile | null>({
    queryKey: ['reader-artist', story?.artistId],
    enabled: !!story?.artistId,
    queryFn: async () => {
      const snap = await getDoc(doc(db, 'users', story!.artistId));
      return snap.exists() ? (snap.data() as UserProfile) : null;
    }
  });

  // Fetch comment count
  const { data: commentsCount = 0 } = useQuery({
    queryKey: ['comments-count', storyId, story?.chapters?.[0]?.id],
    enabled: !!story?.chapters?.[0]?.id,
    queryFn: async () => {
      const q = query(collection(db, 'stories', storyId, 'chapters', story!.chapters![0].id, 'comments'));
      const snap = await getDocs(q);
      return snap.size;
    }
  });

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => setCurrentUser(user));
    return unsub;
  }, []);

  // Increment view count logic
  useEffect(() => {
    if (story && story.chapters && story.chapters.length > 0) {
      const chapterId = story.chapters[0].id;
      const viewKey = `viewed_${storyId}_${chapterId}`;
      
      if (!sessionStorage.getItem(viewKey)) {
        const storyRef = doc(db, 'stories', storyId);
        const chapterRef = doc(db, 'stories', storyId, 'chapters', chapterId);
        
        updateDoc(storyRef, { views: increment(1) }).catch(console.error);
        updateDoc(chapterRef, { views: increment(1) }).catch(console.error);
        
        sessionStorage.setItem(viewKey, 'true');
      }
    }
  }, [story, storyId]);

  useEffect(() => {
    const handleScroll = () => {
      const docHeight = document.documentElement.scrollHeight;
      const windowHeight = window.innerHeight;
      const scrollPosition = window.scrollY;
      const totalHeight = docHeight - windowHeight;
      const scrollPercentage = totalHeight > 0 ? (scrollPosition / totalHeight) * 100 : 0;
      
      setScrollProgress(scrollPercentage);

      // Debounced save to Firestore
      if (currentUser && story) {
        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        
        debounceTimer.current = setTimeout(async () => {
          const currentChapter = story.chapters?.[0];
          if (!currentChapter) return;

          try {
            await setDoc(doc(db, 'users', currentUser.uid, 'library', storyId), {
              storyId: storyId,
              storyTitle: story.title,
              storyCover: story.coverImage.imageUrl,
              lastReadChapterId: currentChapter.id,
              lastReadChapterTitle: currentChapter.title,
              lastReadChapterSlug: currentChapter.slug,
              lastReadScrollPosition: scrollPosition,
              progress: Math.round(scrollPercentage),
              lastReadAt: serverTimestamp()
            }, { merge: true });
          } catch (e) {
            console.error("Error saving reading progress:", e);
          }
        }, 2000);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [currentUser, story, storyId]);

  if (loadingStory) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-stone-950 gap-6">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-stone-500 font-display font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">Ouverture du manuscrit...</p>
      </div>
    );
  }

  if (!story) notFound();
  
  const currentChapter = story.chapters?.[0];
  const pages = currentChapter?.pages || [];

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({ title: "Lien copié dans le sanctuaire" });
  };
  
  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    toast({ title: isBookmarked ? 'Sauvegarde retirée' : 'Sauvegardé dans vos archives !'});
  };

  return (
    <div className="bg-stone-950 min-h-screen selection:bg-primary/20">
      <ProgressBar progress={scrollProgress} />
      
      <ReaderHeader 
        story={story} 
        chapter={currentChapter}
        activeMode={activeMode}
        onModeChange={setActiveMode}
        onSettingsToggle={() => setShowSettings(!showSettings)}
        onBookmark={handleBookmark}
        isBookmarked={isBookmarked}
      />
      
      <div className="flex pt-14 min-h-[calc(100vh-56px)]">
        <main className="flex-1 bg-black min-w-0">
          <div className="w-full max-w-[800px] mx-auto flex flex-col items-center">
            {pages.length > 0 ? pages.map((page, index) => (
              <div key={index} className="relative w-full aspect-[2/3] animate-in fade-in duration-1000">
                <Image
                  src={getOptimizedImage(page.imageUrl, { width: 1000, quality: 90 })}
                  alt={`Page ${index + 1}`}
                  fill
                  className="object-contain md:object-cover"
                  priority={index < 2}
                  sizes="(max-width: 768px) 100vw, 800px"
                />
              </div>
            )) : (
              <div className="py-48 text-center space-y-6 px-6">
                <div className="bg-primary/10 p-6 rounded-full w-fit mx-auto mb-4 border border-primary/20">
                  <Info className="h-12 w-12 text-primary" />
                </div>
                <h2 className="text-3xl font-display font-black text-white">Le chapitre est en cours de création</h2>
                <p className="text-stone-500 italic max-w-sm mx-auto">"L'artiste prépare ses prochaines planches. Revenez bientôt pour la suite de l'aventure."</p>
                <Button asChild variant="outline" className="rounded-full px-8 border-white/10 text-white">
                  <Link href={getStoryUrl(story)}>Retour à l'œuvre</Link>
                </Button>
              </div>
            )}

            {pages.length > 0 && (
              <div className="py-32 px-6 text-center space-y-8 w-full max-w-lg mx-auto">
                <div className="bg-primary/10 p-10 rounded-[3rem] border border-primary/20 backdrop-blur-xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity"><Zap className="h-32 w-32 text-primary" /></div>
                  <h2 className="text-4xl font-display font-black gold-resplendant mb-4">Épisode Terminé</h2>
                  <p className="text-stone-400 text-sm italic font-light">"Chaque fin est le commencement d'une nouvelle légende."</p>
                </div>
                <Button size="lg" className="w-full rounded-full h-16 font-black text-xl gold-shimmer shadow-2xl shadow-primary/20 bg-primary text-black">
                  Épisode Suivant <ChevronRight className="ml-2 h-6 w-6" />
                </Button>
              </div>
            )}
          </div>
        </main>
        
        <ReaderSidebar 
          story={story} 
          artist={artist || null} 
          currentUser={currentUser}
          openAuthModal={openAuthModal}
        />
      </div>

      <FloatingTools 
        onLike={() => setIsLiked(!isLiked)}
        isLiked={isLiked}
        onBookmark={handleBookmark}
        isBookmarked={isBookmarked}
        onShare={handleShare}
        onComment={() => {}}
        commentsCount={commentsCount}
      />
    </div>
  );
}
