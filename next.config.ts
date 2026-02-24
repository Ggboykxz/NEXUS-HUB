import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
  /**
   * Redirections centralisées pour NexusHub.
   * Gère la consolidation des routes legacy vers les routes officielles.
   */
  async redirects() {
    return [
      {
        source: '/webtoons',
        destination: '/webtoon',
        permanent: true,
      },
      {
        source: '/comics',
        destination: '/bd-africaine',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
