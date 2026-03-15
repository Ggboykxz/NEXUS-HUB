'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { db, auth } from '@/lib/firebase';
import { doc, getDoc, collection, getDocs, query, orderBy, setDoc, serverTimestamp, addDoc, increment, limit, updateDoc, onSnapshot, runTransaction } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { notFound, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  Book, Layers, Heart, MessageSquare, ChevronRight, ChevronLeft, Bookmark, Settings, Star, Coins, Eye, Award, Check, Share2, Loader2, Headphones, Music, Volume2, VolumeX, Info, Zap, Flame, Crown, Lock, Flag, AlertTriangle, Maximize, Minimize, X, Palette, Sun, HelpCircle, Keyboard, Wand2
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { getReaderPageOptimized } from '@/lib/image-utils';
import type { Story, UserProfile, Chapter, LibraryEntry } from '@/lib/types';
import { getStoryUrl } from '@/lib/types';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthModal } from '@/components/providers/auth-modal-provider';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
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
  SheetTrigger,
} from "@/components/ui/sheet";
import { Card } from '@/components/ui/card';
import { Logo } from '@/components/icons/logo';
import { checkAndAwardDailyStreak } from '@/lib/actions/reward-actions';
import { augmentedReadingAction } from '@/ai/flows/augmented-reading-flow';

const sanitize = (text: string) => text.replace(/</g, '&lt;').replace(/>/g, '&gt;');

function PremiumGate({ chapter, userCoins, onUnlock, isUnlocking }: any) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-8 animate-in fade-in duration-700">
      <div className="relative">
        <div className="h-32 w-32 bg-primary/10 rounded-full flex items-center justify-center border-4 border-primary/20 shadow-[0_0_50px_rgba(212,168,67,0.3)]">
          <Crown className="h-16 w-16 text-primary animate-pulse" />
        </div>
        <div className="absolute -bottom-2 -right-2 bg-stone-900 border-2 border-primary/50 p-2 rounded-full shadow-2xl">
          <Lock className="h-6 w-6 text-primary" />
        </div>
      </div>
      
      <div className="space-y-4 max-w-sm">
        <h2 className="text-3xl font-display font-black text-white uppercase tracking-tight">Accès Premium</h2>
        <p className="text-stone-400 italic font-light leading-relaxed">
          "Cet épisode est une exclusivité réservée aux membres. Débloquez-le pour soutenir l'artiste et poursuivre votre quête."
        </p>
      </div>

      <Card className="bg-stone-900 border-white/5 p-8 rounded-[2.5rem] w-full max-w-sm shadow-2xl space-y-6">
        <div className="flex justify-between items-center text-stone-500 text-[10px] font-black uppercase tracking-widest px-2">
          <span>Prix du chapitre</span>
          <span>Votre solde</span>
        </div>
        <div className="flex justify-between items-center">
          <div className="text-3xl font-black text-white">{chapter.afriCoinsPrice} 🪙</div>
          <div className="text-3xl font-black text-primary">{userCoins} 🪙</div>
        </div>
        <Button 
          onClick={onUnlock} 
          disabled={isUnlocking || userCoins < chapter.afriCoinsPrice}
          className="w-full h-16 rounded-2xl bg-primary text-black font-black text-xl gold-shimmer shadow-xl shadow-primary/20"
        >
          {isUnlocking ? <Loader2 className="animate-spin h-6 w-6" /> : `Débloquer pour ${chapter.afriCoinsPrice} 🪙`}
        </Button>
        {userCoins < chapter.afriCoinsPrice && (
          <p className="text-[10px] text-rose-500 font-bold uppercase tracking-tighter">Solde insuffisant. Rechargez vos coins.</p>
        )}
      </Card>
      
      <Link href="/africoins" className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-600 hover:text-primary transition-colors">
        Recharger mes AfriCoins <ChevronRight className="inline h-3 w-3" />
      </Link>
    </div>
  );
}

function ReaderHeader({ story, chapter, onModeChange, activeMode, onSettingsToggle, onBookmark, isBookmarked, isFullscreen, onToggleFullscreen, isVisible, onChapterChange, onShare }: any) {
  const storyUrl = getStoryUrl(story);
  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 h-14 bg-stone-950/95 border-b border-white/10 z-50 flex items-center justify-between px-5 backdrop-blur-xl transition-transform duration-300",
      !isVisible && "-translate-y-full"
    )}>
      <div className="flex items-center gap-4 flex-1">
        <Link href="/" className="group">
          <Logo className="h-8 w-auto group-hover:scale-110 transition-transform" />
        </Link>
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
        
        <Button onClick={onShare} size="icon" variant="ghost" className="h-9 w-9 rounded-full hover:bg-white/10 text-stone-400 hover:text-white hidden sm:flex">
          <Share2 className="h-4 w-4" />
        </Button>

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
            <Link key={chap.id} href={`/read/${story.id}?chapter=${chap.id}`} className={cn(
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
                      <Button onClick={() => setReportCommentId(c.id)} variant="ghost" size="icon" className="h-7 w-7 text-stone-600 hover:text-orange-500 rounded-lg">
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

function FloatingTools({ onLike, onComment, onBookmark, onShare, onAugmentedRead, isBookmarked, isLiked, commentsCount, isVisible }: any) {
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
      <Button onClick={onAugmentedRead} variant="outline" size="icon" className="h-12 w-12 rounded-full border-primary/30 bg-primary/10 backdrop-blur-xl shadow-2xl shadow-primary/20 transition-all hover:scale-110 hover:bg-primary/20 text-primary">
        <Wand2 className="h-5 w-5" />
      </Button>
    </div>
  )
}

function AugmentedReadingPanel({ storyTitle, context, open, onOpenChange }: { storyTitle: string, context: string, open: boolean, onOpenChange: (open: boolean) => void }) {
  const [activeTab, setActiveTab] = useState('summary');
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (type: 'summary' | 'glossary' | 'chat') => {
      return augmentedReadingAction({ type, storyTitle, context, userQuery: inputValue });
    },
    onMutate: () => {
      setIsLoading(true);
      setResult(null);
    },
    onSuccess: (data) => setResult(data.result),
    onError: (e: any) => setResult("Une erreur est survenue lors de la communication avec l'assistant."),
    onSettled: () => setIsLoading(false),
  });

  const handleAction = (type: 'summary' | 'glossary' | 'chat') => {
    mutation.mutate(type);
  };
  
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="bg-stone-950/95 backdrop-blur-2xl border-t-primary/20 border-t-2 text-white p-8 rounded-t-[3rem] h-[80vh]">
        <SheetHeader className="mb-8 text-center">
          <SheetTitle className="text-2xl font-display font-black text-white flex items-center justify-center gap-3">
            <Wand2 className="h-6 w-6 text-primary" /> Assistant de Lecture
          </SheetTitle>
          <DialogDescription className="text-stone-500 italic">Votre guide personnel dans l'univers de "{storyTitle}"</DialogDescription>
        </SheetHeader>
        <div className="grid grid-cols-[200px,1fr] gap-8 h-[calc(100%-120px)]">
          <div className="flex flex-col gap-2 border-r border-white/5 pr-8">
            <Button onClick={() => setActiveTab('summary')} variant={activeTab === 'summary' ? 'secondary' : 'ghost'}>Résumé</Button>
            <Button onClick={() => setActiveTab('glossary')} variant={activeTab === 'glossary' ? 'secondary' : 'ghost'}>Glossaire</Button>
            <Button onClick={() => setActiveTab('chat')} variant={activeTab === 'chat' ? 'secondary' : 'ghost'}>Chat</Button>
          </div>
          <div className="flex flex-col">
            <ScrollArea className="flex-1 pr-6 -mr-6">
              {isLoading && <Loader2 className="animate-spin mx-auto my-12" />}
              {result && <p className="whitespace-pre-wrap font-light leading-relaxed text-stone-300">{result}</p>}
            </ScrollArea>
            <div className="pt-6 mt-auto">
              {activeTab === 'summary' && (
                <Button onClick={() => handleAction('summary')} className="w-full">Rattrapage rapide</Button>
              )}
              {activeTab === 'glossary' && (
                <>
                  <Input value={inputValue} onChange={e => setInputValue(e.target.value)} placeholder="Ex: Masque Goli" />
                  <Button onClick={() => handleAction('glossary')} className="w-full mt-2">Expliquer le terme</Button>
                </>
              )}
              {activeTab === 'chat' && (
                <>
                  <Textarea value={inputValue} onChange={e => setInputValue(e.target.value)} placeholder="Posez une question sur l'histoire..." />
                  <Button onClick={() => handleAction('chat')} className="w-full mt-2">Demander à l'IA</Button>
                </>
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default function ReaderClient({ story, chapters }: { story: Story, chapters: Chapter[] }) {
  const { toast } = useToast();
  const { openAuthModal } = useAuthModal();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [activeMode, setActiveMode] = useState<'scroll' | 'pages'>('scroll');
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isAugmentedReadingOpen, setAugmentedReadingOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarTab, setSidebarTab] = useState('chapters');
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [readerBg, setReaderBg] = useState('#0a0a0a');
  const [brightness, setBrightness] = useState(100);
  const [swipeIndicator, setSwipeIndicator] = useState<'prev' | 'next' | null>(null);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [isLowData, setIsLowData] = useState(false);

  const { data: artist } = useQuery<UserProfile | null>({
    queryKey: ['artist', (story as any).artistId],
    queryFn: async () => {
      if (!(story as any).artistId) return null;
      const artistRef = doc(db, 'users', (story as any).artistId);
      const artistSnap = await getDoc(artistRef);
      return artistSnap.exists() ? (artistSnap.data() as UserProfile) : null;
    },
    enabled: !!(story as any).artistId
  });
  
  const lastScrollY = useRef(0);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const viewedPages = useRef<Set<number>>(new Set());

  const initialChapterId = searchParams.get('chapter');

  useEffect(() => {
    if (chapters && initialChapterId) {
      const idx = chapters.findIndex(c => c.id === initialChapterId);
      if (idx !== -1) setCurrentChapterIndex(idx);
    }
  }, [chapters, initialChapterId]);

  const currentChapter = chapters?.[currentChapterIndex];
  const nextChapter = chapters?.[currentChapterIndex + 1];

  // --- PREMIUM GATE CHECK ---
  const { data: isUnlocked, isLoading: loadingUnlock } = useQuery({
    queryKey: ['chapter-unlock', currentUser?.uid, currentChapter?.id],
    enabled: !!currentUser && !!currentChapter?.isPremium,
    queryFn: async () => {
      const unlockRef = doc(db, 'users', currentUser!.uid, 'unlockedChapters', currentChapter!.id);
      const snap = await getDoc(unlockRef);
      return snap.exists();
    }
  });

  const handleUnlock = async () => {
    if (!currentUser) {
      openAuthModal('débloquer ce chapitre Premium');
      return;
    }
    if (!currentChapter) return;

    const price = currentChapter.isPremium ? (currentChapter as any).afriCoinsPrice || 0 : 0;
    
    setIsUnlocking(true);
    try {
      await runTransaction(db, async (transaction) => {
        const userRef = doc(db, 'users', currentUser.uid);
        const userSnap = await transaction.get(userRef);
        
        if (!userSnap.exists()) throw new Error("Profil utilisateur introuvable.");
        
        const currentCoins = userSnap.data().afriCoins || 0;
        if (currentCoins < price) throw new Error("Solde d'AfriCoins insuffisant.");

        transaction.update(userRef, { afriCoins: increment(-price) });
        
        const unlockRef = doc(db, 'users', currentUser.uid, 'unlockedChapters', currentChapter.id);
        transaction.set(unlockRef, {
          unlockedAt: serverTimestamp(),
          storyId: story.id,
          chapterId: currentChapter.id,
          pricePaid: price
        });
      });

      queryClient.invalidateQueries({ queryKey: ['chapter-unlock', currentUser.uid, currentChapter.id] });
      toast({ title: "Chapitre débloqué !", description: "Bonne lecture !" });
    } catch (e: any) {
      toast({ title: "Action impossible", description: e.message, variant: "destructive" });
    } finally {
      setIsUnlocking(false);
    }
  };

  // --- ANALYTICS ---
  useEffect(() => {
    if (!currentChapter || (currentChapter.isPremium && !isUnlocked)) return;
    
    viewedPages.current.clear();

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(async (entry) => {
        if (entry.isIntersecting) {
          const pageIndex = parseInt(entry.target.getAttribute('data-page-index') || '0');
          
          if (!viewedPages.current.has(pageIndex)) {
            viewedPages.current.add(pageIndex);
            
            try {
              const chapterRef = doc(db, 'stories', story.id, 'chapters', currentChapter.id);
              await updateDoc(chapterRef, {
                [`pageStats.${pageIndex}.views`]: increment(1)
              });
            } catch (e) {
              console.error("Error tracking page view:", e);
            }
          }
        }
      });
    }, { threshold: 0.5 });

    const pageElements = document.querySelectorAll('.chapter-page');
    pageElements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, [currentChapter, story.id, isUnlocked]);

  const handleNextChapter = useCallback(() => {
    if (chapters && currentChapterIndex < chapters.length - 1) {
      setSwipeIndicator('next');
      setTimeout(() => {
        setSwipeIndicator(null);
        setCurrentChapterIndex(prev => prev + 1);
        window.scrollTo({ top: 0, behavior: 'instant' });
      }, 500);
    } else {
      toast({ title: "Fin du récit", description: "Vous avez atteint le dernier chapitre publié." });
    }
  }, [chapters, currentChapterIndex, toast]);

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
      const idx = chapters?.findIndex(c => c.id === val);
      if (idx !== undefined && idx !== -1) {
        setCurrentChapterIndex(idx);
        window.scrollTo({ top: 0, behavior: 'instant' });
      }
    }
  };

  const handleShare = async () => {
    const currentChapterId = currentChapter?.id;
    const shareUrl = window.location.origin + '/read/' + story.id + '?chapter=' + currentChapterId;
    
    const shareData = {
      title: story.title || 'NexusHub',
      text: `Je lis "${currentChapter?.title || story.title}" sur NexusHub !`,
      url: shareUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if ((err as Error).name !== 'AbortError') console.error('Error sharing:', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast({ title: "Lien copié !", description: "Le lien vers ce chapitre a été copié." });
      } catch (err) {
        toast({ title: "Erreur", description: "Impossible de copier le lien.", variant: "destructive" });
      }
    }
  };

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error full-screen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        const snap = await getDoc(doc(db, 'users', user.uid));
        if (snap.exists()) setUserProfile(snap.data() as UserProfile);
        try {
            const { awarded, coins, streakDays } = await checkAndAwardDailyStreak(user.uid);
            if (awarded) {
                toast({
                    title: `🔥 Streak ${streakDays} jours !`,
                    description: `+${coins} AfriCoins gagnés`,
                });
                queryClient.invalidateQueries({ queryKey: ['user-profile', user.uid] });
            }
        } catch (error) {
            console.error("Failed to check daily streak on reader page", error);
        }
      }
    });
    return unsub;
  }, [toast, queryClient]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const docHeight = document.documentElement.scrollHeight;
      const windowHeight = window.innerHeight;
      const totalHeight = docHeight - windowHeight;
      const scrollPercentage = totalHeight > 0 ? (scrollPosition / totalHeight) * 100 : 0;
      
      setScrollProgress(scrollPercentage);

      if (Math.abs(scrollPosition - lastScrollY.current) > 5) {
        setIsHeaderVisible(scrollPosition < lastScrollY.current || scrollPosition < 100);
        lastScrollY.current = scrollPosition;
      }

      if (currentUser && currentChapter && (!currentChapter.isPremium || isUnlocked)) {
        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(async () => {
          try {
            await setDoc(doc(db, 'users', currentUser.uid, 'library', story.id), {
              storyId: story.id,
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
    return () => { 
      window.removeEventListener('scroll', handleScroll); 
      if (debounceTimer.current) clearTimeout(debounceTimer.current); 
    };
  }, [currentUser, story, currentChapter, isUnlocked]);

  const pages = currentChapter?.pages || [];
  const showPremiumGate = currentChapter?.isPremium && !isUnlocked && !loadingUnlock;

  return (
    <div className="min-h-screen relative" style={{ backgroundColor: readerBg }}>
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
        onShare={handleShare}
      />

      {swipeIndicator && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none px-6">
          <div className="bg-primary text-black px-8 py-4 rounded-3xl font-black text-xl shadow-2xl border-4 border-black/10 animate-in zoom-in duration-300">
            {swipeIndicator === 'prev' ? '← Ch. Précédent' : 'Ch. Suivant →'}
          </div>
        </div>
      )}
      
      <div className="flex pt-14 min-h-[calc(100vh-56px)]">
        <main className="flex-1 min-w-0" style={{ backgroundColor: readerBg }}>
          <div className={cn(
            "w-full mx-auto flex flex-col items-center min-h-full transition-all duration-500",
            activeMode === 'scroll' ? "max-w-[650px]" : "max-w-5xl px-4 md:px-12"
          )}>
            {showPremiumGate ? (
              <PremiumGate 
                chapter={currentChapter} 
                userCoins={userProfile?.afriCoins || 0} 
                onUnlock={handleUnlock}
                isUnlocking={isUnlocking}
              />
            ) : (loadingUnlock || (chapters.length === 0 && !currentChapter)) ? (
              <div className="flex-1 flex flex-col items-center justify-center py-32 space-y-6">
                <Loader2 className="h-8 w-8 animate-spin text-primary opacity-20" />
                {!currentChapter && chapters.length === 0 && <p className="text-stone-600 italic">Aucun chapitre disponible.</p>}
              </div>
            ) : (
              <>
                <div className={cn(
                  "w-full flex flex-col items-center gap-0",
                  activeMode === 'pages' && "gap-8 py-8"
                )}>
                  {pages.map((page, index) => (
                    <div 
                      key={index} 
                      data-page-index={index}
                      className={cn(
                        "relative w-full animate-in fade-in duration-1000 chapter-page shadow-sm transition-all",
                        activeMode === 'scroll' ? "aspect-auto h-auto" : "aspect-[2/3] rounded-lg overflow-hidden border border-white/5 shadow-2xl"
                      )} 
                      style={{ 
                        filter: `brightness(${brightness}%)`,
                        height: activeMode === 'scroll' ? 'auto' : undefined
                      }}
                    >
                      <Image
                        src={getReaderPageOptimized(page.imageUrl, activeMode, isLowData)}
                        alt={`Page ${index + 1}`}
                        width={1000}
                        height={1000 * (page.height / page.width)}
                        className={cn(
                          "w-full h-auto",
                          activeMode === 'pages' && "h-full object-contain md:object-cover"
                        )}
                        priority={index < 2}
                        sizes={activeMode === 'scroll' ? "(max-width: 768px) 100vw, 650px" : "(max-width: 768px) 100vw, 1000px"}
                      />
                    </div>
                  ))}
                </div>

                <div className="py-32 px-6 text-center space-y-8 w-full max-w-lg mx-auto">
                  <div className="bg-primary/10 p-10 rounded-[3rem] border border-primary/20 backdrop-blur-xl relative overflow-hidden group">
                    <h2 className="text-4xl font-display font-black gold-resplendant mb-4">Épisode Terminé</h2>
                    <p className="text-stone-400 text-sm italic font-light">"Chaque fin est le commencement d'une nouvelle légende."</p>
                  </div>
                  <div className="flex flex-col gap-4">
                    {nextChapter ? (
                      <Button onClick={handleNextChapter} size="lg" className="w-full rounded-full h-16 font-black text-xl gold-shimmer shadow-2xl bg-primary text-black">
                        Épisode {nextChapter.chapterNumber} <ChevronRight className="ml-2 h-6 w-6" />
                      </Button>
                    ) : (
                      <Button asChild variant="outline" size="lg" className="w-full rounded-full h-16 border-white/10 text-white font-black text-xl hover:bg-white/5">
                        <Link href={getStoryUrl(story)}>Retour à la Légende</Link>
                      </Button>
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
        onShare={handleShare}
        onComment={() => { setSidebarOpen(true); setSidebarTab('comments'); }}
        onAugmentedRead={() => setAugmentedReadingOpen(true)}
        commentsCount={0}
        isVisible={isHeaderVisible && !showPremiumGate}
      />

      <AugmentedReadingPanel
        storyTitle={story.title}
        context={`Lecture du chapitre ${currentChapter?.chapterNumber}: ${currentChapter?.title}`}
        open={isAugmentedReadingOpen}
        onOpenChange={setAugmentedReadingOpen}
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
              <label className="text-[10px] uppercase font-black tracking-widest text-stone-500">Fond de lecture</label>
              <div className="grid grid-cols-3 gap-3">
                {[{ id: 'noir', color: '#0a0a0a' }, { id: 'sepia', color: '#1a1208' }, { id: 'gris', color: '#1a1a1a' }].map((opt) => (
                  <button key={opt.id} onClick={() => { setReaderBg(opt.color); localStorage.setItem('reader-bg', opt.color); }} className={cn("h-12 rounded-2xl border-2", readerBg === opt.color ? "border-primary bg-primary/10" : "border-white/5 bg-white/5")} style={{ backgroundColor: opt.color }} />
                ))}
              </div>
            </div>
            <div className="space-y-6">
              <div className="flex justify-between items-center"><label className="text-[10px] uppercase font-black tracking-widest text-stone-500">Luminosité</label><span>{brightness}%</span></div>
              <Slider min={70} max={100} step={1} value={[brightness]} onValueChange={(val) => { setBrightness(val[0]); localStorage.setItem('reader-brightness', val[0].toString()); }} />
            </div>
            <div className="space-y-6 pt-6 border-t border-white/5">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-xs font-bold text-white">Mode Low-Data</Label>
                  <p className="text-[10px] text-stone-500">Compresse les planches pour économiser vos données.</p>
                </div>
                <Switch checked={isLowData} onCheckedChange={setIsLowData} />
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
