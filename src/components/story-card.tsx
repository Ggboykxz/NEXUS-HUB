import Image from 'next/image';
import Link from 'next/link';
import type { Story } from '@/lib/data';
import { cn } from '@/lib/utils';
import { Crown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface StoryCardProps {
  story: Story;
  className?: string;
}

export function StoryCard({ story, className }: StoryCardProps) {
  return (
    <div className={cn("group", className)}>
      <Link href={`/stories/${story.id}`} className="cursor-pointer">
        <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-stone-100 mb-5 shadow-sm transition-shadow hover:shadow-md">
          <Image
            src={story.coverImage.imageUrl}
            alt={`Couverture de ${story.title}`}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            data-ai-hint={story.coverImage.imageHint}
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
          />
           {story.isPremium && (
            <Badge variant="default" className="absolute top-2 right-2 z-10 gap-1 pl-2 pr-2.5 bg-primary/90 text-white backdrop-blur-sm">
              <Crown className="h-3 w-3" />
              Premium
            </Badge>
          )}
        </div>
        <h3 className="font-display font-bold text-lg text-foreground mb-1 group-hover:text-primary transition-colors truncate fade-in">{story.title}</h3>
      </Link>
      <Link href={`/artists/${story.artistId}`} className="cursor-pointer">
        <p className="text-sm text-foreground/60 dark:text-stone-400 mb-3 font-light hover:text-primary transition-colors fade-in">par {story.artistName}</p>
      </Link>
      <span className="inline-block px-3 py-1 bg-stone-100 dark:bg-stone-800 text-foreground/70 dark:text-stone-300 text-xs rounded-full">{story.genre}</span>
    </div>
  );
}
