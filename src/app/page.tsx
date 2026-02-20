'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { StoryCard } from '@/components/story-card';
import { stories, artists, getStoryUrl, getChapterUrl, type Story } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Play, Info, Star, Award, PenSquare, ChevronRight, Zap, Sparkles, BookHeart, TrendingUp, Clock, Compass, Rocket, Users, Heart, UploadCloud, MessageSquare, Flame } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/components/providers/language-provider';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

export default function HomePage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const [recommendations, setRecommendations] = useState<Story[]>([]);
  const [recTitle, setRecTitle] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<string>('all');

  const genres = [
    { id: 'all', label: 'Tout' },
    { id: 'mythologie-africaine', label: 'Mythologie' },
    { id: 'afrofuturisme', label: 'Afrofuturisme' },
    { id: 'contes-revisites', label: 'Contes' },
    { id: 'histoire-africaine', label: 'Histoire' },
    { id: 'science-fiction', label: 'Science-Fiction' },
  ];

  const autoplay = useRef(
    Autoplay({ delay: 6500, stopOnInteraction: true })
  );

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!api) return;
    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  useEffect(() => {
    const prefs = localStorage.getItem('preferredGenres');
    let list: Story[] = [];
    
    if (prefs) {
      try {
        const preferredGenres = JSON.parse(prefs) as string[];
        list = stories.filter(s => preferredGenres.includes(s.genre));
      } catch (e) {
        console.error("Error parsing preferences", e);
      }
    }

    if (list.length < 3) {
      list = [...stories].sort(() => 0.5 - Math.random()).slice(0, 10);
      setRecTitle("POUR TOI");
    } else {
      list = list.slice(0, 10);
      setRecTitle("POUR TOI");
    }
    setRecommendations(list);
  }, []);
  
  const trendingStories = [...stories].sort((a, b) => b.views - a.views).slice(0, 12);
  const newestStories = [...stories].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 6);
  const proStories = stories.filter(s => artists.find(a => a.id === s.artistId)?.isMentor).slice(0, 10);
  const draftStories = stories.filter(s => !artists.find(a => a.id === s.artistId)?.isMentor).slice(0, 10);
  const featuredStories = stories.filter(s => ['1', '2', '3'].includes(s.id));

  const filteredByGenre = useMemo(() => {
    if (selectedGenre === 'all') return stories.slice(0, 10);
    return stories.filter(s => s.genreSlug === selectedGenre).slice(0, 10);
  }, [selectedGenre]);

  return (
    <div className="flex flex-col gap-4 bg-background">
      <section className="relative w-full pt-2 md:pt-4 overflow-hidden">
        <div className="container max-w-7xl mx-auto px-4 lg:px-8">
            <Carousel
                setApi={setApi}
                opts={{ loop: true }}
                plugins={[autoplay.current]}
                className="w-full"
            >
                <CarouselContent>
                    {featuredStories.map((story, index) => {
                        const storyUrl = getStoryUrl(story);
                        const readingUrl = story.chapters.length > 0 ? getChapterUrl(story, story.chapters[0].slug) : storyUrl;
                        const artist = artists.find(a => a.id === story.artistId);
                        
                        return (
                            <CarouselItem key={story.id}>
                                <div className="relative w-full aspect-[3/4] sm:aspect-[16/9] md:aspect-[21/8] min-h-[300px] md:min-h-[350px] rounded-[1.25rem] overflow-hidden group shadow-xl border border-primary/10 bg-stone-950">
                                    <div className="absolute inset-0 transition-transform duration-700 ease-out" style={{ transform: `translateY(${scrollY * 0.1}px) scale(${1.02 + scrollY * 0.0001})` }}>
                                      <Image src={story.coverImage.imageUrl} alt={story.title} fill className="object-cover opacity-40 md:opacity-50" priority={index === 0} data-ai-hint={story.coverImage.imageHint} />
                                    </div>
                                    <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black via-black/80 md:via-black/40 to-transparent flex flex-col justify-end items-start p-6 md:p-10 lg:p-14 z-10">
                                        <div className="flex flex-col gap-2 max-w-2xl w-full">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30 backdrop-blur-xl px-2 py-0.5 font-bold text-[8px] uppercase tracking-[0.2em]">{story.genre}</Badge>
                                                {index === 0 && <Badge className="bg-cyan-500 text-white border-none px-2 py-0.5 font-bold text-[8px] uppercase tracking-[0.2em] shadow-lg animate-pulse"><Sparkles className="h-2 w-2 mr-1" /> Nouveau</Badge>}
                                                {story.isPremium && <Badge className="bg-amber-500 text-black border-none px-2 py-0.5 font-bold text-[8px] uppercase tracking-[0.2em]"><Zap className="h-2 w-2 mr-1 fill-current" /> Premium</Badge>}
                                            </div>
                                            <Link href={storyUrl} className="group/title inline-block">
                                                <h2 className="text-2xl md:text-3xl lg:text-4xl font-display font-black text-white leading-tight tracking-tighter group-hover/title:text-primary transition-colors duration-300">{story.title}</h2>
                                            </Link>
                                            <div className="relative pl-3 border-l border-primary/40 max-w-xl">
                                                <p className="text-white/90 text-[10px] md:text-sm font-light leading-relaxed italic line-clamp-2">"{story.description}"</p>
                                            </div>
                                            <Link href={`/artiste/${artist?.slug}`} className="flex items-center gap-2 mt-1 group/artist-info w-fit">
                                                <div className="relative">
                                                    <Avatar className="h-7 w-7 border border-primary/40 p-0.5 bg-background group-hover/artist-info:border-primary transition-colors">
                                                        <AvatarImage src={artist?.avatar.imageUrl} alt={story.artistName} />
                                                        <AvatarFallback>{story.artistName?.[0]}</AvatarFallback>
                                                    </Avatar>
                                                    {artist?.isMentor && <div className="absolute -top-1 -right-1 bg-emerald-500 rounded-full p-0.5 border border-background shadow-lg"><Award className="h-2.5 w-2.5 text-white" /></div>}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-white font-bold text-[10px] tracking-tight group-hover/artist-info:text-primary transition-colors">{story.artistName}</span>
                                                    <span className="text-primary/80 text-[7px] uppercase tracking-widest font-bold">{artist?.isMentor ? 'Artiste Certifié Pro' : 'Jeune Talent NexusHub'}</span>
                                                </div>
                                            </Link>
                                            <div className="flex flex-wrap items-center gap-2 mt-2">
                                                <Button asChild size="sm" className="h-9 px-5 rounded-full font-bold text-[10px] shadow-md transition-transform active:scale-95 group/btn">
                                                    <Link href={readingUrl}><Play className="mr-1.5 h-3 w-3 fill-current group-hover/btn:scale-110 transition-transform" /> Lire</Link>
                                                </Button>
                                                <Button asChild variant="outline" size="sm" className="h-9 px-5 rounded-full bg-white/5 border-white/20 text-white hover:bg-white/10 backdrop-blur-xl text-[10px] transition-all hover:border-white/40">
                                                    <Link href={storyUrl}><Info className="mr-1.5 h-3 w-3" /> Détails</Link>
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CarouselItem>
                        );
                    })}
                </CarouselContent>
            </Carousel>
            <div className="flex justify-center items-center gap-1.5 mt-3">
                {Array.from({ length: count }).map((_, index) => (
                    <button key={index} onClick={() => api?.scrollTo(index)} className={cn("transition-all duration-500 rounded-full", current === index ? "w-6 h-1 bg-primary shadow-sm" : "w-1 h-1 bg-muted-foreground/30 hover:bg-muted-foreground/60")} aria-label={`Aller à l'œuvre ${index + 1}`} />
                ))}
            </div>
        </div>
      </section>

      <main className="container max-w-7xl mx-auto px-6 lg:px-8 py-4 space-y-10">
        {recommendations.length > 0 && (
          <section className="animate-in fade-in-up duration-700">
            <div className="flex justify-between items-center mb-3 border-b border-primary/10 pb-1.5">
              <Link href="/for-you" className="flex items-center gap-2 group/for-you w-fit">
                <div className="bg-primary/10 p-1 rounded-lg group-hover/for-you:bg-primary/20 transition-colors"><BookHeart className="h-4 w-4 text-primary" /></div>
                <div><h2 className="text-lg font-display font-bold text-foreground tracking-tight group-hover/for-you:text-primary transition-colors">{recTitle}</h2></div>
              </Link>
              <Button asChild variant="outline" size="sm" className="rounded-full font-bold h-7 text-[10px] px-3"><Link href="/for-you">Voir Plus</Link></Button>
            </div>
            <div className="flex overflow-x-auto pb-2 gap-3 hide-scrollbar snap-x snap-mandatory">
              {recommendations.map((story) => (<div key={`rec-${story.id}`} className="flex-none w-[110px] sm:w-[160px] snap-start"><StoryCard story={story} /></div>))}
            </div>
          </section>
        )}

        <section className="animate-in fade-in-up duration-700 delay-100">
          <div className="flex justify-between items-center mb-3 border-b border-rose-500/10 pb-1.5">
            <Link href="/rankings" className="flex items-center gap-2 group/title">
              <div className="bg-rose-500/10 p-1 rounded-lg group-hover/title:bg-rose-500/20 transition-colors"><TrendingUp className="h-4 w-4 text-rose-500" /></div>
              <div><h2 className="text-lg font-display font-bold text-foreground tracking-tight group-hover/title:text-rose-500 transition-colors">Tendances</h2></div>
            </Link>
            <Link href="/rankings" className="text-[10px] font-bold text-rose-500 hover:text-rose-400 transition-colors flex items-center gap-1 group">Voir Tout <ChevronRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" /></Link>
          </div>
          <div className="flex overflow-x-auto pb-2 gap-3 hide-scrollbar snap-x snap-mandatory">
            {trendingStories.map((story) => (<div key={`trending-${story.id}`} className="flex-none w-[110px] sm:w-[160px] snap-start"><StoryCard story={story} /></div>))}
          </div>
        </section>

        <section className="animate-in fade-in-up duration-700">
          <div className="flex flex-col md:flex-row justify-between items-end mb-3 gap-2 border-b border-primary/10 pb-1.5">
            <Link href="/stories" className="flex items-center gap-2 group/genre-title w-fit">
              <div className="bg-primary/10 p-1 rounded-lg group-hover/genre-title:bg-primary/20 transition-colors"><Compass className="h-4 w-4 text-primary" /></div>
              <div><h2 className="text-lg font-display font-bold text-foreground tracking-tight group-hover/genre-title:text-primary transition-colors">Explorez par Genre</h2></div>
            </Link>
            <Link href="/stories" className="text-[10px] font-bold text-primary hover:text-primary/80 transition-colors flex items-center gap-1 group">Tout le catalogue <ChevronRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" /></Link>
          </div>
          <div className="flex flex-wrap gap-1.5 mb-4">
            {genres.map((genre) => (
              <button key={genre.id} onClick={() => setSelectedGenre(genre.id)} className={cn("px-3 py-1.5 rounded-lg border transition-all duration-300 group", selectedGenre === genre.id ? "border-primary bg-primary text-primary-foreground shadow-sm scale-105" : "border-border bg-card hover:border-primary/50 hover:bg-primary/5")}>
                <span className="font-bold text-[9px] uppercase tracking-wider">{genre.label}</span>
              </button>
            ))}
          </div>
          <div className="flex overflow-x-auto pb-2 gap-3 hide-scrollbar snap-x snap-mandatory min-h-[250px]">
            {filteredByGenre.length > 0 ? (filteredByGenre.map((story) => (<div key={`genre-${story.id}-${selectedGenre}`} className="flex-none w-[110px] sm:w-[160px] snap-start"><StoryCard story={story} /></div>))) : (
              <div className="w-full flex flex-col items-center justify-center py-8 text-muted-foreground border border-dashed rounded-2xl">
                <Compass className="h-6 w-6 mb-2 opacity-20" /><p className="italic text-[10px]">Aucune œuvre trouvée dans cet univers.</p>
              </div>
            )}
          </div>
        </section>

        <section className="animate-in fade-in-up duration-700 delay-200">
          <div className="flex justify-between items-center mb-3 border-b border-cyan-500/10 pb-1.5">
            <Link href="/new-releases" className="flex items-center gap-2 group/title">
              <div className="bg-cyan-500/10 p-1 rounded-lg group-hover/title:bg-cyan-500/20 transition-colors"><Clock className="h-4 w-4 text-cyan-500" /></div>
              <div><h2 className="text-lg font-display font-bold text-foreground tracking-tight group-hover/title:text-cyan-500 transition-colors">Nouveautés</h2></div>
            </Link>
            <Link href="/new-releases" className="text-[10px] font-bold text-cyan-500 hover:text-cyan-400 transition-colors flex items-center gap-1 group">Voir Tout <ChevronRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" /></Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {newestStories.map((story) => {
              const latestChapter = story.chapters[story.chapters.length - 1];
              const artist = artists.find(a => a.id === story.artistId);
              const readingUrl = latestChapter ? getChapterUrl(story, latestChapter.slug) : getStoryUrl(story);
              return (
                <Card key={`new-${story.id}`} className="group hover:border-cyan-500/30 transition-all duration-300 overflow-hidden bg-muted/20 border-none shadow-sm">
                  <CardContent className="p-2 flex gap-3">
                    <Link href={getStoryUrl(story)} className="shrink-0"><div className="relative w-14 aspect-[2/3] rounded-lg overflow-hidden shadow-md group-hover:scale-105 transition-transform duration-500"><Image src={story.coverImage.imageUrl} alt={story.title} fill className="object-cover" /></div></Link>
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-0.5"><Link href={getStoryUrl(story)}><h3 className="font-bold text-[11px] truncate group-hover:text-cyan-500 transition-colors">{story.title}</h3></Link><Badge variant="outline" className="text-[7px] h-3.5 px-1 uppercase tracking-tighter border-cyan-500/20 text-cyan-500">Ch. {story.chapters.length}</Badge></div>
                        <p className="text-[8px] text-muted-foreground mb-1 flex items-center gap-1">par <Link href={`/artiste/${artist?.slug}`} className="font-semibold text-foreground/80 hover:text-primary transition-colors">{story.artistName}</Link>{artist?.isMentor ? <Award className="h-2.5 w-2.5 text-emerald-500" /> : <PenSquare className="h-2.5 w-2.5 text-orange-400" />}</p>
                        <p className="text-[9px] text-muted-foreground/70 italic line-clamp-2 leading-tight mb-1">"{story.description}"</p>
                      </div>
                      <div className="flex items-center justify-between mt-auto"><span className="text-[7px] text-muted-foreground uppercase font-bold tracking-widest flex items-center gap-1"><Clock className="h-2 w-2" /> 2h</span><Button asChild size="sm" className="h-5 px-2 rounded-full bg-cyan-600 hover:bg-cyan-700 text-[8px] font-bold"><Link href={readingUrl}>Lire</Link></Button></div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        <section className="relative">
            <div className="absolute -inset-x-6 md:-inset-x-12 -inset-y-4 bg-emerald-500/[0.02] -z-10 rounded-xl" />
            <div className="flex justify-between items-center mb-4 border-b border-emerald-500/10 pb-1.5">
                <Link href="/pro-selection" className="flex items-center gap-2 group/title">
                    <div className="bg-emerald-500/10 p-1 rounded-lg group-hover/title:bg-emerald-500/20 transition-colors"><Award className="h-4 w-4 text-emerald-500" /></div>
                    <div><h2 className="text-lg font-display font-bold text-foreground tracking-tight group-hover/title:text-emerald-500 transition-colors">Sélection NexusHub Pro</h2></div>
                </Link>
                <Link href="/pro-selection" className="text-[10px] font-bold text-emerald-500 hover:text-emerald-400 transition-colors flex items-center gap-1 group">Voir tout <ChevronRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" /></Link>
            </div>
            <div className="flex overflow-x-auto pb-2 gap-3 hide-scrollbar snap-x snap-mandatory">
                {proStories.map((story) => (<div key={`pro-${story.id}`} className="flex-none w-[110px] sm:w-[160px] snap-start"><StoryCard story={story} /></div>))}
            </div>
        </section>

        <section className="relative">
            <div className="absolute -inset-x-6 md:-inset-x-12 -inset-y-4 bg-orange-500/[0.02] -z-10 rounded-xl" />
            <div className="flex justify-between items-center mb-4 border-b border-orange-500/10 pb-1.5">
                <Link href="/draft-exploration" className="flex items-center gap-2 group/title">
                    <div className="bg-orange-500/10 p-1 rounded-lg group-hover/title:bg-orange-500/20 transition-colors"><PenSquare className="h-4 w-4 text-orange-400" /></div>
                    <div><h2 className="text-lg font-display font-bold text-foreground tracking-tight group-hover/title:text-orange-400 transition-colors">Exploration NexusHub Draft</h2></div>
                </Link>
                <Link href="/draft-exploration" className="text-[10px] font-bold text-orange-400 hover:text-orange-300 transition-colors flex items-center gap-1 group">Voir tout <ChevronRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" /></Link>
            </div>
            <div className="flex overflow-x-auto pb-2 gap-3 hide-scrollbar snap-x snap-mandatory">
                {draftStories.map((story) => (<div key={`draft-${story.id}`} className="flex-none w-[110px] sm:w-[160px] snap-start"><StoryCard story={story} /></div>))}
            </div>
        </section>
      </main>
    </div>
  );
}
