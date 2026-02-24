/**
 * @fileOverview Schéma de données complet pour NexusHub — Production
 * @version 2.4.0
 */

import type { Timestamp } from 'firebase/firestore';

// ─── TYPES PARTAGÉS ──────────────────────────────────────────────────────────

export interface ImageData {
  imageUrl: string;
  width: number;
  height: number;
  blurHash?: string;
  alt?: string;
  variantLabel?: string; 
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
  
  readingStats: {
    preferredGenres: Record<string, number>; 
    culturalAffinity: string[];
    lastReadRegion?: string;
    totalReadingTime: number;
  };

  readingStreak: {
    currentCount: number;
    lastReadDate: string;
    longestStreak: number;
    nextRewardAt: number;
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
  progress: number;
}

// ═══════════════════════════════════════════════════════════════════════════
//  COLLECTION : stories/{storyId}
// ═══════════════════════════════════════════════════════════════════════════

export interface StoryArc {
  id: string;
  title: string;
  order: number;
  description?: string;
}

export interface Story {
  id: string;
  slug: string;
  title: string;
  description: string;
  artistId: string;
  artistName: string;
  artistSlug?: string;
  coverImage: ImageData;
  coverVariants?: ImageData[]; 
  format: StoryFormat;
  genre: string;
  genreSlug: string;
  tags: string[];
  status: StoryStatus;
  isPremium: boolean;
  views: number;
  likes: number;
  chapterCount: number;
  region?: string;
  arcs?: StoryArc[]; 
  updatedAt: Timestamp | string;
  chapters?: Chapter[];
}

export interface Chapter {
  id: string;
  storyId: string;
  arcId?: string; 
  slug: string;
  title: string;
  chapterNumber: number;
  pages: ImageData[];
  pageCount: number;
  isPremium: boolean;
  isDraft: boolean;
  version: string; 
  status: ChapterStatus;
  scheduledAt?: Timestamp | string; 
  watermarkEnabled: boolean; 
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
  pageIndex?: number; 
  createdAt: Timestamp | string;
}

export interface Playlist {
  id: string;
  ownerId: string;
  title: string;
  storyIds: string[];
  isPublic: boolean;
}

// ─── HELPERS D'URLS ──────────────────────────────────────────────────────────

export const getStoryUrl = (story: Pick<Story, 'format' | 'slug'>): string => {
  const isWebtoonFormat = story.format === 'Webtoon' || story.format === 'Roman Illustré';
  return isWebtoonFormat ? `/webtoon-hub/${story.slug}` : `/bd-africaine/${story.slug}`;
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
