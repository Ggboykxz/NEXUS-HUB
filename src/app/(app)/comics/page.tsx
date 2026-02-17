'use client';

import { stories } from '@/lib/data';
import { StoryCard } from '@/components/story-card';
import { Book } from 'lucide-react';

export default function ComicsPage() {
  const comics = stories.filter(s => s.format === 'BD');

  return (
    <div className="container mx-auto max-w-7xl px-4 py-12">
      <div className="flex items-center gap-4 mb-8">
        <div className="bg-primary/10 p-3 rounded-full">
            <Book className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-4xl font-bold font-display">Bandes Dessinées</h1>
      </div>
      <p className="text-lg text-muted-foreground mb-12">
        Explorez notre catalogue de bandes dessinées traditionnelles. Des récits épiques présentés dans un format de lecture paginé classique.
      </p>

      {comics.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-12">
          {comics.map((story) => (
            <StoryCard key={story.id} story={story} />
          ))}
        </div>
      ) : (
        <div className="text-center py-24 border rounded-xl bg-card/50">
            <p className="text-muted-foreground italic">Aucune bande dessinée n'est disponible pour le moment.</p>
        </div>
      )}
    </div>
  );
}
