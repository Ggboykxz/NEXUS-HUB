import type { ImagePlaceholder } from './placeholder-images';
import { PlaceHolderImages } from './placeholder-images';

const getImage = (id: string): ImagePlaceholder | undefined => PlaceHolderImages.find(img => img.id === id);

export interface Artist {
  id: string;
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
}

export interface Chapter {
  id: string;
  title: string;
  releaseDate: string;
  status: 'Publié' | 'Programmé' | 'Brouillon';
  pageCount: number;
}

export interface Story {
  id: string;
  title: string;
  artistId: string;
  artistName?: string;
  coverImage: ImagePlaceholder;
  description: string;
  genre: string;
  tags: string[];
  views: number;
  likes: number;
  subscriptions: number;
  chapters: Chapter[];
  updatedAt: string;
  isPremium?: boolean;
  price?: number; // Price in AfriCoins
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

export const artists: Artist[] = [
  {
    id: '1',
    name: 'Jelani Adebayo',
    bio: 'Jelani Adebayo est un conteur visionnaire de Lagos, au Nigeria, connu pour sa série de fantasy épique qui mêle la mythologie yoruba à des récits visuels à couper le souffle. Avec une formation en beaux-arts et une passion pour l\'afrofuturisme, son travail a captivé des publics du monde entier.',
    avatar: getImage('artist-1')!,
    portfolio: ['1', '3'],
    links: { personal: '#', amazon: '#', twitter: '#', instagram: '#' },
    isMentor: true,
  },
  {
    id: '2',
    name: 'Amina Diallo',
    bio: 'Originaire de Dakar, au Sénégal, Amina Diallo est une artiste célèbre dont le travail explore les thèmes de l\'identité, de la tradition et de la modernité. Ses bandes dessinées de science-fiction sont saluées pour leur construction de monde complexe et leurs personnages forts et attachants.',
    avatar: getImage('artist-2')!,
    portfolio: ['2', '4'],
    links: { personal: '#', amazon: '#', facebook: '#' },
  },
   {
    id: '3',
    name: 'Kwame Osei',
    bio: 'Basé à Accra, au Ghana, Kwame Osei est un maître du mystère et du suspense. Ses romans graphiques sont connus pour leurs intrigues captivantes et leurs illustrations atmosphériques, souvent sur fond de villes animées d\'Afrique de l\'Ouest.',
    avatar: getImage('artist-3')!,
    portfolio: ['5', '6'],
    links: { personal: '#', twitter: '#', instagram: '#' },
    isMentor: true,
  },
];

export const readers: Reader[] = [
  {
    id: 'reader-1',
    name: 'Léa Dubois',
    bio: 'Passionnée de lecture depuis toujours, je suis à l\'affût des nouvelles pépites de la BD africaine. Mon genre de prédilection est la fantasy, mais je suis toujours ouverte à de nouvelles découvertes !',
    avatar: getImage('reader-1')!,
  },
  {
    id: 'reader-2',
    name: 'Yannick Beauchamp',
    bio: 'Grand fan de science-fiction, je dévore tous les webtoons du genre. Toujours partant pour une bonne discussion sur les univers cyberpunk.',
    avatar: getImage('reader-2')!,
  },
  {
    id: 'reader-3',
    name: 'Chloé Morin',
    bio: 'Lectrice éclectique, j\'aime autant les mystères que les romances. Je suis ici pour découvrir de nouveaux talents et partager mes coups de cœur.',
    avatar: getImage('reader-3')!,
  },
  {
    id: 'reader-4',
    name: 'Marc-André Lavoie',
    bio: 'Amateur d\'aventure et d\'histoire. Je cherche des récits qui me font voyager dans le temps et l\'espace.',
    avatar: getImage('reader-4')!,
  }
];

export const stories: Story[] = [
  {
    id: '1',
    title: 'Les Chroniques d\'Orisha',
    artistId: '1',
    coverImage: getImage('story-1')!,
    description: 'Un jeune héros découvre son héritage divin et doit naviguer dans un monde de dieux et de monstres pour sauver son peuple.',
    genre: 'Fantaisie',
    tags: ['Mythologie', 'Aventure', 'Magie'],
    views: 1200000,
    likes: 89000,
    subscriptions: 50000,
    chapters: [
        { id: '1-1', title: 'Le Réveil', releaseDate: '2024-05-01', status: 'Publié', pageCount: 22 },
        { id: '1-2', title: 'L\'Épreuve', releaseDate: '2024-05-15', status: 'Publié', pageCount: 25 },
        { id: '1-3', title: 'L\'Ombre grandit', releaseDate: '2024-06-01', status: 'Programmé', pageCount: 23 },
    ],
    updatedAt: 'Il y a 2 jours',
  },
  {
    id: '2',
    title: 'Néo-Dakar 2088',
    artistId: '2',
    coverImage: getImage('story-2')!,
    description: 'Dans un Dakar futuriste, un détective amélioré cybernétiquement découvre une conspiration qui menace toute la ville.',
    genre: 'Science-Fiction',
    tags: ['Cyberpunk', 'Mystère', 'Action'],
    views: 980000,
    likes: 75000,
    subscriptions: 42000,
    chapters: [
        { id: '2-1', title: 'Néons et Brouillard', releaseDate: '2024-04-20', status: 'Publié', pageCount: 30 },
        { id: '2-2', title: 'Le Contact', releaseDate: '2024-05-10', status: 'Publié', pageCount: 28 },
    ],
    updatedAt: 'Il y a 5 jours',
  },
  {
    id: '3',
    title: 'Le Sentier de Sankofa',
    artistId: '1',
    coverImage: getImage('story-3')!,
    description: 'Un voyage à travers le temps pour retrouver les histoires perdues d\'un grand royaume.',
    genre: 'Aventure',
    tags: ['Historique', 'Voyage dans le temps', 'Fantaisie'],
    views: 750000,
    likes: 62000,
    subscriptions: 35000,
    chapters: [
        { id: '3-1', title: 'La Relique', releaseDate: '2024-03-01', status: 'Publié', pageCount: 18 },
        { id: '3-2', title: 'Le Passage', releaseDate: '2024-03-15', status: 'Publié', pageCount: 20 },
        { id: '3-3', title: 'Le Royaume Oublié', releaseDate: '2024-04-01', status: 'Publié', pageCount: 22 },
        { id: '3-4', title: 'Le Retour', releaseDate: '2024-04-15', status: 'Brouillon', pageCount: 0 },
    ],
    updatedAt: 'Il y a 1 semaine',
  },
  {
    id: '4',
    title: 'Le Chant du Griot',
    artistId: '2',
    coverImage: getImage('story-4')!,
    description: 'Une jeune griotte doit utiliser ses pouvoirs de conteuse pour unir une terre divisée.',
    genre: 'Fantaisie',
    tags: ['Folklore', 'Magie', 'Musique'],
    views: 650000,
    likes: 55000,
    subscriptions: 30000,
    chapters: [
        { id: '4-1', title: 'La Première Note', releaseDate: '2024-05-10', status: 'Publié', pageCount: 24 },
    ],
    updatedAt: 'Il y a 3 jours',
    isPremium: true,
    price: 50,
  },
   {
    id: '5',
    title: 'La Toile d\'Anansé',
    artistId: '3',
    coverImage: getImage('story-5')!,
    description: 'Un filou des temps modernes navigue dans le monde de l\'entreprise en utilisant la ruse du dieu araignée Anansé.',
    genre: 'Fantaisie Urbaine',
    tags: ['Mythologie', 'Comédie', 'Moderne'],
    views: 500000,
    likes: 48000,
    subscriptions: 28000,
    chapters: [
        { id: '5-1', title: 'L\'Entretien d\'embauche', releaseDate: '2024-05-20', status: 'Publié', pageCount: 20 },
    ],
    updatedAt: 'Il y a 1 jour',
  },
  {
    id: '6',
    title: 'Les Échos du Bénin',
    artistId: '3',
    coverImage: getImage('story-6')!,
    description: 'Un historien de l\'art découvre que les célèbres bronzes du Bénin détiennent la clé d\'un pouvoir ancien.',
    genre: 'Mystère',
    tags: ['Historique', 'Surnaturel', 'Art'],
    views: 420000,
    likes: 41000,
    subscriptions: 25000,
    chapters: [],
    updatedAt: 'Il y a 1 mois',
    isPremium: true,
    price: 75,
  },
].map(story => ({
  ...story,
  artistName: artists.find(a => a.id === story.artistId)?.name || 'Artiste inconnu',
}));


export const products: Product[] = [
  {
    id: 'prod-1',
    name: 'T-shirt Les Chroniques d\'Orisha',
    price: 29.99,
    image: getImage('product-1')!,
    description: 'T-shirt en coton de haute qualité avec le protagoniste principal des Chroniques d\'Orisha. Disponible dans toutes les tailles.'
  },
  {
    id: 'prod-2',
    name: 'Affiche d\'art Néo-Dakar',
    price: 49.99,
    image: getImage('product-2')!,
    description: 'Une superbe affiche d\'art de 45x60 cm de l\'horizon de Néo-Dakar. Parfait pour l\'encadrement.'
  },
  {
    id: 'prod-3',
    name: 'Mug AfriStory',
    price: 15.99,
    image: getImage('product-3')!,
    description: 'Commencez votre journée avec votre boisson préférée dans ce mug AfriStory au design personnalisé.'
  },
];

export const forumThreads: ForumThread[] = [
  {
    id: 'thread-1',
    title: 'Théories sur le prochain chapitre des Chroniques d\'Orisha ?',
    author: 'ComicFan23',
    authorId: 'user-1',
    replies: 42,
    views: 1200,
    lastPost: { author: 'Jelani Adebayo', time: 'Il y a 2h' },
    category: 'Discussions d\'œuvres',
  },
  {
    id: 'thread-2',
    title: 'Conseils pour les artistes de BD en herbe ?',
    author: 'ArtStudent99',
    authorId: 'user-2',
    replies: 15,
    views: 850,
    lastPost: { author: 'Amina Diallo', time: 'Il y a 5h' },
    category: 'Le coin des artistes',
  },
   {
    id: 'thread-3',
    title: 'Recherche scénariste pour projet de science-fiction',
    author: 'InkMaster',
    authorId: 'user-3',
    replies: 8,
    views: 300,
    lastPost: { author: 'FutureScribe', time: 'Il y a 1j' },
    category: 'Collaborations',
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
        content: "Ce premier chapitre est incroyable ! L'univers est tellement riche. J'ai hâte de voir la suite.",
        timestamp: 'Il y a 2 heures',
        likes: 15,
        replies: [
            {
                id: 'reply-1',
                storyId: '1',
                chapter: 1,
                authorId: '1',
                authorName: 'Jelani Adebayo',
                authorAvatar: getImage('artist-1')!,
                content: "Merci beaucoup Léa ! Ça me fait très plaisir de lire ça. Le meilleur est à venir ! 😉",
                timestamp: 'Il y a 1 heure',
                likes: 8,
            }
        ]
    },
    {
        id: 'comment-2',
        storyId: '1',
        chapter: 1,
        authorId: 'reader-3',
        authorName: 'Chloé Morin',
        authorAvatar: getImage('reader-3')!,
        content: "La direction artistique est sublime. Chaque panneau est une œuvre d'art. Quelqu'un a une théorie sur le mystérieux personnage à la fin ?",
        timestamp: 'Il y a 45 minutes',
        likes: 23,
        replies: []
    },
    {
        id: 'comment-3',
        storyId: '2',
        chapter: 1,
        authorId: 'reader-2',
        authorName: 'Yannick Beauchamp',
        authorAvatar: getImage('reader-2')!,
        content: "L'ambiance cyberpunk est tellement bien retranscrite, c'est fou ! Le détective a la classe.",
        timestamp: 'Il y a 8 heures',
        likes: 19,
        replies: []
    },
    {
        id: 'comment-4',
        storyId: '5',
        chapter: 1,
        authorId: 'reader-4',
        authorName: 'Marc-André Lavoie',
        authorAvatar: getImage('reader-4')!,
        content: "Hilarant ! J'adore comment les mythes sont modernisés. Anansé en consultant en entreprise, il fallait y penser.",
        timestamp: 'Il y a 1 jour',
        likes: 31,
        replies: []
    }
];

export const comicPages = [
  getImage('page-1')!,
  getImage('page-2')!,
  getImage('page-3')!,
];
