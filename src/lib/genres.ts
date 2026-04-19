
// ==================== G E N R E S ====================
// Source de vérité pour tous les genres et catégories de l'application.
// Aide à maintenir la cohérence des slugs, des noms et des filtres.

interface Genre {
  name: string;
  slug: string;
  description?: string;
  emoji?: string;
}

export const GENRES: Genre[] = [];

export const GENRE_MAP = new Map(GENRES.map(g => [g.slug, g]));
