'use client';

import { useState, useEffect, use } from 'react';
import { stories, comicPages, comments as allComments, artists, type Artist, type Chapter, type Story } from '@/lib/data';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  Layers, Book, ChevronLeft, ChevronRight, Bookmark, Settings, Heart, MessageSquare, Share2, Award, Eye, Coins, Check, Star
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

// #region Components

function ReaderHeader({ story, chapter, onModeChange, activeMode, onBookmark, isBookmarked }: any) {
  return (
    <nav className="fixed top-0 left-0 right-0 h-14 bg-background/95 border-b border-border z-50 flex items-center justify-between px-5 backdrop-blur-xl">
      <div className="flex items-center gap-4 flex-1">
        <Link href="/" className="font-display text-base tracking-widest text-primary hidden md:block">NexusHub</Link>
        <div className="w-px h-5 bg-border hidden md:block" />
        <div className="flex items-center gap-2 text-sm text-muted-foreground overflow-hidden">
          <Link href={`/webtoon/${story.slug}`} className="hover:text-primary transition-colors hidden sm:block font-medium truncate">{story.title}</Link>
          <ChevronRight className="h-4 w-4 hidden sm:block shrink-0" />
          <span className="text-primary font-semibold whitespace-nowrap truncate">Chap. {chapter.title}</span>
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
                {chap.title}
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
      </div>
    </nav>
  );
}

function ReaderSidebar({ story, artist }: { story: Story, artist: Artist }) {
  return (
    <aside className="w-[320px] bg-card border-l border-border h-[calc(100vh-56px)] sticky top-14 flex-shrink-0 hidden lg:flex flex-col">
      <div className="p-4 border-b border-border bg-muted/30">
        <div className="flex gap-3 mb-4">
          <Image src={story.coverImage.imageUrl} alt={story.title} width={56} height={80} className="rounded-md object-cover shadow-md" />
          <div className="min-w-0">
            <h3 className="font-display text-sm font-bold truncate">{story.title}</h3>
            <p className="text-xs text-primary font-medium flex items-center gap-1"><Award className="h-3 w-3" /> {artist.name}</p>
            <div className="flex gap-2 text-[10px] text-muted-foreground mt-1">
              <span className="flex items-center gap-0.5"><Eye className="h-2.5 w-2.5" /> {(story.views/1000).toFixed(0)}k</span>
              <span className="flex items-center gap-0.5"><Heart className="h-2.5 w-2.5" /> {(story.likes/1000).toFixed(0)}k</span>
            </div>
          </div>
        </div>
        <Button size="sm" className="w-full bg-primary/10 text-primary hover:bg-primary/20 border-none h-8 text-[10px] uppercase font-bold tracking-widest">
          Soutenir l'artiste 🪙
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Chapitres</span>
            <Badge variant="secondary" className="text-[10px]">{story.chapters.length}</Badge>
          </div>
          <div className="space-y-1">
            {story.chapters.map((chap, idx) => (
              <Link key={chap.id} href={`/webtoon/${story.slug}/${chap.slug}`} className={cn(
                "flex items-center gap-3 p-2 rounded-lg transition-all hover:bg-muted group",
                idx === 0 && "bg-primary/5 border border-primary/10"
              )}>
                <span className={cn("w-6 text-xs font-mono text-center", idx === 0 ? "text-primary font-bold" : "text-muted-foreground")}>{story.chapters.length - idx}</span>
                <span className={cn("flex-1 text-sm truncate", idx === 0 && "text-primary font-medium")}>{chap.title}</span>
                {idx === 0 && <span className="text-[8px] bg-primary text-white px-1 rounded-sm font-bold">LU</span>}
              </Link>
            ))}
          </div>
        </div>
      </ScrollArea>
    </aside>
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

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    toast({ title: isBookmarked ? 'Retiré de votre bibliothèque' : 'Ajouté à votre bibliothèque !' });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <ReaderHeader 
        story={story} 
        chapter={chapter} 
        activeMode={activeMode} 
        onModeChange={setActiveMode}
        onBookmark={handleBookmark}
        isBookmarked={isBookmarked}
      />
      
      <div className="flex mt-14 flex-1">
        <main className={cn(
          "flex-1 flex flex-col items-center gap-0 bg-stone-950/20",
          activeMode === 'pages' && "p-4 md:p-8"
        )}>
          <div className={cn(
            "w-full mx-auto shadow-2xl",
            activeMode === 'scroll' ? "max-w-[800px]" : "max-w-[1000px] flex flex-wrap justify-center gap-4"
          )}>
            {comicPages.map((page, index) => (
              <div key={page.id} className={cn(
                "relative bg-stone-900",
                activeMode === 'scroll' ? "w-full aspect-[2/3]" : "w-[48%] md:w-[45%] aspect-[2/3] rounded-lg overflow-hidden border border-white/5"
              )}>
                <Image
                  src={page.imageUrl}
                  alt={page.description}
                  fill
                  className="object-contain"
                  data-ai-hint={page.imageHint}
                  priority={index < 2}
                />
              </div>
            ))}
          </div>
          
          {/* End of Chapter Section */}
          <div className="w-full max-w-[800px] py-20 px-6 text-center space-y-8">
            <Separator className="bg-primary/20" />
            <div className="space-y-4">
              <h3 className="text-2xl font-display font-bold">Vous avez terminé ce chapitre !</h3>
              <p className="text-muted-foreground">Soutenez {artist.name} pour plus de contenu incroyable.</p>
            </div>
            <div className="flex justify-center gap-4">
              <Button size="lg" className="rounded-full px-8" onClick={() => setIsLiked(!isLiked)}>
                <Heart className={cn("mr-2 h-5 w-5", isLiked && "fill-current")} /> {isLiked ? 'Aimé' : "J'aime"}
              </Button>
              <Button size="lg" variant="outline" className="rounded-full px-8">
                Suivant <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </main>
        
        <ReaderSidebar story={story} artist={artist} />
      </div>
    </div>
  );
}
