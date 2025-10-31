import { getDefaultMessages } from '@/i18n/messages';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export const runtime = 'edge';

/**
 * Generates the Web App Manifest for the application
 *
 * Since the manifest file needs to be placed in the root of the app folder (outside the [locale] dynamic segment),
 * you need to provide a locale explicitly since next-intl can't infer it from the pathname.
 *
 * Solution: use the default messages (get from the default locale)
 *
 * https://next-intl.dev/docs/environments/actions-metadata-route-handlers#manifest
 *
 * @param {NextRequest} request - The incoming request object
 * @returns {NextResponse} The manifest configuration as JSON
 */
export async function GET(request: NextRequest) {
  const defaultMessages = await getDefaultMessages();

  const manifest = {
    name: (defaultMessages as any).Metadata.name,
    short_name: (defaultMessages as any).Metadata.name,
    description: (defaultMessages as any).Metadata.description,
    start_url: '/',
    display: 'standalone' as const,
    background_color: '#ffffff',
    theme_color: '#ffffff',
    icons: [
      {
        src: '/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable' as const,
      },
      {
        src: '/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable' as const,
      },
    ],
  };

  // Return the manifest with correct content type
  return new NextResponse(JSON.stringify(manifest, null, 2), {
    headers: {
      'Content-Type': 'application/manifest+json',
      'Cache-Control': 'public, max-age=86400, immutable',
    },
  });
}