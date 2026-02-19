'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { StoryCard } from '@/components/story-card';
import { stories, artists, getStoryUrl, getChapterUrl, type Story } from '@/lib/data';
import { Play, Info, Star, Award, PenSquare, ChevronRight, Zap, Sparkles, BookHeart, TrendingUp, Clock } from 'lucide-react';
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

export default function HomePage() {
  const { t } = useTranslation();
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const [recommendations, setRecommendations] = useState<Story[]>([]);
  const [recTitle, setRecTitle] = useState("");

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
    // Recommandations logic
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
      // Fallback to random/trending
      list = [...stories].sort(() => 0.5 - Math.random()).slice(0, 5);
      setRecTitle(t('home.trending_fallback'));
    } else {
      list = list.slice(0, 5);
      setRecTitle(t('home.for_you_title'));
    }
    setRecommendations(list);
  }, [t]);
  
  const trendingStories = [...stories].sort((a, b) => b.views - a.views).slice(0, 6);
  const newestStories = [...stories].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 6);
  const proStories = stories.filter(s => artists.find(a => a.id === s.artistId)?.isMentor).slice(0, 5);
  const draftStories = stories.filter(s => !artists.find(a => a.id === s.artistId)?.isMentor).slice(0, 5);
  const featuredStories = stories.filter(s => ['1', '2', '3'].includes(s.id));

  return (
    <div className="flex flex-col gap-12 bg-background">
      <h1 className="sr-only">NexusHub - Moodboard Afro-futuriste & Bandes Dessinées Africaines</h1>
      
      {/* Featured Moodboard Carousel Section with Parallax */}
      <section className="relative w-full pt-4 md:pt-8 overflow-hidden">
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
                                <div className="relative w-full aspect-[3/4] sm:aspect-[16/10] md:aspect-[21/9] min-h-[650px] md:min-h-[550px] rounded-[2rem] overflow-hidden group shadow-2xl border border-primary/10 bg-stone-950">
                                    
                                    {/* Parallax Background Image */}
                                    <div 
                                      className="absolute inset-0 transition-transform duration-700 ease-out"
                                      style={{ 
                                        transform: `translateY(${scrollY * 0.15}px) scale(${1.05 + scrollY * 0.0001})` 
                                      }}
                                    >
                                      <Image
                                          src={story.coverImage.imageUrl}
                                          alt={story.title}
                                          fill
                                          className="object-cover opacity-40 md:opacity-50"
                                          priority={index === 0}
                                          data-ai-hint={story.coverImage.imageHint}
                                      />
                                    </div>
                                    
                                    {/* Cinematic Overlay Gradient */}
                                    <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black via-black/80 md:via-black/40 to-transparent flex flex-col justify-end items-start p-8 md:p-16 lg:p-20 z-10">
                                        <div className="carousel-content-animate flex flex-col gap-4 md:gap-6 max-w-3xl w-full">
                                            
                                            {/* Badges & Tags */}
                                            <div className="flex flex-wrap items-center gap-3">
                                                <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30 backdrop-blur-xl px-4 py-1.5 font-bold text-[10px] uppercase tracking-[0.2em] shadow-inner">
                                                    {story.genre}
                                                </Badge>
                                                {index === 0 && (
                                                    <Badge className="bg-cyan-500 text-white border-none px-4 py-1.5 font-bold text-[10px] uppercase tracking-[0.2em] shadow-lg animate-pulse">
                                                        <Sparkles className="h-3 w-3 mr-2" /> Nouveau
                                                    </Badge>
                                                )}
                                                {story.isPremium && (
                                                    <Badge className="bg-amber-500 text-black border-none px-4 py-1.5 font-bold text-[10px] uppercase tracking-[0.2em] shadow-lg">
                                                        <Zap className="h-3 w-3 mr-2 fill-current" /> Premium
                                                    </Badge>
                                                )}
                                            </div>
                                            
                                            {/* Titre Impactant Cliquable */}
                                            <Link href={storyUrl} className="group/title inline-block">
                                                <h2 className="text-4xl md:text-6xl lg:text-7xl font-display font-black text-white leading-none tracking-tighter drop-shadow-2xl group-hover/title:text-primary transition-colors duration-300">
                                                    {story.title}
                                                </h2>
                                            </Link>
                                            
                                            {/* Synopsis Style Moodboard */}
                                            <div className="relative pl-6 border-l-2 border-primary/40 max-w-2xl">
                                                <p className="text-white/90 text-base md:text-xl font-light leading-relaxed italic line-clamp-3 md:line-clamp-4 drop-shadow-lg">
                                                    "{story.description}"
                                                </p>
                                            </div>

                                            {/* Infos Artiste Cliquables */}
                                            <Link href={`/artiste/${artist?.slug}`} className="flex items-center gap-4 mt-2 group/artist-info w-fit">
                                                <div className="relative">
                                                    <Avatar className="h-12 w-12 border-2 border-primary/40 p-0.5 bg-background group-hover/artist-info:border-primary transition-colors">
                                                        <AvatarImage src={artist?.avatar.imageUrl} alt={story.artistName} />
                                                        <AvatarFallback>{story.artistName?.[0]}</AvatarFallback>
                                                    </Avatar>
                                                    {artist?.isMentor && (
                                                        <div className="absolute -top-1 -right-1 bg-emerald-500 rounded-full p-1 border-2 border-background shadow-lg">
                                                            <Award className="h-3 w-3 text-white" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-white font-bold text-base tracking-tight group-hover/artist-info:text-primary transition-colors">{story.artistName}</span>
                                                    <span className="text-primary/80 text-[10px] uppercase tracking-widest font-bold">
                                                        {artist?.isMentor ? 'Artiste Certifié Pro' : 'Jeune Talent NexusHub'}
                                                    </span>
                                                </div>
                                            </Link>

                                            {/* Boutons d'Action */}
                                            <div className="flex flex-wrap items-center gap-4 mt-4">
                                                <Button asChild size="lg" className="h-14 md:h-16 px-10 md:px-12 rounded-full font-bold text-base shadow-2xl shadow-primary/30 transition-transform active:scale-95 group/btn">
                                                    <Link href={readingUrl}>
                                                        <Play className="mr-3 h-5 w-5 fill-current group-hover/btn:scale-110 transition-transform" />
                                                        {t('common.read')}
                                                    </Link>
                                                </Button>
                                                <Button asChild variant="outline" size="lg" className="h-14 md:h-16 px-10 md:px-12 rounded-full bg-white/5 border-white/20 text-white hover:bg-white/10 backdrop-blur-xl text-base transition-all hover:border-white/40 shadow-xl">
                                                    <Link href={storyUrl}>
                                                        <Info className="mr-3 h-5 w-5" />
                                                        {t('common.details')}
                                                    </Link>
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

            {/* Pagination Dots Animés */}
            <div className="flex justify-center items-center gap-3 mt-10">
                {Array.from({ length: count }).map((_, index) => (
                    <button
                        key={index}
                        onClick={() => api?.scrollTo(index)}
                        className={cn(
                            "transition-all duration-500 rounded-full",
                            current === index 
                                ? "w-12 h-2.5 bg-primary shadow-lg shadow-primary/20" 
                                : "w-2.5 h-2.5 bg-muted-foreground/30 hover:bg-muted-foreground/60"
                        )}
                        aria-label={`Aller à l'œuvre ${index + 1}`}
                    />
                ))}
            </div>
        </div>
      </section>

      {/* Sections de contenu */}
      <main className="container max-w-7xl mx-auto px-6 lg:px-8 py-12 space-y-24">
        
        {/* Section Recommandations Personnalisées */}
        {recommendations.length > 0 && (
          <section className="animate-in fade-in-up duration-700">
            <Link href="/for-you" className="flex items-center gap-4 mb-10 group/for-you w-fit">
              <div className="bg-primary/10 p-3 rounded-2xl group-hover/for-you:bg-primary/20 transition-colors">
                <BookHeart className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h2 className="text-3xl font-display font-bold text-foreground tracking-tight group-hover/for-you:text-primary transition-colors">{recTitle}</h2>
                <p className="text-sm text-muted-foreground font-light">Une sélection aux petits oignons pour vos yeux.</p>
              </div>
            </Link>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-x-6 gap-y-12">
              {recommendations.map((story) => (
                <StoryCard key={`rec-${story.id}`} story={story} />
              ))}
            </div>
          </section>
        )}

        {/* Section Tendances */}
        <section className="animate-in fade-in-up duration-700 delay-150">
          <div className="flex justify-between items-center mb-10 border-b border-rose-500/10 pb-6">
            <Link href="/rankings" className="flex items-center gap-4 group/title">
              <div className="bg-rose-500/10 p-3 rounded-xl group-hover/title:bg-rose-500/20 transition-colors">
                <TrendingUp className="h-8 w-8 text-rose-500" />
              </div>
              <div>
                <h2 className="text-3xl font-display font-bold text-foreground tracking-tight group-hover/title:text-rose-500 transition-colors">Tendances – Les Plus Lus Actuellement</h2>
                <p className="text-sm text-muted-foreground font-light">Les œuvres qui font vibrer la communauté cette semaine.</p>
              </div>
            </Link>
            <Link href="/rankings" className="text-sm font-bold text-rose-500 hover:text-rose-400 transition-colors flex items-center gap-1 group">
              Voir Toutes les Tendances <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-x-6 gap-y-12">
            {trendingStories.map((story) => (
              <StoryCard key={`trending-${story.id}`} story={story} />
            ))}
          </div>
        </section>

        {/* Section Nouveautés - Derniers Chapitres */}
        <section className="animate-in fade-in-up duration-700 delay-300">
          <div className="flex justify-between items-center mb-10 border-b border-cyan-500/10 pb-6">
            <Link href="/new-releases" className="flex items-center gap-4 group/title">
              <div className="bg-cyan-500/10 p-3 rounded-xl group-hover/title:bg-cyan-500/20 transition-colors">
                <Clock className="h-8 w-8 text-cyan-500" />
              </div>
              <div>
                <h2 className="text-3xl font-display font-bold text-foreground tracking-tight group-hover/title:text-cyan-500 transition-colors">{t('home.new_releases_title')}</h2>
                <p className="text-sm text-muted-foreground font-light">Les dernières aventures ajoutées au catalogue.</p>
              </div>
            </Link>
            <Link href="/new-releases" className="text-sm font-bold text-cyan-500 hover:text-cyan-400 transition-colors flex items-center gap-1 group">
              Voir Tout <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {newestStories.map((story) => {
              const latestChapter = story.chapters[story.chapters.length - 1];
              const artist = artists.find(a => a.id === story.artistId);
              const readingUrl = latestChapter ? getChapterUrl(story, latestChapter.slug) : getStoryUrl(story);
              
              return (
                <Card key={`new-${story.id}`} className="group hover:border-cyan-500/30 transition-all duration-300 overflow-hidden bg-muted/20 border-none shadow-sm">
                  <CardContent className="p-4 flex gap-4">
                    <Link href={getStoryUrl(story)} className="shrink-0">
                      <div className="relative w-24 aspect-[2/3] rounded-lg overflow-hidden shadow-lg group-hover:scale-105 transition-transform duration-500">
                        <Image
                          src={story.coverImage.imageUrl}
                          alt={story.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </Link>
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <Link href={getStoryUrl(story)}>
                            <h3 className="font-bold text-base truncate group-hover:text-cyan-500 transition-colors">{story.title}</h3>
                          </Link>
                          <Badge variant="outline" className="text-[9px] uppercase tracking-tighter border-cyan-500/20 text-cyan-500">
                            Chap. {story.chapters.length}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5">
                          par <span className="font-semibold text-foreground/80">{story.artistName}</span>
                          {artist?.isMentor ? <Award className="h-3.5 w-3.5 text-emerald-500" /> : <PenSquare className="h-3.5 w-3.5 text-orange-400" />}
                        </p>
                        <p className="text-xs text-muted-foreground/70 italic line-clamp-2 leading-relaxed mb-3">
                          "{story.description}"
                        </p>
                      </div>
                      <div className="flex items-center justify-between mt-auto">
                        <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest flex items-center gap-1">
                          <Clock className="h-3 w-3" /> Il y a 2h
                        </span>
                        <Button asChild size="sm" className="h-8 px-4 rounded-full bg-cyan-600 hover:bg-cyan-700 text-xs font-bold">
                          <Link href={readingUrl}>Lire</Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Section Pro */}
        <section className="relative">
            <div className="absolute -inset-x-6 md:-inset-x-12 -inset-y-8 bg-emerald-500/[0.02] -z-10 rounded-3xl" />
            <div className="flex justify-between items-center mb-12 border-b border-emerald-500/10 pb-6">
                <Link href="/stories?type=premium" className="flex items-center gap-4 group/title">
                    <div className="bg-emerald-500/10 p-3 rounded-xl group-hover/title:bg-emerald-500/20 transition-colors">
                        <Award className="h-8 w-8 text-emerald-500" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-display font-bold text-foreground tracking-tight group-hover/title:text-emerald-500 transition-colors">{t('home.pro_title')}</h2>
                        <p className="text-sm text-muted-foreground font-light">L'élite de la narration visuelle africaine.</p>
                    </div>
                </Link>
                <Link href="/stories?type=premium" className="text-sm font-bold text-emerald-500 hover:text-emerald-400 transition-colors flex items-center gap-1 group">
                    Voir tout <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-x-6 gap-y-12">
                {proStories.map((story) => (
                    <StoryCard key={story.id} story={story} />
                ))}
            </div>
        </section>

        {/* Section Draft */}
        <section className="relative">
            <div className="absolute -inset-x-6 md:-inset-x-12 -inset-y-8 bg-orange-500/[0.02] -z-10 rounded-3xl" />
            <div className="flex justify-between items-center mb-12 border-b border-orange-500/10 pb-6">
                <Link href="/stories?type=public" className="flex items-center gap-4 group/title">
                    <div className="bg-orange-500/10 p-3 rounded-xl group-hover/title:bg-orange-500/20 transition-colors">
                        <PenSquare className="h-8 w-8 text-orange-400" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-display font-bold text-foreground tracking-tight group-hover/title:text-orange-400 transition-colors">{t('home.draft_title')}</h2>
                        <p className="text-sm text-muted-foreground font-light">Les nouveaux visages du 9ème art continental.</p>
                    </div>
                </Link>
                <Link href="/stories?type=public" className="text-sm font-bold text-orange-400 hover:text-orange-300 transition-colors flex items-center gap-1 group">
                    Voir tout <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-x-6 gap-y-12">
                {draftStories.map((story) => (
                    <StoryCard key={story.id} story={story} />
                ))}
            </div>
        </section>
      </main>
    </div>
  );
}
