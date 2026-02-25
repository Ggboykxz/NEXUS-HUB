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
  slug?: string;                    // @pseudo unique (ex: @allmight)
  role: UserRole;
  level: number;                    // Niveau d'expérience (emergent, rising, pro, elite)
  bio?: string;
  country?: string;                 // Code ISO (NG, SN, CI, GA, etc.)
  languages: string[];              // ex: ['fr', 'en', 'wo', 'ha']
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
  createdAt: Timestamp | string;
  updatedAt: Timestamp | string;
  lastActive?: Timestamp | string;
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
  preferences?: {
    language: string;
    theme: 'light' | 'dark' | 'system';
    notifications: boolean;
    privacy?: {
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
  artistName?: string;
  artistSlug?: string;
  team?: Record<string, 'co_author' | 'colorist' | 'letterer' | 'translator'>;
  title: string;
  description: string;
  format: StoryFormat;
  status: StoryStatus;
  tier: StoryTier;
  coverImage: string;               // URL directe
  bannerImage?: string;
  genres: string[];
  genre?: string;                   // Rétrocompatibilité
  genreSlug?: string;               // Rétrocompatibilité
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
  createdAt: Timestamp | string;
  publishedAt?: Timestamp | string;
  updatedAt: Timestamp | string;
  availableLanguages?: string[];
  sponsoredBy?: { name: string; logoUrl?: string };
}

// ==================== CHAPTER ====================
export interface Chapter {
  id: string;
  storyId: string;
  slug: string;
  number: number;
  chapterNumber?: number;
  title: string;
  status: ChapterStatus;
  releaseDate?: Timestamp | string;
  publishedAt?: Timestamp | string;
  views: number;
  likes: number;
  pages: string[];                  // URLs directes
  isLocked: boolean;
  isPremium?: boolean;
  createdAt: Timestamp | string;
  updatedAt: Timestamp | string;
}

// ==================== COMMENT ====================
export interface Comment {
  id: string;
  storyId?: string;
  chapterId?: string;
  authorId: string;
  authorName?: string;
  authorAvatar?: string;
  content: string;
  likes: number;
  isHidden: boolean;
  isEdited: boolean;
  pageIndex?: number;
  createdAt: Timestamp | string;
  updatedAt?: Timestamp | string;
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
  createdAt: Timestamp | string;
  updatedAt: Timestamp | string;
}

// ==================== FORUM / THREAD / POST ====================
export interface Forum {
  id: string;
  title: string;
  isRestricted: boolean;
  createdAt: Timestamp | string;
}

export interface Thread {
  id: string;
  authorId: string;
  authorName: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  views: number;
  replies: number;
  replyCount?: number;
  isPinned: boolean;
  isLocked: boolean;
  isSolved?: boolean;
  isPremium: boolean;
  isHidden: boolean;
  lastPost: {
    author: string;
    time: string;
  };
  createdAt: Timestamp | string;
  updatedAt: Timestamp | string;
}

export interface Post {
  id: string;
  authorId: string;
  content: string;
  likes: number;
  isHidden: boolean;
  isEdited: boolean;
  createdAt: Timestamp | string;
  updatedAt?: Timestamp | string;
}

// ==================== CONVERSATION & MESSAGE ====================
export interface Conversation {
  id: string;
  participants: string[];
  isGroup: boolean;
  createdAt: Timestamp | string;
  updatedAt: Timestamp | string;
}

export interface Message {
  id: string;
  authorId: string;
  type: MessageType;
  content: string;
  isDeleted: boolean;
  createdAt: Timestamp | string;
  updatedAt?: Timestamp | string;
}

// ==================== NOTIFICATION ====================
export interface Notification {
  id: string;
  userId: string;
  type: 'like' | 'comment' | 'new_chapter' | 'subscription' | 'transaction' | 'system';
  title: string;
  body: string;
  isRead: boolean;
  readAt?: Timestamp | string;
  data?: any;
  createdAt: Timestamp | string;
}

// ==================== TRANSACTION ====================
export interface Transaction {
  id: string;
  userId: string;
  type: 'earn' | 'spend' | 'purchase' | 'donation';
  amount: number;
  description: string;
  createdAt: Timestamp | string;
}

// ==================== AUTRES ====================
export interface Product {
  id: string;
  artistId: string;
  name: string;
  description: string;
  category: string;
  price: number;
  image: { imageUrl: string; imageHint?: string };
  isAvailable: boolean;
  universe?: string;
  isCollectible?: boolean;
  printfulUrl?: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  category: string;
  tags: string[];
  coverImage: { imageUrl: string; imageHint?: string };
}

export interface ComicPage {
  id: string;
  storyId: string;
  chapterId: string;
  pageNumber: number;
  imageUrl: string;
}

export interface LibraryEntry {
  storyId: string;
  addedAt: Timestamp | string;
  lastReadChapterId?: string;
  lastReadChapterSlug?: string;
  lastReadChapterTitle?: string;
  lastReadPageIndex?: number;
  lastReadAt?: Timestamp | string;
  progress: number;
  storyTitle: string;
  storyCover: string;
  isFavorite: boolean;
}

// ==================== HELPERS ====================
export const getStoryUrl = (storyId: string) => `/read/${storyId}`;
export const getChapterUrl = (storyId: string, chapterNumber: number) => `/read/${storyId}/${chapterNumber}`;
export const getUserUrl = (slug: string) => `/artiste/${slug}`;