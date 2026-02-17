'use client';

import { stories } from '@/lib/data';
import { StoryCard } from '@/components/story-card';
import { Layers } from 'lucide-react';

export default function WebtoonsPage() {
  const webtoons = stories.filter(s => s.format === 'Webtoon');

  return (
    <div className="container mx-auto max-w-7xl px-4 py-12">
      <div className="flex items-center gap-4 mb-8">
        <Layers className="w-10 h-10 text-primary" />
        <h1 className="text-4xl font-bold font-display">Univers Webtoons</h1>
      </div>
      <p className="text-lg text-muted-foreground mb-12">
        Découvrez nos œuvres optimisées pour la lecture verticale. Un format moderne pour une immersion totale.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-12">
        {webtoons.map((story) => (
          <StoryCard key={story.id} story={story} />
        ))}
      </div>
    </div>
  );
}