'use client';

import { useState, useEffect, use, useRef, useCallback } from 'react';
import { stories, comicPages } from '@/lib/data';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft, MessageSquare, SlidersHorizontal, X, ChevronRight, Heart, Share2, 
  Sparkles, Flame, AlertCircle, Coins, Info, Languages, History, BrainCircuit,
  Maximize2, Eye, Database, BatteryMedium, Wand2, BookOpen, Headphones, Music, Volume2, VolumeX,
  Layout
} from 'lucide-react';
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
import { SponsoredPanel } from '@/components/ads/sponsored-panel';
import { RewardedAdModal } from '@/components/ads/rewarded-ad-modal';
import { augmentedReadingAction } from '@/ai/flows/augmented-reading-flow';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from '@/components/ui/scroll-area';

interface MagicalReaderProps {
  params: Promise<{ slug: string, chapterSlug: string }>;
  defaultMode?: 'scroll' | 'pages';
}

export default function MagicalReaderPage({ params: paramsPromise, defaultMode = 'scroll' }: MagicalReaderProps) {
  const { slug, chapterSlug } = use(paramsPromise);
  const { toast } = useToast();
  const { openAuthModal } = useAuthModal();
  
  const story = stories.find(s => s.slug === slug);
  if (!story) notFound();

  const chapter = story.chapters?.find(c => c.slug === chapterSlug) || story.chapters?.[0] || { id: '1', title: 'Épisode', slug: '1', chapterNumber: 1 } as any;
  
  const [activeMode, setActiveMode] = useState<'scroll' | 'pages'>(defaultMode);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<'comments' | 'ai'>('comments');
  const [progress, setProgress] = useState(0);
  const [isUIVisible, setIsUIVisible] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // Reading Settings
  const [isLowData, setIsLowData] = useState(false);
  const [isBatterySaver, setIsBatterySaver] = useState(false);
  const [isDoublePage, setIsDoublePage] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAdModalOpen, setIsAdModalOpen] = useState(false);
  
  // Audio Mode
  const [isAudioMode, setIsAudioMode] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  
  // AI State
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [aiSummary, setAiSummary] = useState('');
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const currentScrollY = target.scrollTop;
    
    if (Math.abs(currentScrollY - lastScrollY.current) > 10) {
      setIsUIVisible(currentScrollY < lastScrollY.current || currentScrollY < 50);
      lastScrollY.current = currentScrollY;
    }
    
    const currentProgress = (target.scrollTop / (target.scrollHeight - target.clientHeight)) * 100;
    setProgress(currentProgress);
  }, []);

  const handleGetSummary = async () => {
    if (!currentUser) { openAuthModal('obtenir un résumé IA'); return; }
    setIsSummaryOpen(true);
    setSummaryLoading(true);
    try {
      const res = await augmentedReadingAction({
        type: 'summary',
        storyTitle: story.title,
        context: `L'utilisateur lit le chapitre ${chapter.chapterNumber}.`
      });
      setAiSummary(res.result);
    } catch (e) {
      toast({ title: "Erreur IA", variant: "destructive" });
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleToggleAudio = () => {
    setIsAudioMode(!isAudioMode);
    toast({
      title: isAudioMode ? "Mode Sonore désactivé" : "Mode Sonore activé",
      description: isAudioMode ? "Lecture silencieuse." : "Expérience audio dramatisée en cours.",
    });
  };

  return (
    <div className={cn(
      "h-screen flex flex-col overflow-hidden text-stone-200 transition-all duration-1000",
      isFocusMode ? "bg-black cursor-none" : "bg-stone-950",
      isBatterySaver && "battery-saver"
    )}>
      {/* HEADER NAVIGATION */}
      <nav className={cn(
        "fixed top-0 left-0 right-0 h-14 bg-background/90 border-b border-white/5 z-50 flex items-center justify-between px-5 backdrop-blur-2xl reader-ui-transition",
        (!isUIVisible && !isFocusMode) && "reader-ui-hidden",
        isFocusMode && "opacity-0 pointer-events-none"
      )}>
        <div className="absolute bottom-0 left-0 h-0.5 bg-primary shadow-[0_0_15px_hsl(var(--primary))] transition-all duration-300 z-50" style={{ width: `${progress}%` }} />
        
        <div className="flex items-center gap-4 flex-1">
          <Button asChild variant="ghost" size="icon" className="text-primary h-9 w-9 rounded-full bg-white/5 hover:bg-primary/10">
            <Link href={`/webtoon-hub/${story.slug}`}><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <div className="flex flex-col">
            <span className="text-[9px] uppercase font-black text-primary tracking-[0.2em] leading-none mb-1 truncate max-w-[120px]">{story.title}</span>
            <span className="text-xs font-bold text-foreground truncate max-w-[150px]">Épisode {chapter.chapterNumber}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-1 justify-end">
          <div className="hidden sm:flex bg-white/5 rounded-xl p-0.5 mr-2">
            <Button onClick={() => setActiveMode('scroll')} size="sm" variant={activeMode === 'scroll' ? 'default' : 'ghost'} className="h-7 text-[8px] font-black uppercase px-3 rounded-lg">Webtoon</Button>
            <Button onClick={() => setActiveMode('pages')} size="sm" variant={activeMode === 'pages' ? 'default' : 'ghost'} className="h-7 text-[8px] font-black uppercase px-3 rounded-lg">BD</Button>
          </div>
          <Button onClick={handleToggleAudio} variant="ghost" size="icon" className={cn("h-9 w-9 rounded-full bg-white/5", isAudioMode ? "text-primary bg-primary/10" : "text-stone-500")}>
            <Headphones className="h-4 w-4" />
          </Button>
          <Button onClick={handleGetSummary} variant="ghost" size="icon" className="h-9 w-9 rounded-full bg-white/5 text-emerald-500 hover:bg-emerald-500/10">
            <History className="h-4 w-4" />
          </Button>
          <Button onClick={() => setIsSettingsOpen(!isSettingsOpen)} variant="ghost" size="icon" className={cn("h-9 w-9 rounded-full bg-white/5", isSettingsOpen && "text-primary bg-primary/10")}>
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
          <Button onClick={() => { setIsSidebarOpen(!isSidebarOpen); setSidebarTab('ai'); }} size="icon" variant="ghost" className={cn("h-9 w-9 rounded-full bg-white/5", (isSidebarOpen && sidebarTab === 'ai') && "text-primary bg-primary/10")}>
            <BrainCircuit className="h-4 w-4" />
          </Button>
        </div>
      </nav>
      
      <div className="flex-1 flex overflow-hidden relative">
        <main 
          ref={scrollRef}
          onScroll={handleScroll}
          onDoubleClick={() => setIsFocusMode(!isFocusMode)}
          className={cn(
            "flex-1 overflow-y-auto transition-all duration-700 scroll-smooth hide-scrollbar",
            isSidebarOpen ? "lg:mr-[400px]" : "w-full"
          )}
        >
          <div className={cn(
            "mx-auto py-14",
            activeMode === 'scroll' ? "max-w-[800px] flex flex-col items-center" : "max-w-7xl px-6",
            (activeMode === 'pages' && isDoublePage) ? "grid grid-cols-1 md:grid-cols-2 gap-4" : "flex flex-col items-center"
          )}>
            {comicPages.map((page, index) => (
              <div 
                key={page.id} 
                className={cn(
                  "relative w-full aspect-[2/3] group cursor-pointer",
                  activeMode === 'pages' && "shadow-2xl border border-white/5 rounded-lg overflow-hidden mb-8"
                )}
              >
                <Image
                  src={getOptimizedImage(page.imageUrl, { 
                    width: 1000, 
                    quality: isLowData ? 30 : 90, 
                    lowData: isLowData 
                  })}
                  alt={page.description}
                  fill
                  className="object-contain md:object-cover"
                  priority={index < 2}
                />
              </div>
            ))}
            
            <div className="col-span-full">
              <SponsoredPanel />
              <div className="py-32 text-center space-y-8 max-w-lg mx-auto">
                <div className="bg-primary/10 p-6 rounded-[2.5rem] border border-primary/20 backdrop-blur-md">
                  <h2 className="text-4xl font-display font-black gold-resplendant mb-4">Chapitre Terminé</h2>
                  <p className="text-stone-400 text-sm italic font-light">"Chaque fin est le commencement d'une nouvelle légende."</p>
                </div>
                <Button size="lg" className="w-full rounded-full px-12 h-14 font-black text-lg gold-shimmer shadow-2xl">Épisode Suivant <ChevronRight className="ml-2 h-5 w-5" /></Button>
              </div>
            </div>
          </div>
        </main>

        <aside className={cn(
          "fixed top-14 bottom-0 left-0 w-full lg:w-[320px] bg-stone-950/95 backdrop-blur-3xl border-r border-white/5 z-40 transition-transform duration-500",
          isSettingsOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="p-8 space-y-10">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-display font-black text-white">Réglages</h3>
              <Button onClick={() => setIsSettingsOpen(false)} variant="ghost" size="icon" className="text-stone-500"><X className="h-5 w-5" /></Button>
            </div>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-bold text-white flex items-center gap-2"><Eye className="h-4 w-4 text-primary" /> Mode Focus</Label>
                <Switch checked={isFocusMode} onCheckedChange={setIsFocusMode} />
              </div>
              {activeMode === 'pages' && (
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-bold text-white flex items-center gap-2"><Layout className="h-4 w-4 text-amber-500" /> Double Page</Label>
                  <Switch checked={isDoublePage} onCheckedChange={setIsDoublePage} />
                </div>
              )}
              <div className="flex items-center justify-between">
                <Label className="text-sm font-bold text-white flex items-center gap-2"><Database className="h-4 w-4 text-cyan-500" /> Mode Low-Data</Label>
                <Switch checked={isLowData} onCheckedChange={setIsLowData} />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm font-bold text-white flex items-center gap-2"><BatteryMedium className="h-4 w-4 text-emerald-500" /> Éco Batterie</Label>
                <Switch checked={isBatterySaver} onCheckedChange={setIsBatterySaver} />
              </div>
            </div>
          </div>
        </aside>

        <aside className={cn(
          "fixed top-14 bottom-0 right-0 w-full lg:w-[400px] bg-stone-950 border-l border-white/5 z-40 transition-transform duration-500",
          isSidebarOpen ? "translate-x-0" : "translate-x-full"
        )}>
          <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
            <div className="flex gap-2 bg-black/40 p-1 rounded-xl border border-white/5">
              <Button variant="default" size="sm" className="rounded-lg text-[10px] font-black uppercase tracking-widest h-8">IA Lore</Button>
            </div>
            <Button onClick={() => setIsSidebarOpen(false)} variant="ghost" size="icon" className="text-stone-500"><X className="h-5 w-5" /></Button>
          </div>
          <div className="flex-1 overflow-y-auto h-[calc(100%-60px)]">
            <ScrollArea className="h-full p-6">
              <div className="space-y-6">
                <div className="bg-primary/5 border border-primary/10 p-4 rounded-2xl flex gap-3">
                  <BrainCircuit className="h-5 w-5 text-primary shrink-0" />
                  <p className="text-xs text-stone-300 leading-relaxed italic">"Je suis votre Assistant Lore. Posez-moi vos questions sur les personnages ou la mythologie."</p>
                </div>
              </div>
            </ScrollArea>
          </div>
        </aside>
      </div>

      <Dialog open={isSummaryOpen} onOpenChange={setIsSummaryOpen}>
        <DialogContent className="bg-stone-900 border-primary/20 text-white rounded-[2rem]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><History className="text-primary h-5 w-5" /> Résumé de rattrapage</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {summaryLoading ? (
              <div className="flex items-center justify-center py-8"><Wand2 className="h-8 w-8 text-primary animate-spin" /></div>
            ) : (
              <p className="text-sm leading-relaxed italic border-l-2 border-primary/30 pl-4">{aiSummary || "Prêt à résumer votre lecture..."}</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
