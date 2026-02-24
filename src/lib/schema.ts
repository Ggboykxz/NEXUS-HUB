/**
 * @fileOverview Schéma de données pour Firestore - NexusHub Bêta
 */

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  role: 'reader' | 'artist_draft' | 'artist_pro';
  afriCoins: number;
  bio: string;
  createdAt: string;
  updatedAt: string;
  favorites: string[]; // IDs des stories
  following: string[]; // IDs des artistes
}

export interface StoryMetadata {
  id: string; // Slug ou ID auto-généré
  title: string;
  description: string;
  artistId: string;
  artistName: string;
  genre: string;
  genreSlug: string;
  format: 'Webtoon' | 'BD' | 'Roman Illustré';
  status: 'ongoing' | 'completed' | 'teaser';
  coverImageUrl: string;
  tags: string[];
  views: number;
  likes: number;
  subscribersCount: number;
  isPremium: boolean;
  afriCoinsPrice?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ChapterData {
  id: string;
  storyId: string;
  number: number;
  title: string;
  pages: string[]; // URLs des images
  releaseDate: string;
  version: string;
  isFree: boolean;
}

export interface TransactionRecord {
  id: string;
  userId: string;
  type: 'purchase' | 'donation' | 'unlock';
  amount: number; // en AfriCoins
  targetId?: string; // artistId ou storyId
  timestamp: string;
  status: 'completed' | 'pending' | 'failed';
}
