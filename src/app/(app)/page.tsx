'use client';

import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { Button } from '@/components/ui/button';
import { StoryCard } from '@/components/story-card';
import { stories, artists, comments } from '@/lib/data';
import { ArrowRight } from 'lucide-react';
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
  const topLevelComments = comments.slice(0, 3);
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
                <CarouselContent>
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
                                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent p-8 sm:p-12 md:p-24 flex flex-col justify-center items-start text-left">
                                    <Badge variant="secondary" className="mb-4 backdrop-blur-sm">{story.genre}</Badge>
                                    <h1 className="text-3xl sm:text-4xl md:text-6xl font-display font-bold text-white mb-4 max-w-2xl leading-tight drop-shadow-lg">
                                        {story.title}
                                    </h1>
                                    <p className="text-base md:text-lg text-white/90 font-light max-w-xl mb-8 line-clamp-2 md:line-clamp-3 drop-shadow-sm">
                                        {story.description}
                                    </p>
                                    <Button asChild size="lg">
                                        <Link href={`/stories/${story.id}`}>Découvrir l'œuvre</Link>
                                    </Button>
                                </div>
                            </div>
                        </CarouselItem>
                    ))}
                    {/* Slide for pub */}
                     <CarouselItem>
                        <div className="relative w-full aspect-video md:aspect-[2.5/1] rounded-xl overflow-hidden bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                            <div className="p-8 sm:p-12 md:p-24 flex flex-col justify-center items-center text-center">
                                <h1 className="text-3xl sm:text-4xl md:text-6xl font-display font-bold text-foreground mb-4 max-w-3xl leading-tight">
                                    Partagez Votre Vision
                                </h1>
                                <p className="text-base md:text-lg text-foreground/80 font-light max-w-xl mb-8">
                                    Rejoignez notre communauté d'artistes et partagez votre talent avec un public mondial.
                                </p>
                                <Button asChild size="lg" variant="default">
                                    <Link href="/submit">Soumettre une œuvre</Link>
                                </Button>
                            </div>
                        </div>
                    </CarouselItem>
                </CarouselContent>
                <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 z-10 hidden md:flex bg-background/50 hover:bg-background/70" />
                <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 z-10 hidden md:flex bg-background/50 hover:bg-background/70" />
            </Carousel>
        </div>
      </header>

      <main className="container max-w-7xl mx-auto px-6 lg:px-12 py-12 space-y-24">
        <StoryCarousel title="Populaires et Gratuites" stories={popularPublicStories} columns="5"/>
        <StoryCarousel title="Exclusivités Premium" stories={featuredPremiumStories} columns="5"/>
        <StoryCarousel title="Nouveautés" stories={newStories} columns="5" showUpdateDate={true} />

        <section>
          <div className="flex justify-between items-baseline mb-12 border-b border-border pb-4">
            <h2 className="text-3xl font-display font-bold text-foreground">Artistes à l'honneur</h2>
            <Link href="/artists" className="group flex items-center gap-2 text-sm font-medium text-foreground/60 hover:text-primary transition-colors">
              Voir plus
              <ArrowRight className="text-sm transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-6 gap-y-12">
            {featuredArtists.map((artist) => (
              <Link key={artist.id} href={`/artists/${artist.id}`} className="group flex flex-col items-center text-center">
                  <Avatar className="h-32 w-32 border-4 border-background ring-2 ring-primary mb-4 transition-all duration-300 group-hover:ring-4">
                    <AvatarImage src={artist.avatar.imageUrl} alt={artist.name} data-ai-hint={artist.avatar.imageHint} />
                    <AvatarFallback>{artist.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <h3 className="font-display font-semibold text-lg group-hover:text-primary transition-colors">{artist.name}</h3>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <div className="flex justify-between items-baseline mb-12 border-b border-border pb-4">
            <h2 className="text-3xl font-display font-bold text-foreground">Genres populaires</h2>
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
            <h2 className="text-3xl font-display font-bold text-foreground">Derniers Commentaires</h2>
            <Link href="/forums" className="group flex items-center gap-2 text-sm font-medium text-foreground/60 hover:text-primary transition-colors">
              Rejoindre la discussion
              <ArrowRight className="text-sm transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {topLevelComments.map((comment) => {
                const story = stories.find(s => s.id === comment.storyId);
                if (!story) return null;

                return (
                    <Link key={comment.id} href={`/stories/${story.id}`} className="block h-full">
                      <Card className="flex flex-col p-6 transition-all hover:shadow-lg hover:-translate-y-1 h-full">
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
                          <blockquote className="italic border-l-2 border-primary/50 pl-4 text-foreground/80 flex-grow mb-4 text-base">
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
        </section>

      </main>
    </>
  );
}

function StoryCarousel({ title, stories, columns, showUpdateDate }: { title: string; stories: (typeof import('@/lib/data').stories)[0][]; columns: "4" | "5"; showUpdateDate?: boolean }) {
  const gridClasses = {
    "4": "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12",
    "5": "grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-x-6 gap-y-12"
  };
  
  return (
    <section>
      <div className="flex justify-between items-baseline mb-12 border-b border-border pb-4">
        <h2 className="text-3xl font-display font-bold text-foreground">{title}</h2>
        <Link href="/stories" className="group flex items-center gap-2 text-sm font-medium text-foreground/60 hover:text-primary transition-colors">
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
