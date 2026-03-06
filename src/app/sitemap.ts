import { MetadataRoute } from 'next';
import { getAdminServices } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

/**
 * Générateur de Sitemap dynamique pour NexusHub.
 * Optimise l'indexation par les moteurs de recherche en listant 
 * les routes statiques critiques et les contenus dynamiques (Histoires, Artistes).
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { adminDb } = getAdminServices();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://nexushub.africa';

  // 1. ROUTES STATIQUES (Hardcodées pour la simplicité)
  const staticPaths = [
    '/',
    '/trending',
    '/pro',
    '/blog',
    '/about',
    '/contact'
  ];

  const staticRoutes = staticPaths.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '/' ? 1.0 : 0.8,
  }));

  try {
    // 2. ROUTES DYNAMIQUES : HISTOIRES PUBLIÉES & NON BANNIES
    const storiesSnap = await adminDb.collection('stories')
      .where('isPublished', '==', true)
      .where('isBanned', '==', false)
      .get();
      
    const storyRoutes = storiesSnap.docs.map((doc) => {
      const data = doc.data();
      const lastModified = (data.updatedAt as Timestamp)?.toDate() || new Date();
      
      return {
        url: `${baseUrl}/webtoon-hub/${data.slug}`,
        lastModified,
        changeFrequency: 'weekly' as const,
        priority: 0.9,
      };
    });

    // 3. ROUTES DYNAMIQUES : PROFILS ARTISTES
    const artistsSnap = await adminDb.collection('users')
      .where('isArtist', '==', true) // Simplifié pour inclure tous les artistes
      .get();

    const artistRoutes = artistsSnap.docs
      .map((doc) => {
        const data = doc.data();
        if (!data.slug) return null;

        const lastModified = (data.profileUpdatedAt as Timestamp)?.toDate() || new Date();
        
        return {
          url: `${baseUrl}/artiste/${data.slug}`,
          lastModified,
          changeFrequency: 'monthly' as const,
          priority: 0.7,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);

    return [...staticRoutes, ...storyRoutes, ...artistRoutes];

  } catch (error) {
    console.error("Sitemap Generation Error:", error);
    // En cas d'erreur de base de données, retourner au moins les routes statiques
    // pour maintenir une présence minimale sur les moteurs de recherche.
    return staticRoutes;
  }
}
