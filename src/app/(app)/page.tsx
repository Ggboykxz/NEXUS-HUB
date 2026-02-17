'use client';

import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { Button } from '@/components/ui/button';
import { StoryCard } from '@/components/story-card';
import { stories, artists, comments } from '@/lib/data';
import { ArrowRight, Play, Award, PenSquare } from 'lucide-react';
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

export default function HomePage() {
  const plugin = React.useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true })
  );
  
  // Separate stories into public and premium
  const publicStories = stories.filter(s => !s.isPremium);
  const premiumStories = stories.filter(s => s.isPremium);

  // Get popular public stories
  const popularPublicStories = [...publicStories].sort((a, b) => b.views - a.views).slice(0, 5);
  // Get featured premium stories (e.g., by likes)
  const featuredPremiumStories = [...premiumStories].sort((a, b) => b.likes - a.likes).slice(0, 5);

  const newStories = [...stories].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 5);
  const featuredArtists = artists.slice(0, 5);
  const popularGenres = [...new Set(stories.map(s => s.genre))].slice(0, 4);
  const featuredStoriesForCarousel = stories.filter(s => ['1', '2', '4'].includes(s.id));

  return (
    <>
      <header className="relative pt-12 pb-12 md:pb-24">
        <div className="container max-w-7xl mx-auto px-6 lg:px-12">
            <Carousel
                opts={{
                    loop: true,
                }}
                plugins={[plugin.current]}
                className="w-full"
                onMouseEnter={plugin.current.stop}
                onMouseLeave={plugin.current.reset}
            >
                <CarouselContent className="homepage-carousel-container">
                    {featuredStoriesForCarousel.map((story) => (
                        <CarouselItem key={story.id}>
                            <div className="relative w-full aspect-video md:aspect-[2.5/1] rounded-xl overflow-hidden">
                                <Image
                                    src={story.coverImage.imageUrl}
                                    alt={`Promotion pour ${story.title}`}
                                    fill
                                    className="object-cover"
                                    priority
                                    data-ai-hint={story.coverImage.imageHint}
                                    sizes="(max-width: 768px) 100vw, 70vw"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 sm:p-8 md:p-12 flex flex-col justify-end items-start text-left">
                                    <Link href={`/stories?genre=${story.genre}`}>
                                        <Badge variant="secondary" className="mb-2 md:mb-4 backdrop-blur-sm hover:bg-primary/20 transition-colors">{story.genre}</Badge>
                                    </Link>
                                    <Link href={`/stories/${story.id}`}>
                                        <h1 className="text-xl md:text-4xl font-display font-bold text-white mb-1 md:mb-2 max-w-xl leading-tight drop-shadow-lg hover:text-primary/90 transition-colors">
                                            {story.title}
                                        </h1>
                                    </Link>
                                     <Link href={`/artists/${story.artistId}`}>
                                        <p className="text-sm md:text-base text-white/90 font-semibold mb-3 md:mb-4 drop-shadow-sm hover:text-primary/90 transition-colors">par {story.artistName}</p>
                                    </Link>
                                    <p className="hidden sm:block text-sm md:text-base text-white/90 font-light max-w-lg mb-6 drop-shadow-sm line-clamp-2">
                                        {story.description}
                                    </p>
                                    <div className="flex flex-wrap items-center gap-2 md:gap-4">
                                        <Button asChild size="sm" className="md:h-10 md:px-4 md:py-2 md:text-sm">
                                            <Link href={`/read/${story.id}`}>
                                                <Play className="mr-2 h-4 w-4 fill-current" />
                                                Lire
                                            </Link>
                                        </Button>
                                        <Button asChild size="sm" variant="outline" className="border-white/50 text-white backdrop-blur-sm hover:bg-white/10 hover:text-white md:h-10 md:px-4 md:py-2 md:text-sm">
                                            <Link href={`/stories/${story.id}`}>Détails</Link>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </CarouselItem>
                    ))}
                    {/* Slide for pub */}
                     <CarouselItem>
                        <div className="relative w-full aspect-video md:aspect-[2.5/1] rounded-xl overflow-hidden bg-gradient-to-br from-primary to-accent">
                            <div className="absolute inset-0 bg-black/60 p-6 sm:p-8 md:p-12 flex flex-col justify-center items-center text-center">
                                <h1 className="text-2xl md:text-4xl font-display font-bold text-white mb-2 md:mb-4 max-w-2xl leading-tight drop-shadow-lg">
                                    Partagez Votre Vision
                                </h1>
                                <p className="text-sm md:text-base text-white/90 font-light max-w-lg mb-6 drop-shadow-sm">
                                    Rejoignez notre communauté d'artistes et partagez votre talent avec un public mondial.
                                </p>
                                <Button asChild size="default" variant="default">
                                    <Link href="/submit">Soumettre une œuvre</Link>
                                </Button>
                            </div>
                        </div>
                    </CarouselItem>
                </CarouselContent>
                <CarouselPrevious variant="ghost" className="absolute left-4 top-1/2 -translate-y-1/2 z-10 hidden bg-black/30 text-white hover:bg-black/40 md:flex" />
                <CarouselNext variant="ghost" className="absolute right-4 top-1/2 -translate-y-1/2 z-10 hidden bg-black/30 text-white hover:bg-black/40 md:flex" />
            </Carousel>
        </div>
      </header>

      <main className="container max-w-7xl mx-auto px-6 lg:px-12 py-12 space-y-24">
        <StoryCarousel title="Populaires et Gratuites" stories={popularPublicStories} columns="5" link="/stories" />
        <StoryCarousel title="Exclusivités Premium" stories={featuredPremiumStories} columns="5" link="/stories?type=premium" />
        <StoryCarousel title="Nouveautés" stories={newStories} columns="5" showUpdateDate={true} link="/stories?sort=newest" />

        <section>
          <div className="flex justify-between items-baseline mb-12 border-b border-border pb-4">
            <Link href="/artists" className="group">
              <h2 className="text-3xl font-display font-bold text-foreground group-hover:text-primary transition-colors">Artistes à l'honneur</h2>
            </Link>
            <Link href="/artists" className="group flex items-center gap-2 text-sm font-medium text-foreground/60 hover:text-primary transition-colors">
              Voir plus
              <ArrowRight className="text-sm transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          <div className="relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_10%,white_90%,transparent)]">
            <div className="flex w-max animate-marquee hover:[animation-play-state:paused]">
              {[...featuredArtists, ...featuredArtists].map((artist, index) => (
                <Link key={`${artist.id}-${index}`} href={`/artists/${artist.id}`} className="group flex flex-col items-center text-center mx-8 w-48 shrink-0">
                    <Avatar className="h-32 w-32 border-4 border-background ring-2 ring-primary mb-4 transition-all duration-300 group-hover:ring-4">
                      <AvatarImage src={artist.avatar.imageUrl} alt={artist.name} data-ai-hint={artist.avatar.imageHint} />
                      <AvatarFallback>{artist.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex items-center justify-center gap-2">
                        <h3 className="font-display font-semibold text-lg group-hover:text-primary transition-colors">{artist.name}</h3>
                        {artist.isMentor ? (
                          <Badge variant="secondary" className="gap-1 text-xs">
                            <Award className="h-3 w-3" />
                            Pro
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="gap-1 text-xs">
                            <PenSquare className="h-3 w-3" />
                            Draft
                          </Badge>
                        )}
                    </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section>
          <div className="flex justify-between items-baseline mb-12 border-b border-border pb-4">
            <Link href="/stories" className="group">
                <h2 className="text-3xl font-display font-bold text-foreground group-hover:text-primary transition-colors">Genres populaires</h2>
            </Link>
             <Link href="/stories" className="group flex items-center gap-2 text-sm font-medium text-foreground/60 hover:text-primary transition-colors">
              Explorer
              <ArrowRight className="text-sm transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {popularGenres.map((genre) => (
              <Link key={genre} href={`/stories?genre=${genre}`}>
                <Card className="group relative overflow-hidden rounded-lg transition-all hover:shadow-lg hover:-translate-y-1 h-32 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 opacity-50 group-hover:opacity-80 transition-opacity duration-300"></div>
                     <h3 className="relative text-2xl font-display font-bold text-center text-foreground z-10">{genre}</h3>
                </Card>
              </Link>
            ))}
          </div>
        </section>
        
        <section>
          <div className="flex justify-between items-baseline mb-12 border-b border-border pb-4">
             <Link href="/forums" className="group">
                <h2 className="text-3xl font-display font-bold text-foreground group-hover:text-primary transition-colors">Derniers Commentaires</h2>
            </Link>
            <Link href="/forums" className="group flex items-center gap-2 text-sm font-medium text-foreground/60 hover:text-primary transition-colors">
              Rejoindre la discussion
              <ArrowRight className="text-sm transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          <div className="relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_10%,white_90%,transparent)]">
              <div className="flex w-max animate-marquee hover:[animation-play-state:paused]">
                {[...comments, ...comments].map((comment, index) => {
                    const story = stories.find(s => s.id === comment.storyId);
                    if (!story) return null;

                    return (
                        <Link key={`${comment.id}-${index}`} href={`/stories/${story.id}`} className="block">
                          <Card className="w-80 mx-4 flex flex-col p-6 transition-all hover:shadow-lg hover:-translate-y-1 h-full">
                              <div className="flex items-start gap-4 mb-4">
                                  <Avatar className="h-12 w-12 border-2 border-background ring-2 ring-primary">
                                      <AvatarImage src={comment.authorAvatar.imageUrl} alt={comment.authorName} data-ai-hint={comment.authorAvatar.imageHint} />
                                      <AvatarFallback>{comment.authorName.slice(0, 2)}</AvatarFallback>
                                  </Avatar>
                                  <div>
                                      <p className="font-semibold">{comment.authorName}</p>
                                      <p className="text-xs text-muted-foreground">{comment.timestamp}</p>
                                  </div>
                              </div>
                              <blockquote className="italic border-l-2 border-primary/50 pl-4 text-foreground/80 flex-grow mb-4 text-base line-clamp-3">
                                "{comment.content}"
                              </blockquote>
                              <p className="text-sm text-muted-foreground mt-auto pt-4 border-t border-border">
                                  sur <span className="font-semibold text-primary">{story.title}</span>
                              </p>
                          </Card>
                        </Link>
                    )
                })}
              </div>
          </div>
        </section>

      </main>
    </>
  );
}

function StoryCarousel({ title, stories, columns, showUpdateDate, link }: { title: string; stories: (typeof import('@/lib/data').stories)[0][]; columns: "4" | "5"; showUpdateDate?: boolean; link: string; }) {
  const gridClasses = {
    "4": "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12",
    "5": "grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-x-6 gap-y-12"
  };
  
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
      <div className={`grid ${gridClasses[columns]}`}>
          {stories.map((story) => (
             <StoryCard key={story.id} story={story} showUpdateDate={showUpdateDate} />
          ))}
      </div>
    </section>
  );
}
