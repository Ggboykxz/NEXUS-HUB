'use client';

import { useState, useEffect, use } from 'react';
import { stories, comicPages, comments as allComments, artists, type Chapter, type Story } from '@/lib/data';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  Book, Layers, Heart, MessageSquare, ChevronRight, ChevronLeft, Bookmark, Settings, Star, Coins, Eye, Award, CalendarDays, Check, Share2
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { getOptimizedImage } from '@/lib/image-utils';

// #region Page Components

function ReaderHeader({ story, chapter, onModeChange, activeMode, onSettingsToggle, onBookmark, isBookmarked }: any) {
  return (
    <nav className="fixed top-0 left-0 right-0 h-14 bg-background/95 border-b border-border z-50 flex items-center justify-between px-5 backdrop-blur-xl">
      <div className="flex items-center gap-4 flex-1">
        <Link href="/" className="font-display text-base tracking-widest text-primary hidden md:block">NexusHub</Link>
        <div className="w-px h-5 bg-border hidden md:block" />
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href={`/webtoon/${story.slug}`} className="hover:text-primary transition-colors hidden sm:block font-medium">{story.title}</Link>
          <ChevronRight className="h-4 w-4 hidden sm:block" />
          <span className="text-primary font-semibold whitespace-nowrap">Chap. {chapter.chapterNumber} – {chapter.title}</span>
        </div>
      </div>

      <div className="hidden lg:flex items-center gap-2 absolute left-1/2 -translate-x-1/2">
        <Button size="icon" variant="outline" className="w-8 h-8"><ChevronLeft className="h-4 w-4" /></Button>
        <Select defaultValue={chapter.slug}>
          <SelectTrigger className="w-[200px] h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {story.chapters.map((chap: Chapter) => (
              <SelectItem key={chap.id} value={chap.slug} className="text-xs">
                Chap {chap.chapterNumber} – {chap.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button size="icon" variant="outline" className="w-8 h-8"><ChevronRight className="h-4 w-4" /></Button>
      </div>

      <div className="flex items-center gap-2 flex-1 justify-end">
        <div className="hidden sm:flex bg-card border border-border rounded-lg p-0.5">
          <Button onClick={() => onModeChange('scroll')} size="sm" variant={activeMode === 'scroll' ? 'default' : 'ghost'} className="h-7 text-xs gap-1.5">
            <Layers className="h-3.5 w-3.5" /> Webtoon
          </Button>
          <Button onClick={() => onModeChange('pages')} size="sm" variant={activeMode === 'pages' ? 'default' : 'ghost'} className="h-7 text-xs gap-1.5">
            <Book className="h-3.5 w-3.5" /> BD
          </Button>
        </div>
        <Button onClick={onBookmark} size="sm" variant="outline" className={cn("h-8 gap-1.5", isBookmarked && "bg-primary/10 border-primary text-primary")}>
          <Bookmark className={cn("h-4 w-4", isBookmarked && "fill-current")} />
          <span className="hidden md:inline">{isBookmarked ? 'Sauvegardé' : 'Sauvegarder'}</span>
        </Button>
        <Button onClick={onSettingsToggle} size="icon" variant="outline" className="h-8 w-8">
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </nav>
  );
}

function ProgressBar({ progress }: { progress: number }) {
  return (
    <div className="fixed top-14 left-0 right-0 h-0.5 bg-foreground/5 z-50">
      <div
        className="h-full bg-gradient-to-r from-primary/50 via-primary to-accent transition-all duration-75 ease-linear"
        style={{ width: `${progress}%` }}
      >
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-accent shadow-[0_0_8px_hsl(var(--accent))] shadow-accent/50" />
      </div>
    </div>
  )
}

function ReaderSidebar({ story, artist }: { story: Story, artist: any }) {
  const [activeTab, setActiveTab] = useState('chapters');

  const TabButton = ({ id, label }: { id: string, label: string }) => (
    <Button
      variant="ghost"
      onClick={() => setActiveTab(id)}
      className={cn(
        "flex-1 rounded-none border-b-2 h-11 text-xs font-semibold uppercase tracking-wider",
        activeTab === id ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'
      )}
    >
      {label}
    </Button>
  );

  return (
    <aside className="w-[320px] bg-card border-l border-border h-[calc(100vh-56px)] sticky top-14 flex-shrink-0 hidden lg:flex flex-col">
      <div className="flex border-b border-border sticky top-0 bg-card z-10">
        <TabButton id="chapters" label="Chapitres" />
        <TabButton id="artist" label="Artiste" />
        <TabButton id="explore" label="Explorer" />
      </div>
      <ScrollArea className="flex-1">
        {activeTab === 'chapters' && <ChaptersTab story={story} />}
        {activeTab === 'artist' && <ArtistTab artist={artist} />}
        {activeTab === 'explore' && <ExploreTab />}
      </ScrollArea>
    </aside>
  );
}

function ChaptersTab({ story }: { story: Story }) {
  const { toast } = useToast();
  return (
    <div className="p-4">
      <div className="flex gap-3 mb-4 pb-4 border-b border-border">
        <Link href={`/webtoon/${story.slug}`}>
            <Image src={story.coverImage.imageUrl} alt={story.title} width={56} height={80} className="rounded-md object-cover flex-shrink-0 hover:opacity-80 transition-opacity" />
        </Link>
        <div>
          <Link href={`/webtoon/${story.slug}`}>
            <h3 className="font-display text-sm text-foreground mb-1 hover:text-primary transition-colors">{story.title}</h3>
          </Link>
          <Link href={`/artiste/${story.artistSlug}`} className="text-xs text-primary hover:underline flex items-center gap-1.5 mb-2">
            <Award className="h-3 w-3" /> {story.artistName}
          </Link>
          <div className="flex gap-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Eye className="h-3 w-3"/> {(story.views/1000).toFixed(0)}k</span>
            <span className="flex items-center gap-1"><Heart className="h-3 w-3"/> {(story.likes/1000).toFixed(0)}k</span>
            <span className="flex items-center gap-1"><Book className="h-3 w-3"/> {story.chapterCount} chap.</span>
          </div>
        </div>
      </div>
      <div className="bg-card border border-primary/20 rounded-lg p-3 mb-4">
        <h4 className="text-xs font-bold text-primary flex items-center gap-2 mb-2"><Coins className="h-4 w-4"/> Soutenir l'artiste</h4>
        <div className="flex gap-1.5 mb-2.5">
          {[10, 50, 100, 500].map(amount => (
            <Button key={amount} size="sm" variant="outline" className="h-7 text-xs flex-1 hover:bg-primary hover:text-primary-foreground">{amount} 🪙</Button>
          ))}
        </div>
        <Button size="sm" className="w-full h-8" onClick={() => toast({ title: '🪙 50 AfriCoins envoyés !' })}>Envoyer des AfriCoins</Button>
      </div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs uppercase font-bold tracking-wider text-muted-foreground">Liste des chapitres</label>
        <span className="text-xs text-primary font-semibold">{story.chapterCount}/{story.chapterCount}</span>
      </div>
      <Input type="search" placeholder="🔍 Rechercher un chapitre…" className="h-8 mb-3 text-xs" />
      <div className="flex flex-col gap-1">
        {story.chapters?.map((chap, index) => (
          <Link key={chap.id} href="#" className={cn(
            "flex items-center gap-2.5 p-2.5 rounded-lg transition-colors hover:bg-muted",
            index === 0 && "bg-primary/10 border border-primary/20"
          )}>
            <div className={cn(
              "w-7 h-7 flex items-center justify-center rounded-md bg-muted border border-border text-xs font-bold text-muted-foreground flex-shrink-0",
              index === 0 && "bg-primary border-primary text-primary-foreground"
            )}>{index + 1}</div>
            <div className="flex-1 overflow-hidden">
              <p className={cn("text-sm font-semibold truncate", index === 0 && "text-primary")}>{chap.title}</p>
              <p className="text-xs text-muted-foreground">Lu · {new Date(chap.publishedAt as string).toLocaleDateString()}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function ArtistTab({ artist }: { artist: any }) {
  const { toast } = useToast();
  const [isFollowing, setIsFollowing] = useState(false);
  return (
    <div className="p-4">
      <div className="bg-card border border-border rounded-xl p-4 text-center">
        <Link href={`/artiste/${artist?.slug}`} className="relative inline-block group">
          <Avatar className="w-16 h-16 mx-auto mb-3 border-2 border-primary shadow-lg group-hover:opacity-80 transition-opacity">
            <AvatarImage src={artist?.photoURL} alt={artist?.displayName} />
            <AvatarFallback>{artist?.displayName?.slice(0, 1)}</AvatarFallback>
          </Avatar>
          <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center border-2 border-card">
            <Check className="w-3 h-3 text-black" />
          </div>
        </Link>
        <Link href={`/artiste/${artist?.slug}`}>
            <h3 className="font-display text-base text-foreground mb-1 hover:text-primary transition-colors">{artist?.displayName}</h3>
        </Link>
        <p className="text-xs text-muted-foreground mb-3">Artiste Certifié</p>
        <div className="flex justify-around py-3 border-y border-border mb-3">
          <div>
            <p className="font-bold text-lg text-primary">{(artist?.subscribersCount / 1000).toFixed(1)}k</p>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Abonnés</p>
          </div>
          <div>
            <p className="font-bold text-lg text-primary">{(artist?.totalViews / 1000).toFixed(0)}k</p>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Vues</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button size="sm" className="flex-1 h-9" onClick={() => setIsFollowing(!isFollowing)}>
            <Star className={cn("h-4 w-4", isFollowing && "fill-current")} /> {isFollowing ? 'Suivi' : 'Suivre'}
          </Button>
          <Button size="sm" variant="destructive" className="h-9" onClick={() => toast({ title: '❤️ Merci pour votre soutien !' })}>
            <Heart className="h-4 w-4"/> Soutenir
          </Button>
        </div>
      </div>
    </div>
  )
}

function ExploreTab() {
  const otherStories = stories.slice(0, 4);
  return (
    <div className="p-4">
      <h4 className="text-xs uppercase font-bold tracking-wider text-muted-foreground mb-2">Tendances du moment</h4>
      <div className="flex flex-col gap-2">
        {otherStories.map(story => (
          <Link key={story.id} href={`/webtoon/${story.slug}`} className="flex gap-3 items-center p-2 rounded-lg hover:bg-muted group">
            <Image src={story.coverImage.imageUrl} alt={story.title} width={40} height={56} className="rounded-md object-cover group-hover:opacity-80 transition-opacity" />
            <div>
              <p className="text-sm font-semibold leading-tight group-hover:text-primary transition-colors">{story.title}</p>
              <p className="text-xs text-muted-foreground">{story.artistName}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

function FloatingTools({ onLike, onComment, onBookmark, onShare, isBookmarked, isLiked, commentsCount }: any) {
  return (
    <div className="fixed top-1/2 -translate-y-1/2 right-5 lg:right-[calc(320px+20px)] z-40 flex flex-col gap-2">
      <Button onClick={onLike} variant="outline" size="icon" className={cn("bg-card/80 backdrop-blur-sm rounded-full", isLiked && "text-primary border-primary bg-primary/10")}>
        <Heart className={cn(isLiked && "fill-current")} />
      </Button>
      <Button onClick={onComment} variant="outline" size="icon" className="bg-card/80 backdrop-blur-sm rounded-full relative">
        <MessageSquare />
        <Badge variant="destructive" className="absolute -top-2 -right-2">{commentsCount}</Badge>
      </Button>
      <Button onClick={onBookmark} variant="outline" size="icon" className={cn("bg-card/80 backdrop-blur-sm rounded-full", isBookmarked && "text-primary border-primary bg-primary/10")}>
        <Bookmark className={cn(isBookmarked && "fill-current")} />
      </Button>
      <Button onClick={onShare} variant="outline" size="icon" className="bg-card/80 backdrop-blur-sm rounded-full">
        <Share2 />
      </Button>
    </div>
  )
}

// #endregion

export default function ReadPage(props: { params: { storyId: string } }) {
  const params = use(props.params);
  const story = stories.find((s) => s.id === params.storyId);
  const { toast } = useToast();

  const [activeMode, setActiveMode] = useState<'scroll' | 'pages'>('scroll');
  const [progress, setProgress] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const doc = document.documentElement;
      const scrollPosition = doc.scrollTop;
      const totalHeight = doc.scrollHeight - doc.clientHeight;
      const scrollPercentage = totalHeight > 0 ? (scrollPosition / totalHeight) * 100 : 0;
      setProgress(scrollPercentage);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!story) notFound();
  
  const chapter = story.chapters?.[0] || { id: '1', title: 'Chargement...', chapterNumber: 1, slug: '1' } as any;
  const artist = artists.find(a => a.uid === story.artistId);
  const chapterComments = allComments.filter(c => c.storyId === story!.id);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({ title: "Lien copié dans le presse-papiers" });
  };
  
  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    toast({ title: isBookmarked ? 'Sauvegarde retirée' : 'Chapitre sauvegardé !'});
  };

  const handleLike = () => setIsLiked(!isLiked);

  return (
    <div className="font-sans">
      <ProgressBar progress={progress} />
      <ReaderHeader 
        story={story} 
        chapter={chapter}
        activeMode={activeMode}
        onModeChange={setActiveMode}
        onSettingsToggle={() => setShowSettings(!showSettings)}
        onBookmark={handleBookmark}
        isBookmarked={isBookmarked}
      />
      
      <div className="flex mt-14 min-h-[calc(100vh-56px)]">
        <main className="flex-1 bg-background min-w-0">
          <div className="w-full max-w-[720px] mx-auto flex flex-col items-center gap-0">
            {comicPages.map((page, index) => (
              <div key={page.id} className="relative w-full aspect-[2/3]">
                <Image
                  src={getOptimizedImage(page.imageUrl, { width: 800, quality: 'auto' })}
                  alt={page.description}
                  fill
                  className="max-w-full h-auto object-contain"
                  data-ai-hint={page.imageHint}
                  priority={index < 3}
                  loading={index < 3 ? undefined : "lazy"}
                  sizes="(max-width: 768px) 100vw, 720px"
                />
              </div>
            ))}
          </div>
        </main>
        <ReaderSidebar story={story} artist={artist} />
      </div>

      <FloatingTools 
        onLike={handleLike}
        isLiked={isLiked}
        onBookmark={handleBookmark}
        isBookmarked={isBookmarked}
        onShare={handleShare}
        onComment={() => {}}
        commentsCount={chapterComments.length}
      />
    </div>
  );
}
