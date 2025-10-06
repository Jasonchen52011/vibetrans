import { websiteConfig } from '@/config/website';
import type { Metadata } from 'next';
import { getBaseUrl, getImageUrl } from './urls/urls';

// Default metadata values
const DEFAULT_TITLE = 'VibeTrans';
const DEFAULT_DESCRIPTION = 'AI-powered media translation platform';
const DEFAULT_SITE_NAME = 'VibeTrans';

/**
 * Construct the metadata object for the current page (in docs/guides)
 */
export function constructMetadata({
  title,
  description,
  canonicalUrl,
  image,
  noIndex = false,
}: {
  title?: string;
  description?: string;
  canonicalUrl?: string;
  image?: string;
  noIndex?: boolean;
} = {}): Metadata {
  title = title || DEFAULT_TITLE;
  description = description || DEFAULT_DESCRIPTION;
  image = image || websiteConfig.metadata.images?.ogImage;
  const ogImageUrl = getImageUrl(image || '');
  return {
    title,
    description,
    alternates: canonicalUrl
      ? {
          canonical: canonicalUrl,
        }
      : undefined,
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: canonicalUrl,
      title,
      description,
      siteName: DEFAULT_SITE_NAME,
      images: [ogImageUrl.toString()],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImageUrl.toString()],
      site: getBaseUrl(),
    },
    icons: {
      icon: '/favicon.ico',
      shortcut: '/favicon-32x32.png',
      apple: '/apple-touch-icon.png',
    },
    metadataBase: new URL(getBaseUrl()),
    manifest: `${getBaseUrl()}/manifest.webmanifest`,
    ...(noIndex && {
      robots: {
        index: false,
        follow: false,
      },
    }),
  };
}
