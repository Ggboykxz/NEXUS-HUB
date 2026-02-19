'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { StoryCard } from '@/components/story-card';
import { stories, artists, getStoryUrl, getChapterUrl } from '@/lib/data';
import { ArrowRight, Play, Award, PenSquare, Info, ChevronRight, Sparkles, Zap, Star } from 'lucide-react';
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

  const plugin = React.useRef(
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
  
  const proStories = stories.filter(s => {
    const artist = artists.find(a => a.id === s.artistId);
    return artist?.isMentor;
  }).slice(0, 5);

  const draftStories = stories.filter(s => {
    const artist = artists.find(a => a.id === s.artistId);
    return !artist?.isMentor;
  }).slice(0, 5);

  const popularPublicStories = stories.filter(s => !s.isPremium).sort((a, b) => b.views - a.views).slice(0, 5);
  const newStories = [...stories].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 5);
  
  const featuredArtists = artists.slice(0, 5);
  const featuredStoriesForCarousel = stories.filter(s => ['1', '2', '3'].includes(s.id));

  return (
    <>
      <h1 className="sr-only">NexusHub - {t('nav.browse')}</h1>
      
      {/* Featured Carousel Section */}
      <section className="relative pt-8 pb-12">
        <div className="container max-w-7xl mx-auto px-6 lg:px-12">
            <Carousel
                setApi={setApi}
                opts={{ loop: true }}
                plugins={[plugin.current]}
                className="w-full"
            >
                <CarouselContent>
                    {featuredStoriesForCarousel.map((story) => {
                        const storyUrl = getStoryUrl(story);
                        const readingUrl = story.chapters.length > 0 ? getChapterUrl(story, story.chapters[0].slug) : storyUrl;
                        return (
                            <CarouselItem key={story.id}>
                                <div className="relative w-full aspect-[16/9] md:aspect-[2.4/1] rounded-[2rem] overflow-hidden group shadow-2xl border border-white/10">
                                    <Image
                                        src={story.coverImage.imageUrl}
                                        alt={story.title}
                                        fill
                                        className="object-cover transition-transform duration-[10s] group-hover:scale-110"
                                        priority
                                        data-ai-hint={story.coverImage.imageHint}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent p-8 md:p-16 flex flex-col justify-center items-start text-left">
                                        <div className="carousel-content-animate flex flex-col gap-4 max-w-2xl">
                                            <div className="flex flex-wrap items-center gap-3">
                                                <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/20 backdrop-blur-md px-4 py-1 font-bold text-xs uppercase tracking-widest">
                                                    {story.genre}
                                                </Badge>
                                                {story.isPremium && (
                                                    <Badge className="bg-amber-500 text-black border-none px-4 py-1 font-bold text-xs uppercase tracking-widest shadow-lg">
                                                        <Star className="h-3 w-3 mr-1 fill-current" /> Premium
                                                    </Badge>
                                                )}
                                            </div>
                                            
                                            <h2 className="text-4xl md:text-6xl font-display font-bold text-white leading-none tracking-tight drop-shadow-xl">
                                                {story.title}
                                            </h2>
                                            
                                            <p className="text-white/80 text-sm md:text-lg font-light leading-relaxed line-clamp-3 mb-4 max-w-xl italic border-l-2 border-primary/50 pl-6">
                                                "{story.description}"
                                            </p>

                                            <div className="flex items-center gap-4 mb-6">
                                                <Avatar className="h-10 w-10 border-2 border-primary/30">
                                                    <AvatarImage src={artists.find(a => a.id === story.artistId)?.avatar.imageUrl} />
                                                    <AvatarFallback>A</AvatarFallback>
                                                </Avatar>
                                                <div className="flex flex-col">
                                                    <span className="text-white font-bold text-sm">{story.artistName}</span>
                                                    <span className="text-white/60 text-[10px] uppercase tracking-widest font-bold">Artiste Certifié</span>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-4">
                                                <Button asChild size="lg" className="h-14 px-10 rounded-full font-bold text-base shadow-xl shadow-primary/20 transition-all active:scale-95">
                                                    <Link href={readingUrl}>
                                                        <Play className="mr-3 h-5 w-5 fill-current" />
                                                        {t('common.read')}
                                                    </Link>
                                                </Button>
                                                <Button asChild variant="outline" size="lg" className="h-14 px-10 rounded-full bg-white/5 border-white/20 text-white hover:bg-white/10 hover:border-white/40 backdrop-blur-md transition-all active:scale-95">
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

            {/* Pagination Dots */}
            <div className="flex justify-center gap-2.5 mt-8">
                {Array.from({ length: count }).map((_, index) => (
                    <button
                        key={index}
                        onClick={() => api?.scrollTo(index)}
                        className={cn(
                            "h-2 transition-all duration-500 rounded-full",
                            current === index 
                                ? "w-10 bg-primary shadow-[0_0_10px_rgba(var(--primary),0.5)]" 
                                : "w-2 bg-muted hover:bg-muted-foreground/50"
                        )}
                        aria-label={`Aller à la diapositive ${index + 1}`}
                    />
                ))}
            </div>
        </div>
      </section>

      <main className="container max-w-7xl mx-auto px-6 lg:px-12 py-12 space-y-24">
        
        {/* Section Pro */}
        <section className="relative">
            <div className="absolute -inset-x-6 md:-inset-x-12 -inset-y-8 bg-emerald-500/[0.03] -z-10 rounded-3xl" />
            <div className="flex justify-between items-baseline mb-12 border-b border-emerald-500/20 pb-4">
                <div className="flex items-center gap-3">
                    <Award className="h-8 w-8 text-emerald-500" />
                    <h2 className="text-3xl font-display font-bold text-foreground">{t('home.pro_title')}</h2>
                </div>
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
            <div className="flex justify-between items-baseline mb-12 border-b border-orange-500/20 pb-4">
                <div className="flex items-center gap-3">
                    <PenSquare className="h-8 w-8 text-orange-400" />
                    <h2 className="text-3xl font-display font-bold text-foreground">{t('home.draft_title')}</h2>
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-x-6 gap-y-12">
                {draftStories.map((story) => (
                    <StoryCard key={story.id} story={story} />
                ))}
            </div>
        </section>

        <StoryCarousel title={t('home.popular')} stories={popularPublicStories} link="/stories?tab=popular" />
        <StoryCarousel title={t('home.new')} stories={newStories} link="/new-releases" />

        <section>
          <div className="flex justify-between items-baseline mb-12 border-b border-border pb-4">
            <h2 className="text-3xl font-display font-bold text-foreground">{t('home.featured_artists')}</h2>
          </div>
          <div className="relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_10%,white_90%,transparent)]">
            <div className="flex w-max animate-marquee hover:[animation-play-state:paused]">
              {[...featuredArtists, ...featuredArtists].map((artist, index) => (
                <Link key={`${artist.id}-${index}`} href={`/artiste/${artist.slug}`} className="group flex flex-col items-center text-center mx-8 w-48 shrink-0">
                    <Avatar className="h-32 w-32 border-4 border-background ring-2 ring-primary mb-4 transition-all group-hover:ring-4 group-hover:scale-105 duration-300">
                      <AvatarImage src={artist.avatar.imageUrl} alt={artist.name} />
                      <AvatarFallback>{artist.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <h3 className="font-display font-semibold text-lg group-hover:text-primary transition-colors">{artist.name}</h3>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

function StoryCarousel({ title, stories, link }: { title: string; stories: any[]; link: string; }) {
  return (
    <section>
      <div className="flex justify-between items-baseline mb-12 border-b border-border pb-4">
        <Link href={link} className="group">
          <h2 className="text-3xl font-display font-bold text-foreground group-hover:text-primary transition-colors">{title}</h2>
        </Link>
        <Link href={link} className="group flex items-center gap-2 text-sm font-medium text-foreground/60 hover:text-primary transition-colors">
          Voir plus
          <ArrowRight className="text-sm transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-x-6 gap-y-12">
          {stories.map((story) => (
             <StoryCard key={story.id} story={story} />
          ))}
      </div>
    </section>
  );
}