/**
 * @fileOverview Données initiales et helpers pour NexusHub.
 */

import { Story, UserProfile, Chapter, Playlist, Product, BlogPost, Forum, Thread, Comment, ComicPage } from './types';

// Exportation des types pour compatibilité descendante si nécessaire
export type { Story, UserProfile as Artist, Chapter, UserRole as ArtistRole } from './types';

// Re-export des helpers centralisés
export { getStoryUrl, getChapterUrl, getUserUrl } from './types';

// Listes de données typées (à peupler via Firestore en production)
export const stories: Story[] = [];
export const artists: UserProfile[] = [];
export const comicPages: ComicPage[] = [];
export const comments: Comment[] = [];
export const playlists: Playlist[] = [];
export const products: Product[] = [];
export const blogPosts: BlogPost[] = [];
export const readers: UserProfile[] = [];
export const forumThreads: Thread[] = [];
export const forums: Forum[] = [];
