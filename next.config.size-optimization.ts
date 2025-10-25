/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  // Experimental optimizations for size reduction
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'date-fns',
      'framer-motion',
    ],
  },

  // Advanced webpack optimizations
  webpack: (config, { isServer, dev }) => {
    // Disable server-side bundling for client-side only dependencies
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        path: false,
        crypto: false,
        stream: false,
        buffer: false,
      };
    }

    // Aggressive tree shaking
    config.optimization.usedExports = true;
    config.optimization.sideEffects = false;

    // Chunk splitting for better caching
    config.optimization.splitChunks = {
      chunks: 'all',
      minSize: 20000,
      maxSize: 60000,
      cacheGroups: {
        // Separate vendor chunks for better caching
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          priority: 10,
          enforce: true,
        },
        // Separate AI SDKs to reduce initial bundle
        ai: {
          test: /[\\/]node_modules[\\/]@ai-sdk[\\/]/,
          name: 'ai-sdk',
          chunks: 'all',
          priority: 20,
        },
        // Separate UI libraries
        ui: {
          test: /[\\/]node_modules[\\/](@radix-ui|lucide-react)[\\/]/,
          name: 'ui-libs',
          chunks: 'all',
          priority: 20,
        },
        // Separate heavy libraries
        heavy: {
          test: /[\\/]node_modules[\\/](mammoth|stripe|aws-sdk|google-cloud|framer-motion)[\\/]/,
          name: 'heavy-libs',
          chunks: 'all',
          priority: 30,
        },
      },
    };

    return config;
  },

  // External dependencies for production
  ...(process.env.NODE_ENV === 'production' && {
    externals: {
      // Don't bundle these in production if available via CDN
      'react': 'React',
      'react-dom': 'ReactDOM',
    },
  }),

  // Compression and headers
  compress: true,

  poweredByHeader: false,

  // Output optimization
  output: 'standalone',

  // Remove unnecessary features
  swcMinify: true,

  // Disable source maps in production to reduce size
  ...(process.env.NODE_ENV === 'production' && {
    productionBrowserSourceMaps: false,
  }),
};

module.exports = nextConfig;