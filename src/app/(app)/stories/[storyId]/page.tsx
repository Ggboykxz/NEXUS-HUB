'use client';

import { useState, use } from 'react';
import { stories, artists, comments as allComments, type Story, type Artist, type Chapter } from '@/lib/data';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { BookOpen, Eye, Heart, Star, Share2, Bookmark, Play, Edit, ChevronsDown, MessageSquare, ThumbsUp, AlertCircle, ArrowDown } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { StoryCard } from '@/components/story-card';

const formatStat = (num: number): string => {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(0)}k`;
  return num.toString();
};

function HeroSection({ story, artist, collaborators }: { story: Story, artist: Artist, collaborators: any[] }) {
  const { toast } = useToast();
  const [isBookmarked, setIsBookmarked] = useState(false);

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    toast({ title: isBookmarked ? 'Retiré de votre bibliothèque' : 'Ajouté à votre bibliothèque !' });
  };
  
  return (
    <section className="relative min-h-screen flex items-end overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-green-950/30 via-stone-950/30 to-yellow-950/20" />
      <div className="absolute inset-0 opacity-[0.04] bg-[url('/grid.svg')] [background-position:0_0.5px]" />
      
      <div className="absolute right-[5%] top-1/2 -translate-y-1/2 w-[clamp(260px,30vw,420px)] aspect-[2/3] rounded-md overflow-hidden shadow-2xl shadow-black border border-primary/20 animate-in fade-in duration-1000 slide-in-from-top-10">
        <Image src={story.coverImage.imageUrl} alt={story.title} fill className="object-cover" data-ai-hint={story.coverImage.imageHint} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <Badge className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/80 border-primary/30 backdrop-blur-sm text-primary font-display tracking-widest" variant="outline">NexusHub Pro</Badge>
      </div>

      <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-gradient-to-l from-transparent to-background/80 z-10" />
      <div className="absolute bottom-0 left-0 right-0 h-2/3 bg-gradient-to-t from-background to-transparent z-10" />

      <div className="relative z-20 p-8 max-w-3xl animate-in fade-in duration-700 slide-in-from-bottom-8">
        <div className="flex items-center gap-4 mb-4">
          <Badge variant="outline" className="border-primary/50 text-primary tracking-widest">WEBTOON</Badge>
          <Badge variant="outline" className="border-green-400/50 text-green-400">EN COURS</Badge>
          <Badge className="bg-primary text-primary-foreground font-bold">PRO</Badge>
        </div>
        
        <h1 className="font-display text-5xl md:text-7xl font-bold text-foreground leading-tight">{story.title}</h1>
        <p className="font-serif italic text-2xl text-primary/90 mt-2 mb-6">La Saga des Dieux Oubliés</p>
        
        <div className="flex flex-wrap items-center gap-3 mb-5">
           <Link href={`/artists/${artist.id}`} className="flex items-center gap-3 p-2 pr-4 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors">
              <Avatar className="h-8 w-8 border-2 border-primary/50">
                  <AvatarImage src={artist.avatar.imageUrl} />
                  <AvatarFallback>{artist.name.slice(0,1)}</AvatarFallback>
              </Avatar>
              <div>
                  <p className="text-sm font-semibold">{artist.name}</p>
                  <p className="text-xs text-muted-foreground">Auteur · Dessinateur</p>
              </div>
          </Link>
          {collaborators.map(c => (
              <Link key={c.id} href={`/artists/${c.id}`} className="flex items-center gap-3 p-2 pr-4 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors">
                  <Avatar className="h-8 w-8">
                      <AvatarImage src={c.avatar.imageUrl} />
                      <AvatarFallback>{c.name.slice(0,1)}</AvatarFallback>
                  </Avatar>
                  <div>
                      <p className="text-sm font-semibold">{c.name}</p>
                      <p className="text-xs text-muted-foreground">{c.role}</p>
                  </div>
              </Link>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-6">
          {story.tags.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}
        </div>

        <p className="font-serif text-lg leading-relaxed text-foreground/70 max-w-xl mb-7">{story.description}</p>
        
        <div className="flex items-center gap-6 mb-8 p-4 rounded-xl bg-black/20 border border-white/10 w-fit">
          <div className="text-center"><span className="font-display text-2xl text-primary block">{formatStat(story.views)}</span><span className="text-xs text-muted-foreground tracking-widest">LECTURES</span></div>
          <Separator orientation="vertical" className="h-8 bg-white/10" />
          <div className="text-center"><span className="font-display text-2xl text-primary block">{formatStat(story.likes)}</span><span className="text-xs text-muted-foreground tracking-widest">LIKES</span></div>
          <Separator orientation="vertical" className="h-8 bg-white/10" />
          <div className="text-center"><span className="font-display text-2xl text-primary block">{story.chapters.length}</span><span className="text-xs text-muted-foreground tracking-widest">CHAPITRES</span></div>
           <Separator orientation="vertical" className="h-8 bg-white/10" />
          <div className="text-center"><span className="font-display text-2xl text-primary block">{formatStat(story.subscriptions)}</span><span className="text-xs text-muted-foreground tracking-widest">ABONNÉS</span></div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button asChild size="lg" className="h-12 text-base">
            <Link href={`/read/${story.id}`}><Play className="mr-2 fill-current" /> Commencer la lecture</Link>
          </Button>
          <Button size="lg" variant="outline" className="h-12 text-base" onClick={handleBookmark}>
            <Bookmark className={cn("mr-2", isBookmarked && "fill-current text-primary")} /> {isBookmarked ? 'Sauvegardé' : 'Sauvegarder'}
          </Button>
          <Button size="icon" variant="outline" className="h-12 w-12" onClick={() => toast({title: "Lien copié dans le presse-papiers"})}>
            <Share2 />
          </Button>
        </div>
      </div>
    </section>
  );
}

// ... other components to be created for the rest of the page

export default function StoryDetailPage(props: { params: { storyId: string } }) {
  const params = use(props.params);

  const story = stories.find((s) => s.id === params.storyId);

  if (!story) {
    notFound();
  }
  
  const artist = artists.find((a) => a.id === story.artistId);
  if(!artist) {
    notFound();
  }
  
  const collaborators = story.collaborators || [];
  
  return (
    <div>
      <HeroSection story={story} artist={artist} collaborators={collaborators}/>
    </div>
  );
}
