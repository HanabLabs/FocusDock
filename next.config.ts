import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // @ts-ignore - devIndicators can be boolean in Next.js 15
  devIndicators: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'i.scdn.co',
      },
    ],
  },
};

export default nextConfig;
