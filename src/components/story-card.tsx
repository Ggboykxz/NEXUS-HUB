import Image from 'next/image';
import Link from 'next/link';
import type { Story } from '@/lib/data';
import { cn } from '@/lib/utils';

interface StoryCardProps {
  story: Story;
  className?: string;
}

export function StoryCard({ story, className }: StoryCardProps) {
  return (
    <Link href={`/read/${story.id}`} className={cn("group cursor-pointer", className)}>
      <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-stone-100 mb-5 shadow-sm transition-shadow hover:shadow-md">
        <Image
          src={story.coverImage.imageUrl}
          alt={`Cover of ${story.title}`}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          data-ai-hint={story.coverImage.imageHint}
          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
        />
      </div>
      <h3 className="font-display font-bold text-lg text-foreground mb-1 group-hover:text-primary transition-colors truncate">{story.title}</h3>
      <p className="text-sm text-foreground/60 dark:text-stone-400 mb-3 font-light">By {story.artistName}</p>
      <span className="inline-block px-3 py-1 bg-stone-100 dark:bg-stone-800 text-foreground/70 dark:text-stone-300 text-xs rounded-full">{story.genre}</span>
    </Link>
  );
}
