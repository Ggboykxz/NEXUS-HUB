import Image from 'next/image';
import Link from 'next/link';
import type { Story } from '@/lib/data';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface StoryCardProps {
  story: Story;
  className?: string;
}

export function StoryCard({ story, className }: StoryCardProps) {
  return (
    <Card className={cn("flex flex-col overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1", className)}>
      <Link href={`/read/${story.id}`} className="block">
        <CardHeader className="p-0">
            <div className="aspect-[2/3] w-full overflow-hidden">
                <Image
                    src={story.coverImage.imageUrl}
                    alt={`Cover of ${story.title}`}
                    width={400}
                    height={600}
                    className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                    data-ai-hint={story.coverImage.imageHint}
                />
            </div>
        </CardHeader>
      </Link>
      <CardContent className="p-4 flex-grow">
          <Link href={`/read/${story.id}`} className="block">
            <CardTitle className="text-lg leading-tight font-headline hover:text-primary transition-colors">
                {story.title}
            </CardTitle>
          </Link>
          <Link href={`/artists/${story.artistId}`} className="block">
            <p className="text-sm text-muted-foreground mt-1 hover:text-accent transition-colors">By {story.artistName}</p>
          </Link>
      </CardContent>
      <CardFooter className="p-4 pt-0">
          <Badge variant="secondary" className="font-normal">{story.genre}</Badge>
      </CardFooter>
    </Card>
  );
}
