/**
 * @fileOverview Types et Helpers pour les données de NexusHub.
 */

import { StoryFull, ChapterContent } from './types';

export type { ArtistProfile as Artist, ChapterContent as Chapter, StoryFull as Story, StoryFormat } from './types';

// Helpers d'URLs
export const getStoryUrl = (story: StoryFull) => {
  const prefix = (story.format === 'Webtoon' || story.format === 'Roman Illustré') ? '/webtoon' : '/bd-africaine';
  return `${prefix}/${story.slug}`;
};

export const getChapterUrl = (story: StoryFull, chapterSlug: string) => {
  const prefix = (story.format === 'Webtoon' || story.format === 'Roman Illustré') ? '/webtoon' : '/bd-africaine';
  return `${prefix}/${story.slug}/${chapterSlug}`;
};

// Données fictives pour le rendu initial si nécessaire (Peuvent être vides si Firestore est utilisé)
export const stories: StoryFull[] = [];
export const artists: any[] = [];
export const comicPages: any[] = [];
export const comments: any[] = [];
export const playlists: any[] = [];
export const products: any[] = [];
export const blogPosts: any[] = [];
export const readers: any[] = [];
export const forumThreads: any[] = [];
