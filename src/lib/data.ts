/**
 * @fileOverview Types et Helpers pour les données de NexusHub.
 * Les données statiques ont été supprimées pour laisser place à Firebase.
 */

import type { ImagePlaceholder } from './placeholder-images';

export interface Artist {
  id: string;
  slug: string;
  name: string;
  bio: string;
  avatar: ImagePlaceholder;
  portfolio: string[];
  links: {
    personal?: string;
    amazon?: string;
    twitter?: string;
    instagram?: string;
    facebook?: string;
  };
  isMentor?: boolean;
  subscribers: number;
}

export interface Chapter {
  id: string;
  slug: string;
  title: string;
  releaseDate: string;
  status: 'Publié' | 'Programmé' | 'Brouillon';
  pageCount: number;
  version?: string;
  revisionNote?: string;
}

export type StoryFormat = 'Webtoon' | 'BD' | 'One-shot' | 'Roman Illustré' | 'Hybride';

export interface Story {
  id: string;
  slug: string;
  title: string;
  artistId: string;
  artistName?: string;
  artistSlug?: string;
  coverImage: ImagePlaceholder;
  description: string;
  genre: string;
  genreSlug: string;
  tags: string[];
  views: number;
  likes: number;
  subscriptions: number;
  chapters: Chapter[];
  updatedAt: string;
  isPremium?: boolean;
  format: StoryFormat;
  status: 'En cours' | 'Terminé' | 'À venir';
}

// Helpers d'URLs
export const getStoryUrl = (story: Story) => {
  const prefix = (story.format === 'Webtoon' || story.format === 'Roman Illustré') ? '/webtoon' : '/bd-africaine';
  return `${prefix}/${story.slug}`;
};

export const getChapterUrl = (story: Story, chapterSlug: string) => {
  const prefix = (story.format === 'Webtoon' || story.format === 'Roman Illustré') ? '/webtoon' : '/bd-africaine';
  return `${prefix}/${story.slug}/${chapterSlug}`;
};
