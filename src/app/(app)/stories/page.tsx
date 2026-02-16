import { stories } from '@/lib/data';
import { StoryCard } from '@/components/story-card';
import { BookOpen } from 'lucide-react';

export default function StoriesPage() {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-12">
      <div className="flex items-center gap-4 mb-8">
        <BookOpen className="w-10 h-10 text-primary" />
        <h1 className="text-4xl font-bold">Toutes les œuvres</h1>
      </div>
      <p className="text-lg text-muted-foreground mb-8">
        Explorez notre collection complète de bandes dessinées, webtoons et plus encore.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-12">
        {stories.map((story) => (
          <StoryCard key={story.id} story={story} />
        ))}
      </div>
    </div>
  );
}
