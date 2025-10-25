import type { NextConfig } from 'next';

/**
 * Temporary configuration to bypass MDX issues
 * Remove problematic MDX processing temporarily
 */
const nextConfig: NextConfig = {
  // Output for Cloudflare Pages compatibility
  output: 'standalone',

  /* Basic config */
  devIndicators: false,

  // Skip type checking during build
  typescript: {
    ignoreBuildErrors: true,
  },

  // Exclude Node.js-only packages from Edge Runtime bundles
  serverExternalPackages: ['fumadocs-mdx'],

  images: {
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

export default nextConfig;