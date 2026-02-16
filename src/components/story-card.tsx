'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { Story } from '@/lib/data';
import { cn } from '@/lib/utils';
import { Crown, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Skeleton } from './ui/skeleton';

interface StoryCardProps {
  story: Story;
  className?: string;
  showUpdateDate?: boolean;
}

export function StoryCard({ story, className, showUpdateDate }: StoryCardProps) {
  const [date, setDate] = useState('');

  useEffect(() => {
    // This will only run on the client, after hydration
    if(showUpdateDate) {
        setDate(format(new Date(story.updatedAt), 'd MMM yyyy', { locale: fr }));
    }
  }, [story.updatedAt, showUpdateDate]);

  return (
    <Link href={`/stories/${story.id}`} className={cn("group block", className)}>
      <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-stone-100 mb-5 shadow-sm transition-all duration-300 group-hover:shadow-xl">
        <Image
          src={story.coverImage.imageUrl}
          alt={`Couverture de ${story.title}`}
          fill
          className="object-cover transition-all duration-500 ease-in-out group-hover:scale-110 group-hover:blur-sm"
          data-ai-hint={story.coverImage.imageHint}
          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
        />
        {story.isPremium && (
          <Badge variant="default" className="absolute top-2 right-2 z-20 gap-1 pl-2 pr-2.5 bg-primary/90 text-white backdrop-blur-sm">
            <Crown className="h-3 w-3" />
            Premium
          </Badge>
        )}
        {/* Overlay */}
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-500 p-6">
            <p className="text-white text-sm line-clamp-5 flex-grow">{story.description}</p>
            <div className="flex items-center gap-2 font-semibold text-white border-2 border-white rounded-full px-4 py-2 text-sm mt-4">
                Voir plus <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
        </div>
      </div>
      <h3 className="font-display font-bold text-lg text-foreground mb-1 group-hover:text-primary transition-colors truncate fade-in">{story.title}</h3>
      <p className="text-sm text-foreground/60 dark:text-stone-400 mb-3 font-light transition-colors fade-in">par {story.artistName}</p>
      {showUpdateDate ? (
        <div className="flex items-center justify-between text-xs">
            <span className="inline-block px-3 py-1 bg-stone-100 dark:bg-stone-800 text-foreground/70 dark:text-stone-300 text-xs rounded-full">{story.genre}</span>
            {date ? <p className="text-muted-foreground">{date}</p> : <Skeleton className="w-16 h-4" />}
        </div>
      ) : (
          <span className="inline-block px-3 py-1 bg-stone-100 dark:bg-stone-800 text-foreground/70 dark:text-stone-300 text-xs rounded-full">{story.genre}</span>
      )}
    </Link>
  );
}
