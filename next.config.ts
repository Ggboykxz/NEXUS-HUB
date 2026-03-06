import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
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
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
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
      {
        source: '/cercles',
        destination: '/clubs',
        permanent: true,
      },
      {
        source: '/cercles/:path*',
        destination: '/clubs/:path*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
