import type { ImagePlaceholder } from './placeholder-images';

export type UserRole = 'reader' | 'artist_draft' | 'artist_pro' | 'artist_elite' | 'admin';

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: UserRole;
  afriCoins: number;
  bio: string;
  createdAt: string;
  updatedAt: string;
  favorites: string[];
  following: string[];
  isBanned: boolean;
  isVerified: boolean;
  subscribersCount: number;
  level?: number;
  slug?: string;
}

export interface ChapterContent {
  id: string;
  slug: string;
  storyId: string;
  title: string;
  releaseDate: string;
  status: 'Publié' | 'Programmé' | 'Brouillon';
  pageCount: number;
  version?: string;
  revisionNote?: string;
  pages?: string[];
  views: number;
  likes: number;
}

export type StoryFormat = 'Webtoon' | 'BD' | 'One-shot' | 'Roman Illustré' | 'Hybride';
export type StoryTier = 'free' | 'draft' | 'pro' | 'premium';

export interface StoryFull {
  id: string;
  slug: string;
  title: string;
  artistId: string;
  artistName: string;
  artistSlug?: string;
  coverImage: ImagePlaceholder;
  description: string;
  genre: string;
  genreSlug: string;
  tags: string[];
  views: number;
  likes: number;
  subscriptions: number;
  chapterCount: number;
  chapters: ChapterContent[];
  updatedAt: string;
  createdAt: string;
  isPremium: boolean;
  isPublished: boolean;
  isBanned: boolean;
  isOriginal?: boolean;
  format: StoryFormat;
  status: 'En cours' | 'Terminé' | 'À venir';
  tier: StoryTier;
  team?: { [userId: string]: string }; // Map of userId to role
  collaborators?: {
    id: string;
    name: string;
    role: string;
    avatar: ImagePlaceholder;
  }[];
}

export interface ArtistProfile extends UserProfile {
  role: 'artist_draft' | 'artist_pro' | 'artist_elite';
  portfolio: string[];
  subscribers: number;
  links: {
    personal?: string;
    amazon?: string;
    twitter?: string;
    instagram?: string;
    facebook?: string;
  };
  isMentor: boolean;
}

export interface ComicPage {
  id: string;
  imageUrl: string;
  description: string;
  imageHint: string;
}

export interface ForumThread {
  id: string;
  forumId: string;
  authorId: string;
  author: string;
  title: string;
  content: string;
  category: string;
  views: number;
  replyCount: number;
  isPinned: boolean;
  isLocked: boolean;
  isHidden: boolean;
  isPremium: boolean;
  createdAt: string;
  updatedAt: string;
  lastPost: {
    author: string;
    time: string;
  };
}

export interface ForumPost {
  id: string;
  threadId: string;
  authorId: string;
  content: string;
  likes: number;
  isHidden: boolean;
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  id: string;
  participants: string[];
  lastMessage: string;
  lastMessageAt: string;
  isGroup: boolean;
  createdAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  authorId: string;
  type: 'text' | 'image' | 'africoins' | 'sticker';
  content: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  type: 'purchase' | 'donation' | 'unlock';
  status: 'completed' | 'pending' | 'failed';
  packId?: string;
  timestamp: string;
}

export interface Playlist {
  id: string;
  ownerId: string;
  name: string;
  description: string;
  isPublic: boolean;
  storyIds: string[];
  storyCount: number;
  createdAt: string;
}

export interface Comment {
  id: string;
  storyId: string;
  chapterId: string;
  authorId: string;
  authorName: string;
  authorAvatar: ImagePlaceholder;
  authorBadge?: string;
  content: string;
  likes: number;
  isHidden: boolean;
  isEdited: boolean;
  timestamp: string;
  chapter: number;
  tag?: string;
  pageIndex?: number;
}
