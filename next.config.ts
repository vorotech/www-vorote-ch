import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Webpack configuration
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Mark cloudflare:email as external to prevent bundling
      // This module is only available at runtime on Cloudflare Workers
      config.externals = config.externals || [];
      if (Array.isArray(config.externals)) {
        config.externals.push('cloudflare:email');
      }
    }
    return config;
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'assets.tina.io',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
      },
    ],
  },
  async headers() {
    // these are also defined in the root layout since github pages doesn't support headers
    const headers = [
      {
        key: 'X-Frame-Options',
        value: 'SAMEORIGIN',
      },
      {
        key: 'Content-Security-Policy',
        value: "frame-ancestors 'self'",
      },
    ];
    return [
      {
        source: '/(.*)',
        headers,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/admin',
        destination: '/admin/index.html',
      },
    ];
  },
};

export default nextConfig;
