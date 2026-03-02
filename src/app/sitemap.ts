import { MetadataRoute } from 'next';
import { adminDb } from '@/lib/firebase-admin';

/**
 * Générateur de Sitemap dynamique pour NexusHub.
 * Optimise l'indexation par les moteurs de recherche en listant 
 * les routes statiques critiques et les contenus dynamiques (Histoires, Artistes).
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // En production, remplacez par le domaine réel via variable d'env.
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://nexushub.africa';

  // 1. ROUTES STATIQUES
  const staticPaths = [
    '',
    '/stories',
    '/rankings',
    '/artists',
    '/africoins',
    '/pro',
    '/about',
    '/forums',
    '/shop',
    '/faq',
    '/originals'
  ];

  const staticRoutes = staticPaths.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  try {
    // 2. ROUTES DYNAMIQUES : HISTOIRES PUBLIÉES
    const storiesSnap = await adminDb.collection('stories')
      .where('isPublished', '==', true)
      .get();
    
    const storyRoutes = storiesSnap.docs.map((doc) => {
      const data = doc.data();
      // Conversion du Timestamp Firestore en Date JS pour lastModified
      const updatedAt = data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date();
      
      return {
        url: `${baseUrl}/webtoon-hub/${data.slug}`,
        lastModified: updatedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      };
    });

    // 3. ROUTES DYNAMIQUES : PROFILS ARTISTES
    const artistsSnap = await adminDb.collection('users')
      .where('role', 'in', ['artist_draft', 'artist_pro', 'artist_elite'])
      .get();

    const artistRoutes = artistsSnap.docs
      .map((doc) => {
        const data = doc.data();
        if (!data.slug) return null;
        
        const updatedAt = data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date();
        
        return {
          url: `${baseUrl}/artiste/${data.slug}`,
          lastModified: updatedAt,
          changeFrequency: 'weekly' as const,
          priority: 0.6,
        };
      })
      .filter((item): item is Exclude<typeof item, null> => item !== null);

    return [...staticRoutes, ...storyRoutes, ...artistRoutes];
  } catch (error) {
    console.error("Sitemap generation error:", error);
    // En cas d'erreur de base de données, on retourne au moins les routes statiques
    return staticRoutes;
  }
}
