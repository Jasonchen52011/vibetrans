import { createMDX } from 'fumadocs-mdx/next';
import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

// Setup Cloudflare dev platform for local development
const { setupDevPlatform } = require('@cloudflare/next-on-pages/next-dev');
if (process.env.NODE_ENV === 'development') {
  setupDevPlatform().catch(console.error);
}

/**
 * Minimal configuration for Cloudflare Pages - only core features
 */
const nextConfig: NextConfig = {
  // Use static export to minimize worker size
  output: 'export',
  trailingSlash: true,
  distDir: 'out',

  /* Minimal config for production */
  devIndicators: false,

  // Minimal experimental features
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },

  // Skip type checking
  typescript: {
    ignoreBuildErrors: true,
  },

  // Exclude MOST dependencies
  serverExternalPackages: [
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
    'cookie',
    'deepmerge',
    'crypto-browserify',
    'http-browserify',
    'https-browserify',
  ],

  // Basic compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
    reactRemoveProperties: process.env.NODE_ENV === 'production',
  },

  // Minimal webpack config
  webpack: (config, { webpack, isServer, dev }) => {
    // Ignore problematic modules
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
    };

    // Only optimize in production
    if (!dev) {
      config.optimization.usedExports = true;
      config.optimization.sideEffects = false;
      config.optimization.minimize = true;

      // Very strict limits
      config.performance = {
        maxAssetSize: 50 * 1024, // 50KB per chunk
        maxEntrypointSize: 100 * 1024, // 100KB per entry
        hints: 'error',
      };
    }

    return config;
  },

  // Minimal image config
  images: {
    unoptimized: true,
    domains: [],
  },

  // Disable features
  poweredByHeader: false,
  generateEtags: false,
  compress: true,
};

const withNextIntl = createNextIntlPlugin();
const withMDX = createMDX();

export default withMDX(withNextIntl(nextConfig));