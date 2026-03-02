'use client';

import { useState, useEffect, use, useRef, useCallback } from 'react';
import { db, auth } from '@/lib/firebase';
import { doc, getDoc, collection, getDocs, query, orderBy, setDoc, serverTimestamp, addDoc, increment, limit, updateDoc, runTransaction } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  Book, Layers, Heart, MessageSquare, ChevronRight, ChevronLeft, Bookmark, Settings, Star, Coins, Eye, Award, Check, Share2, Loader2, Headphones, Music, Volume2, VolumeX, Info, Zap, Flame, Crown, Lock, Flag, AlertTriangle, Maximize, Minimize, X, Palette, Sun, HelpCircle, Keyboard
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
import { Slider } from '@/components/ui/slider';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

// #region Page Components

const sanitize = (text: string) => text.replace(/</g, '&lt;').replace(/>/g, '&gt;');

function ReaderHeader({ story, chapter, onModeChange, activeMode, onSettingsToggle, onBookmark, isBookmarked, isFullscreen, onToggleFullscreen, isVisible, onChapterChange }: any) {
  const storyUrl = getStoryUrl(story);
  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 h-14 bg-stone-950/95 border-b border-white/10 z-50 flex items-center justify-between px-5 backdrop-blur-xl transition-transform duration-300",
      !isVisible && "-translate-y-full"
    )}>
      <div className="flex items-center gap-4 flex-1">
        <Link href="/" className="font-display font-black text-lg tracking-tighter text-white gold-resplendant">NexusHub<span className="text-primary">.</span></Link>
        <div className="w-px h-5 bg-white/10 hidden md:block" />
        <div className="flex items-center gap-2 text-sm text-stone-400">
          <Link href={storyUrl} className="hover:text-primary transition-colors hidden sm:block font-medium truncate max-w-[120px] text-stone-400">{story.title}</Link>
          <ChevronRight className="h-4 w-4 hidden sm:block" />
          <span className="text-primary font-semibold whitespace-nowrap">Ep. {chapter?.chapterNumber || 1}</span>
        </div>
      </div>

      <div className="hidden lg:flex items-center gap-2 absolute left-1/2 -translate-x-1/2">
        <Button size="icon" variant="outline" className="w-8 h-8 rounded-full border-white/10 text-white hover:bg-white/10" onClick={() => onChapterChange('prev')}><ChevronLeft className="h-4 w-4" /></Button>
        <Select value={chapter?.id} onValueChange={(val) => onChapterChange(val)}>
          <SelectTrigger className="w-[180px] h-8 text-[10px] uppercase font-black tracking-widest rounded-xl bg-white/5 border-white/10 text-white">
            <SelectValue placeholder="Épisodes" />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-white/10 bg-stone-900 text-white">
            {story.chapters?.map((chap: Chapter) => (
              <SelectItem key={chap.id} value={chap.id} className="text-xs font-bold">
                Épisode {chap.chapterNumber}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button size="icon" variant="outline" className="w-8 h-8 rounded-full border-white/10 text-white hover:bg-white/10" onClick={() => onChapterChange('next')}><ChevronRight className="h-4 w-4" /></Button>
      </div>

      <div className="flex items-center gap-2 flex-1 justify-end">
        <div className="hidden sm:flex bg-white/5 border border-white/10 rounded-xl p-0.5 mr-2">
          <Button onClick={() => onModeChange('scroll')} size="sm" variant={activeMode === 'scroll' ? 'default' : 'ghost'} className={cn("h-7 text-[9px] font-black uppercase px-3 gap-1.5 rounded-lg", activeMode === 'scroll' ? "bg-primary text-black" : "text-stone-400 hover:text-white")}>
            <Layers className="h-3 w-3" /> Webtoon
          </Button>
          <Button onClick={() => onModeChange('pages')} size="sm" variant={activeMode === 'pages' ? 'default' : 'ghost'} className={cn("h-7 text-[9px] font-black uppercase px-3 gap-1.5 rounded-lg", activeMode === 'pages' ? "bg-primary text-black" : "text-stone-400 hover:text-white")}>
            <Book className="h-3 w-3" /> BD
          </Button>
        </div>
        
        <Button onClick={onToggleFullscreen} size="icon" variant="ghost" className="h-9 w-9 rounded-full hover:bg-white/10 text-stone-400 hover:text-white">
          {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
        </Button>

        <Button onClick={onBookmark} size="sm" variant="outline" className={cn("h-8 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest gap-1.5 transition-all border-white/10 text-white hover:bg-white/10", isBookmarked && "bg-primary/10 border-primary text-primary")}>
          <Bookmark className={cn("h-3.5 w-3.5", isBookmarked && "fill-current")} />
          <span className="hidden md:inline">{isBookmarked ? 'Sauvegardé' : 'Sauvegarder'}</span>
        </Button>
        <Button onClick={onSettingsToggle} size="icon" variant="outline" className="h-8 w-8 rounded-full border-white/10 text-white hover:bg-white/10">
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </nav>
  );
}

function ProgressBar({ progress, isVisible }: { progress: number, isVisible: boolean }) {
  return (
    <div className={cn(
      "fixed top-14 left-0 right-0 h-0.5 bg-white/5 z-50 transition-transform duration-300",
      !isVisible && "top-0 translate-y-0"
    )}>
      <div
        className="h-full bg-gradient-to-r from-primary/50 via-primary to-accent transition-all duration-75 ease-linear"
        style={{ width: `${progress}%` }}
      >
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-accent shadow-[0_0_8px_hsl(var(--accent))] shadow-accent/50" />
      </div>
    </div>
  )
}

function ReaderSidebar({ story, artist, currentUser, openAuthModal, activeTab, setActiveTab, currentChapterIndex }: { story: Story, artist: UserProfile | null, currentUser: any, openAuthModal: any, activeTab: string, setActiveTab: (t: string) => void, currentChapterIndex: number }) {
  const currentChapterId = story.chapters?.[currentChapterIndex]?.id;

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
        {activeTab === 'chapters' && <ChaptersTab story={story} currentChapterIndex={currentChapterIndex} />}
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

function ChaptersTab({ story, currentChapterIndex }: { story: Story, currentChapterIndex: number }) {
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
              index === currentChapterIndex ? "bg-primary/10 border-primary/20" : "hover:bg-white/5"
            )}>
              <div className={cn(
                "w-8 h-8 flex items-center justify-center rounded-xl font-display font-black text-xs shrink-0 transition-all",
                index === currentChapterIndex ? "bg-primary text-black" : "bg-white/5 text-stone-600"
              )}>{chap.chapterNumber}</div>
              <div className="min-w-0">
                <p className={cn("text-xs font-bold truncate", index === currentChapterIndex ? "text-white" : "text-stone-400")}>{chap.title}</p>
                {chap.isPremium ? (
                  <p className="text-[9px] text-primary uppercase font-black tracking-widest flex items-center gap-1"><Crown className="h-2 w-2"/> Premium</p>
                ) : (
                  <p className="text-[9px] text-stone-600 uppercase font-black tracking-widest">Épisode gratuit</p>
                )}
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
  const [cooldown, setCooldown] = useState(0);
  const queryClient = useQueryClient();
  const [reportCommentId, setReportCommentId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState('Autre');
  const [isReporting, setIsReporting] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

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
      
      const sanitizedText = sanitize(text.trim());
      
      if (sanitizedText.length > 500) {
        throw new Error('Le commentaire est trop long (max 500 caractères).');
      }

      const ref = collection(db, 'stories', storyId, 'chapters', chapterId, 'comments');
      const userRef = doc(db, 'users', currentUser.uid);

      await addDoc(ref, {
        authorId: currentUser.uid,
        authorName: currentUser.displayName || 'Anonyme',
        authorAvatar: currentUser.photoURL || '',
        content: sanitizedText,
        likes: 0,
        isHidden: false,
        isEdited: false,
        createdAt: serverTimestamp()
      });

      await updateDoc(userRef, {
        lastCommentAt: serverTimestamp()
      });
    },
    onSuccess: () => {
      setCommentText('');
      setCooldown(30);
      queryClient.invalidateQueries({ queryKey: ['comments', storyId, chapterId] });
      toast({ title: "Commentaire publié !" });
    },
    onError: (error: any) => {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
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

  const handleReport = async () => {
    if (!currentUser) {
      openAuthModal('signaler un contenu');
      return;
    }
    if (!reportCommentId) return;

    setIsReporting(true);
    try {
      await addDoc(collection(db, 'reports'), {
        type: 'comment',
        targetId: reportCommentId,
        storyId,
        chapterId,
        reporterId: currentUser.uid,
        reason: reportReason,
        status: 'pending',
        createdAt: serverTimestamp()
      });
      toast({ title: "Signalement envoyé", description: "Merci d'aider à garder le Hub bienveillant." });
      setReportCommentId(null);
    } catch (e) {
      toast({ title: "Erreur lors du signalement", variant: "destructive" });
    } finally {
      setIsReporting(false);
    }
  };

  return (
    <div className="p-6 space-y-8">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-2">
            <MessageSquare className="h-4 w-4"/> Partagez votre avis
          </h4>
          <span className={cn(
            "text-[9px] font-bold uppercase",
            commentText.length > 500 ? "text-rose-500" : "text-stone-600"
          )}>
            {commentText.length}/500
          </span>
        </div>
        <div className="space-y-3">
          <Textarea 
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Qu'avez-vous pensé de cet épisode ?" 
            className="min-h-[100px] bg-white/5 border-white/10 rounded-2xl p-4 text-xs font-light"
            maxLength={550}
          />
          <Button 
            disabled={!commentText.trim() || commentText.length > 500 || submitMutation.isPending || cooldown > 0}
            onClick={() => submitMutation.mutate(commentText)}
            className="w-full h-10 rounded-xl font-black text-[10px] uppercase gold-shimmer"
          >
            {submitMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : cooldown > 0 ? `Attendre (${cooldown}s)` : "Publier"}
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
                  <p className="text-xs font-bold text-white">{c.authorName}</p>
                  <p className="text-[8px] text-stone-500 uppercase font-black">Il y a un instant</p>
                </div>
                <div className="flex items-center gap-1">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 gap-1 px-2 rounded-lg text-stone-500 hover:text-rose-500"
                    onClick={() => likeMutation.mutate(c.id)}
                  >
                    <Heart className="h-3 w-3" />
                    <span className="text-[10px] font-bold">{c.likes}</span>
                  </Button>
                  <Dialog open={reportCommentId === c.id} onOpenChange={(open) => !open && setReportCommentId(null)}>
                    <DialogTrigger asChild>
                      <Button onClick={() => setReportCommentId(c.id)} variant="ghost" size="icon" className="h-7 7-7 text-stone-600 hover:text-orange-500 rounded-lg">
                        <Flag className="h-3 w-3" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-stone-900 border-white/5 text-white rounded-[2rem]">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-orange-500" /> Signaler ce message</DialogTitle>
                        <DialogDescription className="text-stone-400">Pourquoi souhaitez-vous signaler ce commentaire ?</DialogDescription>
                      </DialogHeader>
                      <div className="py-6 space-y-4">
                        <Select value={reportReason} onValueChange={setReportReason}>
                          <SelectTrigger className="h-12 bg-white/5 border-white/10 rounded-xl">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-stone-900 border-white/10">
                            <SelectItem value="Harcèlement">Harcèlement</SelectItem>
                            <SelectItem value="Spam">Spam</SelectItem>
                            <SelectItem value="Contenu offensant">Contenu offensant</SelectItem>
                            <SelectItem value="Autre">Autre</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <DialogFooter>
                        <Button onClick={handleReport} disabled={isReporting} className="w-full h-12 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-black">
                          {isReporting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Envoyer le signalement"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
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

function FloatingTools({ onLike, onComment, onBookmark, onShare, isBookmarked, isLiked, commentsCount, isVisible }: any) {
  return (
    <div className={cn(
      "fixed top-1/2 -translate-y-1/2 right-6 lg:right-[340px] z-40 flex flex-col gap-3 group transition-all duration-500",
      !isVisible ? "translate-x-20 opacity-0" : "translate-x-0 opacity-100"
    )}>
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
  const queryClient = useQueryClient();

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeMode, setActiveMode] = useState<'scroll' | 'pages'>('scroll');
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarTab, setSidebarTab] = useState('chapters');
  const [showShortcutsHelp, setShowHelp] = useState(false);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  
  // Chapter Preloading Ref
  const preloadedChapter = useRef<Chapter | null>(null);
  
  // Custom Reader Settings
  const [readerBg, setReaderBg] = useState('#0a0a0a');
  const [brightness, setBrightness] = useState(100);

  // Swipe Detection
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const [swipeIndicator, setSwipeIndicator] = useState<'prev' | 'next' | null>(null);
  
  const lastScrollY = useRef(0);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

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

  const currentChapter = story?.chapters?.[currentChapterIndex];

  const handleNextChapter = useCallback(() => {
    if (story?.chapters && currentChapterIndex < story.chapters.length - 1) {
      setSwipeIndicator('next');
      setTimeout(() => {
        setSwipeIndicator(null);
        setCurrentChapterIndex(prev => prev + 1);
        window.scrollTo({ top: 0, behavior: 'instant' });
      }, 500);
    } else {
      toast({ title: "Fin du récit", description: "Vous avez atteint le dernier chapitre publié." });
    }
  }, [story, currentChapterIndex, toast]);

  const handlePrevChapter = useCallback(() => {
    if (currentChapterIndex > 0) {
      setSwipeIndicator('prev');
      setTimeout(() => {
        setSwipeIndicator(null);
        setCurrentChapterIndex(prev => prev - 1);
        window.scrollTo({ top: 0, behavior: 'instant' });
      }, 500);
    }
  }, [currentChapterIndex]);

  const handleChapterChange = (val: string | 'next' | 'prev') => {
    if (val === 'next') handleNextChapter();
    else if (val === 'prev') handlePrevChapter();
    else {
      const idx = story?.chapters?.findIndex(c => c.id === val);
      if (idx !== undefined && idx !== -1) {
        setCurrentChapterIndex(idx);
        window.scrollTo({ top: 0, behavior: 'instant' });
      }
    }
  };

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  }, []);

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.key.toLowerCase()) {
        case 'arrowright':
        case ' ':
          e.preventDefault();
          handleNextChapter();
          break;
        case 'arrowleft':
          e.preventDefault();
          handlePrevChapter();
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'c':
          e.preventDefault();
          setSidebarOpen(prev => !prev);
          setSidebarTab('comments');
          break;
        case 'm':
          e.preventDefault();
          setActiveMode(prev => prev === 'scroll' ? 'pages' : 'scroll');
          toast({ title: "Mode de lecture", description: `Passage en mode ${activeMode === 'scroll' ? 'BD (Pages)' : 'Webtoon (Scroll)'}` });
          break;
        case 'escape':
          if (showSettings) setShowSettings(false);
          if (document.fullscreenElement) document.exitFullscreen();
          break;
        case '?':
          e.preventDefault();
          setShowHelp(true);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNextChapter, handlePrevChapter, toggleFullscreen, activeMode, showSettings, toast]);

  // Load preferences
  useEffect(() => {
    const savedBg = localStorage.getItem('reader-bg');
    const savedBrightness = localStorage.getItem('reader-brightness');
    if (savedBg) setReaderBg(savedBg);
    if (savedBrightness) setBrightness(parseInt(savedBrightness));
  }, []);

  const handleUpdateReaderSettings = async (type: 'bg' | 'brightness', value: any) => {
    if (type === 'bg') {
      setReaderBg(value);
      localStorage.setItem('reader-bg', value);
    } else {
      setBrightness(value);
      localStorage.setItem('reader-brightness', value.toString());
    }

    if (currentUser) {
      try {
        const userRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userRef, {
          [`preferences.reader.${type === 'bg' ? 'background' : 'brightness'}`]: value
        });
      } catch (e) {
        console.error("Error saving preferences to Firestore", e);
      }
    }
  };

  const { data: isUnlocked } = useQuery({
    queryKey: ['check-unlock', currentUser?.uid, currentChapter?.id],
    enabled: !!currentUser && !!currentChapter?.isPremium,
    queryFn: async () => {
      const docRef = doc(db, 'users', currentUser!.uid, 'unlockedChapters', currentChapter!.id);
      const snap = await getDoc(docRef);
      return snap.exists();
    }
  });

  const unlockMutation = useMutation({
    mutationFn: async () => {
      if (!currentUser) { openAuthModal('débloquer ce chapitre'); return; }
      if (!currentChapter) return;

      const userRef = doc(db, 'users', currentUser.uid);
      const unlockRef = doc(db, 'users', currentUser.uid, 'unlockedChapters', currentChapter.id);
      
      await runTransaction(db, async (transaction) => {
        const userSnap = await transaction.get(userRef);
        if (!userSnap.exists()) throw "Profil voyageur introuvable.";
        
        const balance = userSnap.data().afriCoins || 0;
        const price = currentChapter.afriCoinsPrice || 5;
        
        if (balance < price) {
          throw "Solde d'AfriCoins insuffisant. Veuillez recharger votre compte.";
        }
        
        transaction.update(userRef, { afriCoins: balance - price });
        transaction.set(unlockRef, {
          unlockedAt: serverTimestamp(),
          storyId,
          chapterId: currentChapter.id,
          chapterTitle: currentChapter.title,
          price: price
        });
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['check-unlock', currentUser?.uid, currentChapter?.id] });
      toast({ title: "Chapitre débloqué !", description: "Bonne immersion dans le récit." });
    }
  });

  const isLocked = currentChapter?.isPremium && !isUnlocked;

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => setCurrentUser(user));
    return unsub;
  }, []);

  useEffect(() => {
    if (story && currentChapter) {
      const viewKey = `viewed_${storyId}_${currentChapter.id}`;
      if (!sessionStorage.getItem(viewKey)) {
        updateDoc(doc(db, 'stories', storyId), { views: increment(1) }).catch(console.error);
        updateDoc(doc(db, 'stories', storyId, 'chapters', currentChapter.id), { views: increment(1) }).catch(console.error);
        sessionStorage.setItem(viewKey, 'true');
      }
    }
  }, [story, currentChapter, storyId]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const docHeight = document.documentElement.scrollHeight;
      const windowHeight = window.innerHeight;
      const totalHeight = docHeight - windowHeight;
      const scrollPercentage = totalHeight > 0 ? (scrollPosition / totalHeight) * 100 : 0;
      
      setScrollProgress(scrollPercentage);

      // Mode Cinéma Logic (Show/Hide Header)
      if (Math.abs(scrollPosition - lastScrollY.current) > 5) {
        setIsHeaderVisible(scrollPosition < lastScrollY.current || scrollPosition < 100);
        lastScrollY.current = scrollPosition;
      }

      // CHAPTER PRELOADING LOGIC
      if (scrollPercentage > 80 && story?.chapters && currentChapterIndex < story.chapters.length - 1) {
        const nextIdx = currentChapterIndex + 1;
        const nextChapter = story.chapters[nextIdx];
        if (!preloadedChapter.current || preloadedChapter.current.id !== nextChapter.id) {
          preloadedChapter.current = nextChapter;
          console.log("Anticipation Nexus : Chapitre suivant préchargé.");
        }
      }

      if (currentUser && story && currentChapter) {
        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(async () => {
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
          } catch (e) { console.error(e); }
        }, 2000);
      }
    };
    window.addEventListener('scroll', handleScroll);
    
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => { 
      window.removeEventListener('scroll', handleScroll); 
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      if (debounceTimer.current) clearTimeout(debounceTimer.current); 
    };
  }, [currentUser, story, currentChapter, storyId, currentChapterIndex]);

  // #region TOUCH SWIPE DETECTION
  const handleTouchStart = (e: React.TouchEvent) => {
    if (activeMode !== 'pages') return;
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (activeMode !== 'pages' || touchStartX.current === null) return;
    touchEndX.current = e.changedTouches[0].clientX;
    const deltaX = touchEndX.current - touchStartX.current;
    if (deltaX > 80) handlePrevChapter();
    else if (deltaX < -80) handleNextChapter();
    touchStartX.current = null;
    touchEndX.current = null;
  };
  // #endregion

  if (loadingStory) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-stone-950 gap-6">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-stone-500 font-display font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">Ouverture du manuscrit...</p>
      </div>
    );
  }

  if (!story) notFound();
  
  const pages = currentChapter?.pages || [];

  return (
    <div 
      className="min-h-screen selection:bg-primary/20 relative" 
      style={{ backgroundColor: readerBg }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <ProgressBar progress={scrollProgress} isVisible={isHeaderVisible} />
      
      <ReaderHeader 
        story={story} 
        chapter={currentChapter}
        activeMode={activeMode}
        onModeChange={setActiveMode}
        onSettingsToggle={() => setShowSettings(true)}
        onBookmark={() => toast({title: 'Sauvegardé'})}
        isBookmarked={isBookmarked}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
        isVisible={isHeaderVisible}
        onChapterChange={handleChapterChange}
      />

      {swipeIndicator && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none px-6">
          <div className="bg-primary text-black px-8 py-4 rounded-3xl font-black text-xl shadow-[0_0_50px_rgba(212,168,67,0.4)] border-4 border-black/10 animate-in zoom-in fade-in duration-300">
            {swipeIndicator === 'prev' ? '← Ch. Précédent' : 'Ch. Suivant →'}
          </div>
        </div>
      )}
      
      <div className="flex pt-14 min-h-[calc(100vh-56px)]">
        <main className="flex-1 min-w-0" style={{ backgroundColor: readerBg }}>
          <div className="w-full max-w-[800px] mx-auto flex flex-col items-center">
            {isLocked ? (
              <div className="py-48 px-6 text-center space-y-10 animate-in fade-in zoom-in-95 duration-700">
                <Card className="bg-stone-900/80 border-primary/30 border-2 rounded-[3rem] p-12 backdrop-blur-2xl shadow-[0_0_50px_rgba(212,168,67,0.2)] relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:rotate-12 transition-transform duration-1000"><Crown className="h-48 w-48 text-primary" /></div>
                  <div className="relative z-10 space-y-8">
                    <div className="mx-auto w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center border-2 border-primary/20 shadow-inner">
                      <Lock className="h-10 w-10 text-primary" />
                    </div>
                    <div className="space-y-3">
                      <Badge className="bg-primary text-black font-black uppercase text-[10px] px-4 py-1">Épisode Premium</Badge>
                      <h2 className="text-4xl font-display font-black text-white tracking-tighter">Soutenez la Création</h2>
                      <p className="text-stone-400 text-lg font-light italic max-sm mx-auto">
                        "Cet épisode est une exclusivité NexusHub. Débloquez-le pour continuer votre voyage."
                      </p>
                    </div>
                    <div className="space-y-4">
                      <Button onClick={() => unlockMutation.mutate()} disabled={unlockMutation.isPending} className="w-full h-16 rounded-2xl bg-primary text-black font-black text-xl gold-shimmer shadow-2xl">
                        {unlockMutation.isPending ? <Loader2 className="h-6 w-6 animate-spin" /> : <>Débloquer pour {currentChapter?.afriCoinsPrice || 5} 🪙</>}
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            ) : (
              <>
                {pages.map((page, index) => (
                  <div key={index} className="relative w-full aspect-[2/3] animate-in fade-in duration-1000" style={{ filter: `brightness(${brightness}%)` }}>
                    <Image
                      src={getOptimizedImage(page.imageUrl, { width: 1000, quality: 90 })}
                      alt={`Page ${index + 1}`}
                      fill
                      className="object-contain md:object-cover"
                      priority={index < 2}
                      sizes="(max-width: 768px) 100vw, 800px"
                    />
                  </div>
                ))}

                <div className="py-32 px-6 text-center space-y-8 w-full max-w-lg mx-auto">
                  <div className="bg-primary/10 p-10 rounded-[3rem] border border-primary/20 backdrop-blur-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity"><Zap className="h-32 w-32 text-primary" /></div>
                    <h2 className="text-4xl font-display font-black gold-resplendant mb-4">Épisode Terminé</h2>
                    <p className="text-stone-400 text-sm italic font-light">"Chaque fin est le commencement d'une nouvelle légende."</p>
                  </div>
                  <div className="flex flex-col gap-4">
                    <Button onClick={handleNextChapter} size="lg" className="w-full rounded-full h-16 font-black text-xl gold-shimmer shadow-2xl bg-primary text-black">
                      Épisode Suivant <ChevronRight className="ml-2 h-6 w-6" />
                    </Button>
                    {currentChapterIndex < (story.chapters?.length || 0) - 1 && (
                      <Link 
                        href={`/read/${storyId}?chapter=${story.chapters![currentChapterIndex+1].id}`} 
                        prefetch={true}
                        className="text-[10px] text-stone-600 font-bold uppercase tracking-[0.3em] hover:text-primary transition-colors"
                      >
                        Chargement anticipé actif
                      </Link>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
        
        {sidebarOpen && (
          <ReaderSidebar 
            story={story} 
            artist={artist || null} 
            currentUser={currentUser}
            openAuthModal={openAuthModal}
            activeTab={sidebarTab}
            setActiveTab={setSidebarTab}
            currentChapterIndex={currentChapterIndex}
          />
        )}
      </div>

      <FloatingTools 
        onLike={() => setIsLiked(!isLiked)}
        isLiked={isLiked}
        onBookmark={() => setIsBookmarked(!isBookmarked)}
        isBookmarked={isBookmarked}
        onShare={() => toast({title:'Lien copié'})}
        onComment={() => { setSidebarOpen(true); setSidebarTab('comments'); }}
        commentsCount={0}
        isVisible={isHeaderVisible}
      />

      <Sheet open={showSettings} onOpenChange={setShowSettings}>
        <SheetContent side="right" className="bg-stone-900 border-white/5 text-white p-8 rounded-l-[3rem] w-full sm:max-w-md">
          <SheetHeader className="mb-10 flex flex-row items-center justify-between">
            <SheetTitle className="text-2xl font-display font-black text-white flex items-center gap-3">
              <Settings className="h-6 w-6 text-primary" /> Réglages
            </SheetTitle>
          </SheetHeader>
          <div className="space-y-12">
            <div className="space-y-6">
              <Label className="text-[10px] uppercase font-black tracking-widest text-stone-500">Fond de lecture</Label>
              <div className="grid grid-cols-3 gap-3">
                {[{ id: 'noir', color: '#0a0a0a' }, { id: 'sepia', color: '#1a1208' }, { id: 'gris', color: '#1a1a1a' }].map((opt) => (
                  <button key={opt.id} onClick={() => handleUpdateReaderSettings('bg', opt.color)} className={cn("h-12 rounded-2xl border-2", readerBg === opt.color ? "border-primary bg-primary/10" : "border-white/5 bg-white/5")} style={{ backgroundColor: opt.color }} />
                ))}
              </div>
            </div>
            <div className="space-y-6">
              <div className="flex justify-between items-center"><Label className="text-[10px] uppercase font-black tracking-widest text-stone-500">Luminosité</Label><span>{brightness}%</span></div>
              <Slider min={70} max={100} step={1} value={[brightness]} onValueChange={(val) => handleUpdateReaderSettings('brightness', val[0])} />
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
