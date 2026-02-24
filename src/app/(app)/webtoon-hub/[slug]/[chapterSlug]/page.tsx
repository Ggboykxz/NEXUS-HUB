'use client';

import { useState, useEffect, use, useRef, useCallback } from 'react';
import { stories, comicPages } from '@/lib/data';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft, MessageSquare, SlidersHorizontal, X, ChevronRight, Heart, Share2, 
  Sparkles, Flame, AlertCircle, Coins, Info, Languages, History, BrainCircuit,
  Maximize2, Eye, Database, BatteryMedium, Wand2, BookOpen
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
import { Input } from '@/components/ui/input';

export default function MagicalReaderPage(props: { params: Promise<{ slug: string, chapterSlug: string }> }) {
  const { slug, chapterSlug } = use(props.params);
  const { toast } = useToast();
  const { openAuthModal } = useAuthModal();
  
  const story = stories.find(s => s.slug === slug);
  if (!story) notFound();

  const chapter = story.chapters?.find(c => c.slug === chapterSlug) || story.chapters?.[0] || { id: '1', title: 'Épisode', slug: '1', chapterNumber: 1 } as any;
  
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<'comments' | 'ai'>('comments');
  const [progress, setProgress] = useState(0);
  const [isUIVisible, setIsUIVisible] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isPro, setIsPro] = useState(false);
  
  // Reading Settings
  const [isLowData, setIsLowData] = useState(false);
  const [isBatterySaver, setIsBatterySaver] = useState(false);
  const [isEyeProtection, setIsEyeProtection] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAdModalOpen, setIsAdModalOpen] = useState(false);
  
  // Augmented Reading State
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [aiSummary, setAiSummary] = useState('');
  const [chatQuestion, setChatQuery] = useState('');
  const [chatHistory, setChatHistory] = useState<{role: 'user' | 'ai', text: string}[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  
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

  // AI ACTIONS
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

  const handleAiChat = async () => {
    if (!chatQuestion.trim()) return;
    setChatLoading(true);
    const userMsg = chatQuestion;
    setChatQuery('');
    setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    
    try {
      const res = await augmentedReadingAction({
        type: 'chat',
        storyTitle: story.title,
        userQuery: userMsg,
        context: `Lecteur au chapitre ${chapter.chapterNumber}. Lore : ${story.description}`
      });
      setChatHistory(prev => [...prev, { role: 'ai', text: res.result }]);
    } catch (e) {
      setChatHistory(prev => [...prev, { role: 'ai', text: "Désolé, ma connexion au lore a été interrompue." }]);
    } finally {
      setChatLoading(false);
    }
  };

  const handlePanelTranslate = async (idx: number) => {
    toast({ title: "Traduction IA...", description: "Analyse du panneau en cours." });
    try {
      const res = await augmentedReadingAction({
        type: 'translate',
        storyTitle: story.title,
        panelContent: `Contenu visuel du panneau ${idx + 1}`
      });
      toast({ title: "Traduction effectuée", description: res.result });
    } catch (e) {
      toast({ title: "Erreur traduction", variant: "destructive" });
    }
  };

  return (
    <div className={cn(
      "h-screen flex flex-col overflow-hidden text-stone-200 transition-all duration-1000",
      isFocusMode ? "bg-black cursor-none" : "bg-stone-950",
      isBatterySaver && "battery-saver",
      isEyeProtection && "sepia-[0.3] brightness-90"
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
          <Button onClick={handleGetSummary} variant="ghost" size="icon" className="h-9 w-9 rounded-full bg-white/5 text-emerald-500 hover:bg-emerald-500/10">
            <History className="h-4 w-4" />
          </Button>
          <Button onClick={() => setIsSettingsOpen(!isSettingsOpen)} variant="ghost" size="icon" className={cn("h-9 w-9 rounded-full bg-white/5", isSettingsOpen && "text-primary bg-primary/10")}>
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
          <Button onClick={() => { setIsSidebarOpen(!isSidebarOpen); setSidebarTab('comments'); }} size="icon" variant="ghost" className={cn("h-9 w-9 rounded-full bg-white/5", (isSidebarOpen && sidebarTab === 'comments') && "text-primary bg-primary/10")}>
            <MessageSquare className="h-4 w-4" />
          </Button>
          <Button onClick={() => { setIsSidebarOpen(!isSidebarOpen); setSidebarTab('ai'); }} size="icon" variant="ghost" className={cn("h-9 w-9 rounded-full bg-white/5", (isSidebarOpen && sidebarTab === 'ai') && "text-primary bg-primary/10")}>
            <BrainCircuit className="h-4 w-4" />
          </Button>
        </div>
      </nav>
      
      <div className="flex-1 flex overflow-hidden relative">
        {/* MAIN CONTENT AREA */}
        <main 
          ref={scrollRef}
          onScroll={handleScroll}
          onDoubleClick={() => setIsFocusMode(!isFocusMode)}
          className={cn(
            "flex-1 overflow-y-auto transition-all duration-700 scroll-smooth hide-scrollbar",
            isSidebarOpen ? "lg:mr-[400px]" : "w-full"
          )}
        >
          <div className="mx-auto flex flex-col items-center max-w-[800px] py-14">
            {comicPages.map((page, index) => (
              <div key={page.id} className="relative w-full aspect-[2/3] group cursor-pointer">
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
                
                {/* Panel Augmented Actions */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute top-6 right-6 flex flex-col gap-2">
                    <Button onClick={() => handlePanelTranslate(index)} size="icon" className="bg-black/60 backdrop-blur-md rounded-full border border-white/10 text-white hover:bg-primary hover:text-black">
                      <Languages className="h-4 w-4" />
                    </Button>
                    <Button onClick={() => toast({ title: "Glossaire", description: "Ce motif Kente symbolise la sagesse." })} size="icon" className="bg-black/60 backdrop-blur-md rounded-full border border-white/10 text-white hover:bg-emerald-500 hover:text-black">
                      <Info className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            
            <SponsoredPanel />

            <div className="py-32 px-6 text-center space-y-8 w-full max-w-lg mx-auto">
              <div className="bg-primary/10 p-6 rounded-[2.5rem] border border-primary/20 backdrop-blur-md">
                <h2 className="text-4xl font-display font-black gold-resplendant mb-4">Chapitre Terminé</h2>
                <p className="text-stone-400 text-sm italic font-light">"Chaque fin est le commencement d'une nouvelle légende."</p>
              </div>
              <Button size="lg" className="w-full rounded-full px-12 h-14 font-black text-lg gold-shimmer shadow-2xl">Épisode Suivant <ChevronRight className="ml-2 h-5 w-5" /></Button>
            </div>
          </div>
        </main>

        {/* SETTINGS SIDEBAR */}
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

        {/* COMMUNITY & AI SIDEBAR */}
        <aside className={cn(
          "fixed top-14 bottom-0 right-0 w-full lg:w-[400px] bg-stone-950 border-l border-white/5 z-40 transition-transform duration-500",
          isSidebarOpen ? "translate-x-0" : "translate-x-full"
        )}>
          <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
            <div className="flex gap-2 bg-black/40 p-1 rounded-xl border border-white/5">
              <Button 
                onClick={() => setSidebarTab('comments')} 
                variant={sidebarTab === 'comments' ? 'default' : 'ghost'} 
                size="sm" 
                className="rounded-lg text-[10px] font-black uppercase tracking-widest h-8"
              >
                Avis
              </Button>
              <Button 
                onClick={() => setSidebarTab('ai')} 
                variant={sidebarTab === 'ai' ? 'default' : 'ghost'} 
                size="sm" 
                className="rounded-lg text-[10px] font-black uppercase tracking-widest h-8"
              >
                IA Lore
              </Button>
            </div>
            <Button onClick={() => setIsSidebarOpen(false)} variant="ghost" size="icon" className="text-stone-500"><X className="h-5 w-5" /></Button>
          </div>

          <div className="flex-1 overflow-y-auto h-[calc(100%-60px)]">
            {sidebarTab === 'comments' ? (
              <div className="p-8 space-y-8">
                <div className="bg-stone-900 p-8 rounded-[2.5rem] border border-white/5 text-center">
                  <AlertCircle className="h-12 w-12 text-stone-700 mx-auto mb-4" />
                  <p className="text-stone-400 font-light italic text-sm">Les discussions arrivent bientôt. Les spoilers seront automatiquement filtrés par notre IA.</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col h-full">
                <ScrollArea className="flex-1 p-6">
                  <div className="space-y-6">
                    <div className="bg-primary/5 border border-primary/10 p-4 rounded-2xl flex gap-3">
                      <BrainCircuit className="h-5 w-5 text-primary shrink-0" />
                      <p className="text-xs text-stone-300 leading-relaxed italic">"Je suis votre Assistant Lore. Posez-moi vos questions sur les personnages, la mythologie ou les chapitres précédents de **{story.title}**."</p>
                    </div>
                    {chatHistory.map((msg, i) => (
                      <div key={i} className={cn("flex flex-col gap-1 max-w-[85%]", msg.role === 'user' ? "ml-auto items-end" : "items-start")}>
                        <div className={cn("p-4 rounded-2xl text-sm", msg.role === 'user' ? "bg-primary text-black font-medium rounded-tr-none" : "bg-white/5 border border-white/10 rounded-tl-none")}>
                          {msg.text}
                        </div>
                      </div>
                    ))}
                    {chatLoading && <div className="flex gap-2 items-center text-stone-500 text-[10px] font-black uppercase animate-pulse"><Sparkles className="h-3 w-3" /> L'IA explore les archives...</div>}
                  </div>
                </ScrollArea>
                <div className="p-6 bg-black/40 border-t border-white/5">
                  <div className="flex gap-2">
                    <Input 
                      value={chatQuestion}
                      onChange={(e) => setChatQuery(e.target.value)}
                      placeholder="Posez votre question sur l'œuvre..." 
                      className="bg-white/5 border-white/10 rounded-xl h-11 text-sm"
                      onKeyDown={(e) => e.key === 'Enter' && handleAiChat()}
                    />
                    <Button onClick={handleAiChat} disabled={chatLoading || !chatQuestion.trim()} size="icon" className="h-11 w-11 rounded-xl bg-primary text-black"><Sparkles className="h-4 w-4" /></Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* CATCH UP SUMMARY DIALOG */}
      <Dialog open={isSummaryOpen} onOpenChange={setIsSummaryOpen}>
        <DialogContent className="max-w-[400px] bg-stone-950 border-primary/20 shadow-2xl rounded-[2.5rem] p-0 overflow-hidden">
          <div className="h-1 w-full bg-emerald-500" />
          <div className="p-8 space-y-6">
            <DialogHeader className="space-y-4">
              <div className="bg-emerald-500/10 p-3 rounded-2xl w-fit"><History className="h-6 w-6 text-emerald-500" /></div>
              <DialogTitle className="text-2xl font-display font-black text-white">Résumé de Rattrapage</DialogTitle>
              <DialogDescription className="text-stone-400 italic">"On vous remet dans le bain en quelques secondes."</DialogDescription>
            </DialogHeader>
            <div className="bg-white/5 p-6 rounded-2xl border border-white/5 min-h-[150px] flex items-center justify-center">
              {summaryLoading ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="h-8 w-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-[10px] uppercase font-black text-emerald-500 tracking-widest">Génération du résumé...</p>
                </div>
              ) : (
                <p className="text-sm text-stone-200 leading-relaxed font-light italic">"{aiSummary || "Prêt à générer votre résumé sur mesure."}"</p>
              )}
            </div>
            <Button onClick={() => setIsSummaryOpen(false)} className="w-full h-12 rounded-xl bg-emerald-500 text-black font-black">Continuer la lecture</Button>
          </div>
        </DialogContent>
      </Dialog>

      <RewardedAdModal 
        isOpen={isAdModalOpen} 
        onClose={() => setIsAdModalOpen(false)} 
        onReward={() => {}} 
      />
    </div>
  );
}
