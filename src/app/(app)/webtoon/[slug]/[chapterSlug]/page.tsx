'use client';

import { useState, useEffect, use, useRef, useMemo } from 'react';
import { stories, comicPages, comments as allComments, artists, type Artist, type Chapter, type Story } from '@/lib/data';
import { notFound, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  Layers, Book, ChevronLeft, ChevronRight, Bookmark, Settings, Heart, MessageSquare, Share2, Award, Eye, Coins, Check, Star, Maximize2, Minimize2, ZoomIn, ZoomOut, Flag, ArrowLeft, SendHorizonal, Smile, Flame, ShieldCheck, Zap
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
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';

// #region Components

/**
 * En-tête minimaliste avec auto-hide
 */
function ReaderHeader({ story, chapter, onModeChange, activeMode, onBookmark, isBookmarked, isVisible, progress }: any) {
  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 h-14 bg-background/95 border-b border-border z-50 flex items-center justify-between px-5 backdrop-blur-xl transition-transform duration-500",
      !isVisible && "-translate-y-full"
    )}>
      {/* Barre de progression dorée */}
      <div 
        className="absolute bottom-0 left-0 h-0.5 bg-primary shadow-[0_0_10px_hsl(var(--primary))] transition-all duration-300 ease-out" 
        style={{ width: `${progress}%` }}
      />

      <div className="flex items-center gap-4 flex-1">
        <Button asChild variant="ghost" size="icon" className="text-primary hover:text-primary/80">
          <Link href={`/webtoon/${story.slug}`}><ArrowLeft className="h-5 w-5" /></Link>
        </Button>
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-black text-primary tracking-widest leading-none mb-1">{story.title}</span>
          <span className="text-xs font-bold text-foreground truncate max-w-[150px] sm:max-w-none">Chap. {chapter.title}</span>
        </div>
      </div>

      <div className="hidden lg:flex items-center gap-2 absolute left-1/2 -translate-x-1/2">
        <Button size="icon" variant="outline" className="w-8 h-8 border-primary/20"><ChevronLeft className="h-4 w-4" /></Button>
        <Select defaultValue={chapter.slug}>
          <SelectTrigger className="w-[220px] h-8 text-xs font-bold border-primary/20 bg-muted/30">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {story.chapters.map((chap: Chapter) => (
              <SelectItem key={chap.id} value={chap.slug} className="text-xs">
                {chap.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button size="icon" variant="outline" className="w-8 h-8 border-primary/20"><ChevronRight className="h-4 w-4" /></Button>
      </div>

      <div className="flex items-center gap-2 flex-1 justify-end">
        <div className="hidden sm:flex bg-card border border-border rounded-lg p-0.5">
          <Button onClick={() => onModeChange('scroll')} size="sm" variant={activeMode === 'scroll' ? 'default' : 'ghost'} className="h-7 text-[10px] font-black gap-1.5 uppercase">
            <Layers className="h-3 w-3" /> Webtoon
          </Button>
          <Button onClick={() => onModeChange('pages')} size="sm" variant={activeMode === 'pages' ? 'default' : 'ghost'} className="h-7 text-[10px] font-black gap-1.5 uppercase">
            <Book className="h-3 w-3" /> BD
          </Button>
        </div>
        <Button onClick={onBookmark} size="icon" variant="outline" className={cn("h-8 w-8", isBookmarked && "bg-primary/10 border-primary text-primary")}>
          <Bookmark className={cn("h-4 w-4", isBookmarked && "fill-current")} />
        </Button>
        <Button size="icon" variant="outline" className="h-8 w-8 md:flex hidden"><Settings className="h-4 w-4" /></Button>
      </div>
    </nav>
  );
}

/**
 * Barre de navigation inférieure avec auto-hide
 */
function ReaderFooter({ isVisible, story, chapter, isLiked, onLike, commentsCount, onShare }: any) {
  return (
    <div className={cn(
      "fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-background/80 backdrop-blur-2xl border border-white/10 p-2 rounded-full shadow-2xl transition-all duration-500",
      !isVisible && "translate-y-24 opacity-0"
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

      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" className="rounded-full gap-2 px-4 h-10 font-bold text-stone-300">
            <MessageSquare className="h-5 w-5" />
            <span className="text-xs">{commentsCount}</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-full sm:max-w-md p-0 bg-stone-950 border-white/5">
          <CommentsOverlay storyId={story.id} chapterIndex={1} />
        </SheetContent>
      </Sheet>

      <Button onClick={onShare} variant="ghost" size="icon" className="rounded-full text-stone-300 hover:text-primary"><Share2 className="h-5 w-5" /></Button>
      
      <Separator orientation="vertical" className="h-6 bg-white/10 mx-1" />

      <Button variant="ghost" size="icon" className="rounded-full text-stone-400 hover:text-primary"><ChevronRight className="h-5 w-5" /></Button>
    </div>
  );
}

/**
 * Overlay des commentaires avec anti-spoiler
 */
function CommentsOverlay({ storyId, chapterIndex }: { storyId: string, chapterIndex: number }) {
  const storyComments = allComments.filter(c => c.storyId === storyId && c.chapter === chapterIndex);
  
  // Simulation d'IA anti-spoiler
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

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-white/5 bg-stone-900/50">
        <h3 className="text-xl font-display font-black text-white flex items-center gap-3 gold-resplendant">
          <MessageSquare className="h-6 w-6 text-primary" /> Commentaires du Chapitre
        </h3>
        <p className="text-[10px] text-stone-400 uppercase font-bold tracking-widest mt-2">Partagez vos théories sans spoilers majeurs</p>
      </div>

      <ScrollArea className="flex-1 p-6">
        <div className="space-y-8">
          {storyComments.map((comment) => (
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
          ))}
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
            <Button size="icon" className="h-8 w-8 rounded-xl bg-primary text-black gold-shimmer shadow-lg">
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
  
  const story = stories.find(s => s.slug === slug);
  if (!story) notFound();

  const chapter = story.chapters.find(c => c.slug === chapterSlug) || story.chapters[0];
  const artist = artists.find(a => a.id === story.artistId)!;

  const [activeMode, setActiveMode] = useState('scroll');
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [uiVisible, setUiVisible] = useState(true);
  const [progress, setProgress] = useState(0);
  const lastScrollY = useRef(0);
  const hideTimeout = useRef<any>(null);

  // Gestion du auto-hide et progression
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const currentProgress = (currentScrollY / docHeight) * 100;
      setProgress(currentProgress);

      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        setUiVisible(false);
      } else {
        setUiVisible(true);
      }
      lastScrollY.current = currentScrollY;

      // Reset timer pour ré-afficher au scroll stop (optionnel)
      if (hideTimeout.current) clearTimeout(hideTimeout.current);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    toast({ title: isBookmarked ? 'Retiré de votre bibliothèque' : 'Ajouté à votre bibliothèque !' });
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({ title: "Lien copié !", description: "Partagez la passion NexusHub." });
  };

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col selection:bg-primary/30">
      <ReaderHeader 
        story={story} 
        chapter={chapter} 
        activeMode={activeMode} 
        onModeChange={setActiveMode}
        onBookmark={handleBookmark}
        isBookmarked={isBookmarked}
        isVisible={uiVisible}
        progress={progress}
      />
      
      <div className="flex-1 w-full">
        <main className={cn(
          "mx-auto flex flex-col items-center",
          activeMode === 'scroll' ? "max-w-[800px]" : "max-w-[1200px] p-4 md:p-12"
        )}>
          {/* Contenu Lecture */}
          <div className={cn(
            "w-full transition-all duration-700",
            activeMode === 'scroll' ? "space-y-0" : "flex flex-wrap justify-center gap-6"
          )}>
            {comicPages.map((page, index) => (
              <div 
                key={page.id} 
                className={cn(
                  "relative transition-all duration-500",
                  activeMode === 'scroll' 
                    ? "w-full aspect-[2/3] mb-4 sm:mb-8" 
                    : "w-[45%] md:w-[30%] aspect-[2/3] rounded-xl overflow-hidden shadow-2xl border border-white/5 hover:border-primary/30 group"
                )}
              >
                <Image
                  src={page.imageUrl}
                  alt={page.description}
                  fill
                  className={cn(
                    "object-contain md:object-cover transition-transform duration-700",
                    activeMode === 'pages' && "group-hover:scale-105"
                  )}
                  data-ai-hint={page.imageHint}
                  priority={index < 3}
                />
                {activeMode === 'pages' && (
                  <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-[10px] font-mono text-white/80">
                    Page {index + 1}
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {/* FIN DU CHAPITRE - BLOC GOLD */}
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

                <div className="pt-6">
                  <button onClick={() => toast({title: "Merci pour votre générosité ! 🪙"})} className="text-primary font-black uppercase tracking-[0.2em] text-xs hover:underline flex items-center gap-2 mx-auto">
                    <Coins className="h-4 w-4" /> Soutenir l'Artiste avec des AfriCoins
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <ReaderFooter 
        isVisible={uiVisible}
        story={story}
        chapter={chapter}
        isLiked={isLiked}
        onLike={() => {setIsLiked(!isLiked); if(!isLiked) toast({title: "Merci pour le like ! ❤️"});}}
        commentsCount={story.chapters.length * 15} // Simulation
        onShare={handleShare}
      />

      {/* Mode Immersion / Plein Écran */}
      <Button 
        variant="ghost" 
        size="icon" 
        className="fixed bottom-6 right-6 z-50 rounded-full bg-black/40 backdrop-blur-md text-stone-400 border border-white/10 hover:text-primary md:flex hidden"
        onClick={() => {
          if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
          } else {
            document.exitFullscreen();
          }
        }}
      >
        <Maximize2 className="h-5 w-5" />
      </Button>
    </div>
  );
}
