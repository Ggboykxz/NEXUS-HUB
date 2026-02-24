'use client';

import { useState, useEffect, use, useRef, useCallback } from 'react';
import { stories, comicPages, comments as allComments, artists, getChapterUrl } from '@/lib/data';
import { notFound, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  Layers, Book, ChevronLeft, ChevronRight, Bookmark, Settings, Heart, MessageSquare, Share2, ArrowLeft, SendHorizonal, Smile, Zap, X, Maximize2, Minimize2
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi
} from "@/components/ui/carousel";
import { useAuthModal } from '@/components/providers/auth-modal-provider';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import type { Story, Chapter } from '@/lib/types';
import { getOptimizedImage } from '@/lib/image-utils';

// #region Components

interface ReaderHeaderProps {
  story: Story;
  chapter: Chapter;
  onModeChange: (mode: 'scroll' | 'pages') => void;
  activeMode: string;
  onBookmark: () => void;
  isBookmarked: boolean;
  progress: number;
  onChapterChange: (slug: string) => void;
  isVisible: boolean;
}

function ReaderHeader({ story, chapter, onModeChange, activeMode, onBookmark, isBookmarked, progress, onChapterChange, isVisible }: ReaderHeaderProps) {
  const chapterNumber = story.chapters?.findIndex((c) => c.slug === chapter.slug) + 1 || 1;

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 h-14 bg-background/90 border-b border-white/5 z-50 flex items-center justify-between px-5 backdrop-blur-2xl reader-ui-transition",
      !isVisible && "reader-ui-hidden"
    )}>
      <div 
        className="absolute bottom-0 left-0 h-0.5 bg-primary shadow-[0_0_15px_hsl(var(--primary))] transition-all duration-300 ease-out z-50" 
        style={{ width: `${progress}%` }}
      />

      <div className="flex items-center gap-4 flex-1">
        <Button asChild variant="ghost" size="icon" className="text-primary hover:text-primary/80 h-9 w-9 rounded-full bg-white/5">
          <Link href={`/webtoon/${story.slug}`}><ArrowLeft className="h-5 w-5" /></Link>
        </Button>
        <div className="flex flex-col justify-center">
          <span className="text-[10px] uppercase font-black text-primary tracking-[0.2em] leading-none mb-1">{story.title}</span>
          <span className="text-xs font-bold text-foreground truncate max-w-[150px] sm:max-w-none">Ch. {chapterNumber} : {chapter.title}</span>
        </div>
      </div>

      <div className="hidden lg:flex items-center gap-2 absolute left-1/2 -translate-x-1/2">
        <Button size="icon" variant="ghost" className="w-8 h-8 text-stone-500 hover:text-primary"><ChevronLeft className="h-4 w-4" /></Button>
        <Select defaultValue={chapter.slug} onValueChange={onChapterChange}>
          <SelectTrigger className="w-[240px] h-9 text-xs font-black border-white/10 bg-white/5 rounded-full px-4">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-stone-900 border-white/10 text-white">
            {story.chapters?.map((chap, idx) => (
              <SelectItem key={chap.id} value={chap.slug} className="text-xs font-bold focus:bg-primary focus:text-black">
                Épisode {idx + 1} : {chap.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button size="icon" variant="ghost" className="w-8 h-8 text-stone-500 hover:text-primary"><ChevronRight className="h-4 w-4" /></Button>
      </div>

      <div className="flex items-center gap-3 flex-1 justify-end">
        <div className="hidden sm:flex bg-white/5 border border-white/10 rounded-full p-1">
          <Button 
            onClick={() => onModeChange('scroll')} 
            size="sm" 
            variant={activeMode === 'scroll' ? 'default' : 'ghost'} 
            className={cn("h-7 text-[10px] font-black gap-1.5 uppercase px-3 rounded-full", activeMode === 'scroll' && "bg-primary text-black shadow-lg shadow-primary/20")}
          >
            <Layers className="h-3.5 w-3.5" /> Webtoon
          </Button>
          <Button 
            onClick={() => onModeChange('pages')} 
            size="sm" 
            variant={activeMode === 'pages' ? 'default' : 'ghost'} 
            className={cn("h-7 text-[10px] font-black gap-1.5 uppercase px-3 rounded-full", activeMode === 'pages' && "bg-primary text-black shadow-lg shadow-primary/20")}
          >
            <Book className="h-3.5 w-3.5" /> BD
          </Button>
        </div>
        <Button onClick={onBookmark} size="icon" variant="ghost" className={cn("h-9 w-9 rounded-full bg-white/5", isBookmarked && "text-primary bg-primary/10")}>
          <Bookmark className={cn("h-4 w-4", isBookmarked && "fill-current")} />
        </Button>
      </div>
    </nav>
  );
}

interface ReaderFooterProps {
  story: Story;
  isLiked: boolean;
  onLike: () => void;
  commentsCount: number;
  onShare: () => void;
  onToggleComments: () => void;
  isCommentsOpen: boolean;
  isVisible: boolean;
}

function ReaderFooter({ story, isLiked, onLike, commentsCount, onShare, onToggleComments, isCommentsOpen, isVisible }: ReaderFooterProps) {
  return (
    <div className={cn(
      "fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-stone-900/80 backdrop-blur-3xl border border-white/10 p-2 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-500",
      isCommentsOpen && "translate-x-[-100%] md:translate-x-[-150%]",
      !isVisible && "reader-footer-hidden"
    )}>
      <Button variant="ghost" size="icon" className="rounded-full h-11 w-11 text-stone-400 hover:text-primary hover:bg-white/5"><ChevronLeft className="h-6 w-6" /></Button>
      
      <Separator orientation="vertical" className="h-8 bg-white/10 mx-1" />
      
      <Button 
        onClick={onLike}
        variant="ghost" 
        className={cn("rounded-full gap-2.5 px-6 h-11 font-black transition-all", isLiked ? "text-primary bg-primary/10 scale-105" : "text-stone-300 hover:bg-white/5")}
      >
        <Heart className={cn("h-5 w-5", isLiked && "fill-current")} />
        <span className="text-sm">{(story.likes / 1000).toFixed(1)}k</span>
      </Button>

      <Button 
        onClick={onToggleComments}
        variant="ghost" 
        className={cn("rounded-full gap-2.5 px-6 h-11 font-black transition-all", isCommentsOpen ? "text-primary bg-primary/10 scale-105" : "text-stone-300 hover:bg-white/5")}
      >
        <MessageSquare className={cn("h-5 w-5", isCommentsOpen && "fill-current")} />
        <span className="text-sm">{commentsCount}</span>
      </Button>

      <Button onClick={onShare} variant="ghost" size="icon" className="rounded-full h-11 w-11 text-stone-300 hover:text-primary hover:bg-white/5"><Share2 className="h-5 w-5" /></Button>
      
      <Separator orientation="vertical" className="h-8 bg-white/10 mx-1" />

      <Button variant="ghost" size="icon" className="rounded-full h-11 w-11 text-stone-400 hover:text-primary hover:bg-white/5"><ChevronRight className="h-6 w-6" /></Button>
    </div>
  );
}

function CommentsPanel({ storyId, chapterIndex, onClose }: { storyId: string, chapterIndex: number, onClose: () => void }) {
  const { openAuthModal } = useAuthModal();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const storyComments = allComments.filter(c => c.storyId === storyId && c.chapter === chapterIndex);
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  const handlePostComment = () => {
    if (!currentUser) {
      openAuthModal('poster votre commentaire');
      return;
    }
  };

  return (
    <div className="flex flex-col h-full bg-stone-950 border-l border-white/10 shadow-[-20px_0_50px_rgba(0,0,0,0.5)]">
      <div className="p-8 border-b border-white/5 bg-stone-900/30 flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-display font-black text-white flex items-center gap-3 gold-resplendant">
            <MessageSquare className="h-7 w-7 text-primary" /> Communauté
          </h3>
          <p className="text-[10px] text-stone-500 uppercase font-black tracking-[0.3em] mt-2">Zone de Débats & Théories</p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="text-stone-500 hover:text-white hover:bg-white/5 rounded-full h-10 w-10">
          <X className="h-6 w-6" />
        </Button>
      </div>

      <ScrollArea className="flex-1 p-8">
        <div className="space-y-10">
          {storyComments.length > 0 ? storyComments.map((comment) => (
            <div key={comment.id} className="group animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="flex items-start gap-5">
                <div className="relative">
                  <Avatar className="h-12 w-12 border-2 border-white/10 ring-2 ring-primary/10">
                    <AvatarImage src={comment.authorAvatar.imageUrl} />
                    <AvatarFallback className="bg-primary/5 text-primary font-black">{comment.authorName[0]}</AvatarFallback>
                  </Avatar>
                  {comment.authorBadge === 'Artiste Pro' && (
                    <div className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full p-0.5 border-2 border-stone-950">
                      <Zap className="h-2.5 w-2.5 text-black fill-current" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-black text-base text-stone-200">{comment.authorName}</span>
                    <Badge variant="outline" className="text-[9px] h-4.5 uppercase font-black border-primary/20 text-primary px-2 tracking-tighter">{comment.authorBadge || 'Lecteur'}</Badge>
                    <span className="text-[10px] text-stone-600 font-bold uppercase ml-auto tracking-widest">{comment.timestamp}</span>
                  </div>
                  <div className="text-base text-stone-400 leading-relaxed font-light bg-white/5 p-4 rounded-3xl rounded-tl-none border border-white/5 shadow-inner">
                    <p>{comment.content}</p>
                  </div>
                  <div className="flex items-center gap-6 mt-3 pl-2">
                    <button className="flex items-center gap-2 text-[11px] font-black text-stone-500 hover:text-primary transition-all uppercase tracking-widest group">
                      <Heart className="h-4 w-4 group-hover:fill-current" /> {comment.likes}
                    </button>
                    <button className="text-[11px] font-black text-stone-500 hover:text-primary transition-all uppercase tracking-widest">Répondre</button>
                  </div>
                </div>
              </div>
            </div>
          )) : (
            <div className="text-center py-20 opacity-30">
              <MessageSquare className="h-12 w-12 mx-auto mb-4" />
              <p className="text-stone-400 italic text-sm font-light">Le silence règne avant la tempête...</p>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-8 border-t border-white/5 bg-stone-900/50">
        <div className="relative group">
          <Textarea 
            placeholder="Partagez votre lumière..." 
            className="min-h-[120px] bg-white/5 border-white/10 rounded-3xl p-6 text-base text-white focus-visible:ring-primary focus-visible:bg-white/10 transition-all placeholder:text-stone-700"
          />
          <div className="absolute right-4 bottom-4 flex items-center gap-3">
            <Button variant="ghost" size="icon" className="h-10 w-10 text-stone-500 hover:text-white hover:bg-white/5 rounded-full"><Smile className="h-6 w-6" /></Button>
            <Button onClick={handlePostComment} size="icon" className="h-12 w-12 rounded-2xl bg-primary text-black shadow-2xl shadow-primary/30 gold-shimmer group-focus-within:scale-110 transition-transform">
              <SendHorizonal className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// #endregion

export default function ReaderPage(props: { params: Promise<{ slug: string, chapterSlug: string }> }) {
  const { slug, chapterSlug } = use(props.params);
  const { toast } = useToast();
  const { openAuthModal } = useAuthModal();
  const router = useRouter();
  
  const story = stories.find(s => s.slug === slug);
  if (!story) notFound();

  const chapter = story.chapters?.find(c => c.slug === chapterSlug) || story.chapters?.[0] || { id: '1', title: 'Chargement...', slug: '1' } as any;
  const artist = artists.find(a => a.uid === story.artistId);

  const [activeMode, setActiveMode] = useState<'scroll' | 'pages'>('scroll');
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [currentPage, setCurrentPage] = useState(0);
  const [isUIVisible, setIsUIVisible] = useState(true);
  const [particles, setParticles] = useState<{id: number, tx: string, ty: string, dur: string, del: string}[]>([]);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);

  useEffect(() => {
    // Generate end-chapter particles
    const newParticles = [...Array(12)].map((_, i) => ({
      id: i,
      tx: `${(Math.random() - 0.5) * 300}px`,
      ty: `${-Math.random() * 200 - 100}px`,
      dur: `${2 + Math.random() * 2}s`,
      del: `${Math.random() * 2}s`
    }));
    setParticles(newParticles);
  }, []);

  useEffect(() => {
    if (!carouselApi) return;
    
    const onSelect = () => {
      const current = carouselApi.selectedScrollSnap();
      setCurrentPage(current);
      if (activeMode === 'pages') {
        const total = carouselApi.scrollSnapList().length;
        setProgress(((current + 1) / total) * 100);
      }
    };

    carouselApi.on("select", onSelect);
    return () => {
      carouselApi.off("select", onSelect);
    };
  }, [carouselApi, activeMode]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const currentScrollY = target.scrollTop;
    
    // Zen Mode: Hide UI on scroll down, show on scroll up
    if (Math.abs(currentScrollY - lastScrollY.current) > 10) {
      setIsUIVisible(currentScrollY < lastScrollY.current || currentScrollY < 100);
      lastScrollY.current = currentScrollY;
    }

    if (activeMode === 'scroll') {
      const currentProgress = (target.scrollTop / (target.scrollHeight - target.clientHeight)) * 100;
      setProgress(currentProgress);
    }
  }, [activeMode]);

  const handleBookmark = () => {
    if (!auth.currentUser) {
      openAuthModal('sauvegarder ce chapitre');
      return;
    }
    setIsBookmarked(!isBookmarked);
    toast({ title: isBookmarked ? 'Retiré de votre bibliothèque' : 'Ajouté à votre bibliothèque !' });
  };

  const handleLike = () => {
    if (!auth.currentUser) {
      openAuthModal('aimer cette œuvre');
      return;
    }
    setIsLiked(!isLiked);
    if(!isLiked) toast({title: "Merci pour le like ! ❤️"});
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({ title: "Lien copié !", description: "Partagez la passion NexusHub." });
  };

  const handleChapterChange = (newSlug: string) => {
    router.push(getChapterUrl(story, newSlug));
  };

  return (
    <div className="h-screen bg-[#050505] flex flex-col selection:bg-primary/30 overflow-hidden text-stone-200">
      <ReaderHeader 
        story={story} 
        chapter={chapter} 
        activeMode={activeMode} 
        onModeChange={setActiveMode}
        onBookmark={handleBookmark}
        isBookmarked={isBookmarked}
        progress={progress}
        onChapterChange={handleChapterChange}
        isVisible={isUIVisible}
      />
      
      <div className="flex-1 flex overflow-hidden relative">
        <main 
          ref={scrollRef}
          onScroll={handleScroll}
          className={cn(
            "flex-1 overflow-y-auto transition-all duration-500 scroll-smooth hide-scrollbar",
            isCommentsOpen ? "w-1/2 border-r border-white/5" : "w-full"
          )}
        >
          {activeMode === 'scroll' ? (
            <div className="mx-auto flex flex-col items-center max-w-[800px] px-0">
              <div className="w-full space-y-0">
                {comicPages.map((page, index) => (
                  <div key={page.id} className="relative w-full aspect-[2/3] animate-in fade-in duration-1000">
                    <Image
                      src={getOptimizedImage(page.imageUrl, { width: 1000, quality: 90 })}
                      alt={page.description}
                      fill
                      className="object-contain md:object-cover"
                      data-ai-hint={page.imageHint}
                      priority={index < 2}
                      loading={index < 2 ? undefined : "lazy"}
                      sizes="(max-width: 768px) 100vw, 800px"
                    />
                  </div>
                ))}
              </div>
              
              {/* MAGICAL END OF CHAPTER */}
              <div className="w-full max-w-[800px] py-40 px-6 relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none">
                  {particles.map(p => (
                    <div 
                      key={p.id} 
                      className="absolute left-1/2 top-1/2 w-1.5 h-1.5 bg-primary rounded-full particle"
                      style={{ '--tx': p.tx, '--ty': p.ty, '--dur': p.dur, '--del': p.del } as any}
                    />
                  ))}
                </div>

                <div className="relative bg-stone-900/40 backdrop-blur-3xl border border-primary/20 rounded-[3rem] p-10 md:p-20 text-center overflow-hidden shadow-[0_0_100px_rgba(212,168,67,0.15)]">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
                  
                  <div className="relative z-10 space-y-10 animate-in zoom-in duration-1000">
                    <div className="flex flex-col items-center gap-6">
                      <div className="relative">
                        <div className="absolute inset-0 bg-primary blur-3xl opacity-20 animate-pulse" />
                        <div className="bg-primary/10 p-6 rounded-full w-fit relative border border-primary/30">
                          <Zap className="h-14 w-14 text-primary fill-primary/20" />
                        </div>
                      </div>
                      <h3 className="text-4xl md:text-6xl font-display font-black text-white gold-resplendant tracking-tighter leading-tight">
                        Légende <br/> Enregistrée
                      </h3>
                      <p className="text-stone-400 font-light italic max-w-md mx-auto text-lg leading-relaxed">
                        "Chaque chapitre lu est une pierre ajoutée à l'édifice de la culture africaine. Merci de porter cette lumière."
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-center gap-5 pt-6">
                      <Button size="lg" className="h-16 px-12 rounded-full font-black text-xl gold-shimmer group bg-primary text-black shadow-2xl shadow-primary/30 active:scale-95 transition-all">
                        Chapitre Suivant 
                        <ChevronRight className="ml-2 h-6 w-6 group-hover:translate-x-2 transition-transform" />
                      </Button>
                      <Button asChild variant="outline" size="lg" className="h-16 px-12 rounded-full border-white/10 text-white font-bold bg-white/5 hover:bg-white/10 backdrop-blur-xl active:scale-95 transition-all">
                        <Link href={`/webtoon/${story.slug}`}>Détails & Galerie</Link>
                      </Button>
                    </div>

                    <div className="pt-10 border-t border-white/5 flex flex-col items-center gap-4">
                      <p className="text-[10px] uppercase font-black tracking-[0.4em] text-stone-600">Soutenir {artist?.displayName}</p>
                      <div className="flex gap-3">
                        {[10, 50, 100].map(val => (
                          <Button key={val} variant="ghost" size="sm" className="h-10 w-16 rounded-xl border border-white/5 bg-white/5 text-xs font-black text-primary hover:bg-primary hover:text-black">
                            {val} 🪙
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-stone-950">
              <Carousel setApi={setCarouselApi} className="w-full h-full max-w-5xl">
                <CarouselContent className="h-full">
                  {comicPages.map((page, index) => (
                    <CarouselItem key={page.id} className="h-full flex items-center justify-center p-6">
                      <div className="relative w-full h-full max-h-[90vh] aspect-[2/3] rounded-2xl overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.8)] border border-white/5 group">
                        <Image
                          src={getOptimizedImage(page.imageUrl, { width: 1200, quality: 95 })}
                          alt={page.description}
                          fill
                          className="object-contain"
                          data-ai-hint={page.imageHint}
                          priority={index === currentPage}
                          sizes="(max-width: 1024px) 100vw, 1200px"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
            </div>
          )}
        </main>

        {isCommentsOpen && (
          <aside className="w-full md:w-1/2 animate-in slide-in-from-right duration-700 ease-out z-40">
            <CommentsPanel 
              storyId={story.id} 
              chapterIndex={story.chapters?.findIndex(c => c.id === chapter.id) + 1 || 1} 
              onClose={() => setIsCommentsOpen(false)} 
            />
          </aside>
        )}
      </div>

      <ReaderFooter 
        story={story}
        isLiked={isLiked}
        onLike={handleLike}
        commentsCount={story.chapterCount * 12}
        onShare={handleShare}
        onToggleComments={() => setIsCommentsOpen(!isCommentsOpen)}
        isCommentsOpen={isCommentsOpen}
        isVisible={isUIVisible}
      />
    </div>
  );
}