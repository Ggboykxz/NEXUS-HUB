'use client';

import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { Button } from '@/components/ui/button';
import { StoryCard } from '@/components/story-card';
import { stories, artists, comments, getStoryUrl, getChapterUrl } from '@/lib/data';
import { ArrowRight, Play, Award, PenSquare, Sparkles, Zap, Star } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/components/providers/language-provider';

export default function HomePage() {
  const { t } = useTranslation();
  const plugin = React.useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true })
  );
  
  const proStories = stories.filter(s => {
    const artist = artists.find(a => a.id === s.artistId);
    return artist?.isMentor;
  }).slice(0, 5);

  const draftStories = stories.filter(s => {
    const artist = artists.find(a => a.id === s.artistId);
    return !artist?.isMentor;
  }).slice(0, 5);

  const popularPublicStories = stories.filter(s => !s.isPremium).sort((a, b) => b.views - a.views).slice(0, 5);
  const featuredPremiumStories = stories.filter(s => s.isPremium).sort((a, b) => b.likes - a.likes).slice(0, 5);
  const newStories = [...stories].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 5);
  
  const featuredArtists = artists.slice(0, 5);
  const featuredStoriesForCarousel = stories.filter(s => ['1', '2', '4'].includes(s.id));

  return (
    <>
      <h1 className="sr-only">NexusHub - {t('nav.browse')}</h1>
      <header className="relative pt-12 pb-12 md:pb-24">
        <div className="container max-w-7xl mx-auto px-6 lg:px-12">
            <Carousel
                opts={{ loop: true }}
                plugins={[plugin.current]}
                className="w-full"
            >
                <CarouselContent className="homepage-carousel-container">
                    {featuredStoriesForCarousel.map((story) => {
                        const storyUrl = getStoryUrl(story);
                        const readingUrl = story.chapters.length > 0 ? getChapterUrl(story, story.chapters[0].slug) : storyUrl;
                        return (
                            <CarouselItem key={story.id}>
                                <div className="relative w-full aspect-video md:aspect-[2.5/1] rounded-xl overflow-hidden">
                                    <Image
                                        src={story.coverImage.imageUrl}
                                        alt={story.title}
                                        fill
                                        className="object-cover"
                                        priority
                                        data-ai-hint={story.coverImage.imageHint}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 sm:p-8 md:p-12 flex flex-col justify-end items-start text-left">
                                        <Link href={`/genre/${story.genreSlug}`}>
                                            <Badge variant="secondary" className="mb-2 md:mb-4 backdrop-blur-sm">{story.genre}</Badge>
                                        </Link>
                                        <h2 className="text-xl md:text-4xl font-display font-bold text-white mb-1 md:mb-2">{story.title}</h2>
                                        <div className="flex flex-wrap items-center gap-2 md:gap-4">
                                            <Button asChild size="sm">
                                                <Link href={readingUrl}>
                                                    <Play className="mr-2 h-4 w-4 fill-current" />
                                                    {t('common.read')}
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </CarouselItem>
                        );
                    })}
                     <CarouselItem>
                        <div className="relative w-full aspect-video md:aspect-[2.5/1] rounded-xl overflow-hidden bg-gradient-to-br from-primary to-accent">
                            <div className="absolute inset-0 bg-black/60 p-6 sm:p-8 md:p-12 flex flex-col justify-center items-center text-center">
                                <h2 className="text-2xl md:text-4xl font-display font-bold text-white mb-2 md:mb-4">
                                    {t('home.hero_title')}
                                </h2>
                                <p className="text-sm md:text-base text-white/90 font-light max-w-lg mb-6">
                                    {t('home.hero_desc')}
                                </p>
                                <Button asChild variant="default">
                                    <Link href="/submit">{t('nav.submit')}</Link>
                                </Button>
                            </div>
                        </div>
                    </CarouselItem>
                </CarouselContent>
            </Carousel>
        </div>
      </header>

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

        <StoryCarousel title={t('home.popular')} stories={popularPublicStories} link="/popular" />
        <StoryCarousel title={t('home.new')} stories={newStories} link="/new-releases" />

        <section>
          <div className="flex justify-between items-baseline mb-12 border-b border-border pb-4">
            <h2 className="text-3xl font-display font-bold text-foreground">{t('home.featured_artists')}</h2>
          </div>
          <div className="relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_10%,white_90%,transparent)]">
            <div className="flex w-max animate-marquee hover:[animation-play-state:paused]">
              {[...featuredArtists, ...featuredArtists].map((artist, index) => (
                <Link key={`${artist.id}-${index}`} href={`/artiste/${artist.slug}`} className="group flex flex-col items-center text-center mx-8 w-48 shrink-0">
                    <Avatar className="h-32 w-32 border-4 border-background ring-2 ring-primary mb-4">
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
