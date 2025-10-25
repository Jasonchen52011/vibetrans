/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-icons',
      'framer-motion',
      'recharts',
    ],
    webpack: (config, { isServer }) => {
      if (!isServer) {
        config.resolve.fallback = {
          ...config.resolve.fallback,
          fs: false,
          path: false,
          crypto: false,
          stream: false,
          buffer: false,
        };
      }

      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10,
          },
          radix: {
            test: /[\\/]node_modules[\\/]@radix-ui[\\/]/,
            name: 'radix',
            chunks: 'all',
            priority: 20,
          },
          lucide: {
            test: /[\\/]node_modules[\\/]lucide-react[\\/]/,
            name: 'lucide',
            chunks: 'all',
            priority: 20,
          },
          mammoth: {
            test: /[\\/]node_modules[\\/]mammoth[\\/]/,
            name: 'mammoth',
            chunks: 'async',
            priority: 30,
          },
        },
      };

      return config;
    },
  },
  webpack: (config, { isServer, dev }) => {
    // Tree shaking optimizations
    config.optimization.usedExports = true;
    config.optimization.sideEffects = false;

    // Reduce bundle size for production
    if (!dev && !isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        // Replace heavy libraries with lighter alternatives
        'react-syntax-highlighter': 'react-syntax-highlighter/dist/esm/light',
        'framer-motion': 'framer-motion/dist/framer-motion.min',
      };
    }

    return config;
  },
};

module.exports = nextConfig;