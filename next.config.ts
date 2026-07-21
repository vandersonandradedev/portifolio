import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.vercel.app' },
      { protocol: 'https', hostname: 'cdn.microlink.io' },
      { protocol: 'https', hostname: 's.wordpress.com' }
    ]
  }
};

export default nextConfig;
