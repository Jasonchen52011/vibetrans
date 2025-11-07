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

  // Temporary fix for build issues - disabled trailingSlash to fix Html import issue
  // trailingSlash: true,
  // skipTrailingSlashRedirect: true,

  // Skip type checking during build
  typescript: {
    ignoreBuildErrors: true,
  },

  // Temporary fix for static generation issues with error pages
  generateEtags: false,

  // Disable static generation for error pages to bypass Html import issue
  trailingSlash: false,

  // Force dynamic rendering for all pages to bypass Html import issues
  staticPageGenerationTimeout: 1000,

  // Skip static generation for now
  skipTrailingSlashRedirect: true,

  

  // Disable distDir to avoid Html import issues
  distDir: '.next',

  // Exclude Node.js-only packages from Edge Runtime bundles
  serverExternalPackages: ['sharp', 'critters', '@clerk/nextjs'],

  // https://nextjs.org/docs/architecture/nextjs-compiler#remove-console
  // Remove all console.* calls in production only
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Disable experimental optimizations temporarily to bypass Html import issue

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
      crypto: false,
      buffer: false,
      process: false,
      util: false,
      assert: false,
      events: false,
    };

    // Optimize for Cloudflare Workers
    if (!dev && !isServer) {
      // Enable tree shaking and minification
      config.optimization = {
        ...config.optimization,
        usedExports: true,
        sideEffects: false,
        concatenateModules: true, // Enable module concatenation
      };

      // Exclude large dependencies from edge runtime
      config.externals = {
        ...config.externals,
        sharp: 'sharp',
        'next-intl/middleware': 'next-intl/middleware',
      };

      // Add optimization plugins
      config.plugins.push(
        new webpack.DefinePlugin({
          'process.env.NODE_ENV': JSON.stringify('production'),
        })
      );

      // Optimize chunk splitting for Cloudflare Pages Functions
      config.optimization.splitChunks = {
        ...config.optimization.splitChunks,
        chunks: 'all',
        maxSize: 80 * 1024, // 80KB max per chunk - more aggressive for Cloudflare Pro
        minSize: 5 * 1024, // 5KB min chunk size - create more, smaller chunks
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
            // Much smaller vendor chunks for Pages Functions
            maxSize: 50 * 1024, // 50KB max for vendor chunks - very aggressive
            minSize: 5 * 1024,
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 5,
            maxSize: 60 * 1024, // 60KB max for common chunks (further reduced)
            minSize: 15 * 1024,
          },
          // 新增：分离配置文件到独立chunk
          config: {
            test: /[\\/]src[\\/]lib[\\/].*config.*\.ts/,
            name: 'configs',
            chunks: 'all',
            priority: 15,
            maxSize: 20 * 1024, // 20KB max for config chunks - very aggressive
            minSize: 3 * 1024,
          },
          // 新增：分离工具函数
          utils: {
            test: /[\\/]src[\\/]lib[\\/](?!config).*\.ts/,
            name: 'utils',
            chunks: 'all',
            priority: 12,
            maxSize: 40 * 1024, // 40KB max for utils chunks
            minSize: 10 * 1024,
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
