import { Timestamp } from 'firebase/firestore';

// ==================== ENUMS ====================
export type UserRole = 
  | 'reader' 
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

// ==================== USER ====================
export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  slug?: string;                    // @pseudo unique
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
  };
  afriCoins: number;
  subscribersCount: number;
  followedCount: number;
  isCertified: boolean;
  isBanned: boolean;
  isVerified: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastActive?: Timestamp;
  readingStats?: {
    preferredGenres: Record<string, number>;
    totalReadTime: number;          // minutes
    favoriteArtists: string[];
  };
  readingStreak?: {
    currentCount: number;
    lastReadDate: string;
    longestStreak: number;
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
  coverImage: string;
  bannerImage?: string;
  genres: string[];
  tags: string[];
  isPublished: boolean;
  isBanned: boolean;
  isOriginal: boolean;
  isPremium: boolean;
  views: number;
  likes: number;
  subscriptions: number;
  chapterCount: number;
  rating: number;                   // 0.0 à 5.0
  createdAt: Timestamp;
  publishedAt?: Timestamp;
  updatedAt: Timestamp;
  region?: string;
}

// ==================== CHAPTER ====================
export interface Chapter {
  id: string;
  storyId: string;
  slug: string;
  number: number;
  title: string;
  status: ChapterStatus;
  releaseDate: Timestamp;
  views: number;
  likes: number;
  pages: string[];                  // URLs directes Storage
  isLocked: boolean;
  isPremium?: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ==================== COMMENT ====================
export interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  likes: number;
  isHidden: boolean;
  isEdited: boolean;
  pageIndex?: number;               // Pour commentaires contextuels
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

// ==================== PLAYLIST ====================
export interface Playlist {
  id: string;
  ownerId: string;
  title: string;
  description?: string;
  isPublic: boolean;
  storyIds: string[];
  storyCount: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ==================== FORUM / THREAD / POST ====================
export interface Forum {
  id: string;
  title: string;
  isRestricted: boolean;
  createdAt: Timestamp;
}

export interface Thread {
  id: string;
  authorId: string;
  authorName: string;
  title: string;
  content: string;
  category: string;
  views: number;
  replyCount: number;
  isPinned: boolean;
  isLocked: boolean;
  isPremium: boolean;
  isHidden: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Post {
  id: string;
  authorId: string;
  content: string;
  likes: number;
  isHidden: boolean;
  isEdited: boolean;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

// ==================== CONVERSATION & MESSAGE ====================
export interface Conversation {
  id: string;
  participants: string[];
  isGroup: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Message {
  id: string;
  authorId: string;
  type: MessageType;
  content: string;
  isDeleted: boolean;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

// ==================== NOTIFICATION ====================
export interface Notification {
  id: string;
  userId: string;
  type: 'like' | 'comment' | 'new_chapter' | 'subscription' | 'transaction' | 'system';
  title: string;
  body: string;
  isRead: boolean;
  readAt?: Timestamp;
  data?: any;
  createdAt: Timestamp;
}

// ==================== TRANSACTION ====================
export interface Transaction {
  id: string;
  userId: string;
  type: 'earn' | 'spend' | 'purchase' | 'donation';
  amount: number;
  description: string;
  createdAt: Timestamp;
}

export interface ComicPage {
  id: string;
  storyId: string;
  chapterId: string;
  pageNumber: number;
  imageUrl: string;
}

// ==================== HELPERS ====================
export const getStoryUrl = (storyId: string) => `/read/${storyId}`;
export const getChapterUrl = (storyId: string, chapterNumber: number) => `/read/${storyId}/${chapterNumber}`;
export const getUserUrl = (slug: string) => `/artiste/${slug.replace('@', '')}`;
