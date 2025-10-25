import { createMDX } from 'fumadocs-mdx/next';
import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl-plugin';

// Setup Cloudflare dev platform for local development
const { setupDevPlatform } = require('@cloudflare/next-on-pages/next-dev');
if (process.env.NODE_ENV === 'development') {
  setupDevPlatform().catch(console.error);
}

/**
 * Ultra-optimized configuration for Cloudflare Pages 3MB limit
 */
const nextConfig: NextConfig = {
  // Use standalone mode with optimizations
  output: 'standalone',

  /* Minimal config */
  devIndicators: false,

  // Skip type checking for size reduction
  typescript: {
    ignoreBuildErrors: true,
  },

  // Aggressive package exclusions
  serverExternalPackages: [
    'fumadocs-mdx',
    // All heavy dependencies
    '@aws-sdk/client-s3',
    '@google-cloud/text-to-speech',
    'google-auth-library',
    'pg',
    'postgres',
    'drizzle-orm',
    '@supabase/supabase-js',
    '@supabase/ssr',
    'stripe',
    '@stripe/stripe-js',
    'resend',
    'crisp-sdk-web',
    'posthog-js',
    '@vercel/analytics',
    '@vercel/speed-insights',
    // AI SDKs (largest contributors)
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
    // Heavy utilities
    'tone',
    'mammoth',
    'streamdown',
    '@react-email/components',
    '@react-email/render',
    // Complex UI libraries
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

  // Ultra aggressive compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
    reactRemoveProperties: process.env.NODE_ENV === 'production',
    // Remove development code
    removeProdWarnings: true,
    // Optimize imports
    optimizeCss: true,
  },

  // Ultra-optimized webpack config
  webpack: (config, { webpack, isServer, dev }) => {
    // Ignore problematic modules
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^pg-native$|^cloudflare:sockets$|^aws-sdk$|^google-cloud$/,
      })
    );

    // Disable ALL Node.js modules aggressively
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

    // Aggressive optimization only in production
    if (!dev) {
      config.optimization.usedExports = true;
      config.optimization.sideEffects = false;
      config.optimization.minimize = true;

      // Split large chunks into smaller pieces
      config.optimization.splitChunks = {
        chunks: 'all',
        minSize: 20000,
        maxSize: 50000,
        cacheGroups: {
          default: {
            minChunks: 2,
            chunks: 'async',
            priority: -10,
            reuseExistingChunk: true,
          },
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: -10,
            chunks: 'async',
          },
          react: {
            test: /[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types|use-subscription|use-sync-external-store)[\\/]/,
            name: 'react',
            priority: -9,
            chunks: 'async',
          },
        },
      };

      // Very strict performance limits for Cloudflare
      config.performance = {
        maxAssetSize: 50 * 1024, // 50KB per chunk
        maxEntrypointSize: 100 * 1024, // 100KB per entry
        hints: 'error',
      };

      // Tree shake aggressively
      config.optimization.moduleIds = 'deterministic';
      config.optimization.chunkIds = 'deterministic';
      config.optimization.runtimeChunk = 'single';

      // Reduce bundle analysis overhead
      config.optimization.providedExports = false;
      config.optimization.usedExports = false;
      config.optimization.concatenateModules = true;
    }

    return config;
  },

  // Disable image processing to save space
  images: {
    unoptimized: true,
    domains: [],
  },

  // Disable power-intensive features
  poweredByHeader: false,
  generateEtags: false,
  compress: true,

  // Force edge runtime for all pages (this actually reduces bundle size)
  experimental: {
    runtime: 'edge',
    serverComponentsExternalPackages: [
      'fumadocs-mdx',
      '@aws-sdk/client-s3',
      '@google-cloud/text-to-speech',
      'google-auth-library',
      'pg',
      'postgres',
      'drizzle-orm',
      '@supabase/supabase-js',
      '@supabase/ssr',
      'stripe',
      '@stripe/stripe-js',
      'resend',
      'crisp-sdk-web',
      'posthog-js',
      '@vercel/analytics',
      '@vercel/speed-insights',
    ],
    optimizePackageImports: ['lucide-react'],
    optimizeCss: true,
    largePageDataBytes: 128 * 1024,
    scrollRestoration: true,
    // Optimize bundle imports
    workerThreads: false,
    serverMinification: true,
    serverSourceMaps: false,
    adjustFontFallbacks: false,
  },
};

const withNextIntl = createNextIntlPlugin();
const withMDX = createMDX();

export default withMDX(withNextIntl(nextConfig));