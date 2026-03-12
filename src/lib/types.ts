
import { Timestamp } from 'firebase/firestore';

/**
 * @fileOverview NexusHub Core Type Definitions - Version 4.4.0
 * Schéma consolidé pour Firestore incluant slugs uniques, rôles avancés et statistiques.
 */

// ==================== ENUMS ====================
export type UserRole = 
  | 'reader' 
  | 'premium_reader'
  | 'artist_draft' 
  | 'artist_pro' 
  | 'artist_elite' 
  | 'admin' 
  | 'translator';

export type StoryFormat = 'Webtoon' | 'BD' | 'One-shot' | 'Roman Illustré' | 'Hybride';
export type StoryStatus = 'En cours' | 'Terminé' | 'À venir';
export type StoryTier = 'free' | 'draft' | 'pro' | 'premium';
export type ChapterStatus = 'Brouillon' | 'Programmé' | 'Publié';
export type MessageType = 'text' | 'image' | 'africoins' | 'sticker';
export type UniverseRelation = 'Préquel' | 'Séquelle' | 'Spin-off' | 'Original';
export type PublicationStatus = 'brouillon' | 'publié';

// ==================== USER ====================
export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  bannerURL?: string;              // Nouveau: Image de fond du profil
  slug: string;                    // @pseudo unique obligatoire
  role: UserRole;
  level: number;
  bio?: string;
  country?: string;                 // code ISO (NG, SN, CI, etc.)
  languages: string[];
  socialLinks?: {
    twitter?: string;
    instagram?: string;
    tiktok?: string;
    facebook?: string;
    website?: string;
  };
  afriCoins: number;
  subscribersCount: number;
  followedCount: number;
  isCertified: boolean;
  isBanned: boolean;
  isVerified: boolean;
  onboardingCompleted?: boolean;
  createdAt: Timestamp | string;
  updatedAt: Timestamp | string;
  lastActive?: Timestamp | string;
  readingStats?: {
    preferredGenres: Record<string, number>;
    totalReadTime: number;          // minutes
    chaptersRead: number;
    favoriteArtists: string[];
  };
  readingStreak?: {
    currentCount: number;
    lastReadDate: string;
    longestStreak: number;
  };
  preferences?: {
    theme: 'light' | 'dark' | 'system';
    language: string;
    privacy: {
      showCurrentReading: boolean;
      showHistory: boolean;
    };
  };
}

// ==================== STORY ====================
export interface Story {
  id: string;
  slug: string;
  artistId: string;
  artistName: string;
  artistSlug: string;
  team?: Record<string, 'co_author' | 'colorist' | 'letterer' | 'translator'>;
  title: string;
  description: string;
  format: StoryFormat;
  status: StoryStatus;
  tier: StoryTier;
  coverImage: {
    imageUrl: string;
    blurHash?: string;
    imageHint?: string;
  };
  bannerImage?: string;
  genre: string;                    // Principal
  genreSlug: string;
  genres: string[];                 // Multiple tags
  tags: string[];
  region?: string;                  // Région d'origine
  isPublished: boolean;
  isBanned: boolean;
  isOriginal: boolean;
  isPremium: boolean;
  views: number;
  likes: number;
  subscriptions: number;
  chapterCount: number;
  rating: number;                   // 0.0 à 5.0
  createdAt: Timestamp | string;
  publishedAt?: Timestamp | string;
  updatedAt: Timestamp | string;
  universeId?: string;              // Identifiant de l'univers partagé
  universeRelation?: UniverseRelation; // Type de relation dans l'univers
  sponsoredBy?: {
    name: string;
    link: string;
  };
  chapters?: Chapter[];             // Peuplé dynamiquement
}

// ==================== CHAPTER ====================
export interface Chapter {
  id: string;
  storyId: string;
  slug: string;
  chapterNumber: number;
  title: string;
  status: ChapterStatus;
  releaseDate: Timestamp | string;
  views: number;
  likes: number;
  pages: { imageUrl: string; width: number; height: number }[];
  isLocked: boolean;
  isPremium?: boolean;
  afriCoinsPrice?: number;
  publishedAt: Timestamp | string;
  createdAt: Timestamp | string;
  updatedAt: Timestamp | string;
  pageStats?: Record<string, any>;
}

export interface ComicPage {
  id: string;
  storyId: string;
  chapterId: string;
  pageNumber: number;
  imageUrl: string;
  width: number;
  height: number;
}

// ==================== SUB-COLLECTIONS ====================
export interface LibraryEntry {
  storyId: string;
  storyTitle: string;
  storyCover: string;
  lastReadAt: Timestamp | string;
  lastReadChapterId: string;
  lastReadChapterTitle: string;
  lastReadChapterSlug: string;
  progress: number;                 // 0 à 100
}

export interface Subscription {
  artistId: string;
  artistName: string;
  artistPhoto: string;
  subscribedAt: Timestamp | string;
}

// ==================== SOCIAL ====================
export interface Comment {
  id: string;
  storyId: string;
  chapterId: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  likes: number;
  isHidden: boolean;
  isEdited: boolean;
  pageIndex?: number;               // Pour BD paginée
  scrollPosition?: number;          // Pour Webtoon (en %)
  createdAt: Timestamp | string;
  updatedAt?: Timestamp | string;
}

export interface Playlist {
  id: string;
  ownerId: string;
  title: string;
  description?: string;
  isPublic: boolean;
  storyIds: string[];
  storyCount: number;
  createdAt: Timestamp | string;
  updatedAt: Timestamp | string;
}

// ==================== ECONOMY ====================
export interface Transaction {
  id: string;
  userId: string;
  type: 'earn' | 'spend' | 'purchase' | 'donation';
  amount: number;
  description: string;
  packId?: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: Timestamp | string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  image: {
    imageUrl: string;
    imageHint: string;
  };
  universe?: string;
  isCollectible?: boolean;
  printfulUrl?: string;
}


// ==================== BLOG & FORUM ====================

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  status: PublicationStatus;
  excerpt: string;
  content: string; // HTML ou Markdown
  coverImage: {
    imageUrl: string;
    imageHint?: string;
  };
  authorName: string; // Dénormalisé pour un accès simple
  authorId: string;
  category: string;
  tags: string[];
  views: number;
  readTime: number; // en minutes
  publishedAt: Timestamp | string;
  createdAt: Timestamp | string;
  updatedAt: Timestamp | string;
}

export interface Forum {
  id: string;
  name: string;
  description: string;
  threadCount: number;
  postCount: number;
}

export interface Thread {
  id: string;
  forumId: string;
  title: string;
  authorId: string;
  authorName: string;
  createdAt: Timestamp | string;
  updatedAt: Timestamp | string;
  isLocked: boolean;
  isPinned: boolean;
  postCount: number;
}

// ==================== HELPERS ====================
/**
 * Helper SEO pour générer les URLs des histoires.
 */
export const getStoryUrl = (story: { format: string, slug: string } | string) => {
  if (typeof story === 'string') return `/read/${story}`;
  if (typeof story === 'object' && (story.format === 'BD' || story.format === 'One-shot')) return `/bd-africaine/${story.slug}`;
  if (typeof story === 'object') return `/webtoon-hub/${story.slug}`;
  return '/';
};

export const getChapterUrl = (storySlug: string, chapterSlug: string) => `/webtoon-hub/${storySlug}/${chapterSlug}`;
export const getUserUrl = (slug: string) => `/artiste/${slug.replace('@', '')}`;
