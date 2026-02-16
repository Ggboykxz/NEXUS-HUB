'use client';

import { useState } from 'react';
import { stories, comicPages } from '@/lib/data';
import { notFound, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Book, ChevronLeft, ChevronRight, Layers } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import type { CarouselApi } from '@/components/ui/carousel';
import { useEffect } from 'react';

export default function ReadPage({ params }: { params: { storyId: string } }) {
  const story = stories.find((s) => s.id === params.storyId);
  const router = useRouter();
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  if (!story) {
    notFound();
  }

  return (
    <div className="relative">
      <header className="sticky top-0 z-20 bg-gray-900/80 backdrop-blur-lg border-b border-gray-700">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
          <div className="text-center">
            <h1 className="font-display text-lg truncate">{story.title}</h1>
            <p className="text-sm text-muted-foreground">Chapitre 1</p>
          </div>
          <div className="w-24"></div> {/* Spacer */}
        </div>
      </header>

      <Tabs defaultValue="scroll" className="w-full">
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-20">
          <TabsList>
            <TabsTrigger value="scroll" className="gap-2">
              <Layers className="h-4 w-4" /> Scroll
            </TabsTrigger>
            <TabsTrigger value="pages" className="gap-2">
              <Book className="h-4 w-4" /> Pages
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="scroll">
          <div className="flex flex-col items-center pt-4">
            {comicPages.map((page) => (
              <Image
                key={page.id}
                src={page.imageUrl}
                alt={page.description}
                width={800}
                height={1200}
                className="max-w-full h-auto"
                data-ai-hint={page.imageHint}
              />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="pages">
          <div className="flex items-center justify-center h-[calc(100vh-4rem)] pt-4">
            <Carousel setApi={setApi} className="w-full max-w-2xl">
              <CarouselContent>
                {comicPages.map((page) => (
                  <CarouselItem key={page.id}>
                    <Image
                      src={page.imageUrl}
                      alt={page.description}
                      width={800}
                      height={1200}
                      className="max-w-full h-auto mx-auto object-contain max-h-[calc(100vh-8rem)]"
                      data-ai-hint={page.imageHint}
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="text-foreground" />
              <CarouselNext className="text-foreground" />
            </Carousel>
          </div>
           <div className="py-2 text-center text-sm text-muted-foreground fixed bottom-20 left-1/2 -translate-x-1/2 z-20">
            Page {current} sur {count}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
