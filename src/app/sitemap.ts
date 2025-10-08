import type { MetadataRoute } from 'next';
import { getBaseUrl } from '../lib/urls/urls';

/**
 * static routes for sitemap, you may change the routes for your own
 */
const staticRoutes = [
  '/',
  '/about',
  '/dog-translator',
  '/gen-z-translator',
  '/dumb-it-down-ai',
  '/privacy',
  '/terms',
];

/**
 * Generate a sitemap for the website
 *
 * https://nextjs.org/docs/app/api-reference/functions/generate-sitemaps
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseUrl();

  // Only include core static routes (English only)
  return staticRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    priority: 1,
    changeFrequency: 'weekly' as const,
  }));
}
