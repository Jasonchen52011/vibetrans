import { createMDX } from 'fumadocs-mdx/next';
import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

// Note: Removed @cloudflare/next-on-pages as it's deprecated
// Using direct Next.js output for Cloudflare Pages compatibility

/**
 * Configuration for Cloudflare Pages with Functions
 */
const nextConfig: NextConfig = {
  // Output for Cloudflare Pages compatibility - keep default for API routes support

  /* config options here */
  devIndicators: false,

  // Skip type checking during build
  typescript: {
    ignoreBuildErrors: true,
  },

  // Exclude Node.js-only packages from Edge Runtime bundles
  serverExternalPackages: [
    'fumadocs-mdx',
    'sharp',
    'canvas-confetti',
    'tone',
    'mammoth',
  ],

  // https://nextjs.org/docs/architecture/nextjs-compiler#remove-console
  // Remove all console.* calls in production only
  compiler: {
    // removeConsole: process.env.NODE_ENV === 'production',
  },

  // Enable experimental optimizations for Cloudflare
  experimental: {
    optimizePackageImports: [
      '@radix-ui/react-accordion',
      '@radix-ui/react-alert-dialog',
      '@radix-ui/react-avatar',
      '@radix-ui/react-checkbox',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-label',
      '@radix-ui/react-popover',
      '@radix-ui/react-progress',
      '@radix-ui/react-select',
      '@radix-ui/react-separator',
      '@radix-ui/react-slider',
      '@radix-ui/react-slot',
      '@radix-ui/react-switch',
      '@radix-ui/react-tabs',
      '@radix-ui/react-toast',
      '@radix-ui/react-toggle',
      '@radix-ui/react-tooltip',
      'lucide-react',
      'date-fns',
      'ai',
      'react-syntax-highlighter',
      'swiper',
    ],
    // Enable worker threads for better performance
    workerThreads: false,
    // Optimize CSS
    optimizeCss: true,
    // Enable large page data optimization
    largePageDataBytes: 128 * 1000,
  },

  // Webpack configuration for Cloudflare Pages Edge Runtime compatibility
  webpack: (config, { webpack, isServer, dev }) => {
    // Ignore native modules
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^pg-native$|^cloudflare:sockets$/,
      })
    );

    // Note: Removed polyfills as they're not needed for modern browsers

    // Disable Node.js modules not available in Edge Runtime
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      stream: false,
      child_process: false,
      os: false,
      path: false,
      perf_hooks: false,
      'node:crypto': false,
      querystring: false,
      vm: false,
    };

    // Optimize for Cloudflare Workers
    if (!dev && !isServer) {
      // Enable tree shaking and minification
      config.optimization = {
        ...config.optimization,
        usedExports: true,
        sideEffects: false,
      };

      // Exclude large dependencies from edge runtime
      config.externals = {
        ...config.externals,
        sharp: 'sharp',
        mongodb: 'mongodb',
        mysql2: 'mysql2',
        pg: 'pg',
        redis: 'redis',
        'canvas-confetti': 'canvas-confetti',
        tone: 'tone',
        mammoth: 'mammoth',
        'google-auth-library': 'google-auth-library',
        '@aws-sdk/client-s3': '@aws-sdk/client-s3',
        recharts: 'recharts',
        'react-syntax-highlighter': 'react-syntax-highlighter',
      };

      // Optimize chunk splitting
      config.optimization.splitChunks = {
        ...config.optimization.splitChunks,
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10,
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 5,
          },
        },
      };
    }

    return config;
  },

  images: {
    // Disable image optimization for Cloudflare Pages to reduce bundle size
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'randomuser.me',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'ik.imagekit.io',
      },
      {
        protocol: 'https',
        hostname: 'html.tailus.io',
      },
      {
        protocol: 'https',
        hostname: 'service.firecrawl.dev',
      },
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
      },
    ],
  },
};

const withNextIntl = createNextIntlPlugin();
const withMDX = createMDX();

export default withMDX(withNextIntl(nextConfig));
