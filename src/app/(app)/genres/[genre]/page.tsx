'use client';

import { use } from 'react';
import { stories } from '@/lib/data';
import { StoryCard } from '@/components/story-card';
import { Sparkles } from 'lucide-react';
import { notFound } from 'next/navigation';

export default function GenrePage({ params: propsParams }: { params: { genre: string } }) {
  const params = use(propsParams);
  const genreName = decodeURIComponent(params.genre);
  
  const genreStories = stories.filter(s => 
    s.genre === genreName || s.tags.includes(genreName)
  );

  if (genreStories.length === 0) {
    notFound();
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-12">
      <div className="flex items-center gap-4 mb-8">
        <Sparkles className="w-10 h-10 text-primary" />
        <h1 className="text-4xl font-bold font-display">{genreName}</h1>
      </div>
      <p className="text-lg text-muted-foreground mb-12">
        Explorez toutes nos œuvres classées dans la catégorie {genreName}.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-12">
        {genreStories.map((story) => (
          <StoryCard key={story.id} story={story} />
        ))}
      </div>
    </div>
  );
}