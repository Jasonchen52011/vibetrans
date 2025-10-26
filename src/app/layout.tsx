import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

// Edge runtime configuration for Cloudflare Pages compatibility
export const runtime = 'edge';

/**
 * Since we have a `not-found.tsx` page on the root, a layout file
 * is required, even if it's just passing children through.
 *
 * https://next-intl.dev/docs/environments/error-files#catching-non-localized-requests
 */
export default function RootLayout({ children }: Props) {
  return children;
}
