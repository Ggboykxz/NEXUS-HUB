'use client';

import { stories } from '@/lib/data';
import { StoryCard } from '@/components/story-card';
import { Clock } from 'lucide-react';

export default function OngoingPage() {
  const ongoingStories = stories.filter(s => s.status === 'En cours');

  return (
    <div className="container mx-auto max-w-7xl px-4 py-12">
      <div className="flex items-center gap-4 mb-8">
        <Clock className="w-10 h-10 text-primary" />
        <h1 className="text-4xl font-bold font-display">Séries en Cours</h1>
      </div>
      <p className="text-lg text-muted-foreground mb-12">
        Ne manquez aucun chapitre ! Suivez les dernières aventures de vos héros préférés, mises à jour régulièrement.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-12">
        {ongoingStories.map((story) => (
          <StoryCard key={story.id} story={story} />
        ))}
      </div>
    </div>
  );
}