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
  chapters: number;
  updatedAt: string;
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
    bio: 'Jelani Adebayo is a visionary storyteller from Lagos, Nigeria, known for his epic fantasy series that weave Yoruba mythology into breathtaking visual narratives. With a background in fine arts and a passion for afrofuturism, his work has captivated audiences worldwide.',
    avatar: getImage('artist-1')!,
    portfolio: ['1', '3'],
    links: { personal: '#', amazon: '#', twitter: '#', instagram: '#' },
  },
  {
    id: '2',
    name: 'Amina Diallo',
    bio: 'From Dakar, Senegal, Amina Diallo is a celebrated artist whose work explores themes of identity, tradition, and modernity. Her sci-fi comics are praised for their intricate world-building and strong, relatable characters.',
    avatar: getImage('artist-2')!,
    portfolio: ['2', '4'],
    links: { personal: '#', amazon: '#', facebook: '#' },
  },
   {
    id: '3',
    name: 'Kwame Osei',
    bio: 'Based in Accra, Ghana, Kwame Osei is a master of mystery and suspense. His graphic novels are known for their gripping plots and atmospheric artwork, often set against the backdrop of bustling West African cities.',
    avatar: getImage('artist-3')!,
    portfolio: ['5', '6'],
    links: { personal: '#', twitter: '#', instagram: '#' },
  },
];

export const readers: Reader[] = [
  {
    id: 'reader-1',
    name: 'Léa Dubois',
    bio: 'Passionnée de lecture depuis toujours, je suis à l\'affût des nouvelles pépites de la BD africaine. Mon genre de prédilection est la fantasy, mais je suis toujours ouverte à de nouvelles découvertes !',
    avatar: getImage('reader-1')!,
  }
];

export const stories: Story[] = [
  {
    id: '1',
    title: 'The Orisha Chronicles',
    artistId: '1',
    coverImage: getImage('story-1')!,
    description: 'A young hero discovers his divine heritage and must navigate a world of gods and monsters to save his people.',
    genre: 'Fantasy',
    tags: ['Mythology', 'Adventure', 'Magic'],
    views: 1200000,
    likes: 89000,
    subscriptions: 50000,
    chapters: 24,
    updatedAt: '2 days ago',
  },
  {
    id: '2',
    title: 'Neo-Dakar 2088',
    artistId: '2',
    coverImage: getImage('story-2')!,
    description: 'In a futuristic Dakar, a cybernetically enhanced detective uncovers a conspiracy that threatens the entire city.',
    genre: 'Sci-Fi',
    tags: ['Cyberpunk', 'Mystery', 'Action'],
    views: 980000,
    likes: 75000,
    subscriptions: 42000,
    chapters: 18,
    updatedAt: '5 days ago',
  },
  {
    id: '3',
    title: 'Sankofa\'s Path',
    artistId: '1',
    coverImage: getImage('story-3')!,
    description: 'A journey through time to reclaim the lost histories of a great kingdom.',
    genre: 'Adventure',
    tags: ['Historical', 'Time Travel', 'Fantasy'],
    views: 750000,
    likes: 62000,
    subscriptions: 35000,
    chapters: 30,
    updatedAt: '1 week ago',
  },
  {
    id: '4',
    title: 'The Griot\'s Song',
    artistId: '2',
    coverImage: getImage('story-4')!,
    description: 'A young griot must use her storytelling powers to unite a divided land.',
    genre: 'Fantasy',
    tags: ['Folklore', 'Magic', 'Music'],
    views: 650000,
    likes: 55000,
    subscriptions: 30000,
    chapters: 22,
    updatedAt: '3 days ago',
  },
   {
    id: '5',
    title: 'Ananse\'s Web',
    artistId: '3',
    coverImage: getImage('story-5')!,
    description: 'A modern-day trickster navigates the corporate world using the cunning of the spider god Ananse.',
    genre: 'Urban Fantasy',
    tags: ['Mythology', 'Comedy', 'Modern'],
    views: 500000,
    likes: 48000,
    subscriptions: 28000,
    chapters: 15,
    updatedAt: '1 day ago',
  },
  {
    id: '6',
    title: 'Echoes of Benin',
    artistId: '3',
    coverImage: getImage('story-6')!,
    description: 'An art historian discovers that the famous Benin Bronzes hold the key to an ancient power.',
    genre: 'Mystery',
    tags: ['Historical', 'Supernatural', 'Art'],
    views: 420000,
    likes: 41000,
    subscriptions: 25000,
    chapters: 20,
    updatedAt: '1 month ago',
  },
].map(story => ({
  ...story,
  artistName: artists.find(a => a.id === story.artistId)?.name || 'Unknown Artist',
}));


export const products: Product[] = [
  {
    id: 'prod-1',
    name: 'Orisha Chronicles Tee',
    price: 29.99,
    image: getImage('product-1')!,
    description: 'High-quality cotton T-shirt featuring the main protagonist from The Orisha Chronicles. Available in all sizes.'
  },
  {
    id: 'prod-2',
    name: 'Neo-Dakar Art Print',
    price: 49.99,
    image: getImage('product-2')!,
    description: 'A stunning 18x24 inch art print of the Neo-Dakar skyline. Perfect for framing.'
  },
  {
    id: 'prod-3',
    name: 'NexusHub Mug',
    price: 15.99,
    image: getImage('product-3')!,
    description: 'Start your day with your favorite beverage in this custom-designed NexusHub mug.'
  },
];

export const forumThreads: ForumThread[] = [
  {
    id: 'thread-1',
    title: 'Theories about the next chapter of Orisha Chronicles?',
    author: 'ComicFan23',
    authorId: 'user-1',
    replies: 42,
    views: 1200,
    lastPost: { author: 'Jelani Adebayo', time: '2h ago' },
    category: 'Story Discussion',
  },
  {
    id: 'thread-2',
    title: 'Tips for aspiring comic artists?',
    author: 'ArtStudent99',
    authorId: 'user-2',
    replies: 15,
    views: 850,
    lastPost: { author: 'Amina Diallo', time: '5h ago' },
    category: 'Artist Corner',
  },
   {
    id: 'thread-3',
    title: 'Looking for a writer for a sci-fi project',
    author: 'InkMaster',
    authorId: 'user-3',
    replies: 8,
    views: 300,
    lastPost: { author: 'FutureScribe', time: '1d ago' },
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
        authorId: 'artist-3',
        authorName: 'FanDeFantaisie',
        authorAvatar: getImage('artist-3')!,
        content: "La direction artistique est sublime. Chaque panneau est une œuvre d'art. Quelqu'un a une théorie sur le mystérieux personnage à la fin ?",
        timestamp: 'Il y a 45 minutes',
        likes: 23,
        replies: []
    }
];

export const comicPages = [
  getImage('page-1')!,
  getImage('page-2')!,
  getImage('page-3')!,
];
