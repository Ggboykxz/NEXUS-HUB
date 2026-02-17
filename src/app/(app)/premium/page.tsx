'use client';

import { stories } from '@/lib/data';
import { StoryCard } from '@/components/story-card';
import { Crown } from 'lucide-react';

export default function PremiumStoriesPage() {
  const premiumStories = stories.filter(s => s.isPremium);

  return (
    <div className="container mx-auto max-w-7xl px-4 py-12">
      <div className="flex items-center gap-4 mb-8">
        <div className="bg-primary/10 p-3 rounded-full">
            <Crown className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-4xl font-bold font-display">Exclusivités Premium</h1>
      </div>
      <p className="text-lg text-muted-foreground mb-12">
        Accédez à du contenu exclusif de haute qualité avec NexusHub Pro.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-12">
        {premiumStories.map((story) => (
          <StoryCard key={story.id} story={story} />
        ))}
      </div>
    </div>
  );
}
