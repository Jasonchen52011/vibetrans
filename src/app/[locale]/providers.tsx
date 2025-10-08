'use client';

import { PostHogProvider } from '@/analytics/posthog-analytics';
import { ActiveThemeProvider } from '@/components/layout/active-theme-provider';
import { GoogleOAuthProvider } from '@/components/providers/google-oauth-provider';
import { QueryProvider } from '@/components/providers/query-provider';
import { websiteConfig } from '@/config/website';
import { ThemeProvider } from 'next-themes';
import type { ReactNode } from 'react';

interface ProvidersProps {
  children: ReactNode;
  locale: string;
}

/**
 * Providers
 *
 * This component is used to wrap the app in the providers.
 *
 * - PostHogProvider: Provides the PostHog analytics to the app.
 * - GoogleOAuthProvider: Provides Google OAuth context for One Tap login.
 * - QueryProvider: Provides the query client to the app.
 * - ThemeProvider: Provides the theme to the app.
 * - ActiveThemeProvider: Provides the active theme to the app.
 */
export function Providers({ children, locale }: ProvidersProps) {
  const defaultMode = websiteConfig.ui.mode?.defaultMode ?? 'system';

  return (
    <PostHogProvider>
      <GoogleOAuthProvider>
        <QueryProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme={defaultMode}
            enableSystem={true}
            disableTransitionOnChange
          >
            <ActiveThemeProvider>
              {children}
            </ActiveThemeProvider>
          </ThemeProvider>
        </QueryProvider>
      </GoogleOAuthProvider>
    </PostHogProvider>
  );
}
