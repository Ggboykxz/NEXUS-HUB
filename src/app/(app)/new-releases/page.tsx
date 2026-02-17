'use client';

import { stories } from '@/lib/data';
import { StoryCard } from '@/components/story-card';
import { Sparkles } from 'lucide-react';

export default function NewReleasesPage() {
  const newStories = [...stories].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  return (
    <div className="container mx-auto max-w-7xl px-4 py-12">
      <div className="flex items-center gap-4 mb-8">
        <div className="bg-primary/10 p-3 rounded-full">
            <Sparkles className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-4xl font-bold font-display">Nouveautés</h1>
      </div>
      <p className="text-lg text-muted-foreground mb-12">
        Soyez les premiers à découvrir les dernières pépites publiées sur la plateforme.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-12">
        {newStories.map((story) => (
          <StoryCard key={story.id} story={story} showUpdateDate={true} />
        ))}
      </div>
    </div>
  );
}
