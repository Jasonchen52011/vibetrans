import { fontSatoshi } from '@/assets/fonts';
import type { ReactNode } from 'react';
import '@/styles/globals.css';

interface Props {
  children: ReactNode;
}

/**
 * Root layout for next-intl routing
 *
 * https://next-intl.dev/docs/environments/error-files#catching-non-localized-requests
 */
export const runtime = 'edge';

export default function RootLayout({ children }: Props) {
  return (
    <html suppressHydrationWarning>
      <body className={fontSatoshi.className}>{children}</body>
    </html>
  );
}
