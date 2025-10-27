import type { NextConfig } from 'next';

/**
 * Basic Next.js configuration for Cloudflare Pages
 * Minimal setup to avoid configuration errors
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

  // Experimental optimizations for size reduction
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'date-fns',
      'framer-motion',
      'recharts',
    ],
  },

  // Exclude Node.js-only packages from Edge Runtime bundles
  serverExternalPackages: ['fumadocs-mdx'],
};

export default nextConfig;
