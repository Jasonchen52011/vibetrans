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
  '/gen-alpha-translator',
  '/dumb-it-down-ai',
  '/bad-translator',
  '/baby-translator',
  '/gibberish-translator',
  '/ancient-greek-translator',
  '/al-bhed-translator',
  '/alien-text-generator',
  '/esperanto-translator',
  '/cuneiform-translator',
  '/verbose-generator',
  '/ivr-translator',
  '/albanian-to-english',
  '/creole-to-english-translator',
  '/pig-latin-translator',
  '/cantonese-translator',
  '/middle-english-translator',
  '/minion-translator',
  '/baybayin-translator',
  '/samoan-to-english-translator',
  '/gaster-translator',
  '/high-valyrian-translator',
  '/aramaic-translator',
  '/rune-translator',
  '/english-to-swahili-translator',
  '/nahuatl-translator',
  '/english-to-amharic-translator',
  '/runic-translator',
  '/drow-translator',
  '/swahili-to-english-translator',
  '/english-to-polish-translator',
  '/ogham-translator',
  '/mandalorian-translator',
  '/yoda-translator',
  '/wingdings-translator',
  '/greek-translator',
  '/manga-translator',
  '/telugu-to-english-translator',
  '/haitian-creole-translator',
  '/english-to-turkish-translator',
  '/english-to-persian-translator',
  '/english-to-chinese-translator',
  '/japanese-to-english-translator',
  '/chinese-to-english-translator',
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
