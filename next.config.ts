import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Add this Webpack config to fix the TinaCMS "node:fs" error
  // webpack: (config, { isServer, webpack }) => {
  //   if (!isServer) {
  //     // Fallback Node modules to false for the browser
  //     config.resolve.fallback = {
  //       ...config.resolve.fallback,
  //       fs: false,
  //       path: false,
  //       os: false,
  //       crypto: false, 
  //     };

  //     // Fix for "node:" protocol imports (caused by new pure ESM Tina packages)
  //     config.plugins.push(
  //       new webpack.NormalModuleReplacementPlugin(
  //         /^node:/,
  //         (resource: any) => {
  //           resource.request = resource.request.replace(/^node:/, '');
  //         }
  //       )
  //     );
  //   }
  //   return config;
  // },

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
      }
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

export default nextConfig
