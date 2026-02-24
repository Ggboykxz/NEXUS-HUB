import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
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
   * Consolide les routes vers webtoon-hub pour éviter les erreurs de parallélisme.
   */
  async redirects() {
    return [
      {
        source: '/webtoons',
        destination: '/webtoon-hub',
        permanent: true,
      },
      {
        source: '/webtoon',
        destination: '/webtoon-hub',
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
