'use client';

import { stories } from '@/lib/data';
import { StoryCard } from '@/components/story-card';
import { CheckCircle2 } from 'lucide-react';

export default function CompletedStoriesPage() {
  const completedStories = stories.filter(s => s.status === 'Terminé');

  return (
    <div className="container mx-auto max-w-7xl px-4 py-12">
      <div className="flex items-center gap-4 mb-8">
        <div className="bg-green-500/10 p-3 rounded-full">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
        </div>
        <h1 className="text-4xl font-bold font-display">Séries Terminées</h1>
      </div>
      <p className="text-lg text-muted-foreground mb-12">
        Plongez dans des histoires complètes du début à la fin. Pas d'attente, juste le plaisir de la lecture intégrale.
      </p>

      {completedStories.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-12">
          {completedStories.map((story) => (
            <StoryCard key={story.id} story={story} />
          ))}
        </div>
      ) : (
        <div className="text-center py-24 border rounded-xl bg-card/50">
            <p className="text-muted-foreground italic">Aucune série terminée pour le moment. Revenez bientôt !</p>
        </div>
      )}
    </div>
  );
}
