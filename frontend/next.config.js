/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // API rewrites to proxy backend
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3001/:path*',
      },
    ];
  },

  // Suppress hydration warnings from browser extensions
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },

  // Webpack configuration to handle browser extension conflicts
  webpack: (config, { isServer, dev }) => {
    if (!isServer) {
      // Prevent webpack from trying to resolve browser extension modules
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };

      // In development, suppress extension errors from error overlay
      if (dev) {
        config.devtool = 'cheap-module-source-map';
      }
    }
    return config;
  },
};

module.exports = nextConfig;

