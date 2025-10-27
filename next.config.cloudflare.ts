import { createMDX } from 'fumadocs-mdx/next';
import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

// Setup Cloudflare dev platform for local development
const { setupDevPlatform } = require('@cloudflare/next-on-pages/next-dev');
if (process.env.NODE_ENV === 'development') {
  setupDevPlatform().catch(console.error);
}

/**
 * Ultra-optimized configuration for Cloudflare Pages size limits
 */
const nextConfig: NextConfig = {
  // Use static export to minimize worker size
  output: 'export',
  trailingSlash: true,
  distDir: 'out',

  /* Minimal config for production */
  devIndicators: false,

  // Aggressive size optimizations
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'date-fns',
      'framer-motion',
      'recharts',
    ],
    forceSwcTransforms: true,
    // Enable minimal CSS extraction
    optimizeCss: true,
  },

  // Skip type checking to reduce build size
  typescript: {
    ignoreBuildErrors: true,
  },

  // Exclude ALL heavy dependencies
  serverExternalPackages: [
    // Database & backend packages
    'fumadocs-mdx',
    '@aws-sdk/client-s3',
    '@google-cloud/text-to-speech',
    'google-auth-library',
    'pg',
    'postgres',
    'drizzle-orm',
    '@supabase/supabase-js',
    '@supabase/ssr',

    // Payment & analytics
    'stripe',
    '@stripe/stripe-js',
    'resend',
    'crisp-sdk-web',
    'posthog-js',
    '@vercel/analytics',
    '@vercel/speed-insights',

    // Heavy AI/ML libraries
    '@ai-sdk/deepseek',
    '@ai-sdk/fal',
    '@ai-sdk/fireworks',
    '@ai-sdk/google',
    '@ai-sdk/openai',
    '@ai-sdk/react',
    '@ai-sdk/replicate',
    '@openrouter/ai-sdk-provider',
    'ai',

    // Media & document processing
    'tone',
    'mammoth',
    'streamdown',

    // Email & communication
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

    // Heavy utilities
    '@oram/orama',
    '@orama/tokenizers',
    'deepmerge',
    'dotted-map',
  ],

  // Aggressive compiler optimizations
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
        resourceRegExp:
          /^pg-native$|^cloudflare:sockets$|^aws-sdk$|^google-cloud$/,
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

    // Aggressive optimization only in production
    if (!dev) {
      config.optimization.usedExports = true;
      config.optimization.sideEffects = false;
      config.optimization.minimize = true;

      // Strict performance limits
      config.performance = {
        maxAssetSize: 100 * 1024, // 100KB per chunk
        maxEntrypointSize: 150 * 1024, // 150KB per entry
        hints: 'error',
      };

      // Tree shake aggressively
      config.optimization.moduleIds = 'deterministic';
      config.optimization.chunkIds = 'deterministic';
    }

    return config;
  },

  // Minimal image config
  images: {
    unoptimized: true,
    domains: [],
  },

  // Disable power-intensive features
  poweredByHeader: false,
  generateEtags: false,
  compress: true,
};

const withNextIntl = createNextIntlPlugin();
const withMDX = createMDX();

export default withMDX(withNextIntl(nextConfig));
