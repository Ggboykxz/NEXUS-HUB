/**
 * @fileOverview Types et Helpers pour les données de NexusHub.
 */

import { StoryFull, ArtistProfile, ChapterContent, Playlist, Product, BlogPost, UserProfile, ForumThread, Comment, ComicPage } from './types';

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

// Listes de données typées
export const stories: StoryFull[] = [];
export const artists: ArtistProfile[] = [];
export const comicPages: ComicPage[] = [];
export const comments: Comment[] = [];
export const playlists: Playlist[] = [];
export const products: any[] = []; // À typer si nécessaire ultérieurement
export const blogPosts: any[] = []; // À typer si nécessaire ultérieurement
export const readers: UserProfile[] = [];
export const forumThreads: ForumThread[] = [];
