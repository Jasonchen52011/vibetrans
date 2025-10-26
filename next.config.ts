import { createMDX } from 'fumadocs-mdx/next';
import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

// Setup Cloudflare dev platform for local development
const { setupDevPlatform } = require('@cloudflare/next-on-pages/next-dev');
if (process.env.NODE_ENV === 'development') {
  setupDevPlatform().catch(console.error);
}

/**
 * Configuration for Cloudflare Pages with Functions
 */
const nextConfig: NextConfig = {
  // Output for Cloudflare Pages compatibility
  output: 'standalone',

  /* config options here */
  devIndicators: false,

  // Skip type checking during build
  typescript: {
    ignoreBuildErrors: true,
  },

  // Exclude Node.js-only packages from Edge Runtime bundles
  serverExternalPackages: ['fumadocs-mdx'],

  // https://nextjs.org/docs/architecture/nextjs-compiler#remove-console
  // Remove all console.* calls in production only
  compiler: {
    // removeConsole: process.env.NODE_ENV === 'production',
  },

  
  // Webpack configuration for Cloudflare Pages Edge Runtime compatibility
  webpack: (config, { webpack, isServer }) => {
    // Ignore native modules
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^pg-native$|^cloudflare:sockets$/,
      })
    );

    // Add browserify polyfills for Edge Runtime
    if (isServer) {
      config.resolve.alias['https'] = 'https-browserify';
      config.resolve.alias['http'] = 'http-browserify';
      config.resolve.alias['crypto'] = 'crypto-browserify';
    }

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

    
    return config;
  },

  images: {
    // https://vercel.com/docs/image-optimization/managing-image-optimization-costs#minimizing-image-optimization-costs
    // https://nextjs.org/docs/app/api-reference/components/image#unoptimized
    // vercel has limits on image optimization, 1000 images per month
    unoptimized: process.env.DISABLE_IMAGE_OPTIMIZATION === 'true',
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