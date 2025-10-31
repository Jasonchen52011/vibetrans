import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

// Note: @cloudflare/next-on-pages handles Cloudflare Pages compatibility
// Including proper output directory and function routing

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
  serverExternalPackages: ['sharp', 'critters'],

  // https://nextjs.org/docs/architecture/nextjs-compiler#remove-console
  // Remove all console.* calls in production only
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Enable experimental optimizations for Cloudflare
  experimental: {
    optimizePackageImports: [
      '@radix-ui/react-accordion',
      '@radix-ui/react-collapsible',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-navigation-menu',
      '@radix-ui/react-portal',
      '@radix-ui/react-slot',
      '@radix-ui/react-tooltip',
      'lucide-react',
      'ai',
      'clsx',
      'tailwind-merge',
      'sonner',
      'next-themes',
      'nuqs',
      'react-remove-scroll',
    ],
    // Optimize CSS
    optimizeCss: true,
    // Adjust large page data bytes for Cloudflare paid plan
    largePageDataBytes: 256 * 1000, // 256KB for paid plans
    // Enable webpack bundle analyzer for optimization
    webpackBuildWorker: true,
    // Enable more aggressive compression
    gzipSize: true,
    // Optimize chunks
    optimizeCss: true,
    // Enable server components HMR
    serverComponentsHmrCache: true,
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
      };

      // Optimize chunk splitting for Cloudflare Pages Functions
      config.optimization.splitChunks = {
        ...config.optimization.splitChunks,
        chunks: 'all',
        maxSize: 150 * 1024, // 150KB max per chunk (reduced from 200KB)
        minSize: 10 * 1024, // 10KB min chunk size
        cacheGroups: {
          default: {
            enforce: true,
            priority: -20,
            reuseExistingChunk: true,
          },
          vendors: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10,
            enforce: true,
            // Smaller vendor chunks for Pages Functions
            maxSize: 100 * 1024, // 100KB max for vendor chunks (reduced from 150KB)
            minSize: 10 * 1024,
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 5,
            maxSize: 80 * 1024, // 80KB max for common chunks (reduced from 100KB)
            minSize: 10 * 1024,
          },
          // 新增：分离配置文件到独立chunk
          config: {
            test: /[\\/]src[\\/]lib[\\/].*config.*\.ts/,
            name: 'configs',
            chunks: 'all',
            priority: 15,
            maxSize: 50 * 1024, // 50KB max for config chunks
            minSize: 5 * 1024,
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

export default withNextIntl(nextConfig);
