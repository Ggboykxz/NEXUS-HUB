/**
 * @fileOverview Schéma de données complet pour NexusHub — Production
 * @version 4.2.0
 */

import type { Timestamp } from 'firebase/firestore';

// ─── TYPES PARTAGÉS ──────────────────────────────────────────────────────────

export type UserRole = 'reader' | 'artist_draft' | 'artist_pro' | 'artist_elite' | 'admin' | 'translator';
export type ArtistLevel = 'emergent' | 'draft' | 'pro' | 'elite';
export type StoryFormat = 'Webtoon' | 'BD' | 'One-shot' | 'Roman Illustré' | 'Hybride';
export type StoryStatus = 'En cours' | 'Terminé' | 'À venir';
export type ChapterStatus = 'Publié' | 'Programmé' | 'Brouillon';
export type StoryTier = 'free' | 'draft' | 'pro' | 'premium';
export type Language = 'fr' | 'en' | 'sw' | 'ha' | 'am' | 'ar' | 'yo' | 'ig' | 'zu';
export type TeamRole = 'author' | 'artist' | 'colorist' | 'letterer' | 'translator';
export type TransactionType = 'purchase' | 'earn_streak' | 'spend_unlock' | 'donation' | 'payout';
export type NotificationType = 'new_chapter' | 'new_follower' | 'comment' | 'africoins_received' | 'system';

export interface ImageData {
  imageUrl: string;
  width: number;
  height: number;
  blurHash?: string;
  alt?: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  slug?: string;                    // ex: @allmight (unique)
  country?: string;                 // Code pays ISO 3166-1 alpha-2
  role: UserRole;
  level?: ArtistLevel;              // 🔒 Mis à jour par le système
  bio?: string;
  links?: { 
    twitter?: string; 
    instagram?: string; 
    tiktok?: string; 
    facebook?: string;
    personal?: string;
  };
  isMentor?: boolean;
  afriCoins: number;                // 🔒 Mis à jour par Cloud Functions
  totalEarned?: number;             // 🔒 Total gagné (artistes)
  subscribersCount: number;         // 🔒
  followedCount: number;
  storiesCount?: number;            // 🔒
  totalViews?: number;              // 🔒
  isCertified: boolean;
  isBanned: boolean;                // 🔒
  isVerified: boolean;              // 🔒
  isEmailVerified: boolean;         // 🔒
  preferences: {
    language: Language;
    theme: 'light' | 'dark' | 'system';
    notifications: boolean;
    privacy?: {
      showCurrentReading: boolean;
      showHistory: boolean;
    };
  };
  createdAt: Timestamp | string;
  updatedAt: Timestamp | string;
  lastActiveAt?: Timestamp | string;
  readingStats?: {
    preferredGenres: Record<string, number>;
    totalReadTime: number;
    favoriteArtists: string[];
    chaptersRead: number;
  };
  readingStreak?: {
    currentCount: number;
    lastReadDate: string;
    longestStreak: number;
    nextRewardAt: number;
  };
}

/**
 * users/{uid}/library/{storyId}
 */
export interface LibraryEntry {
  storyId: string;
  addedAt: Timestamp | string;
  lastReadChapterId?: string;
  lastReadChapterSlug?: string;
  lastReadChapterTitle?: string;
  lastReadPageIndex?: number;
  lastReadAt?: Timestamp | string;
  progress: number;                 // 0–100 (%)
  storyTitle: string;               // Dénormalisé pour affichage rapide
  storyCover: string;               // Dénormalisé
  isFavorite: boolean;
}

/**
 * users/{uid}/subscriptions/{artistId}
 */
export interface Subscription {
  artistId: string;
  subscribedAt: Timestamp | string;
}

export interface Story {
  id: string;
  slug: string;
  title: string;
  description: string;
  artistId: string;
  artistName: string;
  artistSlug?: string;
  team?: Record<string, TeamRole>;
  revenueShare?: Record<string, number>;
  coverImage: ImageData;
  format: StoryFormat;
  genre: string;
  genreSlug: string;
  tags: string[];
  language: Language;
  country?: string;
  status: StoryStatus;
  tier: StoryTier;
  isPremium: boolean;
  afriCoinPrice?: number;
  isPublished: boolean;
  isOriginal: boolean;              // 🔒
  isBanned: boolean;                // 🔒
  views: number;                    // 🔒
  likes: number;                    // 🔒
  subscriptions: number;            // 🔒
  chapterCount: number;             // 🔒
  createdAt: Timestamp | string;
  updatedAt: Timestamp | string;
  publishedAt?: Timestamp | string;
  availableLanguages?: Language[];
  sponsoredBy?: { name: string; logoUrl?: string };
}

export interface Chapter {
  id: string;
  storyId: string;
  slug: string;
  title: string;
  chapterNumber: number;
  pages: ImageData[];
  pageCount: number;
  status: ChapterStatus;
  scheduledAt?: Timestamp | string;
  isPremium: boolean;
  afriCoinPrice?: number;
  version: string;
  revisionNote?: string;
  views: number;                    // 🔒
  likes: number;                    // 🔒
  createdAt: Timestamp | string;
  updatedAt: Timestamp | string;
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
  pageIndex?: number;
  isSpoiler: boolean;
  parentId?: string;
  isHidden: boolean;
  isEdited: boolean;
  likes: number;                    // 🔒
  replyCount?: number;              // 🔒
  createdAt: Timestamp | string;
  updatedAt?: Timestamp | string;
}

export interface Thread {
  id: string;
  forumId: string;
  authorId: string;
  authorName: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  isPinned: boolean;
  isLocked: boolean;
  isSolved: boolean;
  isPremium: boolean;
  isHidden: boolean;
  views: number;                    // 🔒
  replies: number;                  // 🔒
  lastPost: {
    author: string;
    time: string;
  };
  lastReplyAt?: Timestamp | string; // 🔒
  createdAt: Timestamp | string;
}

export interface Forum {
  id: string;
  name: string;
  description: string;
  slug: string;
  icon: string;
  isRestricted: boolean;
  order: number;
  threadCount: number;              // 🔒
  postCount: number;                // 🔒
  createdAt: Timestamp | string;
}

export interface Playlist {
  id: string;
  ownerId: string;
  title: string;
  description?: string;
  isPublic: boolean;
  storyIds: string[];
  storyCount: number;               // 🔒
  createdAt: Timestamp | string;
  updatedAt: Timestamp | string;
}

export interface Product {
  id: string;
  artistId: string;
  storyId?: string;
  name: string;
  description: string;
  category: string;
  price: number;
  priceUSD?: number;
  image: ImageData;
  stock?: number | null;
  isAvailable: boolean;
  requiresShipping: boolean;
  printfulId?: string;
  printfulUrl?: string;
  universe?: string;
  isCollectible?: boolean;
  createdAt: Timestamp | string;
}

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string;
  reference?: string;
  paymentMethod?: string;
  paymentCurrency?: string;
  paymentAmount?: number;
  externalRef?: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  createdAt: Timestamp | string;
  completedAt?: Timestamp | string;
}

// ─── HELPERS D'URLS ──────────────────────────────────────────────────────────

export const getStoryUrl = (story: Pick<Story, 'format' | 'slug'>): string => {
  const isWebtoonFormat = story.format === 'Webtoon' || story.format === 'Roman Illustré' || story.format === 'Hybride';
  return isWebtoonFormat ? `/webtoon-hub/${story.slug}` : `/bd-africaine/${story.slug}`;
};

export const getChapterUrl = (story: Pick<Story, 'format' | 'slug'>, chapterSlug: string): string => {
  return `${getStoryUrl(story)}/${chapterSlug}`;
};

export const getUserUrl = (user: Pick<UserProfile, 'uid' | 'role' | 'slug'>): string => {
  if (user.role !== 'reader' && user.slug) return `/artiste/${user.slug}`;
  return `/profile/${user.uid}`;
};
