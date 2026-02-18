'use client';

import { use, useEffect } from 'react';
import { stories, getStoryUrl } from '@/lib/data';
import { notFound, useRouter } from 'next/navigation';

export default function StoryIdRedirectPage(props: { params: Promise<{ storyId: string }> }) {
  const { storyId } = use(props.params);
  const router = useRouter();
  const story = stories.find((s) => s.id === storyId);

  useEffect(() => {
    if (story) {
      // Redirect to the new SEO optimized URL
      router.replace(getStoryUrl(story));
    }
  }, [story, router]);

  if (!story) {
    notFound();
  }

  return (
    <div className="flex h-[60vh] items-center justify-center">
        <div className="text-center">
            <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground font-display">Redirection vers {story.title}...</p>
        </div>
    </div>
  );
}
