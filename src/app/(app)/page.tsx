'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { StoryCard } from '@/components/story-card';
import { stories, artists, getStoryUrl, getChapterUrl } from '@/lib/data';
import { Play, Info, Star, Award, PenSquare, ChevronRight, Zap, Sparkles } from 'lucide-react';
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

export default function HomePage() {
  const { t } = useTranslation();
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  const autoplay = useRef(
    Autoplay({ delay: 6500, stopOnInteraction: true })
  );

  useEffect(() => {
    if (!api) return;
    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);
  
  const proStories = stories.filter(s => artists.find(a => a.id === s.artistId)?.isMentor).slice(0, 5);
  const draftStories = stories.filter(s => !artists.find(a => a.id === s.artistId)?.isMentor).slice(0, 5);
  // Sélection des 3 piliers du moodboard : Orisha, Cyber-Dakar, Griot/Historique
  const featuredStories = stories.filter(s => ['1', '2', '3'].includes(s.id));

  return (
    <div className="flex flex-col gap-12 bg-background">
      <h1 className="sr-only">NexusHub - Moodboard Afro-futuriste & Bandes Dessinées Africaines</h1>
      
      {/* Featured Moodboard Carousel Section */}
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
                                <div className="relative w-full aspect-[3/4] sm:aspect-[16/10] md:aspect-[21/9] min-h-[600px] md:min-h-[500px] rounded-[2rem] overflow-hidden group shadow-2xl border border-primary/10 bg-stone-950">
                                    {/* Image de fond massive */}
                                    <Image
                                        src={story.coverImage.imageUrl}
                                        alt={story.title}
                                        fill
                                        className="object-cover transition-transform duration-[12s] scale-105 group-hover:scale-110 opacity-40 md:opacity-50"
                                        priority={index === 0}
                                        data-ai-hint={story.coverImage.imageHint}
                                    />
                                    
                                    {/* Overlay Gradient Progressif */}
                                    <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black via-black/80 md:via-black/40 to-transparent flex flex-col justify-end items-start p-8 md:p-16 lg:p-20">
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
                                            
                                            {/* Titre Impactant */}
                                            <h2 className="text-4xl md:text-6xl lg:text-7xl font-display font-black text-white leading-none tracking-tighter drop-shadow-sm">
                                                {story.title}
                                            </h2>
                                            
                                            {/* Synopsis Style Moodboard */}
                                            <div className="relative pl-6 border-l-2 border-primary/40 max-w-2xl">
                                                <p className="text-white/80 text-base md:text-xl font-light leading-relaxed italic line-clamp-3 md:line-clamp-4">
                                                    "{story.description}"
                                                </p>
                                            </div>

                                            {/* Infos Artiste */}
                                            <div className="flex items-center gap-4 mt-2">
                                                <div className="relative">
                                                    <Avatar className="h-12 w-12 border-2 border-primary/40 p-0.5 bg-background">
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
                                                    <span className="text-white font-bold text-base tracking-tight">{story.artistName}</span>
                                                    <span className="text-primary/80 text-[10px] uppercase tracking-widest font-bold">
                                                        {artist?.isMentor ? 'Artiste Certifié Pro' : 'Jeune Talent NexusHub'}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Boutons d'Action */}
                                            <div className="flex flex-wrap items-center gap-4 mt-4">
                                                <Button asChild size="lg" className="h-14 md:h-16 px-10 md:px-12 rounded-full font-bold text-base shadow-2xl shadow-primary/30 transition-transform active:scale-95 group/btn">
                                                    <Link href={readingUrl}>
                                                        <Play className="mr-3 h-5 w-5 fill-current group-hover/btn:scale-110 transition-transform" />
                                                        {t('common.read')}
                                                    </Link>
                                                </Button>
                                                <Button asChild variant="outline" size="lg" className="h-14 md:h-16 px-10 md:px-12 rounded-full bg-white/5 border-white/20 text-white hover:bg-white/10 backdrop-blur-xl text-base transition-all hover:border-white/40">
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
        {/* Section Pro */}
        <section className="relative">
            <div className="absolute -inset-x-6 md:-inset-x-12 -inset-y-8 bg-emerald-500/[0.02] -z-10 rounded-3xl" />
            <div className="flex justify-between items-center mb-12 border-b border-emerald-500/10 pb-6">
                <div className="flex items-center gap-4">
                    <div className="bg-emerald-500/10 p-3 rounded-xl">
                        <Award className="h-8 w-8 text-emerald-500" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-display font-bold text-foreground tracking-tight">{t('home.pro_title')}</h2>
                        <p className="text-sm text-muted-foreground font-light">L'élite de la narration visuelle africaine.</p>
                    </div>
                </div>
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
                <div className="flex items-center gap-4">
                    <div className="bg-orange-500/10 p-3 rounded-xl">
                        <PenSquare className="h-8 w-8 text-orange-400" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-display font-bold text-foreground tracking-tight">{t('home.draft_title')}</h2>
                        <p className="text-sm text-muted-foreground font-light">Les nouveaux visages du 9ème art continental.</p>
                    </div>
                </div>
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
