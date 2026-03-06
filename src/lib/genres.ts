
// ==================== G E N R E S ====================
// Source de vérité pour tous les genres et catégories de l'application.
// Aide à maintenir la cohérence des slugs, des noms et des filtres.

interface Genre {
  name: string;
  slug: string;
  description?: string;
  emoji?: string;
}

export const GENRES: Genre[] = [
  { name: 'Action', slug: 'action', description: 'Récits rythmés par des combats, des poursuites et des défis physiques.', emoji: '💥' },
  { name: 'Aventure', slug: 'aventure', description: 'Voyages épiques, exploration de mondes inconnus et quêtes héroïques.', emoji: '🌍' },
  { name: 'Comédie', slug: 'comedie', description: 'Histoires légères et humoristiques conçues pour faire rire.', emoji: '😂' },
  { name: 'Drame', slug: 'drame', description: 'Récits poignants explorant des conflits émotionnels et des relations complexes.', emoji: '🎭' },
  { name: 'Fantaisie', slug: 'fantaisie', description: 'Mondes magiques, créatures mythiques et épopées surnaturelles.', emoji: '✨' },
  { name: 'Science-Fiction', slug: 'science-fiction', description: 'Futurs dystopiques, technologies avancées et exploration spatiale.', emoji: '🚀' },
  { name: 'Tranche de vie', slug: 'tranche-de-vie', description: 'Instants du quotidien, relations humaines et développement personnel.', emoji: 'slice-of-life' },
  { name: 'Horreur', slug: 'horreur', description: 'Récits conçus pour effrayer et susciter la tension.', emoji: '👻' },
  { name: 'Mystère', slug: 'mystere', description: 'Enquêtes, secrets et énigmes à résoudre.', emoji: '🔍' },
  { name: 'Romance', slug: 'romance', description: 'Histoires d\'amour, relations passionnées et cœurs brisés.', emoji: '💖' },
  { name: 'Sport', slug: 'sport', description: 'Compétitions, dépassement de soi et esprit d\'équipe.', emoji: '🏆' },
  { name: 'Surnaturel', slug: 'surnaturel', description: 'Phénomènes paranormaux, fantômes et pouvoirs inexpliqués.', emoji: ' paranormal' },
  { name: 'Thriller', slug: 'thriller', description: 'Suspense, tension psychologique et retournements de situation.', emoji: '🔪' },
  { name: 'Isekai', slug: 'isekai', description: 'Personnages transportés dans un autre monde, souvent de type fantasy.', emoji: '🌌' },
  { name: 'Cyberpunk', slug: 'cyberpunk', description: 'Futurs high-tech et low-life, où la technologie modifie la société.', emoji: '🤖' }
];

export const GENRE_MAP = new Map(GENRES.map(g => [g.slug, g]));
