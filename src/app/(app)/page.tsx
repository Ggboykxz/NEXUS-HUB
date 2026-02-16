import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { StoryCard } from '@/components/story-card';
import { stories } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ArrowRight } from 'lucide-react';

export default function HomePage() {
  const heroImage = PlaceHolderImages.find(img => img.id === 'hero');
  const popularStories = [...stories].sort((a, b) => b.views - a.views).slice(0, 6);
  const newStories = [...stories].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 6);
  const recommendedStories = [...stories].sort(() => 0.5 - Math.random()).slice(0, 6);

  return (
    <>
      {/* Hero Section */}
      <section className="relative h-[60vh] md:h-[80vh] w-full">
        {heroImage && (
          <Image
            src={heroImage.imageUrl}
            alt={heroImage.description}
            fill
            className="object-cover"
            priority
            data-ai-hint={heroImage.imageHint}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
        <div className="relative z-10 flex flex-col items-center justify-end h-full text-center pb-16 md:pb-24 px-4">
          <h1 className="text-4xl md:text-6xl font-extrabold text-foreground leading-tight tracking-tighter">
            Plongez au Cœur des Histoires Africaines
          </h1>
          <p className="mt-4 max-w-2xl text-lg md:text-xl text-foreground/80">
            Découvrez un univers de bandes dessinées, webtoons et romans graphiques créés par des artistes africains talentueux.
          </p>
          <div className="mt-8 flex gap-4">
            <Button asChild size="lg" className="font-bold">
              <Link href="/stories">Commencer la lecture</Link>
            </Button>
            <Button asChild size="lg" variant="secondary" className="font-bold">
              <Link href="/submit">Soumettre une œuvre</Link>
            </Button>
          </div>
        </div>
      </section>

      <div className="container max-w-7xl mx-auto py-12 px-4 space-y-16">
        {/* Story Carousels */}
        <StoryCarousel title="Œuvres Populaires" stories={popularStories} />
        <StoryCarousel title="Nouveautés" stories={newStories} />
        <StoryCarousel title="Recommandations" stories={recommendedStories} />
      </div>
    </>
  );
}

function StoryCarousel({ title, stories }: { title: string; stories: (typeof import('@/lib/data').stories)[0][] }) {
  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold">{title}</h2>
        <Button variant="ghost" asChild>
          <Link href="/stories">Voir plus <ArrowRight className="ml-2 h-4 w-4" /></Link>
        </Button>
      </div>
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent>
          {stories.map((story) => (
            <CarouselItem key={story.id} className="md:basis-1/3 lg:basis-1/4 xl:basis-1/5">
              <div className="p-1">
                <StoryCard story={story} />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden md:flex" />
        <CarouselNext className="hidden md:flex" />
      </Carousel>
    </section>
  );
}
