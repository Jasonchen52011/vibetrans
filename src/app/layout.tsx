import type { ReactNode } from 'react';
import { fontSatoshi } from '@/assets/fonts';
import AffonsoScript from '@/components/affiliate/affonso';
import PromotekitScript from '@/components/affiliate/promotekit';
import '@/styles/globals.css';

interface Props {
  children: ReactNode;
}

/**
 * Root layout for next-intl routing
 *
 * https://next-intl.dev/docs/environments/error-files#catching-non-localized-requests
 */
export default function RootLayout({ children }: Props) {
  return (
    <html suppressHydrationWarning>
      <head>
        <meta name="msvalidate.01" content="518A1A066EA7B7ED31AA7B89CDC8BC86" />
      </head>
      <body
        suppressHydrationWarning
        className={`size-full antialiased ${fontSatoshi.className}`}
      >
        {children}
        <AffonsoScript />
        <PromotekitScript />
      </body>
    </html>
  );
}
