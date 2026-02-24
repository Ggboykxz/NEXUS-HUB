
'use client';

import { useState, useEffect, use, useRef, useCallback, useMemo } from 'react';
import { stories, comicPages, comments as allComments, artists, getChapterUrl } from '@/lib/data';
import { notFound, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  Layers, Book, ChevronLeft, ChevronRight, Bookmark, Settings, Heart, MessageSquare, Share2, ArrowLeft, SendHorizonal, Smile, Zap, X, Maximize2, Minimize2, Eye, MonitorPlay, ScanEye, Sun, Moon, Map, Flag, Info, Star, ListPlus, Download
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
import { Slider } from '@/components/ui/slider';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi
} from "@/components/ui/carousel";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuthModal } from '@/components/providers/auth-modal-provider';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import type { Story, Chapter } from '@/lib/types';
import { getOptimizedImage } from '@/lib/image-utils';

export default function ReaderPage(props: { params: Promise<{ slug: string, chapterSlug: string }> }) {
  const { slug, chapterSlug } = use(props.params);
  const { toast } = useToast();
  const { openAuthModal } = useAuthModal();
  const router = useRouter();
  
  const story = stories.find(s => s.slug === slug);
  if (!story) notFound();

  const chapter = story.chapters?.find(c => c.slug === chapterSlug) || story.chapters?.[0] || { id: '1', title: 'Chargement...', slug: '1' } as any;
  const artist = artists.find(a => a.uid === story.artistId);

  // --- Cinematic State ---
  const [activeMode, setActiveMode] = useState<'scroll' | 'pages' | 'panels'>('scroll');
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [blueLightFilter, setBlueLightFilter] = useState(0);
  const [currentPanelIndex, setCurrentPanelIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [currentPage, setCurrentPage] = useState(0);
  const [isUIVisible, setIsUIVisible] = useState(true);
  const [particles, setParticles] = useState<{id: number, tx: string, ty: string, dur: string, del: string}[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);
  const progressTimer = useRef<NodeJS.Timeout | null>(null);

  // Simulated Panels
  const panels = useMemo(() => {
    return comicPages.flatMap((page, pageIdx) => [
      { id: `${page.id}-1`, url: page.imageUrl, pageIdx, region: 'top' },
      { id: `${page.id}-2`, url: page.imageUrl, pageIdx, region: 'bottom' }
    ]);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => setCurrentUser(user));
    return () => unsubscribe();
  }, []);

  // Sync Progress to Firestore (Debounced)
  useEffect(() => {
    if (!currentUser || progress === 0) return;

    if (progressTimer.current) clearTimeout(progressTimer.current);
    
    progressTimer.current = setTimeout(async () => {
      try {
        const libRef = doc(db, 'users', currentUser.uid, 'library', story.id);
        await setDoc(libRef, {
          storyId: story.id,
          storyTitle: story.title,
          storyCover: story.coverImage.imageUrl,
          lastReadChapterId: chapter.id,
          lastReadChapterSlug: chapter.slug,
          lastReadChapterTitle: chapter.title,
          lastReadAt: serverTimestamp(),
          progress: Math.floor(progress),
        }, { merge: true });
      } catch (e) {
        console.error("Progression sync error", e);
      }
    }, 3000);

    return () => {
      if (progressTimer.current) clearTimeout(progressTimer.current);
    };
  }, [progress, currentUser, story, chapter]);

  useEffect(() => {
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
    return () => carouselApi.off("select", onSelect);
  }, [carouselApi, activeMode]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const currentScrollY = target.scrollTop;
    
    if (Math.abs(currentScrollY - lastScrollY.current) > 10) {
      setIsUIVisible(currentScrollY < lastScrollY.current || currentScrollY < 100);
      lastScrollY.current = currentScrollY;
    }

    if (activeMode === 'scroll') {
      const currentProgress = (target.scrollTop / (target.scrollHeight - target.clientHeight)) * 100;
      setProgress(currentProgress);
    }
  }, [activeMode]);

  const toggleFocus = () => {
    setIsFocusMode(!isFocusMode);
    toast({ 
      title: isFocusMode ? "Mode Standard" : "Mode Focus Activé", 
      description: isFocusMode ? "L'interface est de retour." : "Immersion totale."
    });
  };

  const handleBookmarkPanel = () => {
    if (!currentUser) {
      openAuthModal('enregistrer vos moments préférés');
      return;
    }
    toast({
      title: "Moment immortalisé !",
      description: "Cette case a été ajoutée à vos favoris personnels.",
    });
  };

  const handleSharePanel = () => {
    toast({
      title: "Prêt à partager",
      description: "Exportation de la case pour vos stories...",
    });
  };

  return (
    <div className={cn(
      "h-screen bg-black flex flex-col selection:bg-primary/30 overflow-hidden text-stone-200 transition-colors duration-1000",
      isFocusMode && "cursor-none"
    )}>
      {/* Blue Light Filter Overlay */}
      <div 
        className="fixed inset-0 pointer-events-none z-[100] transition-opacity duration-500" 
        style={{ backgroundColor: `rgba(255, 150, 0, ${blueLightFilter / 400})`, opacity: blueLightFilter > 0 ? 1 : 0 }}
      />

      {/* HEADER */}
      <nav className={cn(
        "fixed top-0 left-0 right-0 h-14 bg-background/90 border-b border-white/5 z-50 flex items-center justify-between px-5 backdrop-blur-2xl reader-ui-transition",
        (!isUIVisible && !isFocusMode) && "reader-ui-hidden",
        isFocusMode && "opacity-0 pointer-events-none"
      )}>
        <div className="absolute bottom-0 left-0 h-0.5 bg-primary shadow-[0_0_15px_hsl(var(--primary))] transition-all duration-300 ease-out z-50" style={{ width: `${progress}%` }} />
        
        <div className="flex items-center gap-4 flex-1">
          <Button asChild variant="ghost" size="icon" className="text-primary h-9 w-9 rounded-full bg-white/5">
            <Link href={`/webtoon/${story.slug}`}><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <div className="flex flex-col justify-center">
            <span className="text-[10px] uppercase font-black text-primary tracking-[0.2em] leading-none mb-1">{story.title}</span>
            <span className="text-xs font-bold text-foreground truncate max-w-[120px]">Ch. {chapter.chapterNumber} : {chapter.title}</span>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-2">
          <Select defaultValue={activeMode} onValueChange={(val: any) => setActiveMode(val)}>
            <SelectTrigger className="w-[140px] h-9 text-xs font-black border-white/10 bg-white/5 rounded-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="scroll">Mode Scroll</SelectItem>
              <SelectItem value="pages">Mode Page</SelectItem>
              <SelectItem value="panels">Mode Case</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2 flex-1 justify-end">
          <Button onClick={handleBookmarkPanel} size="icon" variant="ghost" className="h-9 w-9 rounded-full bg-white/5">
            <Bookmark className="h-4 w-4" />
          </Button>
          <Button onClick={toggleFocus} size="icon" variant="ghost" className="h-9 w-9 rounded-full bg-white/5">
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
      </nav>
      
      <div className="flex-1 flex overflow-hidden relative">
        <main 
          ref={scrollRef}
          onScroll={handleScroll}
          className={cn(
            "flex-1 overflow-y-auto transition-all duration-700 scroll-smooth hide-scrollbar",
            isCommentsOpen ? "w-1/2 border-r border-white/5" : "w-full"
          )}
        >
          {activeMode === 'scroll' && (
            <div className="mx-auto flex flex-col items-center max-w-[800px] px-0">
              {comicPages.map((page, index) => (
                <div key={page.id} className="relative w-full aspect-[2/3] animate-in fade-in duration-1000 group">
                  <Image
                    src={getOptimizedImage(page.imageUrl, { width: 1000, quality: 90 })}
                    alt={page.description}
                    fill
                    className="object-contain md:object-cover transition-transform duration-500"
                    priority={index < 2}
                  />
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-2">
                    <Button onClick={handleBookmarkPanel} size="icon" variant="secondary" className="h-10 w-10 rounded-full shadow-2xl bg-black/60 backdrop-blur-md border border-white/10 text-white hover:text-primary">
                      <Bookmark className="h-5 w-5" />
                    </Button>
                    <Button onClick={handleSharePanel} size="icon" variant="secondary" className="h-10 w-10 rounded-full shadow-2xl bg-black/60 backdrop-blur-md border border-white/10 text-white hover:text-primary">
                      <Share2 className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              ))}
              <ChapterEndCard story={story} particles={particles} />
            </div>
          )}

          {activeMode === 'pages' && (
            <div className="h-full w-full flex items-center justify-center bg-black">
              <Carousel setApi={setCarouselApi} className="w-full h-full max-w-5xl">
                <CarouselContent className="h-full">
                  {comicPages.map((page, index) => (
                    <CarouselItem key={page.id} className="h-full flex items-center justify-center p-4">
                      <div className="relative w-full h-full max-h-[95vh] aspect-[2/3] rounded-xl overflow-hidden shadow-2xl border border-white/5">
                        <Image src={page.imageUrl} alt={page.description} fill className="object-contain" priority={index === currentPage} />
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
            <CommentsPanel storyId={story.id} chapterIndex={chapter.chapterNumber} onClose={() => setIsCommentsOpen(false)} />
          </aside>
        )}
      </div>

      {!isFocusMode && (
        <div className={cn(
          "fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-stone-900/80 backdrop-blur-3xl border border-white/10 p-2 rounded-full shadow-2xl transition-all duration-500",
          !isUIVisible && "translate-y-20 opacity-0"
        )}>
          <Button onClick={() => setIsLiked(!isLiked)} variant="ghost" className={cn("rounded-full gap-2.5 px-6 h-11 font-black transition-all", isLiked ? "text-primary bg-primary/10" : "text-stone-300")}>
            <Heart className={cn("h-5 w-5", isLiked && "fill-current")} />
            <span className="text-sm">{(story.likes / 1000).toFixed(1)}k</span>
          </Button>
          <Button onClick={() => setIsCommentsOpen(!isCommentsOpen)} variant="ghost" className={cn("rounded-full gap-2.5 px-6 h-11 font-black transition-all", isCommentsOpen ? "text-primary bg-primary/10" : "text-stone-300")}>
            <MessageSquare className={cn("h-5 w-5", isCommentsOpen && "fill-current")} />
            <span className="text-sm">42</span>
          </Button>
          <Button onClick={() => toast({ title: "Lien copié" })} variant="ghost" size="icon" className="rounded-full h-11 w-11 text-stone-300 hover:text-primary"><Share2 className="h-5 w-5" /></Button>
        </div>
      )}
    </div>
  );
}

function ChapterEndCard({ story, particles }: any) {
  return (
    <div className="w-full max-w-[800px] py-40 px-6 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        {particles.map((p: any) => (
          <div key={p.id} className="absolute left-1/2 top-1/2 w-1.5 h-1.5 bg-primary rounded-full particle" style={{ '--tx': p.tx, '--ty': p.ty, '--dur': p.dur, '--del': p.del } as any} />
        ))}
      </div>
      <div className="relative bg-stone-900/40 backdrop-blur-3xl border border-primary/20 rounded-[3rem] p-10 md:p-20 text-center overflow-hidden shadow-2xl">
        <div className="relative z-10 space-y-10">
          <div className="flex flex-col items-center gap-6">
            <div className="bg-primary/10 p-6 rounded-full w-fit border border-primary/30"><Zap className="h-14 w-14 text-primary fill-primary/20" /></div>
            <h3 className="text-4xl md:text-6xl font-display font-black text-white gold-resplendant tracking-tighter leading-tight">Légende Enregistrée</h3>
          </div>
          <Button size="lg" className="h-16 px-12 rounded-full font-black text-xl gold-shimmer group bg-primary text-black">
            Chapitre Suivant <ChevronRight className="ml-2 h-6 w-6 group-hover:translate-x-2 transition-transform" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function CommentsPanel({ storyId, chapterIndex, onClose }: any) {
  return (
    <div className="flex flex-col h-full bg-stone-950 border-l border-white/10 shadow-2xl">
      <div className="p-8 border-b border-white/5 bg-stone-900/30 flex items-center justify-between">
        <h3 className="text-2xl font-display font-black text-white flex items-center gap-3 gold-resplendant">
          <MessageSquare className="h-7 w-7 text-primary" /> Communauté
        </h3>
        <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full h-10 w-10"><X className="h-6 w-6" /></Button>
      </div>
      <ScrollArea className="flex-1 p-8">
        <div className="text-center py-20 opacity-30">
          <MessageSquare className="h-12 w-12 mx-auto mb-4" />
          <p className="text-stone-400 italic text-sm font-light">Le silence règne avant la tempête...</p>
        </div>
      </ScrollArea>
      <div className="p-8 border-t border-white/5">
        <Textarea placeholder="Partagez votre lumière..." className="min-h-[100px] bg-white/5 border-white/10 rounded-2xl p-4" />
      </div>
    </div>
  );
}
