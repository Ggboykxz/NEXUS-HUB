'use client';

import { useState, useEffect, use, useRef, useCallback, useMemo } from 'react';
import { stories, comicPages, comments as allComments, getChapterUrl } from '@/lib/data';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  Bookmark, Settings, Heart, MessageSquare, Share2, ArrowLeft, ChevronRight, Eye, MonitorPlay, Volume2, Database, BatteryMedium, SlidersHorizontal, X, Sparkles, Flame, AlertCircle
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useAuthModal } from '@/components/providers/auth-modal-provider';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, serverTimestamp, increment } from 'firebase/firestore';
import { getOptimizedImage } from '@/lib/image-utils';
import { useTranslation } from '@/components/providers/language-provider';

/**
 * Le "Lecteur Magique" consolidé de NexusHub.
 * Gère le mode cinématique, l'accessibilité africaine et le profiling algorithmique.
 */
export default function ReaderPage(props: { params: Promise<{ slug: string, chapterSlug: string }> }) {
  const { slug, chapterSlug } = use(props.params);
  const { toast } = useToast();
  const { openAuthModal } = useAuthModal();
  const { t } = useTranslation();
  
  const story = stories.find(s => s.slug === slug);
  if (!story) notFound();

  const chapter = story.chapters?.find(c => c.slug === chapterSlug) || story.chapters?.[0] || { id: '1', title: 'Chargement...', slug: '1', chapterNumber: 1 } as any;
  
  // --- États Interface & Immersion ---
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isUIVisible, setIsUIVisible] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [panelReactions, setPanelReactions] = useState<Record<number, Record<string, number>>>({});
  const [readingStartTime] = useState(Date.now());
  
  // Accessibilité
  const [isLowData, setIsLowData] = useState(false);
  const [isBatterySaver, setIsBatterySaver] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => setCurrentUser(user));
    return () => unsubscribe();
  }, []);

  // Profiling Algorithmique & Sync Progression
  useEffect(() => {
    if (!currentUser || progress === 0) return;
    
    const syncInterval = setInterval(async () => {
      try {
        const timeSpent = Math.floor((Date.now() - readingStartTime) / 60000); 
        const libRef = doc(db, 'users', currentUser.uid, 'library', story.id);
        const userRef = doc(db, 'users', currentUser.uid);

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

        if (timeSpent > 0) {
          await setDoc(userRef, {
            readingStats: {
              preferredGenres: { [story.genreSlug]: increment(1) },
              totalReadingTime: increment(1)
            }
          }, { merge: true });
        }
      } catch (e) {}
    }, 15000);

    return () => clearInterval(syncInterval);
  }, [progress, currentUser, story, chapter, readingStartTime]);

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
      return { ...prev, [pageIdx]: { ...current, [emoji]: (current[emoji] || 0) + 1 } };
    });
    toast({ title: `Réaction ${emoji} !` });
  };

  const handleTTS = () => {
    if ('speechSynthesis' in window) {
      const msg = new SpeechSynthesisUtterance(`${chapter.title}.`);
      msg.lang = 'fr-FR';
      window.speechSynthesis.speak(msg);
      toast({ title: "Lecture audio lancée" });
    }
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
      isBatterySaver && "battery-saver"
    )}>
      {/* HEADER ZEN */}
      <nav className={cn(
        "fixed top-0 left-0 right-0 h-14 bg-background/90 border-b border-white/5 z-50 flex items-center justify-between px-5 backdrop-blur-2xl reader-ui-transition",
        (!isUIVisible && !isFocusMode) && "reader-ui-hidden",
        isFocusMode && "opacity-0 pointer-events-none"
      )}>
        <div className="absolute bottom-0 left-0 h-0.5 bg-primary shadow-[0_0_15px_hsl(var(--primary))] transition-all duration-300 z-50" style={{ width: `${progress}%` }} />
        
        <div className="flex items-center gap-4 flex-1">
          <Button asChild variant="ghost" size="icon" className="text-primary h-9 w-9 rounded-full bg-white/5">
            <Link href={getStoryUrl(story)}><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <div className="flex flex-col">
            <span className="text-[9px] uppercase font-black text-primary tracking-[0.2em] leading-none mb-1">{story.title}</span>
            <span className="text-xs font-bold text-foreground truncate max-w-[150px]">Ch. {chapter.chapterNumber}</span>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-2">
          <Button onClick={handleTTS} variant="ghost" size="icon" className="h-9 w-9 rounded-full bg-white/5 text-stone-400 hover:text-primary">
            <Volume2 className="h-4 w-4" />
          </Button>
          <Button onClick={() => setIsSettingsOpen(!isSettingsOpen)} variant="ghost" size="icon" className={cn("h-9 w-9 rounded-full bg-white/5", isSettingsOpen && "text-primary bg-primary/10")}>
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
          <Button onClick={() => setIsFocusMode(!isFocusMode)} size="sm" variant="ghost" className="h-9 px-4 rounded-full bg-white/5 text-[10px] font-black uppercase tracking-widest">
            {isFocusMode ? "Quitter Focus" : "Focus"}
          </Button>
        </div>

        <div className="flex items-center gap-2 flex-1 justify-end">
          <Button onClick={() => setIsCommentsOpen(!isCommentsOpen)} size="icon" variant="ghost" className={cn("h-9 w-9 rounded-full bg-white/5", isCommentsOpen && "text-primary bg-primary/10")}>
            <MessageSquare className="h-4 w-4" />
          </Button>
        </div>
      </nav>
      
      <div className="flex-1 flex overflow-hidden relative">
        <main 
          ref={scrollRef}
          onScroll={handleScroll}
          className={cn(
            "flex-1 overflow-y-auto transition-all duration-700 scroll-smooth hide-scrollbar",
            isCommentsOpen ? "lg:mr-[400px]" : "w-full"
          )}
        >
          <div className="mx-auto flex flex-col items-center max-w-[800px]">
            {comicPages.map((page, index) => (
              <div key={page.id} className="relative w-full aspect-[2/3] animate-in fade-in duration-1000 group">
                <Image
                  src={getOptimizedImage(page.imageUrl, { width: 1000, quality: isLowData ? 30 : 90, lowData: isLowData })}
                  alt={page.description}
                  fill
                  className="object-contain md:object-cover"
                  priority={index < 2}
                />
                
                {/* Micro-interactions par panneau */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {topMoments.includes(index) && !isBatterySaver && (
                    <div className="absolute top-4 left-4 flex items-center gap-2 bg-primary text-black px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-xl animate-pulse">
                      <Flame className="h-3 w-3 fill-current" /> Top Moment
                    </div>
                  )}

                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-black/60 backdrop-blur-xl border border-white/10 p-1 rounded-full shadow-2xl">
                    {['🔥', '❤️', '😱', '✨'].map(emoji => (
                      <button
                        key={emoji}
                        onClick={() => handleReaction(index, emoji)}
                        className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/10 transition-all active:scale-90"
                      >
                        <span className="text-lg">{emoji}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
            
            <div className="py-24 text-center space-y-8">
              <h2 className="text-4xl font-display font-black gold-resplendant">Fin du Chapitre</h2>
              <Button size="lg" className="rounded-full px-12 h-14 font-black text-lg gold-shimmer shadow-2xl shadow-primary/20">
                Chapitre Suivant <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </main>

        {/* PANNEAU ACCESSIBILITÉ */}
        <aside className={cn(
          "fixed top-14 bottom-0 left-0 w-full lg:w-[320px] bg-stone-950 border-r border-white/5 z-40 transition-transform duration-500",
          isSettingsOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="p-6 space-y-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-display font-black text-primary">Réglages</h3>
              <Button onClick={() => setIsSettingsOpen(false)} variant="ghost" size="icon"><X className="h-5 w-5" /></Button>
            </div>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-bold text-white flex items-center gap-2"><Database className="h-4 w-4 text-cyan-500" /> Mode Low-Data</Label>
                  <p className="text-[10px] text-muted-foreground italic">Compression images à 40%.</p>
                </div>
                <Switch checked={isLowData} onCheckedChange={setIsLowData} />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-bold text-white flex items-center gap-2"><BatteryMedium className="h-4 w-4 text-emerald-500" /> Éco Batterie</Label>
                  <p className="text-[10px] text-muted-foreground italic">Désactive les animations.</p>
                </div>
                <Switch checked={isBatterySaver} onCheckedChange={setIsBatterySaver} />
              </div>
            </div>
          </div>
        </aside>

        {/* PANNEAU COMMENTAIRES */}
        <aside className={cn(
          "fixed top-14 bottom-0 right-0 w-full lg:w-[400px] bg-stone-950 border-l border-white/5 z-40 transition-transform duration-500",
          isCommentsOpen ? "translate-x-0" : "translate-x-full"
        )}>
          <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
            <h3 className="text-lg font-display font-black text-white flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" /> Communauté
            </h3>
            <Button onClick={() => setIsCommentsOpen(false)} variant="ghost" size="icon"><X className="h-5 w-5" /></Button>
          </div>
          <div className="p-8 text-center flex flex-col justify-center h-[calc(100%-60px)]">
            <AlertCircle className="h-12 w-12 text-stone-700 mx-auto mb-4" />
            <p className="text-stone-500 italic text-sm">Discussions en cours de chargement...</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
