/**
 * @fileOverview Schéma de données complet pour NexusHub — Production
 * @version 2.0.0
 *
 * IMPORTANT : Ce fichier est la source de vérité unique pour tous les types
 * de données Firestore. Les interfaces reflètent exactement la structure
 * des documents Firestore.
 */

import type { Timestamp } from 'firebase/firestore';

// ─── TYPES PARTAGÉS ──────────────────────────────────────────────────────────

/** Image avec métadonnées pour next/image */
export interface ImageData {
  imageUrl: string;
  width: number;
  height: number;
  blurHash?: string;
  alt?: string;
}

/** Liens sociaux */
export interface SocialLinks {
  personal?: string;
  amazon?: string;
  twitter?: string;
  instagram?: string;
  facebook?: string;
  youtube?: string;
  tiktok?: string;
}

/** Format des séries */
export type StoryFormat = 'Webtoon' | 'BD' | 'One-shot' | 'Roman Illustré' | 'Hybride';

/** Statut des séries */
export type StoryStatus = 'En cours' | 'Terminé' | 'À venir';

/** Niveau d'accès d'une série */
export type StoryTier = 'free' | 'draft' | 'pro' | 'premium';

/** Rôle dans l'équipe créative */
export type TeamRole = 'scenariste' | 'dessinateur' | 'coloriste' | 'lettreur' | 'traducteur';

/** Statut d'un chapitre */
export type ChapterStatus = 'Publié' | 'Programmé' | 'Brouillon';

/** Rôle utilisateur */
export type UserRole = 'reader' | 'artist_draft' | 'artist_pro' | 'artist_elite' | 'admin';

/** Niveau artiste */
export type ArtistLevel = 'emergent' | 'draft' | 'pro' | 'elite';

/** Langue */
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
  country?: string;
  role: UserRole;
  level?: ArtistLevel;
  bio?: string;
  links?: SocialLinks;
  isMentor?: boolean;
  portfolio?: string[];
  afriCoins: number;
  totalEarned?: number;
  totalSpent?: number;
  subscribersCount: number;
  storiesCount?: number;
  totalViews?: number;
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
    lowDataMode: boolean;
  };
  createdAt: Timestamp | string;
  updatedAt: Timestamp | string;
  lastActiveAt: Timestamp | string;
}

export interface LibraryEntry {
  storyId: string;
  addedAt: Timestamp | string;
  lastReadChapterId?: string;
  lastReadPageIndex?: number;
  lastReadAt?: Timestamp | string;
  progress: number;
}

export interface Subscription {
  artistId: string;
  subscribedAt: Timestamp | string;
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
  isOriginal: boolean;
  isBanned: boolean;
  views: number;
  likes: number;
  subscriptions: number;
  chapterCount: number;
  createdAt: Timestamp | string;
  updatedAt: Timestamp | string;
  publishedAt?: Timestamp | string;
  chapters?: Chapter[]; // Injected for UI needs in some views
}

export interface StoryLike {
  userId: string;
  likedAt: Timestamp | string;
}


// ═══════════════════════════════════════════════════════════════════════════
//  SOUS-COLLECTION : stories/{storyId}/chapters/{chapterId}
// ═══════════════════════════════════════════════════════════════════════════

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
  views: number;
  likes: number;
  createdAt: Timestamp | string;
  updatedAt: Timestamp | string;
  publishedAt?: Timestamp | string;
}

export interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  authorBadge?: string;
  content: string;
  pageIndex?: number;
  isSpoiler: boolean;
  parentId?: string;
  isHidden: boolean;
  isEdited: boolean;
  likes: number;
  replyCount?: number;
  createdAt: Timestamp | string;
  updatedAt?: Timestamp | string;
  tag?: string;
}


// ═══════════════════════════════════════════════════════════════════════════
//  AUTRES COLLECTIONS (Forum, Conversations, etc.)
// ═══════════════════════════════════════════════════════════════════════════

export interface Forum {
  id: string;
  name: string;
  description: string;
  slug: string;
  icon: string;
  isRestricted: boolean;
  order: number;
  threadCount: number;
  postCount: number;
  createdAt: Timestamp | string;
}

export interface Thread {
  id: string;
  forumId: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  title: string;
  content: string;
  tags: string[];
  isPinned: boolean;
  isLocked: boolean;
  isSolved: boolean;
  isHidden: boolean;
  isPremium?: boolean;
  views: number;
  replyCount: number;
  lastReplyAt?: Timestamp | string;
  lastReplyAuthorId?: string;
  lastReplyAuthorName?: string;
  createdAt: Timestamp | string;
  updatedAt?: Timestamp | string;
  category?: string; // Compatibility
  lastPost?: { author: string; time: string }; // UI helper
}

export interface Post {
  id: string;
  threadId: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  parentId?: string;
  isHidden: boolean;
  isEdited: boolean;
  likes: number;
  createdAt: Timestamp | string;
  updatedAt?: Timestamp | string;
}

export interface Conversation {
  id: string;
  participants: string[];
  isGroup: boolean;
  groupName?: string;
  groupAvatar?: string;
  lastMessage: string;
  lastMessageAt: Timestamp | string;
  lastMessageAuthorId: string;
  unreadCount: Record<string, number>;
  createdAt: Timestamp | string;
  updatedAt: Timestamp | string;
}

export interface Message {
  id: string;
  conversationId: string;
  authorId: string;
  authorName: string;
  type: 'text' | 'image' | 'africoins' | 'sticker';
  content: string;
  attachmentUrl?: string;
  readBy: string[];
  isDeleted: boolean;
  createdAt: Timestamp | string;
  updatedAt?: Timestamp | string;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  imageUrl?: string;
  data: {
    storyId?: string;
    chapterId?: string;
    commentId?: string;
    fromUserId?: string;
    fromUserName?: string;
    threadId?: string;
    forumId?: string;
  };
  isRead: boolean;
  readAt?: Timestamp | string;
  createdAt: Timestamp | string;
}

export interface Transaction {
  id: string;
  userId: string;
  type: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string;
  reference?: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  createdAt: Timestamp | string;
  completedAt?: Timestamp | string;
}

export interface Playlist {
  id: string;
  ownerId: string;
  title: string;
  name?: string; // Compatibility
  description?: string;
  coverImage?: string;
  isPublic: boolean;
  storyIds: string[];
  storyCount: number;
  createdAt: Timestamp | string;
  updatedAt: Timestamp | string;
}

export interface Product {
  id: string;
  artistId: string;
  storyId?: string;
  name: string;
  description: string;
  images: string[];
  image?: ImageData; // Compatibility
  category: string;
  price: number;
  isAvailable: boolean;
  printfulUrl?: string; // Compatibility
  universe?: string; // Compatibility
  createdAt: Timestamp | string;
  updatedAt: Timestamp | string;
}

export interface Order {
  id: string;
  userId: string;
  items: any[];
  total: number;
  status: string;
  createdAt: Timestamp | string;
  updatedAt: Timestamp | string;
}

export interface Report {
  id: string;
  reporterId: string;
  targetType: string;
  targetId: string;
  reason: string;
  status: string;
  createdAt: Timestamp | string;
}

export interface Ban {
  id: string;
  userId: string;
  reason: string;
  expiresAt: Timestamp | string | null;
  isLifted: boolean;
  createdAt: Timestamp | string;
}

export interface AfriCoinsPackage {
  id: string;
  afriCoins: number;
  bonus?: number;
  prices: Record<string, number>;
  isPopular?: boolean;
  isActive: boolean;
  order: number;
  createdAt: Timestamp | string;
}

export interface ComicPage {
  id: string;
  imageUrl: string;
  description: string;
  imageHint: string;
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

// ─── CONSTANTES MÉTIER ────────────────────────────────────────────────────────

export const ARTIST_LEVEL_CRITERIA = {
  emergent: { minViews: 0, minChapters: 1, minFollowers: 0 },
  draft: { minViews: 500, minChapters: 3, minFollowers: 50 },
  pro: { minViews: 5000, minChapters: 10, minFollowers: 200 },
  elite: { minViews: 50000, minChapters: 20, minFollowers: 1000 },
} as const;

export const REVENUE_SHARE_RATES = {
  emergent: 0.15,
  draft: 0.30,
  pro: 0.60,
  elite: 0.70,
} as const;

export const VALIDATION_LIMITS = {
  displayName: { min: 2, max: 50 },
  bio: { min: 0, max: 1000 },
  storyTitle: { min: 2, max: 200 },
  storyDesc: { min: 10, max: 3000 },
  chapterTitle: { min: 1, max: 200 },
  comment: { min: 1, max: 2000 },
  forumTitle: { min: 5, max: 200 },
  forumContent: { min: 10, max: 10000 },
  message: { min: 1, max: 5000 },
  reportReason: { min: 5, max: 1000 },
  playlistTitle: { min: 1, max: 100 },
  productName: { min: 2, max: 200 },
  tags: { maxCount: 10, maxLength: 30 },
} as const;
