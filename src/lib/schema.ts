/**
 * @fileOverview Schéma de données pour Firestore - NexusHub Production
 */

import { UserProfile, StoryFull, ChapterContent, Transaction, Playlist } from './types';

export type { UserProfile, StoryFull, ChapterContent, Transaction, Playlist };

export interface StoryMetadata extends Omit<StoryFull, 'chapters'> {
  // Metadata specifically for Firestore collection root
}

export interface ChapterData extends ChapterContent {
  pages: string[]; // URLs des images
  isFree: boolean;
}

export interface TransactionRecord extends Transaction {
  targetId?: string; // artistId ou storyId
}

export interface ReportRecord {
  id: string;
  reporterId: string;
  targetId: string;
  targetType: 'story' | 'chapter' | 'comment' | 'user' | 'post' | 'thread' | 'message';
  reason: string;
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt: string;
}

export interface AfriCoinsPackage {
  id: string;
  name: string;
  amount: number;
  price: number;
  currency: string;
  isPopular?: boolean;
}
