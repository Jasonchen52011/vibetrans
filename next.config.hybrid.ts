import { createMDX } from 'fumadocs-mdx/next';
import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl-plugin';

// Setup Cloudflare dev platform for local development
const { setupDevPlatform } = require('@cloudflare/next-on-pages/next-dev');
if (process.env.NODE_ENV === 'development') {
  setupDevPlatform().catch(console.error);
}

/**
 * Hybrid configuration: Static pages + Edge APIs to minimize Worker size
 */
const nextConfig: NextConfig = {
  // Use export mode for static pages (smaller bundles)
  output: 'export',
  trailingSlash: true,
  distDir: 'out',

  /* Minimal config */
  devIndicators: false,

  // Skip type checking
  typescript: {
    ignoreBuildErrors: true,
  },

  // Exclude heavy dependencies from all bundles
  serverExternalPackages: [
    'fumadocs-mdx',
    '@aws-sdk/client-s3',
    '@google-cloud/text-to-speech',
    'google-auth-library',
    'pg',
    'postgres',
    'drizzle-orm',
    '@supabase/supabae-js',
    '@supabase/ssr',
    'stripe',
    '@stripe/stripe-js',
    'resend',
    'crisp-sdk-web',
    'posthog-js',
    '@vercel/analytics',
    '@vercel/speed-insights',
    '@ai-sdk/deepseek',
    '@ai-sdk/fal',
    '@ai-sdk/fireworks',
    '@ai-sdk/google',
    '@ai-sdk/openai',
    '@ai-sdk/react',
    '@ai-sdk/replicate',
    '@google/generative-ai',
    '@openrouter/ai-sdk-provider',
    'ai',
    'tone',
    'mammoth',
    'streamdown',
    '@react-email/components',
    '@react-email/render',
    '@dnd-kit/core',
    '@dnd-kit/modifiers',
    '@dnd-kit/sortable',
    '@dnd-kit/utilities',
    '@tanstack/react-table',
    'embla-carousel-fade',
    'embla-carousel-react',
    'react-resizable-panels',
    'swiper',
    '@oram/orama',
    '@orama/tokenizers',
    'deepmerge',
    'dotted-map',
    'framer-motion',
    'recharts',
    'date-fns',
    'canvas-confetti',
    'react-social-media-embed',
    'react-syntax-highlighter',
    'react-tweet',
    'shiki',
    'react-use-measure',
    'vaul',
    'react-remove-scroll',
    'input-otp',
    'class-variance-authority',
    'cmdk',
    'react-day-picker',
    'react-hook-form',
    '@hookform/resolvers',
    'zod',
    'zustand',
    '@tanstack/react-query',
    '@tanstack/react-query-devtools',
    'nuqs',
    'next-themes',
    'use-intl',
    'use-media',
    'use-stick-to-bottom',
    'tailwind-merge',
    'tailwindcss-animate',
    'tw-animate-css',
    'clsx',
    'crypto-browserify',
    'http-browserify',
    'https-browserify',
  ],

  // Remove all console calls and debug code
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
    reactRemoveProperties: process.env.NODE_ENV === 'production',
    removeProdWarnings: true,
  },

  // Webpack configuration for minimal bundle size
  webpack: (config, { webpack, isServer, dev }) => {
    // Ignore native modules
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^pg-native$|^cloudflare:sockets$|^aws-sdk$|^google-cloud$/,
      })
    );

    // Disable all Node.js modules
    config.resolve.fallback = {
      fs: false,
      net: false,
      tls: false,
      stream: false,
      child_process: false,
      os: false,
      path: false,
      perf_hooks: false,
      'node:crypto': false,
      'node:fs': false,
      'node:path': false,
      'node:stream': false,
      'node:util': false,
      'node:url': false,
      querystring: false,
      vm: false,
      zlib: false,
      events: false,
      util: false,
      url: false,
      assert: false,
      buffer: false,
      crypto: false,
      http: false,
      https: false,
      dns: false,
      dgram: false,
      tls: false,
      child_process: false,
      os: false,
      path: false,
      fs: false,
      process: false,
    };

    // Minimal optimization
    if (!dev) {
      config.optimization.usedExports = true;
      config.optimization.sideEffects = false;
      config.optimization.minimize = true;

      // Split into very small chunks
      config.optimization.splitChunks = {
        chunks: 'all',
        minSize: 10000,
        maxSize: 30000,
        maxInitialRequests: 25,
        maxAsyncRequests: 25,
        cacheGroups: {
          default: {
            minChunks: 1,
            chunks: 'async',
            priority: -20,
            reuseExistingChunk: true,
            enforceSizeThreshold: 30000,
          },
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: -20,
            chunks: 'async',
            enforceSizeThreshold: 30000,
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'async',
            priority: -10,
            enforceSizeThreshold: 30000,
          },
        },
      };

      // Ultra strict limits for Cloudflare
      config.performance = {
        maxAssetSize: 30 * 1024, // 30KB per chunk
        maxEntrypointSize: 50 * 1024, // 50KB per entry
        hints: 'error',
      };

      // Tree shake everything
      config.optimization.moduleIds = 'deterministic';
      config.optimization.chunkIds = 'deterministic';
      config.optimization.runtimeChunk = 'single';
      config.optimization.providedExports = false;
      config.optimization.usedExports = false;
      config.optimization.concatenateModules = true;
    }

    return config;
  },

  // Minimal image config
  images: {
    unoptimized: true,
    domains: [],
  },

  // Disable all non-essential features
  poweredByHeader: false,
  generateEtags: false,
  compress: true,
};

const withNextIntl = createNextIntlPlugin();
const withMDX = createMDX();

export default withMDX(withNextIntl(nextConfig));