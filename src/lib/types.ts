/**
 * @fileOverview Schéma de données complet pour NexusHub — Production
 * @version 2.1.0
 */

import type { Timestamp } from 'firebase/firestore';

// ─── TYPES PARTAGÉS ──────────────────────────────────────────────────────────

export interface ImageData {
  imageUrl: string;
  width: number;
  height: number;
  blurHash?: string;
  alt?: string;
}

export interface SocialLinks {
  personal?: string;
  amazon?: string;
  twitter?: string;
  instagram?: string;
  facebook?: string;
  youtube?: string;
  tiktok?: string;
}

export type StoryFormat = 'Webtoon' | 'BD' | 'One-shot' | 'Roman Illustré' | 'Hybride';
export type StoryStatus = 'En cours' | 'Terminé' | 'À venir';
export type StoryTier = 'free' | 'draft' | 'pro' | 'premium';
export type TeamRole = 'scenariste' | 'dessinateur' | 'coloriste' | 'lettreur' | 'traducteur';
export type ChapterStatus = 'Publié' | 'Programmé' | 'Brouillon';
export type UserRole = 'reader' | 'artist_draft' | 'artist_pro' | 'artist_elite' | 'admin';
export type ArtistLevel = 'emergent' | 'draft' | 'pro' | 'elite';
export type Language = 'fr' | 'en' | 'sw' | 'ha' | 'am' | 'ar' | 'yo' | 'ig' | 'zu';

// ═══════════════════════════════════════════════════════════════════════════
//  COLLECTION : users/{uid}
// ═══════════════════════════════════════════════════════════════════════════

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  slug?: string;
  role: UserRole;
  level?: ArtistLevel;
  bio?: string;
  links?: SocialLinks;
  afriCoins: number;
  subscribersCount: number;
  
  readingStreak: {
    currentCount: number;
    lastReadDate: string; // ISO
    longestStreak: number;
    nextRewardAt: number; // 7, 30, 100
  };
  
  isBanned: boolean;
  isVerified: boolean;
  isEmailVerified: boolean;
  preferences: {
    language: Language;
    theme: 'light' | 'dark' | 'system';
    notifications: {
      newChapter: boolean;
      newFollower: boolean;
      comments: boolean;
      africoins: boolean;
      system: boolean;
    };
    readingMode: 'webtoon' | 'bd' | 'auto';
  };
  createdAt: Timestamp | string;
  updatedAt: Timestamp | string;
}

export interface LibraryEntry {
  storyId: string;
  storyTitle: string; 
  storyCover: string; 
  addedAt: Timestamp | string;
  lastReadChapterId: string;
  lastReadChapterSlug: string;
  lastReadChapterTitle: string;
  lastReadPageIndex: number;
  lastReadScrollPosition?: number;
  lastReadAt: Timestamp | string;
  progress: number; // 0-100
}

// ═══════════════════════════════════════════════════════════════════════════
//  COLLECTION : stories/{storyId}
// ═══════════════════════════════════════════════════════════════════════════

export interface Story {
  id: string;
  slug: string;
  title: string;
  description: string;
  artistId: string;
  artistName: string;
  artistSlug?: string;
  coverImage: ImageData;
  format: StoryFormat;
  genre: string;
  genreSlug: string;
  tags: string[];
  status: StoryStatus;
  isPremium: boolean;
  views: number;
  likes: number;
  chapterCount: number;
  updatedAt: Timestamp | string;
  chapters?: Chapter[];
}

export interface Chapter {
  id: string;
  storyId: string;
  slug: string;
  title: string;
  chapterNumber: number;
  pages: ImageData[];
  pageCount: number;
  isPremium: boolean;
  views: number;
  likes: number;
  publishedAt?: Timestamp | string;
}

export interface Comment {
  id: string;
  storyId: string;
  chapterId: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  isSpoiler: boolean;
  likes: number;
  pageIndex?: number; // Rattaché à une planche précise
  createdAt: Timestamp | string;
}

export interface PanelReaction {
  pageIndex: number;
  reactions: Record<string, number>; // { '🔥': 12, '❤️': 5 }
}

export interface Playlist {
  id: string;
  ownerId: string;
  title: string;
  storyIds: string[];
  isPublic: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  imageUrl?: string;
  isRead: boolean;
  createdAt: Timestamp | string;
}

export interface ComicPage {
  id: string;
  imageUrl: string;
  description: string;
  imageHint: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  image: ImageData;
  category: string;
  universe?: string;
  printfulUrl?: string;
  description: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  category: string;
  coverImage: ImageData;
  tags: string[];
}

// ─── HELPERS D'URLS ──────────────────────────────────────────────────────────

export const getStoryUrl = (story: Pick<Story, 'format' | 'slug'>): string => {
  const isWebtoonFormat = story.format === 'Webtoon' || story.format === 'Roman Illustré';
  return isWebtoonFormat ? `/webtoon/${story.slug}` : `/bd-africaine/${story.slug}`;
};

export const getChapterUrl = (
  story: Pick<Story, 'format' | 'slug'>,
  chapterSlug: string
): string => {
  const base = getStoryUrl(story);
  return `${base}/${chapterSlug}`;
};

export const getUserUrl = (user: Pick<UserProfile, 'uid' | 'role' | 'slug'>): string => {
  if (user.role !== 'reader' && user.slug) {
    return `/artiste/${user.slug}`;
  }
  return `/profile/${user.uid}`;
};
