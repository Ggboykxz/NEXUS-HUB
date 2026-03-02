'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Play, Heart, MessageSquare, Share2, Star, Eye, Clock, 
  ChevronRight, Award, Zap, Crown, Flame, Plus, Check, Info,
  TrendingUp, CircleDollarSign, Headphones, Music, Share, Flag, AlertTriangle, Loader2
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { ToastAction } from '@/components/ui/toast';
import { useAuthModal } from '@/components/providers/auth-modal-provider';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, deleteDoc, updateDoc, increment, serverTimestamp, onSnapshot, collection, addDoc } from 'firebase/firestore';
import type { Story, UserProfile, Chapter, LibraryEntry } from '@/lib/types';
import { getStoryUrl } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslation } from '@/components/providers/language-provider';

interface StoryDetailClientProps {
  story: Story;
  artist: UserProfile | null;
  similarStories: Story[];
}

export default function StoryDetailClient({ story, artist, similarStories }: StoryDetailClientProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { openAuthModal } = useAuthModal();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [libraryEntry, setLibraryEntry] = useState<LibraryEntry | null>(null);
  
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [reportReason, setReportReason] = useState('Contenu offensant');
  const [isReporting, setIsReporting] = useState(false);

  const [showAllChapters, setShowAllChapters] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!currentUser || !story.id) {
      setIsFavorite(false);
      setLibraryEntry(null);
      return;
    }

    const likeRef = doc(db, 'stories', story.id, 'likes', currentUser.uid);
    const unsubFav = onSnapshot(likeRef, (docSnap) => {
      setIsFavorite(docSnap.exists());
    });

    const libraryRef = doc(db, 'users', currentUser.uid, 'library', story.id);
    const unsubLib = onSnapshot(libraryRef, (docSnap) => {
      if (docSnap.exists()) {
        setLibraryEntry(docSnap.data() as LibraryEntry);
      } else {
        setLibraryEntry(null);
      }
    });

    return () => {
      unsubFav();
      unsubLib();
    };
  }, [currentUser, story.id]);

  const handleFavorite = async (showToast: boolean | React.MouseEvent = true) => {
    const shouldShowToast = typeof showToast === 'boolean' ? showToast : true;
    
    if (!currentUser) {
      openAuthModal('ajouter cette œuvre à vos favoris');
      return;
    }

    const likeRef = doc(db, 'stories', story.id, 'likes', currentUser.uid);
    const storyRef = doc(db, 'stories', story.id);

    try {
      if (isFavorite) {
        await deleteDoc(likeRef);
        await updateDoc(storyRef, { likes: increment(-1) });
        if (shouldShowToast) {
          toast({ 
            title: "Retiré des favoris",
            action: <ToastAction altText="Annuler" onClick={() => handleFavorite(false)}>Annuler</ToastAction>,
            duration: 5000
          });
        }
      } else {
        await setDoc(likeRef, {
          userId: currentUser.uid,
          userName: currentUser.displayName || 'Voyageur',
          likedAt: serverTimestamp()
        });
        await updateDoc(storyRef, { likes: increment(1) });
        if (shouldShowToast) {
          toast({ 
            title: "Ajouté aux favoris !",
            action: <ToastAction altText="Annuler" onClick={() => handleFavorite(false)}>Annuler</ToastAction>,
            duration: 5000
          });
        }
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast({ title: "Erreur", description: "Impossible de mettre à jour vos favoris.", variant: "destructive" });
    }
  };

  const handleReportStory = async () => {
    if (!currentUser) {
      openAuthModal('signaler une œuvre');
      return;
    }

    setIsReporting(true);
    try {
      await addDoc(collection(db, 'reports'), {
        type: 'story',
        targetId: story.id,
        targetTitle: story.title,
        reporterId: currentUser.uid,
        reason: reportReason,
        status: 'pending',
        createdAt: serverTimestamp()
      });
      toast({ title: "Signalement envoyé", description: "Nos modérateurs vont examiner cette œuvre." });
      setIsReportDialogOpen(false);
    } catch (e) {
      toast({ title: "Erreur lors du signalement", variant: "destructive" });
    } finally {
      setIsReporting(false);
    }
  };

  const displayedChapters = showAllChapters ? story.chapters : story.chapters?.slice(0, 10);
  const hasMoreChapters = (story.chapters?.length || 0) > 10;

  return (
    <div className="flex flex-col min-h-screen bg-background pb-20">
      <header className="relative h-[65vh] md:h-[75vh] overflow-hidden">
        <div className="absolute inset-0">
          <Image src={story.coverImage.imageUrl} alt="bg" fill className="object-cover opacity-20 blur-3xl scale-110" priority />
          <div className="absolute inset-0 bg-stone-950/60" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        </div>
        
        <div className="container max-w-7xl mx-auto px-6 h-full flex flex-col justify-end pb-16">
          <div className="flex flex-col md:flex-row gap-12 items-end">
            <div className="relative aspect-[3/4] w-56 md:w-80 rounded-[2.5rem] overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.5)] border-8 border-background shrink-0 -mb-8 md:-mb-24 animate-in slide-in-from-bottom-12 duration-1000">
              <Image src={story.coverImage.imageUrl} alt={story.title} fill className="object-cover" priority />
              {libraryEntry && libraryEntry.progress > 0 && (
                <div className="absolute bottom-0 left-0 w-full h-2 bg-black/40 z-20">
                  <div className="h-full bg-primary shadow-[0_0_15px_hsl(var(--primary))]" style={{ width: `${libraryEntry.progress}%` }} />
                </div>
              )}
            </div>
            
            <div className="flex-1 space-y-8 pb-4 md:pb-12 animate-in fade-in slide-in-from-left-12 duration-1000 delay-200">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <Badge className="bg-primary text-black uppercase tracking-[0.2em] font-black text-[9px] px-4 py-1.5 border-none shadow-lg shadow-primary/10">ORIGINAL NEXUS</Badge>
                  <Badge variant="secondary" className="bg-white/5 text-stone-300 border-white/10 uppercase tracking-widest text-[9px] font-bold px-4 py-1.5">{story.genre}</Badge>
                </div>
                <h1 className="text-5xl md:text-8xl font-display font-black text-white leading-[0.85] tracking-tighter drop-shadow-[0_0_20px_rgba(212,168,67,0.3)]">{story.title}</h1>
              </div>

              <div className="flex flex-wrap gap-4 items-center">
                <Button asChild size="lg" className="rounded-full px-12 h-16 font-black text-xl gold-shimmer shadow-[0_0_40px_rgba(212,168,67,0.4)] bg-primary text-black">
                  <Link href={`/webtoon-hub/${story.slug}/${libraryEntry?.lastReadChapterSlug || 'chapitre-1'}`}>
                    <Play className="mr-3 h-6 w-6 fill-current" /> 
                    {libraryEntry ? (
                      libraryEntry.progress === 100 ? t('common.read') + " encore" : t('common.resume_quest') + ` — Ep. ${libraryEntry.lastReadChapterTitle}`
                    ) : t('common.start_quest')}
                  </Link>
                </Button>
                <div className="flex items-center gap-3">
                  <Button onClick={handleFavorite} variant="outline" size="icon" className={cn("h-16 w-16 rounded-full border-white/10 text-white hover:bg-rose-500/10 hover:text-rose-500 transition-all backdrop-blur-md", isFavorite && "bg-rose-500/10 text-rose-500 border-rose-500/50 shadow-[0_0_20px_rgba(244,63,94,0.2)]")}>
                    <Heart className={cn("h-7 w-7 transition-all duration-300", isFavorite && "fill-current scale-110")} />
                  </Button>
                  <Button variant="outline" size="icon" className="h-16 w-16 rounded-full border-white/10 text-white hover:bg-white/10 backdrop-blur-md"><Share2 className="h-7 w-7" /></Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container max-w-7xl mx-auto px-6 pt-32 md:pt-48 grid lg:grid-cols-3 gap-16">
        <div className="lg:col-span-2 space-y-16">
          <section className="space-y-8">
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 p-3 rounded-2xl"><Info className="h-6 w-6 text-primary" /></div>
              <h2 className="text-3xl font-display font-black text-white uppercase tracking-tighter">Le Récit</h2>
            </div>
            <p className="text-xl text-stone-400 leading-relaxed italic font-light border-l-4 border-primary/20 pl-8">"{story.description}"</p>
          </section>

          <section className="space-y-8">
            <Tabs defaultValue="chapters" className="w-full">
              <TabsList className="bg-muted/50 p-1.5 rounded-2xl h-14 mb-10 border border-border/50 max-w-md">
                <TabsTrigger value="chapters" className="rounded-xl flex-1 gap-2 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-black">
                  <Clock className="h-4 w-4" /> {story.chapterCount} {t('common.chapters')}
                </TabsTrigger>
                <TabsTrigger value="comments" className="rounded-xl flex-1 gap-2 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-black">
                  <MessageSquare className="h-4 w-4" /> Avis Fans
                </TabsTrigger>
              </TabsList>

              <TabsContent value="chapters" className="space-y-4 animate-in fade-in duration-700">
                <div className="space-y-3">
                  {displayedChapters?.map((chap, i) => (
                    <Link key={chap.id} href={`/webtoon-hub/${story.slug}/${chap.slug}`} className="block group">
                      <div className={cn("flex items-center gap-6 p-6 rounded-3xl border transition-all hover:shadow-2xl hover:-translate-y-1", libraryEntry?.lastReadChapterId === chap.id ? "bg-primary/5 border-primary/30" : "bg-card/50 border-white/5 hover:border-primary/30")}>
                        <div className={cn("h-16 w-16 rounded-2xl flex items-center justify-center font-display font-black transition-all text-2xl", libraryEntry?.lastReadChapterId === chap.id ? "bg-primary text-black" : "bg-white/5 text-stone-600 group-hover:text-primary group-hover:bg-primary/10")}>{chap.chapterNumber}</div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-xl text-white group-hover:text-primary transition-colors truncate">{chap.title}</h4>
                          <p className="text-[9px] text-stone-500 uppercase font-black tracking-[0.2em] mt-1">Saison 1 &bull; Publié le 12 Fév.</p>
                        </div>
                        {chap.isPremium ? <div className="bg-primary/10 p-3 rounded-full text-primary shadow-lg"><Crown className="h-5 w-5" /></div> : <div className="bg-emerald-500/10 p-3 rounded-full text-emerald-500"><Check className="h-5 w-5" /></div>}
                      </div>
                    </Link>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </section>
        </div>

        <aside className="space-y-12">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[2.5rem] text-center space-y-2">
              <Eye className="h-6 w-6 text-primary mx-auto mb-2" />
              <p className="text-3xl font-black text-white tracking-tighter">{(story.views/1000).toFixed(0)}k</p>
              <p className="text-[9px] uppercase font-black text-stone-600 tracking-widest">{t('common.views')}</p>
            </div>
            <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[2.5rem] text-center space-y-2">
              <Heart className="h-6 w-6 text-rose-500 mx-auto mb-2" />
              <p className="text-3xl font-black text-white tracking-tighter">{(story.likes/1000).toFixed(0)}k</p>
              <p className="text-[9px] uppercase font-black text-stone-600 tracking-widest">{t('common.likes')}</p>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}
