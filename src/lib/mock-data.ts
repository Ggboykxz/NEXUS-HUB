
import { Story, UserProfile, Chapter, Playlist, Product, BlogPost, Forum, Thread, Comment, ComicPage } from './types';

// Mock data for UserProfiles (artists and readers)
export const mockUserProfiles: UserProfile[] = [
  {
    uid: 'user1',
    email: 'artist1@example.com',
    displayName: 'Artiste Visionnaire',
    photoURL: '/images/artists/artist1.png',
    slug: 'artiste-visionnaire',
    role: 'artist_pro',
    level: 15,
    bio: 'Créateur de mondes extraordinaires et de personnages inoubliables.',
    country: 'SN',
    languages: ['fr', 'en'],
    socialLinks: {
      twitter: 'https://twitter.com/ArtisteVision',
      instagram: 'https://instagram.com/ArtisteVision',
    },
    afriCoins: 1200,
    subscribersCount: 25000,
    followedCount: 150,
    isCertified: true,
    isBanned: false,
    isVerified: true,
    createdAt: new Date('2022-01-15T10:00:00Z').toISOString(),
    updatedAt: new Date('2023-10-26T12:00:00Z').toISOString(),
  },
  {
    uid: 'user2',
    email: 'lecteur-assidu@example.com',
    displayName: 'Lecteur Assidu',
    photoURL: '/images/readers/reader1.png',
    slug: 'lecteur-assidu',
    role: 'premium_reader',
    level: 8,
    bio: 'Passionné par la BD africaine et les webtoons.',
    country: 'CI',
    languages: ['fr'],
    afriCoins: 350,
    subscribersCount: 120,
    followedCount: 300,
    isCertified: false,
    isBanned: false,
    isVerified: false,
    createdAt: new Date('2022-05-20T18:30:00Z').toISOString(),
    updatedAt: new Date('2023-11-10T20:00:00Z').toISOString(),
  },
];

// Mock data for Stories
export const mockStories: Story[] = [
  {
    id: 'story1',
    slug: 'le-secret-des-orishas',
    artistId: 'user1',
    artistName: 'Artiste Visionnaire',
    artistSlug: 'artiste-visionnaire',
    title: 'Le Secret des Orishas',
    description: 'Une aventure épique à travers le folklore ouest-africain, où une jeune prêtresse doit percer le secret des anciens dieux pour sauver son peuple.',
    format: 'Webtoon',
    status: 'En cours',
    tier: 'pro',
    coverImage: {
      imageUrl: '/images/covers/orishas-cover.jpg',
      blurHash: 'L6Pj0^i_.AyE_3ofR*j[00o#M{Rj',
    },
    genre: 'Fantastique',
    genreSlug: 'fantastique',
    genres: ['Mythologie', 'Aventure', 'Magie'],
    tags: ['folklore', 'yoruba', 'divinités'],
    isPublished: true,
    isBanned: false,
    isOriginal: true,
    isPremium: false,
    views: 1500000,
    likes: 85000,
    subscriptions: 50000,
    chapterCount: 25,
    rating: 4.8,
    createdAt: new Date('2023-02-01T11:00:00Z').toISOString(),
    updatedAt: new Date('2023-11-12T09:00:00Z').toISOString(),
  },
  {
    id: 'story2',
    slug: 'cyber-dakar-2088',
    artistId: 'user1',
    artistName: 'Artiste Visionnaire',
    artistSlug: 'artiste-visionnaire',
    title: 'Cyber Dakar 2088',
    description: 'Dans un Dakar futuriste et dystopique, une hackeuse de génie découvre un complot qui menace de renverser le gouvernement. Une course contre la montre s\'engage.',
    format: 'BD',
    status: 'Terminé',
    tier: 'premium',
    coverImage: {
      imageUrl: '/images/covers/cyber-dakar-cover.jpg',
      blurHash: 'LGF5?xYk^%~q-;R*R.t60#IV?wR%',
    },
    genre: 'Science-Fiction',
    genreSlug: 'science-fiction',
    genres: ['Cyberpunk', 'Thriller', 'Action'],
    tags: ['dystopie', 'hacking', 'afrofuturisme'],
    isPublished: true,
    isBanned: false,
    isOriginal: true,
    isPremium: true,
    views: 2800000,
    likes: 150000,
    subscriptions: 95000,
    chapterCount: 40,
    rating: 4.9,
    createdAt: new Date('2022-08-10T14:00:00Z').toISOString(),
    updatedAt: new Date('2023-09-05T16:00:00Z').toISOString(),
  }
];

// Mock data for Chapters
export const mockChapters: Chapter[] = [
  {
    id: 'chapter1-story1',
    storyId: 'story1',
    slug: 'le-reveil-du-pouvoir',
    chapterNumber: 1,
    title: 'Le Réveil du Pouvoir',
    status: 'Publié',
    releaseDate: new Date('2023-02-01T11:00:00Z').toISOString(),
    views: 120000,
    likes: 15000,
    pages: Array.from({ length: 15 }, (_, i) => ({
      imageUrl: `/images/stories/orishas/ch1/page-${i + 1}.jpg`,
      width: 800,
      height: 1280,
    })),
    isLocked: false,
    isPremium: false,
    publishedAt: new Date('2023-02-01T11:00:00Z').toISOString(),
    createdAt: new Date('2023-01-20T10:00:00Z').toISOString(),
    updatedAt: new Date('2023-02-01T11:00:00Z').toISOString(),
  },
  {
    id: 'chapter1-story2',
    storyId: 'story2',
    slug: 'la-faille-dans-le-systeme',
    chapterNumber: 1,
    title: 'La Faille dans le Système',
    status: 'Publié',
    releaseDate: new Date('2022-08-10T14:00:00Z').toISOString(),
    views: 250000,
    likes: 22000,
    pages: Array.from({ length: 22 }, (_, i) => ({
      imageUrl: `/images/stories/cyber-dakar/ch1/page-${i + 1}.jpg`,
      width: 1200,
      height: 800,
    })),
    isLocked: false,
    isPremium: false,
    publishedAt: new Date('2022-08-10T14:00:00Z').toISOString(),
    createdAt: new Date('2022-07-30T15:00:00Z').toISOString(),
    updatedAt: new Date('2022-08-10T14:00:00Z').toISOString(),
  },
];

// Mock data for ComicPages
export const mockComicPages: ComicPage[] = [
  {
    id: 'page1-chapter1-story1',
    storyId: 'story1',
    chapterId: 'chapter1-story1',
    pageNumber: 1,
    imageUrl: '/images/stories/orishas/ch1/page-1.jpg',
    width: 800,
    height: 1280,
  },
  {
    id: 'page1-chapter1-story2',
    storyId: 'story2',
    chapterId: 'chapter1-story2',
    pageNumber: 1,
    imageUrl: '/images/stories/cyber-dakar/ch1/page-1.jpg',
    width: 1200,
    height: 800,
  },
];

// Mock data for Comments
export const mockComments: Comment[] = [
  {
    id: 'comment1',
    storyId: 'story1',
    chapterId: 'chapter1-story1',
    authorId: 'user2',
    authorName: 'Lecteur Assidu',
    authorAvatar: '/images/readers/reader1.png',
    content: 'Incroyable début ! L\'ambiance est mystique et les dessins sont magnifiques. Hâte de lire la suite !',
    likes: 150,
    isHidden: false,
    isEdited: false,
    scrollPosition: 0.8, // 80% down the page
    createdAt: new Date('2023-02-02T18:00:00Z').toISOString(),
    updatedAt: new Date('2023-02-02T18:00:00Z').toISOString(),
  }
];

// Mock data for other types can be added here (Playlists, Products, etc.)
export const mockPlaylists: Playlist[] = [];
export const mockProducts: Product[] = [];
export const mockBlogPosts: BlogPost[] = [];
export const mockForums: Forum[] = [];
export const mockForumThreads: Thread[] = [];
