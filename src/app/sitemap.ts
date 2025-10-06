import type { MetadataRoute } from 'next';

/**
 * static routes for sitemap, you may change the routes for your own
 */
const staticRoutes = ['/', '/about', '/dog-translator', '/privacy', '/terms'];

/**
 * Generate a sitemap for the website
 *
 * https://nextjs.org/docs/app/api-reference/functions/generate-sitemaps
 * https://github.com/javayhu/cnblocks/blob/main/app/sitemap.ts
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Only include core static routes (English only)
  return staticRoutes.map((route) => ({
    url: `https://vibetrans.com${route}`,
    lastModified: new Date(),
    priority: 1,
    changeFrequency: 'weekly' as const,
  }));
}
