import type { ImagePlaceholder } from './placeholder-images';
import { PlaceHolderImages } from './placeholder-images';

const getImage = (id: string): ImagePlaceholder | undefined => PlaceHolderImages.find(img => img.id === id);

export interface Artist {
  id: string;
  slug: string;
  name: string;
  bio: string;
  avatar: ImagePlaceholder;
  portfolio: string[];
  links: {
    personal?: string;
    amazon?: string;
    twitter?: string;
    instagram?: string;
    facebook?: string;
  };
  isMentor?: boolean;
  subscribers: number;
}

export interface Chapter {
  id: string;
  slug: string;
  title: string;
  releaseDate: string;
  status: 'Publié' | 'Programmé' | 'Brouillon';
  pageCount: number;
}

export interface Collaborator {
  id: string;
  name: string;
  role: 'Scénariste' | 'Coloriste' | 'Dessinateur' | 'Illustrateur';
  avatar: ImagePlaceholder;
}

export type StoryFormat = 'Webtoon' | 'BD' | 'One-shot' | 'Roman Illustré' | 'Hybride';

export interface Story {
  id: string;
  slug: string;
  title: string;
  artistId: string;
  artistName?: string;
  artistSlug?: string;
  coverImage: ImagePlaceholder;
  description: string;
  genre: string;
  genreSlug: string;
  tags: string[];
  views: number;
  likes: number;
  subscriptions: number;
  chapters: Chapter[];
  updatedAt: string;
  isPremium?: boolean;
  price?: number; // Price in AfriCoins
  collaborators?: Collaborator[];
  format: StoryFormat;
  status: 'En cours' | 'Terminé' | 'À venir';
}

export interface Product {
  id: string;
  name: string;
  price: number;
  image: ImagePlaceholder;
  description: string;
}

export interface ForumThread {
  id: string;
  title: string;
  author: string;
  authorId: string;
  replies: number;
  views: number;
  lastPost: {
    author: string;
    time: string;
  };
  category: string;
}

export interface Reader {
  id: string;
  name: string;
  bio: string;
  avatar: ImagePlaceholder;
}

export interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: ImagePlaceholder;
  storyId: string;
  chapter: number;
  content: string;
  timestamp: string;
  likes: number;
  replies?: Comment[];
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  storyIds: string[];
  isPublic: boolean;
  authorId: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: ImagePlaceholder;
  category: string;
  author: string;
  date: string;
  tags: string[];
}

export const artists: Artist[] = [
  {
    id: '1',
    slug: 'jelani-adebayo',
    name: 'Jelani Adebayo',
    bio: 'Jelani Adebayo est un conteur visionnaire de Lagos, au Nigeria, connu pour sa série de fantasy épique qui mêle la mythologie yoruba à des récits visuels à couper le souffle. Avec une formation en beaux-arts et une passion pour l\'afrofuturisme, son travail a captivé des publics du monde entier.',
    avatar: getImage('artist-1')!,
    portfolio: ['1', '3', '7'],
    links: { personal: '#', amazon: '#', twitter: '#', instagram: '#' },
    isMentor: true,
    subscribers: 14800,
  },
  {
    id: '2',
    slug: 'amina-diallo',
    name: 'Amina Diallo',
    bio: 'Originaire de Dakar, au Sénégal, Amina Diallo est une artiste célèbre dont le travail explore les thèmes de l\'identité, de la tradition et de la modernité. Ses bandes dessinées de science-fiction sont saluées pour leur construction de monde complexe et leurs personnages forts et attachants.',
    avatar: getImage('artist-2')!,
    portfolio: ['2', '4', '8'],
    links: { personal: '#', amazon: '#', facebook: '#' },
    subscribers: 12500,
  },
   {
    id: '3',
    slug: 'kwame-osei',
    name: 'Kwame Osei',
    bio: 'Master du mystère basé à Accra. Ses œuvres explorent les recoins sombres des métropoles africaines avec un style graphique unique et atmosphérique.',
    avatar: getImage('artist-3')!,
    portfolio: ['5', '6', '9'],
    links: { personal: '#', twitter: '#', instagram: '#' },
    isMentor: true,
    subscribers: 8900,
  },
];

export const readers: Reader[] = [
  {
    id: 'reader-1',
    name: 'Léa Dubois',
    bio: 'Passionnée de lecture depuis toujours, je suis à l\'affût des nouvelles pépites de la BD africaine.',
    avatar: getImage('reader-1')!,
  },
  {
    id: 'reader-2',
    name: 'Yannick Beauchamp',
    bio: 'Grand fan de science-fiction, je dévore tous les webtoons du genre.',
    avatar: getImage('reader-2')!,
  },
];

export const stories: Story[] = [
  {
    id: '1',
    slug: 'les-chroniques-d-orisha',
    title: 'Les Chroniques d\'Orisha',
    artistId: '1',
    coverImage: getImage('story-1')!,
    description: 'Un jeune héros découvre son héritage divin et doit naviguer dans un monde de dieux et de monstres pour sauver son peuple.',
    genre: 'Mythologie africaine',
    genreSlug: 'mythologie-africaine',
    tags: ['Mythologie', 'Aventure', 'Magie'],
    views: 1200000,
    likes: 89000,
    subscriptions: 50000,
    chapters: [
        { id: '1-1', slug: 'chapitre-1-le-reveil', title: 'Le Réveil', releaseDate: '2024-05-01', status: 'Publié', pageCount: 22 },
        { id: '1-2', slug: 'chapitre-2-l-epreuve', title: 'L\'Épreuve', releaseDate: '2024-05-15', status: 'Publié', pageCount: 25 },
        { id: '1-3', slug: 'chapitre-3-l-ombre-grandit', title: 'L\'Ombre grandit', releaseDate: '2024-06-01', status: 'Programmé', pageCount: 23 },
    ],
    updatedAt: '2024-07-16T10:00:00Z',
    format: 'Webtoon',
    status: 'En cours',
  },
  {
    id: '2',
    slug: 'neo-dakar-2088',
    title: 'Néo-Dakar 2088',
    artistId: '2',
    coverImage: getImage('story-2')!,
    description: 'Dans un Dakar futuriste, un détective amélioré cybernétiquement découvre une conspiration qui menace toute la ville.',
    genre: 'Afrofuturisme',
    genreSlug: 'afrofuturisme',
    tags: ['Cyberpunk', 'Mystère', 'Action'],
    views: 980000,
    likes: 75000,
    subscriptions: 42000,
    chapters: [
        { id: '2-1', slug: 'chapitre-1-neons-et-brouillard', title: 'Néons et Brouillard', releaseDate: '2024-04-20', status: 'Publié', pageCount: 30 },
        { id: '2-2', slug: 'chapitre-2-le-contact', title: 'Le Contact', releaseDate: '2024-05-10', status: 'Publié', pageCount: 28 },
    ],
    updatedAt: '2024-07-13T10:00:00Z',
    format: 'Webtoon',
    status: 'En cours',
  },
  {
    id: '3',
    slug: 'le-sentier-de-sankofa',
    title: 'Le Sentier de Sankofa',
    artistId: '1',
    coverImage: getImage('story-3')!,
    description: 'Un voyage à travers le temps pour retrouver les histoires perdues d\'un grand royaume.',
    genre: 'Histoire africaine',
    genreSlug: 'histoire-africaine',
    tags: ['Historique', 'Voyage dans le temps', 'Fantaisie'],
    views: 750000,
    likes: 62000,
    subscriptions: 35000,
    chapters: [
        { id: '3-1', slug: 'chapitre-1-la-relique', title: 'La Relique', releaseDate: '2024-03-01', status: 'Publié', pageCount: 18 },
        { id: '3-2', slug: 'chapitre-2-le-passage', title: 'Le Passage', releaseDate: '2024-03-15', status: 'Publié', pageCount: 20 },
    ],
    updatedAt: '2024-07-11T10:00:00Z',
    format: 'BD',
    status: 'Terminé',
  },
  {
    id: '7',
    slug: 'zero-heure',
    title: 'Zéro Heure',
    artistId: '1',
    coverImage: getImage('story-4')!,
    description: 'Un récit court et intense sur les dernières minutes avant un saut spatial vers une nouvelle colonie.',
    genre: 'Science-Fiction',
    genreSlug: 'science-fiction',
    tags: ['One-shot', 'Espace', 'Drame'],
    views: 120000,
    likes: 15000,
    subscriptions: 5000,
    chapters: [
        { id: '7-1', slug: 'one-shot-complet', title: 'Histoire Complète', releaseDate: '2024-06-20', status: 'Publié', pageCount: 48 },
    ],
    updatedAt: '2024-06-20T10:00:00Z',
    format: 'One-shot',
    status: 'Terminé',
  },
  {
    id: '8',
    slug: 'l-ombre-du-baobab',
    title: 'L\'Ombre du Baobab',
    artistId: '2',
    coverImage: getImage('story-5')!,
    description: 'Un roman illustré explorant les légendes oubliées du Sahel à travers les yeux d\'une jeune érudite.',
    genre: 'Contes revisités',
    genreSlug: 'contes-revisites',
    tags: ['Roman', 'Illustré', 'Légende'],
    views: 85000,
    likes: 12000,
    subscriptions: 8000,
    chapters: [
        { id: '8-1', slug: 'partie-1-les-racines', title: 'Partie 1 : Les Racines', releaseDate: '2024-07-01', status: 'Publié', pageCount: 60 },
    ],
    updatedAt: '2024-07-01T10:00:00Z',
    format: 'Roman Illustré',
    status: 'En cours',
  },
  {
    id: '9',
    slug: 'les-masques-de-bronze',
    title: 'Les Masques de Bronze',
    artistId: '3',
    coverImage: getImage('story-6')!,
    description: 'Bientôt sur NexusHub : Une épopée mystique au cœur du royaume d\'Ifé.',
    genre: 'Fantaisie Historique',
    genreSlug: 'histoire-africaine',
    tags: ['Mystère', 'Art', 'Culture'],
    views: 0,
    likes: 0,
    subscriptions: 1200,
    chapters: [],
    updatedAt: '2024-07-20T10:00:00Z',
    format: 'Hybride',
    status: 'À venir',
  },
].map(story => {
  const artist = artists.find(a => a.id === story.artistId);
  return {
    ...story,
    artistName: artist?.name || 'Artiste inconnu',
    artistSlug: artist?.slug || 'artiste-inconnu',
  }
});

export const blogPosts: BlogPost[] = [
  {
    id: 'blog-1',
    slug: 'world-building-afrofuturiste-black-panther',
    title: 'Construire un univers Afrofuturiste : De Black Panther aux réalités du Gabon',
    excerpt: 'Découvrez comment s\'inspirer du cinéma moderne pour créer des cités technologiques ancrées dans les traditions locales.',
    content: 'Le world building dans les histoires africaines au Gabon et ailleurs demande une attention particulière aux détails culturels...',
    coverImage: getImage('hero')!,
    category: 'World Building',
    author: 'Equipe NexusHub',
    date: '2024-07-15',
    tags: ['Afrofuturisme', 'Cinéma', 'Design']
  },
  {
    id: 'blog-2',
    slug: 'mythologie-yoruba-bd-africaine',
    title: 'L\'Art du World Building : Intégrer la Mythologie Yoruba dans vos BD',
    excerpt: 'Pourquoi les Orishas sont une source inépuisable de conflits dramatiques et de visuels saisissants.',
    content: 'La mythologie Yoruba offre une structure narrative complexe idéale pour les récits épiques...',
    coverImage: getImage('story-1')!,
    category: 'Scénario',
    author: 'Jelani Adebayo',
    date: '2024-07-10',
    tags: ['Mythologie', 'Yoruba', 'Narration']
  },
  {
    id: 'blog-3',
    slug: 'inspiration-mati-diop-atlantique',
    title: 'Cinéma et BD : Comment Mati Diop inspire la narration visuelle moderne',
    excerpt: 'Analyse du film "Atlantique" et de son utilisation du mysticisme pour enrichir vos arrière-plans.',
    content: 'L\'ambiance onirique de Mati Diop est un modèle pour tout artiste webtoon cherchant à exprimer l\'invisible...',
    coverImage: getImage('story-2')!,
    category: 'Analyse Ciné',
    author: 'Amina Diallo',
    date: '2024-07-05',
    tags: ['Mati Diop', 'Mysticisme', 'Visuel']
  }
];

export const products: Product[] = [
  {
    id: 'prod-1',
    name: 'T-shirt Les Chroniques d\'Orisha',
    price: 29.99,
    image: getImage('product-1')!,
    description: 'T-shirt en coton de haute qualité.'
  },
];

export const forumThreads: ForumThread[] = [
  {
    id: 'thread-1',
    title: 'Théories sur le prochain chapitre ?',
    author: 'ComicFan23',
    authorId: 'user-1',
    replies: 42,
    views: 1200,
    lastPost: { author: 'Jelani Adebayo', time: 'Il y a 2h' },
    category: 'Discussions d\'œuvres',
  },
];

export const comments: Comment[] = [
    {
        id: 'comment-1',
        storyId: '1',
        chapter: 1,
        authorId: 'reader-1',
        authorName: 'Léa Dubois',
        authorAvatar: getImage('reader-1')!,
        content: "Ce premier chapitre est incroyable !",
        timestamp: 'Il y a 2 heures',
        likes: 15,
    },
];

export const playlists: Playlist[] = [
  {
    id: 'playlist-1',
    name: 'Épopées Fantastiques',
    description: 'Une collection des meilleures bandes dessinées.',
    storyIds: ['1', '3', '8'],
    isPublic: true,
    authorId: 'reader-1',
  },
];

export const comicPages = [
  getImage('page-1')!,
  getImage('page-2')!,
  getImage('page-3')!,
];

// Helper to get formatted story URL
export const getStoryUrl = (story: Story) => {
  const prefix = (story.format === 'Webtoon' || story.format === 'Roman Illustré') ? '/webtoon' : '/bd-africaine';
  return `${prefix}/${story.slug}`;
};

// Helper to get formatted reading URL
export const getChapterUrl = (story: Story, chapterSlug: string) => {
  const prefix = (story.format === 'Webtoon' || story.format === 'Roman Illustré') ? '/webtoon' : '/bd-africaine';
  return `${prefix}/${story.slug}/${chapterSlug}`;
};
