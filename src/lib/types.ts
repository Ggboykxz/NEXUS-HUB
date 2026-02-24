import type { ImagePlaceholder } from './placeholder-images';

export type UserRole = 'reader' | 'artist_draft' | 'artist_pro';

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
  slug?: string;
}

export interface ChapterContent {
  id: string;
  slug: string;
  title: string;
  releaseDate: string;
  status: 'Publié' | 'Programmé' | 'Brouillon';
  pageCount: number;
  version?: string;
  revisionNote?: string;
  pages?: string[];
}

export type StoryFormat = 'Webtoon' | 'BD' | 'One-shot' | 'Roman Illustré' | 'Hybride';

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
  chapters: ChapterContent[];
  updatedAt: string;
  isPremium: boolean;
  format: StoryFormat;
  status: 'En cours' | 'Terminé' | 'À venir';
  collaborators?: {
    id: string;
    name: string;
    role: string;
    avatar: ImagePlaceholder;
  }[];
}

export interface ArtistProfile extends UserProfile {
  role: 'artist_draft' | 'artist_pro';
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
