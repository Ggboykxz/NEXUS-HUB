'use client';

import { useState, useEffect, use, useRef } from 'react';
import { stories, comicPages, comments as allComments, artists, type Chapter, getChapterUrl } from '@/lib/data';
import { notFound, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  Layers, Book, ChevronLeft, ChevronRight, Bookmark, Settings, Heart, MessageSquare, Share2, ArrowLeft, SendHorizonal, Smile, Flame, Zap, X
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

// #region Components

/**
 * En-tête fixe avec numéro de chapitre
 * Ajusté avec top-14 pour se placer sous le header principal
 */
function ReaderHeader({ story, chapter, onModeChange, activeMode, onBookmark, isBookmarked, progress, onChapterChange }: any) {
  const chapterNumber = story.chapters.findIndex((c: any) => c.slug === chapter.slug) + 1;

  return (
    <nav className="fixed top-14 left-0 right-0 h-11 bg-background/95 border-b border-border z-40 flex items-center justify-between px-5 backdrop-blur-xl transition-all">
      <div 
        className="absolute bottom-0 left-0 h-0.5 bg-primary shadow-[0_0_10px_hsl(var(--primary))] transition-all duration-300 ease-out" 
        style={{ width: `${progress}%` }}
      />

      <div className="flex items-center gap-4 flex-1">
        <Button asChild variant="ghost" size="icon" className="text-primary hover:text-primary/80 h-8 w-8">
          <Link href={`/webtoon/${story.slug}`}><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div className="flex flex-col justify-center">
          <span className="text-[9px] uppercase font-black text-primary tracking-widest leading-none mb-0.5">{story.title}</span>
          <span className="text-[11px] font-bold text-foreground truncate max-w-[120px] sm:max-w-none">Chapitre {chapterNumber} : {chapter.title}</span>
        </div>
      </div>

      <div className="hidden lg:flex items-center gap-2 absolute left-1/2 -translate-x-1/2">
        <Button size="icon" variant="outline" className="w-7 h-7 border-primary/20"><ChevronLeft className="h-3.5 w-3.5" /></Button>
        <Select defaultValue={chapter.slug} onValueChange={onChapterChange}>
          <SelectTrigger className="w-[220px] h-7 text-[10px] font-bold border-primary/20 bg-muted/30">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {story.chapters.map((chap: Chapter, idx: number) => (
              <SelectItem key={chap.id} value={chap.slug} className="text-[10px]">
                Chapitre {idx + 1} : {chap.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button size="icon" variant="outline" className="w-7 h-7 border-primary/20"><ChevronRight className="h-3.5 w-3.5" /></Button>
      </div>

      <div className="flex items-center gap-2 flex-1 justify-end">
        <div className="hidden sm:flex bg-card border border-border rounded-lg p-0.5">
          <Button onClick={() => onModeChange('scroll')} size="sm" variant={activeMode === 'scroll' ? 'default' : 'ghost'} className="h-6 text-[9px] font-black gap-1 uppercase px-2">
            <Layers className="h-3 w-3" /> Webtoon
          </Button>
          <Button onClick={() => onModeChange('pages')} size="sm" variant={activeMode === 'pages' ? 'default' : 'ghost'} className="h-6 text-[9px] font-black gap-1 uppercase px-2">
            <Book className="h-3 w-3" /> BD
          </Button>
        </div>
        <Button onClick={onBookmark} size="icon" variant="outline" className={cn("h-7 w-7", isBookmarked && "bg-primary/10 border-primary text-primary")}>
          <Bookmark className={cn("h-3.5 w-3.5", isBookmarked && "fill-current")} />
        </Button>
        <Button size="icon" variant="outline" className="h-7 w-7 md:flex hidden"><Settings className="h-3.5 w-3.5" /></Button>
      </div>
    </nav>
  );
}

function ReaderFooter({ story, isLiked, onLike, commentsCount, onShare, onToggleComments, isCommentsOpen }: any) {
  return (
    <div className={cn(
      "fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-background/80 backdrop-blur-2xl border border-white/10 p-2 rounded-full shadow-2xl transition-all duration-500",
      isCommentsOpen && "translate-x-[-100%] md:translate-x-[-150%]"
    )}>
      <Button variant="ghost" size="icon" className="rounded-full text-stone-400 hover:text-primary"><ChevronLeft className="h-5 w-5" /></Button>
      
      <Separator orientation="vertical" className="h-6 bg-white/10 mx-1" />
      
      <Button 
        onClick={onLike}
        variant="ghost" 
        className={cn("rounded-full gap-2 px-4 h-10 font-bold", isLiked ? "text-primary bg-primary/10" : "text-stone-300")}
      >
        <Heart className={cn("h-5 w-5", isLiked && "fill-current")} />
        <span className="text-xs">{(story.likes / 1000).toFixed(1)}k</span>
      </Button>

      <Button 
        onClick={onToggleComments}
        variant="ghost" 
        className={cn("rounded-full gap-2 px-4 h-10 font-bold", isCommentsOpen ? "text-primary bg-primary/10" : "text-stone-300")}
      >
        <MessageSquare className={cn("h-5 w-5", isCommentsOpen && "fill-current")} />
        <span className="text-xs">{commentsCount}</span>
      </Button>

      <Button onClick={onShare} variant="ghost" size="icon" className="rounded-full text-stone-300 hover:text-primary"><Share2 className="h-5 w-5" /></Button>
      
      <Separator orientation="vertical" className="h-6 bg-white/10 mx-1" />

      <Button variant="ghost" size="icon" className="rounded-full text-stone-400 hover:text-primary"><ChevronRight className="h-5 w-5" /></Button>
    </div>
  );
}

function CommentsPanel({ storyId, chapterIndex, onClose }: { storyId: string, chapterIndex: number, onClose: () => void }) {
  const { openAuthModal } = useAuthModal();
  const isLoggedIn = typeof window !== 'undefined' ? localStorage.getItem('isLoggedIn') === 'true' : false;
  const storyComments = allComments.filter(c => c.storyId === storyId && c.chapter === chapterIndex);
  
  const processComment = (text: string) => {
    const keywords = ["spoiler", "mort", "fin", "trahison", "révélation"];
    let containsSensitive = false;
    keywords.forEach(word => {
      if (text.toLowerCase().includes(word)) containsSensitive = true;
    });

    if (containsSensitive) {
      return (
        <details className="group/spoiler cursor-pointer">
          <summary className="text-[10px] font-black text-primary uppercase tracking-widest mb-2 flex items-center gap-2 list-none">
            <Flame className="h-3 w-3" /> Spoiler potentiel : Cliquer pour voir
          </summary>
          <p className="pl-4 border-l-2 border-primary/20 py-1 transition-all">{text}</p>
        </details>
      );
    }
    return <p>{text}</p>;
  };

  const handlePostComment = () => {
    if (!isLoggedIn) {
      openAuthModal('poster votre commentaire');
      return;
    }
    // Post comment logic
  };

  return (
    <div className="flex flex-col h-full bg-stone-950 border-l border-white/10">
      <div className="p-6 border-b border-white/5 bg-stone-900/50 flex items-center justify-between">
        <div>
          <h3 className="text-xl font-display font-black text-white flex items-center gap-3 gold-resplendant">
            <MessageSquare className="h-6 w-6 text-primary" /> Communauté
          </h3>
          <p className="text-[10px] text-stone-400 uppercase font-bold tracking-widest mt-1">Lecture & Débat en simultané</p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="text-stone-500 hover:text-white rounded-full">
          <X className="h-5 w-5" />
        </Button>
      </div>

      <ScrollArea className="flex-1 p-6">
        <div className="space-y-8">
          {storyComments.length > 0 ? storyComments.map((comment) => (
            <div key={comment.id} className="group animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="flex items-start gap-4">
                <Avatar className="h-10 w-10 border-2 border-white/5 group-hover:border-primary/30 transition-all">
                  <AvatarImage src={comment.authorAvatar.imageUrl} />
                  <AvatarFallback>{comment.authorName[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="font-bold text-sm text-stone-200">{comment.authorName}</span>
                    <Badge variant="outline" className="text-[8px] h-4 uppercase border-primary/20 text-primary">{comment.authorBadge || 'Lecteur'}</Badge>
                    <span className="text-[9px] text-stone-500 font-bold uppercase ml-auto">{comment.timestamp}</span>
                  </div>
                  <div className="text-sm text-stone-400 leading-relaxed font-light bg-white/5 p-3 rounded-2xl rounded-tl-none border border-white/5">
                    {processComment(comment.content)}
                  </div>
                  <div className="flex items-center gap-4 mt-2">
                    <button className="flex items-center gap-1.5 text-[10px] font-black text-stone-500 hover:text-primary transition-all">
                      <Heart className="h-3 w-3" /> {comment.likes}
                    </button>
                    <button className="text-[10px] font-black text-stone-500 hover:text-primary transition-all uppercase">Répondre</button>
                  </div>
                </div>
              </div>
            </div>
          )) : (
            <div className="text-center py-12">
              <p className="text-stone-500 italic text-sm">Soyez le premier à commenter ce chapitre !</p>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-6 border-t border-white/5 bg-stone-900/50">
        <div className="relative">
          <Textarea 
            placeholder="Écrivez avec bienveillance..." 
            className="min-h-[100px] bg-white/5 border-white/10 rounded-2xl p-4 text-sm text-white font-light focus-visible:ring-primary"
          />
          <div className="absolute right-3 bottom-3 flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-stone-500"><Smile className="h-5 w-5" /></Button>
            <Button onClick={handlePostComment} size="icon" className="h-8 w-8 rounded-xl bg-primary text-black gold-shimmer shadow-lg">
              <SendHorizonal className="h-4 w-4" />
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

  const chapter = story.chapters.find(c => c.slug === chapterSlug) || story.chapters[0];
  const artist = artists.find(a => a.id === story.artistId)!;

  const [activeMode, setActiveMode] = useState('scroll');
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [currentPage, setCurrentPage] = useState(0);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  // Synchronise progress with carousel in 'pages' mode
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

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (activeMode === 'scroll') {
      const target = e.currentTarget;
      const currentProgress = (target.scrollTop / (target.scrollHeight - target.clientHeight)) * 100;
      setProgress(currentProgress);
    }
  };

  const handleBookmark = () => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!isLoggedIn) {
      openAuthModal('sauvegarder ce chapitre');
      return;
    }
    setIsBookmarked(!isBookmarked);
    toast({ title: isBookmarked ? 'Retiré de votre bibliothèque' : 'Ajouté à votre bibliothèque !' });
  };

  const handleLike = () => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!isLoggedIn) {
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

  // BD Navigation handlers
  const handlePagePrev = () => {
    carouselApi?.scrollPrev();
  };

  const handlePageNext = () => {
    carouselApi?.scrollNext();
  };

  // Custom click handler for BD images with side detection
  const handleImageClick = (e: React.MouseEvent) => {
    if (activeMode !== 'pages') return;
    
    // Check if it's a context menu (right click)
    if (e.type === 'contextmenu') {
      e.preventDefault();
      handlePageNext();
      return;
    }

    // Left click handling with side detection
    if (e.button === 0) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left; // Click position relative to element
      const width = rect.width;
      
      if (x < width / 2) {
        // Clicked left side -> Previous
        handlePagePrev();
      } else {
        // Clicked right side -> Next
        handlePageNext();
      }
    }
  };

  return (
    <div className="h-screen bg-[#050505] flex flex-col selection:bg-primary/30 overflow-hidden">
      <ReaderHeader 
        story={story} 
        chapter={chapter} 
        activeMode={activeMode} 
        onModeChange={setActiveMode}
        onBookmark={handleBookmark}
        isBookmarked={isBookmarked}
        progress={progress}
        onChapterChange={handleChapterChange}
      />
      
      <div className="flex-1 flex overflow-hidden pt-[100px] relative">
        <main 
          ref={scrollRef}
          onScroll={handleScroll}
          className={cn(
            "flex-1 overflow-y-auto transition-all duration-500 scroll-smooth",
            isCommentsOpen ? "w-1/2 border-r border-white/5" : "w-full"
          )}
        >
          {activeMode === 'scroll' ? (
            <div className="mx-auto flex flex-col items-center py-8 max-w-[800px] px-0">
              <div className="w-full space-y-0">
                {comicPages.map((page, index) => (
                  <div 
                    key={page.id} 
                    className="relative w-full aspect-[2/3] mb-4 sm:mb-8"
                  >
                    <Image
                      src={page.imageUrl}
                      alt={page.description}
                      fill
                      className="object-contain md:object-cover"
                      data-ai-hint={page.imageHint}
                      priority={index < 3}
                    />
                  </div>
                ))}
              </div>
              
              <div className="w-full max-w-[800px] py-32 px-6">
                <div className="relative bg-stone-900 border border-primary/20 rounded-[2.5rem] p-8 md:p-16 text-center overflow-hidden shadow-[0_0_50px_rgba(212,168,67,0.1)]">
                  <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -z-0" />
                  <div className="absolute bottom-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -z-0" />
                  
                  <div className="relative z-10 space-y-8 animate-in zoom-in duration-1000">
                    <div className="flex flex-col items-center gap-4">
                      <div className="bg-primary/10 p-4 rounded-full w-fit gold-shimmer">
                        <Zap className="h-10 w-10 text-primary" />
                      </div>
                      <h3 className="text-3xl md:text-5xl font-display font-black text-white gold-resplendant">Chapitre Terminé !</h3>
                      <p className="text-stone-400 font-light italic max-w-md mx-auto">
                        "L'histoire ne fait que commencer. Votre soutien permet à {artist.name} de continuer cette légende."
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-4 py-8 border-y border-white/5">
                      <div>
                        <p className="text-2xl font-black text-white">12m</p>
                        <p className="text-[10px] uppercase font-bold text-stone-500 tracking-widest">Lecture</p>
                      </div>
                      <div>
                        <p className="text-2xl font-black text-white">{(story.views / 1000).toFixed(0)}k</p>
                        <p className="text-[10px] uppercase font-bold text-stone-500 tracking-widest">Lecteurs</p>
                      </div>
                      <div>
                        <p className="text-2xl font-black text-white">4.9</p>
                        <p className="text-[10px] uppercase font-bold text-stone-500 tracking-widest">Note</p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
                      <Button size="lg" className="h-14 px-10 rounded-full font-black text-lg gold-shimmer group bg-primary text-black">
                        Chapitre Suivant 
                        <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                      </Button>
                      <Button asChild variant="outline" size="lg" className="h-14 px-10 rounded-full border-white/20 text-white font-bold bg-white/5 hover:bg-white/10">
                        <Link href={`/webtoon/${story.slug}`}>Détails de l'œuvre</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* BD Mode: One page at a time with swipe and click navigation */
            <div className="h-full w-full flex items-center justify-center py-4">
              <Carousel 
                setApi={setCarouselApi} 
                className="w-full h-full max-w-4xl"
                opts={{
                  align: "center",
                  loop: false
                }}
              >
                <CarouselContent className="h-full">
                  {comicPages.map((page, index) => (
                    <CarouselItem key={page.id} className="h-full flex items-center justify-center p-4">
                      <div 
                        className="relative w-full h-full max-h-[85vh] aspect-[2/3] rounded-xl overflow-hidden shadow-2xl border border-white/10 cursor-pointer select-none"
                        onClick={handleImageClick}
                        onContextMenu={(e) => { e.preventDefault(); handleImageClick(e); }}
                      >
                        <Image
                          src={page.imageUrl}
                          alt={page.description}
                          fill
                          className="object-contain"
                          data-ai-hint={page.imageHint}
                          priority={index === currentPage}
                        />
                        <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] font-black text-white/80 uppercase tracking-widest border border-white/10">
                          Planche {index + 1} / {comicPages.length}
                        </div>
                        
                        {/* Interactive tooltips for onboarding */}
                        {index === 0 && (
                          <div className="absolute inset-0 pointer-events-none flex items-center justify-between px-8 opacity-0 hover:opacity-100 transition-opacity duration-500">
                            <div className="bg-primary/20 backdrop-blur-sm p-4 rounded-xl border border-primary/30 text-white text-[10px] font-black uppercase text-center animate-pulse">
                              Bord Gauche<br/>PRÉCÉDENT
                            </div>
                            <div className="bg-primary/20 backdrop-blur-sm p-4 rounded-xl border border-primary/30 text-white text-[10px] font-black uppercase text-center animate-pulse">
                              Bord Droit<br/>SUIVANT
                            </div>
                          </div>
                        )}
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                
                {/* Navigation controls shown on desktop */}
                <div className="hidden lg:block">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="absolute left-10 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-black/20 border-white/10 text-white hover:bg-primary hover:text-black transition-all"
                    onClick={handlePagePrev}
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="absolute right-10 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-black/20 border-white/10 text-white hover:bg-primary hover:text-black transition-all"
                    onClick={handlePageNext}
                  >
                    <ChevronRight className="h-6 w-6" />
                  </Button>
                </div>
              </Carousel>
            </div>
          )}
        </main>

        {isCommentsOpen && (
          <aside className="w-full md:w-1/2 animate-in slide-in-from-right duration-500 ease-out">
            <CommentsPanel 
              storyId={story.id} 
              chapterIndex={story.chapters.findIndex(c => c.id === chapter.id) + 1} 
              onClose={() => setIsCommentsOpen(false)} 
            />
          </aside>
        )}
      </div>

      <ReaderFooter 
        story={story}
        isLiked={isLiked}
        onLike={handleLike}
        commentsCount={story.chapters.length * 15}
        onShare={handleShare}
        onToggleComments={() => setIsCommentsOpen(!isCommentsOpen)}
        isCommentsOpen={isCommentsOpen}
      />
    </div>
  );
}
