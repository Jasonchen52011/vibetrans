'use server';

import { actionClient } from '@/lib/safe-action';
import {
  getSubmissionStats,
  submitToAllSearchEngines,
} from '@/lib/seo/search-engine-submitter';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

/**
 * Schema for sitemap submission
 */
const submitSitemapSchema = z.object({
  force: z.boolean().optional().default(false),
});

/**
 * Server Action to submit sitemap to all search engines
 */
export const submitSitemapAction = actionClient
  .schema(submitSitemapSchema)
  .action(async ({ parsedInput }) => {
    const { force } = parsedInput;

    try {
      // Check if SEO automation is enabled
      const seoEnabled = process.env.SEO_AUTO_SUBMIT_ENABLED === 'true';
      if (!seoEnabled && !force) {
        return {
          success: false,
          error: 'SEO auto-submission is disabled',
          results: [],
        };
      }

      console.log('Starting sitemap submission to search engines...');
      const startTime = Date.now();

      // Submit to all search engines
      const results = await submitToAllSearchEngines();
      const stats = getSubmissionStats(results);
      const duration = Date.now() - startTime;

      console.log(`Sitemap submission completed in ${duration}ms:`, stats);

      // Revalidate relevant paths
      revalidatePath('/api/sitemap.xml');
      revalidatePath('/admin/seo');

      // Log results for monitoring
      const successfulSubmissions = results.filter((r) => r.success);
      const failedSubmissions = results.filter((r) => !r.success);

      if (successfulSubmissions.length > 0) {
        console.log(
          '✅ Successfully submitted to:',
          successfulSubmissions.map((r) => r.searchEngine).join(', ')
        );
      }

      if (failedSubmissions.length > 0) {
        console.warn(
          '❌ Failed to submit to:',
          failedSubmissions
            .map((r) => `${r.searchEngine}: ${r.error}`)
            .join(', ')
        );
      }

      return {
        success: stats.successful > 0,
        results,
        stats,
        duration,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Sitemap submission error:', error);

      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
        results: [],
        stats: null,
        duration: 0,
        timestamp: new Date().toISOString(),
      };
    }
  });

/**
 * Schema for single search engine submission
 */
const submitToSearchEngineSchema = z.object({
  searchEngine: z.enum(['google', 'bing', 'duckduckgo', 'yandex']),
  url: z.string().url().optional(),
});

/**
 * Server Action to submit sitemap to a specific search engine
 */
export const submitToSearchEngineAction = actionClient
  .schema(submitToSearchEngineSchema)
  .action(async ({ parsedInput }) => {
    const { searchEngine, url } = parsedInput;

    try {
      // Import here to avoid circular dependencies
      const {
        submitToGoogle,
        submitToBing,
        submitToDuckDuckGo,
        submitToYandex,
      } = await import('@/lib/seo/search-engine-submitter');

      const baseUrl =
        url || process.env.NEXT_PUBLIC_BASE_URL || 'https://vibetrans.com';
      const sitemapUrl = `${baseUrl}/api/sitemap.xml`;
      const config = {
        sitemapUrl,
        siteUrl: baseUrl,
        bingApiKey: process.env.BING_API_KEY,
      };

      let result;

      switch (searchEngine) {
        case 'google':
          result = await submitToGoogle(config);
          break;
        case 'bing':
          result = await submitToBing(config);
          break;
        case 'duckduckgo':
          result = await submitToDuckDuckGo(config);
          break;
        case 'yandex':
          result = await submitToYandex(config);
          break;
        default:
          throw new Error(`Unsupported search engine: ${searchEngine}`);
      }

      console.log(`${searchEngine} submission result:`, result);

      return {
        success: result.success,
        result,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error(`${searchEngine} submission error:`, error);

      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
        result: null,
        timestamp: new Date().toISOString(),
      };
    }
  });
