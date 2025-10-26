import type { MetadataRoute } from 'next';
import { getBaseUrl } from '../lib/urls/urls';

export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        // API and system routes
        '/api/*',
        '/_next/*',

        // Protected routes
        '/settings/*',
        '/dashboard/*',
        '/admin/*',

        // Auth pages (keep functional but hide from search)
        '/auth/*',

        // Content pages (hide from search)
        '/blog/*',
        '/docs/*',

        // Feature pages (hide from search)
        '/pricing',
        '/video',
        '/chat',
        '/image',

        // Legal pages (hide from search)
        '/cookie',

        // Chinese locale (hide all Chinese pages)
        '/zh/*',
      ],
    },
    sitemap: `${getBaseUrl()}/sitemap.xml`,
  };
}
