'use client';

import { useState, useEffect, use, useRef, useCallback, useMemo } from 'react';
import { stories, comicPages, comments as allComments, getChapterUrl } from '@/lib/data';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  Bookmark, Settings, Heart, MessageSquare, Share2, ArrowLeft, ChevronRight, Eye, MonitorPlay, Sun, Moon, Map, Flag, Info, Star, Download, Flame, MessageCircle, AlertCircle, Volume2, Database, BatteryMedium, SlidersHorizontal, X
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useAuthModal } from '@/components/providers/auth-modal-provider';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { getOptimizedImage } from '@/lib/image-utils';
import { useTranslation } from '@/components/providers/language-provider';

export default function ReaderPage(props: { params: Promise<{ slug: string, chapterSlug: string }> }) {
  const { slug, chapterSlug } = use(props.params);
  const { toast } = useToast();
  const { openAuthModal } = useAuthModal();
  const { t } = useTranslation();
  
  const story = stories.find(s => s.slug === slug);
  if (!story) notFound();

  const chapter = story.chapters?.find(c => c.slug === chapterSlug) || story.chapters?.[0] || { id: '1', title: 'Chargement...', slug: '1', chapterNumber: 1 } as any;
  
  // --- States ---
  const [activeMode, setActiveMode] = useState<'scroll' | 'pages'>('scroll');
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [activePanelIndex, setActivePanelIndex] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const [isUIVisible, setIsUIVisible] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [panelReactions, setPanelReactions] = useState<Record<number, Record<string, number>>>({});
  
  // Accessibility States
  const [isLowData, setIsLowData] = useState(false);
  const [isBatterySaver, setIsBatterySaver] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => setCurrentUser(user));
    return () => unsubscribe();
  }, []);

  // Mode Batterie Éco
  useEffect(() => {
    if (isBatterySaver) {
      document.body.classList.add('battery-saver');
    } else {
      document.body.classList.remove('battery-saver');
    }
  }, [isBatterySaver]);

  // Sync Progress Firestore
  useEffect(() => {
    if (!currentUser || progress === 0) return;
    const timer = setTimeout(async () => {
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
      } catch (e) { console.error(e); }
    }, 3000);
    return () => clearTimeout(timer);
  }, [progress, currentUser, story, chapter]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const currentScrollY = target.scrollTop;
    if (Math.abs(currentScrollY - lastScrollY.current) > 10) {
      setIsUIVisible(currentScrollY < lastScrollY.current || currentScrollY < 100);
      lastScrollY.current = currentScrollY;
    }
    const currentProgress = (target.scrollTop / (target.scrollHeight - target.clientHeight)) * 100;
    setProgress(currentProgress);
  }, []);

  const handleReaction = (pageIdx: number, emoji: string) => {
    if (!currentUser) {
      openAuthModal(`reagir avec ${emoji}`);
      return;
    }
    setPanelReactions(prev => {
      const current = prev[pageIdx] || {};
      return {
        ...prev,
        [pageIdx]: { ...current, [emoji]: (current[emoji] || 0) + 1 }
      };
    });
    toast({ title: `Réaction ${emoji} ajoutée !`, description: "Votre émotion a été enregistrée sur cette case." });
  };

  const handleDownload = () => {
    if (!currentUser) {
      openAuthModal('télécharger des chapitres');
      return;
    }
    setIsDownloading(true);
    setTimeout(() => {
      setIsDownloading(false);
      toast({ title: "Chapitre téléchargé !", description: "Disponible hors-ligne." });
    }, 2000);
  };

  const handleTTS = () => {
    if ('speechSynthesis' in window) {
      const msg = new SpeechSynthesisUtterance();
      msg.text = `Chapitre ${chapter.chapterNumber} : ${chapter.title}.`;
      msg.lang = 'fr-FR';
      window.speechSynthesis.speak(msg);
      toast({ title: "Lecture audio", description: "Assistant vocal activé." });
    }
  };

  const openInlineComments = (pageIdx: number) => {
    setActivePanelIndex(pageIdx);
    setIsCommentsOpen(true);
  };

  const topMoments = useMemo(() => {
    const scores = Object.entries(panelReactions).map(([idx, reacts]) => ({
      idx: parseInt(idx),
      score: Object.values(reacts).reduce((a, b) => a + b, 0)
    }));
    return scores.sort((a, b) => b.score - a.score).slice(0, 3).map(s => s.idx);
  }, [panelReactions]);

  return (
    <div className={cn(
      "h-screen bg-black flex flex-col selection:bg-primary/30 overflow-hidden text-stone-200 transition-colors duration-1000",
      isFocusMode && "cursor-none",
      isBatterySaver && "bg-[#050505]"
    )}>
      {/* HEADER DINAMIQUE */}
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
            <span className="text-xs font-bold text-foreground truncate max-w-[120px]">Ch. {chapter.chapterNumber}</span>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-2">
          <Button onClick={handleTTS} variant="ghost" size="icon" className="h-9 w-9 rounded-full bg-white/5 text-stone-400 hover:text-primary">
            <Volume2 className="h-4 w-4" />
          </Button>
          <Button onClick={() => setIsSettingsOpen(!isSettingsOpen)} variant="ghost" size="icon" className={cn("h-9 w-9 rounded-full bg-white/5 text-stone-400 hover:text-primary", isSettingsOpen && "text-primary bg-primary/10")}>
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
          <Button onClick={() => setIsFocusMode(!isFocusMode)} size="sm" variant="ghost" className="h-9 px-4 rounded-full bg-white/5 text-xs font-bold uppercase tracking-widest">
            {isFocusMode ? "Quitter Focus" : "Mode Focus"}
          </Button>
        </div>

        <div className="flex items-center gap-2 flex-1 justify-end">
          <Button onClick={handleDownload} disabled={isDownloading} size="icon" variant="ghost" className="h-9 w-9 rounded-full bg-white/5 text-stone-400 hover:text-primary">
            <Download className={cn("h-4 w-4", isDownloading && "animate-bounce text-primary")} />
          </Button>
          <Button size="icon" variant="ghost" className="h-9 w-9 rounded-full bg-white/5"><Bookmark className="h-4 w-4" /></Button>
          <Button onClick={() => setIsCommentsOpen(!isCommentsOpen)} size="icon" variant="ghost" className={cn("h-9 w-9 rounded-full bg-white/5", isCommentsOpen && "text-primary bg-primary/10")}>
            <MessageSquare className="h-4 w-4" />
          </Button>
        </div>
      </nav>
      
      <div className="flex-1 flex overflow-hidden relative">
        {/* ZONE DE LECTURE */}
        <main 
          ref={scrollRef}
          onScroll={handleScroll}
          className={cn(
            "flex-1 overflow-y-auto transition-all duration-700 scroll-smooth hide-scrollbar",
            isCommentsOpen ? "lg:mr-[400px]" : "w-full"
          )}
        >
          <div className="mx-auto flex flex-col items-center max-w-[800px] px-0">
            {comicPages.map((page, index) => (
              <div key={page.id} className="relative w-full aspect-[2/3] animate-in fade-in duration-1000 group">
                <Image
                  src={getOptimizedImage(page.imageUrl, { width: 1000, quality: isLowData ? 30 : 90, lowData: isLowData })}
                  alt={page.description}
                  fill
                  className="object-contain md:object-cover"
                  priority={index < 2}
                />
                
                {/* Overlays Interactifs */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {topMoments.includes(index) && !isBatterySaver && (
                    <div className="absolute top-4 left-4 flex items-center gap-2 bg-primary text-black px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl animate-pulse">
                      <Flame className="h-3 w-3 fill-current" /> Top Moment
                    </div>
                  )}

                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/60 backdrop-blur-xl border border-white/10 p-1.5 rounded-full shadow-2xl">
                    {['🔥', '❤️', '😱', '😭', '✨'].map(emoji => (
                      <button
                        key={emoji}
                        onClick={() => handleReaction(index, emoji)}
                        className="w-10 h-10 flex flex-col items-center justify-center rounded-full hover:bg-white/10 transition-all active:scale-90 relative"
                      >
                        <span className="text-xl">{emoji}</span>
                        {panelReactions[index]?.[emoji] && (
                          <span className="absolute -top-1 -right-1 bg-primary text-black text-[8px] font-black px-1 rounded-full">{panelReactions[index][emoji]}</span>
                        )}
                      </button>
                    ))}
                    <Separator orientation="vertical" className="h-6 bg-white/10 mx-1" />
                    <Button 
                      onClick={() => openInlineComments(index)}
                      variant="ghost" 
                      size="icon" 
                      className="w-10 h-10 rounded-full hover:bg-primary/20 text-white"
                    >
                      <MessageCircle className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            
            <div className="py-20 text-center space-y-6">
              <Badge variant="outline" className="border-primary/20 text-primary uppercase font-bold tracking-widest">Fin du Chapitre</Badge>
              <h2 className="text-4xl font-display font-black gold-resplendant">L'aventure continue...</h2>
              <Button size="lg" className="rounded-full px-12 h-14 font-black text-lg gold-shimmer shadow-2xl shadow-primary/20">
                Chapitre Suivant <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </main>

        {/* SIDEBAR ACCESSIBILITÉ */}
        <aside className={cn(
          "fixed top-14 bottom-0 left-0 w-full lg:w-[320px] bg-stone-950 border-r border-white/5 z-40 transition-transform duration-500 ease-out",
          isSettingsOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="flex flex-col h-full">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-xl font-display font-black text-white flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" /> Paramètres
              </h3>
              <Button onClick={() => setIsSettingsOpen(false)} variant="ghost" size="icon" className="rounded-full"><X className="h-5 w-5" /></Button>
            </div>
            
            <div className="p-6 space-y-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-bold text-white flex items-center gap-2">
                      <Database className="h-4 w-4 text-cyan-500" /> Mode Low-Data
                    </Label>
                    <p className="text-[10px] text-muted-foreground italic">Compression d'images maximale.</p>
                  </div>
                  <Switch checked={isLowData} onCheckedChange={setIsLowData} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-bold text-white flex items-center gap-2">
                      <BatteryMedium className="h-4 w-4 text-emerald-500" /> Économiseur Batterie
                    </Label>
                    <p className="text-[10px] text-muted-foreground italic">Animations réduites.</p>
                  </div>
                  <Switch checked={isBatterySaver} onCheckedChange={setIsBatterySaver} />
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* SIDEBAR COMMENTAIRES */}
        <aside className={cn(
          "fixed top-14 bottom-0 right-0 w-full lg:w-[400px] bg-stone-950 border-l border-white/5 z-40 transition-transform duration-500 ease-out",
          isCommentsOpen ? "translate-x-0 shadow-[-20px_0_50px_rgba(0,0,0,0.5)]" : "translate-x-full"
        )}>
          <CommentsPanel 
            activePanel={activePanelIndex} 
            onClose={() => setIsCommentsOpen(false)} 
            onClearFilter={() => setActivePanelIndex(null)}
          />
        </aside>
      </div>
    </div>
  );
}

function CommentsPanel({ activePanel, onClose, onClearFilter }: any) {
  const [commentText, setCommentText] = useState('');
  const [isSpoiler, setIsSpoiler] = useState(false);

  const comments = useMemo(() => {
    let list = [
      { id: '1', author: 'NexusFan', content: 'Le dessin est incroyable sur cette planche !', pageIndex: 2, isSpoiler: false, likes: 12 },
      { id: '2', author: 'SpoilerGuy', content: 'Je savais que le méchant allait revenir ici...', pageIndex: 4, isSpoiler: true, likes: 5 },
      { id: '3', author: 'ArtLover', content: 'Quelle maîtrise de la couleur.', pageIndex: 2, isSpoiler: false, likes: 24 },
    ];
    if (activePanel !== null) {
      list = list.filter(c => c.pageIndex === activePanel);
    }
    return list;
  }, [activePanel]);

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
        <div className="flex flex-col">
          <h3 className="text-xl font-display font-black text-white flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" /> 
            {activePanel !== null ? `Réactions Case ${activePanel + 1}` : 'Communauté'}
          </h3>
          {activePanel !== null && (
            <button onClick={onClearFilter} className="text-[10px] text-primary hover:underline font-bold uppercase tracking-widest mt-1 text-left">Voir tout</button>
          )}
        </div>
        <Button onClick={onClose} variant="ghost" size="icon" className="rounded-full"><X className="h-5 w-5" /></Button>
      </div>

      <ScrollArea className="flex-1 p-6">
        <div className="space-y-6">
          {comments.map(c => (
            <CommentItem key={c.id} comment={c} />
          ))}
        </div>
      </ScrollArea>

      <div className="p-6 border-t border-white/5 bg-white/5 space-y-4">
        <Textarea 
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="Partagez votre lumière..." 
          className="min-h-[100px] bg-black/40 border-white/10 rounded-2xl p-4 focus-visible:ring-primary"
        />
        <div className="flex items-center justify-between">
          <button onClick={() => setIsSpoiler(!isSpoiler)} className={cn("text-[10px] font-black uppercase", isSpoiler ? "text-orange-500" : "text-stone-500")}>Spoiler</button>
          <Button disabled={!commentText.trim()} className="rounded-full px-6 font-black gold-shimmer bg-primary text-black">Envoyer</Button>
        </div>
      </div>
    </div>
  );
}

function CommentItem({ comment }: { comment: any }) {
  const [revealed, setRevealed] = useState(!comment.isSpoiler);

  return (
    <div className="space-y-2 group">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6 border border-white/10"><AvatarFallback className="text-[10px] bg-primary/10 text-primary">{comment.author[0]}</AvatarFallback></Avatar>
          <span className="text-xs font-black text-white/80">{comment.author}</span>
        </div>
        <span className="text-[9px] text-stone-500 font-bold uppercase">Il y a 2h</span>
      </div>
      
      <div className="relative overflow-hidden rounded-xl">
        <p className={cn(
          "text-sm font-light leading-relaxed p-3 bg-white/5 rounded-xl transition-all duration-500",
          (!revealed && comment.isSpoiler) && "blur-md select-none cursor-pointer"
        )} onClick={() => !revealed && setRevealed(true)}>
          {comment.content}
        </p>
        {comment.isSpoiler && !revealed && (
          <div className="absolute inset-0 flex items-center justify-center">
            <button className="bg-orange-500 text-black text-[9px] font-black px-3 py-1 rounded-full" onClick={() => setRevealed(true)}>RÉVÉLER</button>
          </div>
        )}
      </div>
    </div>
  );
}
