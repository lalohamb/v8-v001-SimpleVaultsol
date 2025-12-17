/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

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

  // Custom error handling
  onError: (err) => {
    // Suppress extension errors
    if (
      err.message?.includes('chainId') ||
      err.message?.includes('getter') ||
      err.stack?.includes('chrome-extension://') ||
      err.stack?.includes('moz-extension://')
    ) {
      console.warn('Suppressed extension error:', err.message);
      return;
    }
    console.error(err);
  },
};

module.exports = nextConfig;

