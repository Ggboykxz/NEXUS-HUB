import { MetadataRoute } from 'next'

/**
 * Générateur robots.ts pour NexusHub.
 * Définit les règles d'indexation pour les moteurs de recherche.
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://nexushub.africa'
  
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/dashboard',
        '/settings',
        '/admin',
        '/api',
        '/messages',
        '/submit',
        '/_next',
        '/static'
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
