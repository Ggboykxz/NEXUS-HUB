import { readers, stories } from '@/lib/data';
import { notFound } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { StoryCard } from '@/components/story-card';
import { Separator } from '@/components/ui/separator';

export default function ProfilePage({ params }: { params: { readerId: string } }) {
  const reader = readers.find((r) => r.id === params.readerId);

  if (!reader) {
    notFound();
  }

  // Placeholder for favorite stories
  const favoriteStories = stories.slice(0, 5);

  return (
    <div className="container mx-auto max-w-5xl px-4 py-12">
      <div className="flex flex-col items-center text-center">
        <Avatar className="h-40 w-40 border-4 border-background ring-4 ring-primary">
          <AvatarImage src={reader.avatar.imageUrl} alt={reader.name} data-ai-hint={reader.avatar.imageHint} />
          <AvatarFallback>{reader.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <h1 className="text-4xl font-bold mt-4">{reader.name}</h1>
        <p className="text-lg text-muted-foreground mt-1">Lecteur / Lectrice</p>
        
        <p className="text-md text-foreground/80 leading-relaxed mt-6 max-w-2xl">{reader.bio}</p>
      </div>

      <Separator className="my-12" />

      <div className="mt-8">
        <h2 className="text-3xl font-bold font-display mb-8 text-center">Histoires Favorites (exemple)</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-12">
          {favoriteStories.map((story) => (
            <StoryCard key={story.id} story={story} />
          ))}
        </div>
      </div>
    </div>
  );
}
