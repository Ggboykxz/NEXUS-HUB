/**
 * @fileOverview Bridge de compatibilité pour le schéma de données.
 */

import * as Types from './types';

export type UserProfile = Types.UserProfile;
export interface StoryMetadata extends Omit<Types.Story, 'chapters'> {}
export interface ChapterData extends Types.Chapter {
  isFree: boolean;
}
export interface TransactionRecord extends Types.Transaction {
  targetId?: string;
}
