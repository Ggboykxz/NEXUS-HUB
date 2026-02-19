'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { StoryCard } from '@/components/story-card';
import { stories, artists, getStoryUrl, getChapterUrl } from '@/lib/data';
import { Play, Info, Star, Award, PenSquare, ChevronRight } from 'lucide-react';
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
    Autoplay({ delay: 6000, stopOnInteraction: true })
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
  const featuredStories = stories.filter(s => ['1', '2', '3'].includes(s.id));

  return (
    <div className="flex flex-col gap-12">
      <h1 className="sr-only">NexusHub - Plateforme de Webtoons et BD Africaines</h1>
      
      {/* Featured Carousel Section */}
      <section className="relative pt-6">
        <div className="container max-w-7xl mx-auto px-4 lg:px-12">
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
                                <div className="relative w-full aspect-[4/5] sm:aspect-[16/9] md:aspect-[2.4/1] min-h-[450px] rounded-[1.5rem] md:rounded-[2rem] overflow-hidden group shadow-2xl border border-white/10 bg-stone-900">
                                    <Image
                                        src={story.coverImage.imageUrl}
                                        alt={story.title}
                                        fill
                                        className="object-cover transition-transform duration-[10s] group-hover:scale-110 opacity-50 sm:opacity-60"
                                        priority={index === 0}
                                        data-ai-hint={story.coverImage.imageHint}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r from-black via-black/80 sm:via-black/60 to-transparent p-6 md:p-16 flex flex-col justify-end items-start text-left">
                                        <div className="carousel-content-animate flex flex-col gap-4 max-w-2xl w-full">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/20 backdrop-blur-md px-3 py-1 font-bold text-[10px] uppercase tracking-widest">
                                                    {story.genre}
                                                </Badge>
                                                {story.isPremium && (
                                                    <Badge className="bg-amber-500 text-black border-none px-3 py-1 font-bold text-[10px] uppercase tracking-widest shadow-lg">
                                                        <Star className="h-3 w-3 mr-1 fill-current" /> Premium
                                                    </Badge>
                                                )}
                                            </div>
                                            
                                            <h2 className="text-3xl md:text-6xl font-display font-bold text-white leading-tight tracking-tight">
                                                {story.title}
                                            </h2>
                                            
                                            <p className="text-white/90 text-sm md:text-lg font-light leading-relaxed line-clamp-3 mb-4 italic border-l-2 border-primary/50 pl-4 md:pl-6 max-w-xl">
                                                "{story.description}"
                                            </p>

                                            <div className="flex items-center gap-3 mb-6">
                                                <Avatar className="h-10 w-10 border-2 border-primary/30">
                                                    <AvatarImage src={artist?.avatar.imageUrl} alt={story.artistName} />
                                                    <AvatarFallback>{story.artistName?.[0]}</AvatarFallback>
                                                </Avatar>
                                                <div className="flex flex-col">
                                                    <span className="text-white font-bold text-sm">{story.artistName}</span>
                                                    <span className="text-white/60 text-[10px] uppercase tracking-widest font-bold">
                                                        {artist?.isMentor ? 'Artiste Certifié' : 'Jeune Talent'}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-4">
                                                <Button asChild size="lg" className="h-12 md:h-14 px-8 md:px-10 rounded-full font-bold text-sm md:text-base shadow-xl shadow-primary/20">
                                                    <Link href={readingUrl}>
                                                        <Play className="mr-3 h-5 w-5 fill-current" />
                                                        {t('common.read')}
                                                    </Link>
                                                </Button>
                                                <Button asChild variant="outline" size="lg" className="h-12 md:h-14 px-8 md:px-10 rounded-full bg-white/5 border-white/20 text-white hover:bg-white/10 backdrop-blur-md text-sm md:text-base">
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

            {/* Pagination Dots Indicators */}
            <div className="flex justify-center gap-2 mt-8">
                {Array.from({ length: count }).map((_, index) => (
                    <button
                        key={index}
                        onClick={() => api?.scrollTo(index)}
                        className={cn(
                            "h-2 transition-all duration-500 rounded-full",
                            current === index 
                                ? "w-10 bg-primary" 
                                : "w-2 bg-muted hover:bg-muted-foreground/50"
                        )}
                        aria-label={`Aller à l'œuvre ${index + 1}`}
                    />
                ))}
            </div>
        </div>
      </section>

      <main className="container max-w-7xl mx-auto px-6 lg:px-12 py-12 space-y-24">
        {/* Section Pro */}
        <section className="relative">
            <div className="absolute -inset-x-6 md:-inset-x-12 -inset-y-8 bg-emerald-500/[0.03] -z-10 rounded-3xl" />
            <div className="flex justify-between items-center mb-12 border-b border-emerald-500/20 pb-4">
                <div className="flex items-center gap-3">
                    <Award className="h-8 w-8 text-emerald-500" />
                    <h2 className="text-3xl font-display font-bold text-foreground">{t('home.pro_title')}</h2>
                </div>
                <Link href="/stories?type=premium" className="text-sm font-bold text-emerald-500 hover:underline">Voir tout</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-x-6 gap-y-12">
                {proStories.map((story) => (
                    <StoryCard key={story.id} story={story} />
                ))}
            </div>
        </section>

        {/* Section Draft */}
        <section className="relative">
            <div className="absolute -inset-x-6 md:-inset-x-12 -inset-y-8 bg-orange-500/[0.03] -z-10 rounded-3xl" />
            <div className="flex justify-between items-center mb-12 border-b border-orange-500/20 pb-4">
                <div className="flex items-center gap-3">
                    <PenSquare className="h-8 w-8 text-orange-400" />
                    <h2 className="text-3xl font-display font-bold text-foreground">{t('home.draft_title')}</h2>
                </div>
                <Link href="/stories?type=public" className="text-sm font-bold text-orange-400 hover:underline">Voir tout</Link>
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
